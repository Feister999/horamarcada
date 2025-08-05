import { useState } from "react";
import { X, CreditCard, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;
    price: string;
    period: string;
    features: string[];
  };
}

const CheckoutModal = ({ isOpen, onClose, plan }: CheckoutModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simular processamento de pagamento
    setTimeout(() => {
      toast({
        title: "Pagamento processado com sucesso!",
        description: `Bem-vindo ao plano ${plan.name}. Você receberá um email de confirmação em breve.`,
      });
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Finalizar Assinatura
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo do Plano */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-2xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              
              <div className="space-y-2">
                {plan.features.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Método de Pagamento */}
          <div className="space-y-4">
            <h3 className="font-medium">Método de Pagamento</h3>
            
            <Card className="border-primary">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Cartão de Crédito</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, Elo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Segurança */}
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Pagamento seguro com SSL</span>
          </div>

          {/* Botão de Pagamento */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              "Processando..."
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Confirmar Pagamento
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Ao confirmar, você concorda com nossos termos de serviço
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;