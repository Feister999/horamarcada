import { Calendar, Clock, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleStartFree = () => {
    navigate("/cadastro");
  };

  const handleViewDemo = () => {
    const demoSection = document.getElementById('features');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background py-20 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-accent/20 rounded-full text-sm font-medium text-accent-foreground mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Powered by IA
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              Agenda Inteligente
              <span className="block text-primary">para Autônomos</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Organize seus atendimentos com IA, otimize horários automaticamente 
              e escale seu negócio com nossa plataforma profissional.
            </p>

            {/* Benefits */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-success mr-2" />
                Setup em 5 minutos
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-success mr-2" />
                Otimização automática
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-success mr-2" />
                Gratuito para começar
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 shadow-elegant text-lg px-8 py-6"
                onClick={handleStartFree}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Começar Grátis
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary text-primary hover:bg-primary/5 text-lg px-8 py-6"
                onClick={handleViewDemo}
              >
                <Clock className="w-5 h-5 mr-2" />
                Ver Demo
              </Button>
            </div>

            {/* Social proof */}
            <p className="text-sm text-muted-foreground mt-8">
              Usado por mais de <strong>1000+</strong> profissionais autônomos
            </p>
          </div>

          {/* Hero Image/Mockup */}
          <div className="relative">
            <div className="bg-card rounded-2xl shadow-elegant p-8 border">
              <div className="space-y-6">
                {/* Mock calendar header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-lg">Sua Agenda</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Online</span>
                  </div>
                </div>

                {/* Mock appointments */}
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="w-2 h-12 bg-primary rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Consulta - João Silva</p>
                      <p className="text-xs text-muted-foreground">09:00 - 10:00</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>

                  <div className="flex items-center p-3 bg-accent/10 rounded-lg border border-accent/20">
                    <div className="w-2 h-12 bg-accent rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Atendimento - Maria</p>
                      <p className="text-xs text-muted-foreground">14:30 - 15:30</p>
                    </div>
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex items-center p-3 bg-muted rounded-lg border-dashed border border-border">
                    <div className="w-2 h-12 bg-muted-foreground/30 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-muted-foreground">Horário disponível</p>
                      <p className="text-xs text-muted-foreground">16:00 - 17:00</p>
                    </div>
                  </div>
                </div>

                {/* Mock AI suggestion */}
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Sugestão da IA</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Detectamos um gap entre 15:30-16:00. Quer otimizar sua agenda?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;