import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AvailabilitySettings {
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  sessionDuration: number;
}

interface UnavailableDate {
  date: Date;
  reason: string;
}

const AgendaConfig = () => {
  const [availability, setAvailability] = useState<AvailabilitySettings[]>([
    { dayOfWeek: 0, isAvailable: false, startTime: "09:00", endTime: "18:00", sessionDuration: 30 },
    { dayOfWeek: 1, isAvailable: true, startTime: "09:00", endTime: "18:00", sessionDuration: 30 },
    { dayOfWeek: 2, isAvailable: true, startTime: "09:00", endTime: "18:00", sessionDuration: 30 },
    { dayOfWeek: 3, isAvailable: true, startTime: "09:00", endTime: "18:00", sessionDuration: 30 },
    { dayOfWeek: 4, isAvailable: true, startTime: "09:00", endTime: "18:00", sessionDuration: 30 },
    { dayOfWeek: 5, isAvailable: true, startTime: "09:00", endTime: "18:00", sessionDuration: 30 },
    { dayOfWeek: 6, isAvailable: false, startTime: "09:00", endTime: "18:00", sessionDuration: 30 },
  ]);
  
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [dateReason, setDateReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [userSlug, setUserSlug] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from("profiles")
        .select("slug")
        .eq("user_id", user.id)
        .single();

      if (profile?.slug) {
        setUserSlug(profile.slug);
      }

      // Carregar configurações de disponibilidade
      const { data: availabilityData } = await supabase
        .from("availability_settings")
        .select("*")
        .eq("user_id", user.id);

      if (availabilityData && availabilityData.length > 0) {
        const newAvailability = [...availability];
        availabilityData.forEach((setting) => {
          const index = setting.day_of_week;
          if (index >= 0 && index < 7) {
            newAvailability[index] = {
              dayOfWeek: setting.day_of_week,
              isAvailable: setting.is_available,
              startTime: setting.start_time,
              endTime: setting.end_time,
              sessionDuration: setting.session_duration,
            };
          }
        });
        setAvailability(newAvailability);
      }

      // Carregar datas indisponíveis
      const { data: unavailableData } = await supabase
        .from("unavailable_dates")
        .select("*")
        .eq("user_id", user.id);

      if (unavailableData) {
        setUnavailableDates(unavailableData.map(d => ({
          date: new Date(d.date),
          reason: d.reason || ""
        })));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive",
      });
    }
  };

  const handleAvailabilityChange = (dayIndex: number, field: keyof AvailabilitySettings, value: any) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex] = { ...newAvailability[dayIndex], [field]: value };
    setAvailability(newAvailability);
  };

  const addUnavailableDate = () => {
    if (selectedDate && dateReason.trim()) {
      setUnavailableDates([...unavailableDates, { date: selectedDate, reason: dateReason }]);
      setSelectedDate(undefined);
      setDateReason("");
    }
  };

  const removeUnavailableDate = (index: number) => {
    setUnavailableDates(unavailableDates.filter((_, i) => i !== index));
  };

  const saveConfiguration = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Deletar configurações antigas
      await supabase
        .from("availability_settings")
        .delete()
        .eq("user_id", user.id);

      await supabase
        .from("unavailable_dates")
        .delete()
        .eq("user_id", user.id);

      // Inserir novas configurações de disponibilidade
      const availabilityInserts = availability.map(setting => ({
        user_id: user.id,
        day_of_week: setting.dayOfWeek,
        is_available: setting.isAvailable,
        start_time: setting.startTime,
        end_time: setting.endTime,
        session_duration: setting.sessionDuration,
      }));

      const { error: availabilityError } = await supabase
        .from("availability_settings")
        .insert(availabilityInserts);

      if (availabilityError) throw availabilityError;

      // Inserir datas indisponíveis
      if (unavailableDates.length > 0) {
        const unavailableInserts = unavailableDates.map(dateInfo => ({
          user_id: user.id,
          date: format(dateInfo.date, "yyyy-MM-dd"),
          reason: dateInfo.reason,
        }));

        const { error: unavailableError } = await supabase
          .from("unavailable_dates")
          .insert(unavailableInserts);

        if (unavailableError) throw unavailableError;
      }

      toast({
        title: "Sucesso!",
        description: "Configurações salvas com sucesso",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Configurar Agenda
          </h1>
          <p className="text-muted-foreground">
            Configure seus horários de atendimento e disponibilidade
          </p>
          {userSlug && (
            <p className="text-sm text-primary mt-2">
              Seu link público: <strong>/marcar/{userSlug}</strong>
            </p>
          )}
        </div>

        <div className="space-y-6">
          {/* Configuração de horários por dia da semana */}
          <Card>
            <CardHeader>
              <CardTitle>Horários de Atendimento</CardTitle>
              <CardDescription>
                Configure os dias e horários que você atende
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availability.map((day, index) => (
                <div key={day.dayOfWeek} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 min-w-[100px]">
                    <Switch
                      checked={day.isAvailable}
                      onCheckedChange={(checked) => 
                        handleAvailabilityChange(index, "isAvailable", checked)
                      }
                    />
                    <Label className="font-medium">{daysOfWeek[day.dayOfWeek]}</Label>
                  </div>
                  
                  {day.isAvailable && (
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">De:</Label>
                        <Input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => 
                            handleAvailabilityChange(index, "startTime", e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Até:</Label>
                        <Input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => 
                            handleAvailabilityChange(index, "endTime", e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Duração:</Label>
                        <Select
                          value={day.sessionDuration.toString()}
                          onValueChange={(value) =>
                            handleAvailabilityChange(index, "sessionDuration", parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 min</SelectItem>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="45">45 min</SelectItem>
                            <SelectItem value="60">1 hora</SelectItem>
                            <SelectItem value="90">1h 30min</SelectItem>
                            <SelectItem value="120">2 horas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Datas indisponíveis */}
          <Card>
            <CardHeader>
              <CardTitle>Datas Indisponíveis</CardTitle>
              <CardDescription>
                Marque datas específicas que você não estará disponível
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label>Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP", { locale: ptBR })
                        ) : (
                          "Selecione uma data"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex-1">
                  <Label>Motivo (opcional)</Label>
                  <Input
                    value={dateReason}
                    onChange={(e) => setDateReason(e.target.value)}
                    placeholder="Ex: Viagem, feriado..."
                  />
                </div>
                
                <Button 
                  onClick={addUnavailableDate}
                  disabled={!selectedDate}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {unavailableDates.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Datas marcadas como indisponíveis:</Label>
                  {unavailableDates.map((dateInfo, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <span className="font-medium">
                          {format(dateInfo.date, "PPP", { locale: ptBR })}
                        </span>
                        {dateInfo.reason && (
                          <span className="text-sm text-muted-foreground ml-2">
                            - {dateInfo.reason}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUnavailableDate(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={saveConfiguration}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaConfig;