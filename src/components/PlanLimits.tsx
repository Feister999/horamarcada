import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Lock, CheckCircle } from "lucide-react";

interface PlanLimitsProps {
  subscription: any;
}

const PlanLimits = ({ subscription }: PlanLimitsProps) => {
  const isProfessional = subscription?.subscription_tier === 'premium' && 
                         subscription?.subscribed && 
                         subscription?.is_active;

  const freeLimits = [
    { feature: "Tipos de serviço", free: "1", pro: "Ilimitados", current: isProfessional ? "∞" : "1" },
    { feature: "Agendamentos/mês", free: "10", pro: "Ilimitados", current: isProfessional ? "∞" : "10" },
    { feature: "Lembretes", free: "Email básico", pro: "WhatsApp + Email", current: isProfessional ? "WhatsApp + Email" : "Email básico" },
    { feature: "Relatórios", free: "Básicos", pro: "Detalhados", current: isProfessional ? "Detalhados" : "Básicos" },
    { feature: "Personalização", free: "Limitada", pro: "Completa", current: isProfessional ? "Completa" : "Limitada" },
    { feature: "Suporte", free: "Email", pro: "Prioritário", current: isProfessional ? "Prioritário" : "Email" }
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isProfessional ? (
            <>
              <CheckCircle className="h-5 w-5 text-success" />
              Recursos Liberados - Plano Profissional
            </>
          ) : (
            <>
              <Lock className="h-5 w-5 text-muted-foreground" />
              Limitações do Plano Gratuito
            </>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-4">
          {freeLimits.map((limit, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex-1">
                <span className="font-medium">{limit.feature}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={isProfessional ? "default" : "secondary"}
                  className="min-w-[100px] justify-center"
                >
                  {limit.current}
                </Badge>
                {!isProfessional && (
                  <div className="text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Upgrade para liberar
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {!isProfessional && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Importante:</strong> As limitações são aplicadas automaticamente. 
              Para acessar recursos ilimitados, faça upgrade para o Plano Profissional.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanLimits;