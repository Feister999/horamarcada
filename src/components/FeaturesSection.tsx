import { 
  Calendar, 
  Clock, 
  Smartphone, 
  Zap, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Shield,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FeaturesSection = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "IA Inteligente",
      description: "Algoritmo que otimiza automaticamente sua agenda, priorizando horários mais lucrativos e evitando conflitos.",
      highlights: ["Otimização automática", "Priorização de horários", "Prevenção de conflitos"]
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Agenda Profissional",
      description: "Interface limpa e intuitiva para gerenciar todos os seus atendimentos com facilidade total.",
      highlights: ["Design intuitivo", "Visão semanal/mensal", "Sincronização em tempo real"]
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Automação Completa",
      description: "Envio automático de confirmações, lembretes via WhatsApp e emails personalizados para seus clientes.",
      highlights: ["WhatsApp integrado", "Emails automáticos", "Mensagens personalizadas"]
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "100% Responsivo",
      description: "Acesse e gerencie sua agenda de qualquer dispositivo, desktop ou mobile, com sincronização instantânea.",
      highlights: ["Mobile-first", "Sincronização cloud", "Offline-ready"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Relatórios Inteligentes",
      description: "Insights detalhados sobre seus horários mais procurados, taxa de cancelamento e receita projetada.",
      highlights: ["Dashboard analytics", "Relatórios semanais", "Projeção de receita"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Segurança Total",
      description: "Seus dados e de seus clientes protegidos com criptografia de ponta e conformidade LGPD.",
      highlights: ["Criptografia SSL", "Conformidade LGPD", "Backup automático"]
    }
  ];

  return (
    <section id="features" className="py-20 bg-brand-gray-light/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Funcionalidades
          </div>
          
          <h2 className="text-3xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Tudo que você precisa
            <span className="block text-primary">em uma plataforma</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Desenvolvemos cada funcionalidade pensando no dia a dia do profissional autônomo. 
            Simples de usar, poderoso nos resultados.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-card hover:shadow-soft smooth-transition bg-background">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-heading">{feature.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-muted-foreground mb-4 leading-relaxed">
                  {feature.description}
                </CardDescription>
                
                <div className="space-y-2">
                  {feature.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-success mr-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Mais de <strong>50 funcionalidades</strong> para profissionalizar seu negócio
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-medium shadow-elegant smooth-transition"
              onClick={() => {
                const pricingSection = document.getElementById('pricing');
                if (pricingSection) {
                  pricingSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Explorar Todas as Funcionalidades
            </button>
            <button 
              className="border border-primary text-primary hover:bg-primary/5 px-8 py-4 rounded-xl font-medium smooth-transition"
              onClick={() => {
                window.open('https://demo.horamarcada.com', '_blank');
              }}
            >
              Ver Demo Completa
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;