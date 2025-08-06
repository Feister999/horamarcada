import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, User, Phone, Mail, FileText, Link, Settings } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  notes?: string;
  status: string;
  created_at: string;
}

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSlug, setUserSlug] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Buscar slug do usuário
      const { data: profile } = await supabase
        .from("profiles")
        .select("slug")
        .eq("user_id", user.id)
        .single();

      if (profile?.slug) {
        setUserSlug(profile.slug);
      }

      // Buscar agendamentos
      const { data: appointmentsData, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("provider_id", user.id)
        .order("appointment_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;

      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar agendamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Concluído</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAppointmentsByStatus = (status: string) => {
    return appointments.filter(apt => apt.status === status);
  };

  const getTodayAppointments = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return appointments.filter(apt => apt.appointment_date === today);
  };

  const getUpcomingAppointments = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return appointments.filter(apt => apt.appointment_date > today);
  };

  const copyPublicLink = () => {
    const link = `${window.location.origin}/marcar/${userSlug}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "O link público foi copiado para a área de transferência",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const todayAppointments = getTodayAppointments();
  const upcomingAppointments = getUpcomingAppointments();
  const confirmedCount = getAppointmentsByStatus("confirmed").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                Meus Agendamentos
              </h1>
              <p className="text-muted-foreground">
                Gerencie seus horários e visualize seus agendamentos
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate("/agenda-config")}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configurar Agenda
              </Button>
              {userSlug && (
                <Button 
                  onClick={copyPublicLink}
                  className="flex items-center gap-2"
                >
                  <Link className="h-4 w-4" />
                  Copiar Link Público
                </Button>
              )}
            </div>
          </div>
          
          {userSlug && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Seu link público para agendamentos:</p>
              <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                {window.location.origin}/marcar/{userSlug}
              </code>
            </div>
          )}
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Todos os Agendamentos</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os seus agendamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum agendamento ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Compartilhe seu link público para começar a receber agendamentos
                </p>
                {userSlug && (
                  <Button onClick={copyPublicLink}>
                    <Link className="h-4 w-4 mr-2" />
                    Copiar Link Público
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{appointment.client_name}</p>
                            <p className="text-sm text-muted-foreground">{appointment.client_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(appointment.appointment_date), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appointment.start_time} - {appointment.end_time}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {appointment.client_email}
                            </div>
                            {appointment.client_phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {appointment.client_phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(appointment.status)}
                        </TableCell>
                        <TableCell>
                          {appointment.notes ? (
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span className="text-sm truncate max-w-[200px]" title={appointment.notes}>
                                {appointment.notes}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyAppointments;