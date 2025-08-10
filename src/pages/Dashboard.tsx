
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import PlanLimits from "@/components/PlanLimits";

interface DashboardStats {
  appointmentsToday: number;
  nextAppointment: {
    time: string;
    clientName: string;
    date: string;
  } | null;
  activeClients: number;
}

const Dashboard = () => {
  const { user, signOut, subscription } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    appointmentsToday: 0,
    nextAppointment: null,
    activeClients: 0,
  });
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const loadDashboardStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      const today = new Date();
      const todayString = format(today, "yyyy-MM-dd");
      const now = new Date();
      const ninetyDaysAgo = format(addDays(today, -90), "yyyy-MM-dd");

      // 1. Agendamentos hoje
      const { data: todayAppointments, error: todayError } = await supabase
        .from("appointments")
        .select("id")
        .eq("provider_id", user.id)
        .eq("appointment_date", todayString)
        .eq("status", "confirmed");

      if (todayError) {
        console.error("Error fetching today's appointments:", todayError);
      }

      // 2. Próximo atendimento
      const { data: nextAppointments, error: nextError } = await supabase
        .from("appointments")
        .select("appointment_date, start_time, client_name")
        .eq("provider_id", user.id)
        .eq("status", "confirmed")
        .gte("appointment_date", todayString)
        .order("appointment_date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(10);

      if (nextError) {
        console.error("Error fetching next appointments:", nextError);
      }

      // Encontrar próximo agendamento futuro
      let nextAppointment = null;
      if (nextAppointments && nextAppointments.length > 0) {
        for (const apt of nextAppointments) {
          const aptDateTime = new Date(`${apt.appointment_date}T${apt.start_time}`);
          if (aptDateTime > now) {
            nextAppointment = {
              time: apt.start_time.slice(0, 5), // HH:MM
              clientName: apt.client_name,
              date: format(new Date(apt.appointment_date), "dd/MM", { locale: ptBR }),
            };
            break;
          }
        }
      }

      // 3. Clientes ativos (últimos 90 dias)
      const { data: activeClientsData, error: clientsError } = await supabase
        .from("appointments")
        .select("client_email")
        .eq("provider_id", user.id)
        .eq("status", "confirmed")
        .gte("appointment_date", ninetyDaysAgo);

      if (clientsError) {
        console.error("Error fetching active clients:", clientsError);
      }

      // Contar clientes únicos
      const uniqueClients = new Set();
      activeClientsData?.forEach(apt => {
        if (apt.client_email) {
          uniqueClients.add(apt.client_email);
        }
      });

      setStats({
        appointmentsToday: todayAppointments?.length || 0,
        nextAppointment,
        activeClients: uniqueClients.size,
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, [user?.id]);

  // Realtime updates para agendamentos
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('dashboard-appointments')
      .on(
        'postgres_changes',
        {
          event: '*', // Escutar INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'appointments',
          filter: `provider_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Appointment change detected:', payload);
          // Recarregar estatísticas quando houver mudanças
          loadDashboardStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo, {user?.user_metadata?.display_name || user?.email}!
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <SubscriptionStatus />
        
        <PlanLimits subscription={subscription} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Agendamentos Hoje
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.appointmentsToday}
              </div>
              <p className="text-xs text-muted-foreground">
                Agendamentos confirmados para hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Próximo Atendimento
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold">...</div>
              ) : stats.nextAppointment ? (
                <>
                  <div className="text-2xl font-bold">
                    {stats.nextAppointment.time}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.nextAppointment.date} - {stats.nextAppointment.clientName}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">--:--</div>
                  <p className="text-xs text-muted-foreground">
                    Nenhum agendamento futuro
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clientes Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.activeClients}
              </div>
              <p className="text-xs text-muted-foreground">
                Últimos 90 dias
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="inline-block p-8">
            <CardHeader>
              <CardTitle>Em construção</CardTitle>
              <CardDescription>
                Sua agenda inteligente está sendo preparada com muito carinho!
              </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="flex gap-4">
              <Button onClick={() => navigate('/agenda-config')} className="shadow-soft">
                Configurar minha agenda
              </Button>
              <Button variant="outline" onClick={() => navigate('/meus-agendamentos')}>
                Ver agendamentos
              </Button>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
