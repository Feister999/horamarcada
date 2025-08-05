import { Calendar, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary/95 to-accent relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Stars */}
          <div className="flex justify-center items-center space-x-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
            <span className="text-primary-foreground/80 ml-3 text-sm">
              4.9/5 - Mais de 500 avaliações
            </span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-heading font-bold text-primary-foreground mb-6">
            Pronto para organizar
            <span className="block">sua agenda?</span>
          </h2>
          
          <p className="text-xl text-primary-foreground/80 mb-8 leading-relaxed max-w-2xl mx-auto">
            Junte-se a milhares de profissionais que já transformaram 
            seus negócios com nossa agenda inteligente.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-primary-foreground mb-2">
                1000+
              </div>
              <div className="text-primary-foreground/80">
                Profissionais ativos
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-primary-foreground mb-2">
                50k+
              </div>
              <div className="text-primary-foreground/80">
                Agendamentos realizados
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-primary-foreground mb-2">
                98%
              </div>
              <div className="text-primary-foreground/80">
                Taxa de satisfação
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-background text-foreground hover:bg-background/90 shadow-elegant text-lg px-10 py-6 font-semibold"
            >
              <Calendar className="w-6 h-6 mr-3" />
              Começar Grátis Agora
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
            
            <div className="text-center sm:text-left">
              <p className="text-primary-foreground/80 text-sm">
                ✅ Setup em 5 minutos<br />
                ✅ Não precisa cartão de crédito<br />
                ✅ Suporte em português
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-12 pt-8 border-t border-primary-foreground/20">
            <p className="text-primary-foreground/60 text-sm mb-4">
              Confiado por profissionais em todo Brasil
            </p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="bg-primary-foreground/20 rounded-lg px-4 py-2 text-primary-foreground text-xs font-medium">
                SSL Seguro
              </div>
              <div className="bg-primary-foreground/20 rounded-lg px-4 py-2 text-primary-foreground text-xs font-medium">
                LGPD Compliant
              </div>
              <div className="bg-primary-foreground/20 rounded-lg px-4 py-2 text-primary-foreground text-xs font-medium">
                99.9% Uptime
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;