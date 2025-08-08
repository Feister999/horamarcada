import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Clock } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SubscriptionStatus = () => {
  const { user, subscription, refreshSubscription } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();

  const handlePaymentConfirmation = async () => {
    if (!user) return;
    
    setIsConfirming(true);
    
    try {
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
      
      const { error } = await supabase
        .from('subscribers')
        .update({
          subscription_tier: 'premium',
          subscribed: true,
          subscription_end: subscriptionEndDate.toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshSubscription();
      
      toast({
        title: "Plano ativado!",
        description: "Seu plano Profissional foi ativado com sucesso por 30 dias.",
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível confirmar o pagamento. Tente novamente."
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleUpgrade = () => {
    window.open("https://mpago.la/1XdWxZ1", "_blank");
  };

  const isExpired = () => {
    if (!subscription?.subscription_end) return false;
    return new Date(subscription.subscription_end) < new Date();
  };

  const getDaysRemaining = () => {
    if (!subscription?.subscription_end) return 0;
    const endDate = new Date(subscription.subscription_end);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatExpirationDate = () => {
    if (!subscription?.subscription_end) return '';
    return new Date(subscription.subscription_end).toLocaleDateString('pt-BR');
  };

  const isProfessional = subscription?.subscription_tier === 'premium' && 
                         subscription?.subscribed && 
                         !isExpired();

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl">Status da Assinatura</CardTitle>
              <CardDescription>
                Gerencie seu plano e pagamentos
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant={isProfessional ? "default" : "secondary"}
            className="text-sm px-3 py-1"
          >
            {isProfessional ? "Profissional" : "Gratuito"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isProfessional ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Ativo até {formatExpirationDate()}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>
                {getDaysRemaining() > 0 
                  ? `${getDaysRemaining()} dias restantes`
                  : 'Assinatura expirada'
                }
              </span>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-medium mb-2">Recursos do Plano Profissional:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Serviços ilimitados</li>
                <li>✓ Agendamentos ilimitados</li>
                <li>✓ Relatórios detalhados</li>
                <li>✓ Personalização visual</li>
                <li>✓ Suporte prioritário</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleUpgrade}
              variant="outline"
              className="w-full"
            >
              Renovar Assinatura
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-medium mb-2">Plano Gratuito - Limitações:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 1 tipo de serviço apenas</li>
                <li>• Até 10 agendamentos por mês</li>
                <li>• Lembretes básicos por email</li>
                <li>• Suporte por email</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleUpgrade}
                className="flex-1"
              >
                Assinar Plano Profissional
              </Button>
              
              <Button 
                onClick={handlePaymentConfirmation}
                variant="outline"
                disabled={isConfirming}
                className="flex-1"
              >
                {isConfirming ? "Confirmando..." : "Já Paguei"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;