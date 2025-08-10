import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, User } from "lucide-react";
import { format, addDays, isSameDay, isAfter, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  display_name: string;
  business_name?: string;
}

interface AvailabilitySettings {
  day_of_week: number;
  is_available: boolean;
  start_time: string;
  end_time: string;
  session_duration: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const PublicBooking = () => {
  const { userSlug } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySettings[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProviderData();
  }, [userSlug]);

  useEffect(() => {
    if (selectedDate && availability.length > 0) {
      generateTimeSlots();
    }
  }, [selectedDate, availability, bookedSlots, unavailableDates]);

  const loadProviderData = async () => {
    if (!userSlug) return;

    try {
      console.log("Loading provider data for slug:", userSlug);
      
      // Buscar perfil do prestador
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, display_name, business_name")
        .eq("slug", userSlug)
        .single();

      console.log("Profile query result:", { profileData, profileError });

      if (profileError || !profileData) {
        toast({
          title: "Erro",
          description: "Prestador não encontrado",
          variant: "destructive",
        });
        return;
      }

      setProfile(profileData);

      // Buscar configurações de disponibilidade
      const { data: availabilityData, error: availabilityError } = await supabase
        .from("availability_settings")
        .select("*")
        .eq("user_id", profileData.user_id);

      console.log("Availability query result:", { availabilityData, availabilityError });

      if (availabilityData) {
        setAvailability(availabilityData);
      }

      // Buscar datas indisponíveis
      const { data: unavailableData, error: unavailableError } = await supabase
        .from("unavailable_dates")
        .select("date")
        .eq("user_id", profileData.user_id);

      console.log("Unavailable dates query result:", { unavailableData, unavailableError });

      if (unavailableData) {
        setUnavailableDates(unavailableData.map(d => d.date));
      }

      // Buscar agendamentos já marcados
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("appointment_date, start_time")
        .eq("provider_id", profileData.user_id)
        .eq("status", "confirmed");

      console.log("Appointments query result:", { appointmentsData, appointmentsError });

      if (appointmentsData) {
        setBookedSlots(appointmentsData.map(apt => 
          `${apt.appointment_date}T${apt.start_time}`
        ));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do prestador",
        variant: "destructive",
      });
    }
  };

  const generateTimeSlots = () => {
    if (!selectedDate || availability.length === 0) {
      console.log("No date selected or no availability data");
      setAvailableSlots([]);
      return;
    }

    const dayOfWeek = selectedDate.getDay();
    const dateString = format(selectedDate, "yyyy-MM-dd");
    
    console.log("Generating slots for:", {
      date: dateString,
      dayOfWeek,
      availability: availability.length,
      availabilityData: availability
    });
    
    // Verificar se o dia está indisponível
    if (unavailableDates.includes(dateString)) {
      console.log("Date is unavailable");
      setAvailableSlots([]);
      return;
    }

    const daySettings = availability.find(a => a.day_of_week === dayOfWeek);
    
    console.log("Day settings found:", daySettings);
    
    if (!daySettings || !daySettings.is_available) {
      console.log("No day settings or day not available");
      setAvailableSlots([]);
      return;
    }

    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = daySettings.start_time.split(':').map(Number);
    const [endHour, endMinute] = daySettings.end_time.split(':').map(Number);
    
    const startTime = new Date(selectedDate);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(selectedDate);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    const currentTime = new Date(startTime);
    
    console.log("Time slots generation:", {
      startHour, startMinute, endHour, endMinute,
      sessionDuration: daySettings.session_duration
    });
    
    while (currentTime < endTime) {
      const timeString = format(currentTime, "HH:mm");
      const slotDateTime = `${dateString}T${timeString}`;
      
      // Verificar se o horário já foi agendado
      const isBooked = bookedSlots.includes(slotDateTime);
      
      // Verificar se é no passado (apenas para hoje)
      const now = new Date();
      const isPast = isSameDay(selectedDate, now) && currentTime <= now;
      
      slots.push({
        time: timeString,
        available: !isBooked && !isPast,
      });
      
      currentTime.setMinutes(currentTime.getMinutes() + daySettings.session_duration);
    }
    
    console.log("Generated slots:", slots);
    setAvailableSlots(slots);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !bookingForm.clientName || !bookingForm.clientEmail) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (!profile) return;

    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("slug", userSlug)
        .single();

      if (!profileData) throw new Error("Prestador não encontrado");

      // Calcular horário de fim baseado na duração da sessão
      const dayOfWeek = selectedDate.getDay();
      const daySettings = availability.find(a => a.day_of_week === dayOfWeek);
      const sessionDuration = daySettings?.session_duration || 30;
      
      const [hour, minute] = selectedTime.split(':').map(Number);
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(hour, minute, 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + sessionDuration);

      // Usar a edge function para validar limites e criar agendamento
      const { data: result, error: functionError } = await supabase.functions.invoke('validate-appointment-limit', {
        body: {
          provider_id: profileData.user_id,
          client_name: bookingForm.clientName,
          client_email: bookingForm.clientEmail,
          client_phone: bookingForm.clientPhone || null,
          appointment_date: format(selectedDate, "yyyy-MM-dd"),
          start_time: selectedTime,
          end_time: format(endDateTime, "HH:mm"),
          notes: bookingForm.notes || null,
        }
      });

      if (functionError) {
        console.error("Error calling function:", functionError);
        toast({
          title: "Erro de conexão",
          description: `Falha na comunicação com o servidor. Tente novamente em alguns instantes.`,
          variant: "destructive",
        });
        return;
      }

      if (!result) {
        console.error("No result returned from function");
        toast({
          title: "Erro",
          description: "Servidor não respondeu. Verifique sua conexão e tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // Verificar se houve erro na resposta
      if (result.success === false || result.error) {
        console.error("Function returned error:", result);
        
        // Mensagem específica baseada no tipo de erro
        let errorMessage = "Erro desconhecido";
        let errorTitle = "Erro";
        
        if (result.error === 'Monthly appointment limit reached') {
          errorTitle = "Limite de agendamentos atingido";
          errorMessage = result.message || "Limite mensal de agendamentos atingido";
        } else if (result.error === 'Failed to create appointment') {
          errorTitle = "Erro ao criar agendamento";
          errorMessage = "Não foi possível salvar o agendamento. Verifique se o horário ainda está disponível.";
        } else if (result.details) {
          errorMessage = `${result.error || 'Erro'}: ${result.details}`;
        } else {
          errorMessage = result.message || result.error || "Erro ao processar agendamento";
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Agendamento confirmado!",
        description: `Seu horário foi marcado para ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às ${selectedTime}`,
      });

      // Reset form
      setBookingForm({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        notes: "",
      });
      setSelectedTime("");
      
      // Recarregar agendamentos para atualizar disponibilidade
      loadProviderData();
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast({
        title: "Erro",
        description: "Erro ao confirmar agendamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <p className="text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            {profile.business_name || profile.display_name}
          </h1>
          <p className="text-muted-foreground">
            Agende seu horário de forma rápida e fácil
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seleção de data e horário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Selecione Data e Horário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Escolha uma data:</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    const today = startOfDay(new Date());
                    if (!isAfter(date, addDays(today, -1))) {
                      console.log("Date is in the past:", date);
                      return true;
                    }
                    
                    const dateString = format(date, "yyyy-MM-dd");
                    if (unavailableDates.includes(dateString)) {
                      console.log("Date is in unavailable list:", dateString);
                      return true;
                    }
                    
                    const dayOfWeek = date.getDay();
                    const daySettings = availability.find(a => a.day_of_week === dayOfWeek);
                    const shouldDisable = !daySettings || !daySettings.is_available;
                    
                    if (shouldDisable) {
                      console.log("Day disabled - dayOfWeek:", dayOfWeek, "daySettings:", daySettings);
                    }
                    
                    return shouldDisable;
                  }}
                  locale={ptBR}
                  className="pointer-events-auto border rounded-lg"
                />
              </div>

              {selectedDate && (
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Horários disponíveis para {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}:
                  </Label>
                  <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                    {availableSlots.length === 0 ? (
                      <p className="text-sm text-muted-foreground col-span-3 text-center py-4">
                        Nenhum horário disponível para esta data
                      </p>
                    ) : (
                      availableSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className="text-xs"
                        >
                          {slot.time}
                        </Button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulário de agendamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Seus Dados
              </CardTitle>
              <CardDescription>
                Preencha seus dados para confirmar o agendamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clientName">Nome completo *</Label>
                <Input
                  id="clientName"
                  value={bookingForm.clientName}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <Label htmlFor="clientEmail">E-mail *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={bookingForm.clientEmail}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <Label htmlFor="clientPhone">Telefone</Label>
                <Input
                  id="clientPhone"
                  value={bookingForm.clientPhone}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Alguma informação adicional..."
                  rows={3}
                />
              </div>

              {selectedDate && selectedTime && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Resumo do Agendamento
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>Data:</strong> {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Horário:</strong> {selectedTime}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Prestador:</strong> {profile.business_name || profile.display_name}
                  </p>
                </div>
              )}

              <Button
                onClick={handleBooking}
                disabled={loading || !selectedDate || !selectedTime || !bookingForm.clientName || !bookingForm.clientEmail}
                className="w-full"
              >
                {loading ? "Confirmando..." : "Confirmar Agendamento"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicBooking;