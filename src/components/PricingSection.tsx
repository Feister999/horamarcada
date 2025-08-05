import { Check, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutModal from "./CheckoutModal";

const PricingSection = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handlePlanSelect = (plan: any) => {
    if (plan.name === "Gratuito") {
      navigate("/cadastro");
    } else if (plan.name === "Premium") {
      // Simular contato com especialista
      window.open("https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre o plano Premium", "_blank");
    } else {
      setSelectedPlan(plan);
      setIsCheckoutOpen(true);
    }
  };

  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      period: "/mês",
      description: "Perfeito para começar",
      popular: false,
      features: [
        "1 tipo de serviço",
        "Até 10 agendamentos/mês",
        "Lembretes básicos por email",
        "Agenda web responsiva",
        "Suporte por email"
      ],
      cta: "Começar Grátis",
      variant: "outline" as const
    },
    {
      name: "Profissional",
      price: "R$ 29",
      period: "/mês",
      description: "Para profissionais estabelecidos",
      popular: true,
      features: [
        "Serviços ilimitados",
        "Agendamentos ilimitados",
        "Lembretes via WhatsApp",
        "Integração Google Calendar",
        "Relatórios detalhados",
        "Personalização visual",
        "Suporte prioritário"
      ],
      cta: "Experimentar 14 dias grátis",
      variant: "default" as const
    },
    {
      name: "Premium",
      price: "R$ 59",
      period: "/mês",
      description: "Para escalar seu negócio",
      popular: false,
      features: [
        "Tudo do Profissional",
        "Marca branca (sem logo MarqueiAi)",
        "API para integrações avançadas",
        "Múltiplos usuários/colaboradores",
        "Analytics avançado",
        "Automações personalizadas",
        "Suporte VIP 24/7",
        "Consultoria de otimização"
      ],
      cta: "Falar com Especialista",
      variant: "outline" as const
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-accent/10 rounded-full text-sm font-medium text-accent-foreground mb-6">
            <Star className="w-4 h-4 mr-2" />
            Planos e Preços
          </div>
          
          <h2 className="text-3xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Escolha o plano ideal
            <span className="block text-primary">para seu negócio</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Comece grátis e evolua conforme seu negócio cresce. 
            Todos os planos incluem suporte e atualizações.
          </p>

          {/* Pricing Toggle */}
          <div className="inline-flex items-center bg-muted rounded-xl p-1">
            <button className="px-4 py-2 rounded-lg bg-background shadow-sm text-foreground font-medium">
              Mensal
            </button>
            <button className="px-4 py-2 rounded-lg text-muted-foreground font-medium">
              Anual <span className="text-xs bg-success text-success-foreground px-2 py-1 rounded-full ml-1">-20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative border-2 shadow-card hover:shadow-soft smooth-transition ${
                plan.popular 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    Mais Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-heading font-bold">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {plan.description}
                </CardDescription>
                
                <div className="flex items-baseline justify-center mt-6">
                  <span className="text-4xl font-heading font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {plan.period}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Button 
                  className={`w-full mb-6 ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary/90 shadow-elegant' 
                      : ''
                  }`}
                  variant={plan.variant}
                  size="lg"
                  onClick={() => handlePlanSelect(plan)}
                >
                  {plan.popular && <Zap className="w-4 h-4 mr-2" />}
                  {plan.cta}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <div className="bg-muted rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              Todos os planos incluem:
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-success mr-3" />
                <span className="text-muted-foreground">SSL e segurança LGPD</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-success mr-3" />
                <span className="text-muted-foreground">Backup automático diário</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-success mr-3" />
                <span className="text-muted-foreground">Atualizações gratuitas</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-success mr-3" />
                <span className="text-muted-foreground">99.9% de uptime garantido</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              <strong>Garantia de 30 dias:</strong> Não satisfeito? Devolvemos 100% do seu dinheiro.
            </p>
          </div>
        </div>

        {/* Checkout Modal */}
        {selectedPlan && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => {
              setIsCheckoutOpen(false);
              setSelectedPlan(null);
            }}
            plan={selectedPlan}
          />
        )}
      </div>
    </section>
  );
};

export default PricingSection;