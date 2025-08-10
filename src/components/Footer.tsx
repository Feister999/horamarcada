import { Calendar, Mail, Phone, MapPin } from "lucide-react";
const Footer = () => {
  return <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-heading font-bold">
                Hora Marcada
              </span>
            </div>
            <p className="text-background/80 mb-6 leading-relaxed">
              A agenda inteligente que transforma a gestão de atendimentos 
              para profissionais autônomos e pequenos negócios.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 bg-background/10 rounded-lg flex items-center justify-center hover:bg-primary smooth-transition">
                <span className="sr-only">Instagram</span>
                📱
              </a>
              <a href="#" className="w-8 h-8 bg-background/10 rounded-lg flex items-center justify-center hover:bg-primary smooth-transition">
                <span className="sr-only">LinkedIn</span>
                💼
              </a>
              <a href="#" className="w-8 h-8 bg-background/10 rounded-lg flex items-center justify-center hover:bg-primary smooth-transition">
                <span className="sr-only">YouTube</span>
                ▶️
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">Produto</h3>
            <ul className="space-y-4">
              <li>
                <a href="#features" className="text-background/80 hover:text-background smooth-transition">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-background/80 hover:text-background smooth-transition">
                  Planos e Preços
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background smooth-transition">
                  Demo Gratuita
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background smooth-transition">
                  API e Integrações
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background smooth-transition">
                  Atualizações
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">Suporte</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-background/80 hover:text-background smooth-transition">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background smooth-transition">
                  Tutoriais
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background smooth-transition">
                  Status do Sistema
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background smooth-transition">
                  Contato
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background smooth-transition">
                  Comunidade
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">Contato</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-background/80">contato@horamarcada.com.br</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-background/80">(11) 96508-7151</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-background/80">São Paulo, Brasil</span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-background/60 mb-3">
                Receba dicas e novidades:
              </p>
              <div className="flex">
                <input type="email" placeholder="seu@email.com" className="flex-1 px-4 py-2 rounded-l-lg text-foreground text-sm" />
                <button className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-r-lg text-primary-foreground text-sm font-medium smooth-transition">
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-background/60 text-sm">© 2025 Hora Marcada. Todos os direitos reservados.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-background/60 hover:text-background text-sm smooth-transition">
                Privacidade
              </a>
              <a href="#" className="text-background/60 hover:text-background text-sm smooth-transition">
                Termos
              </a>
              <a href="#" className="text-background/60 hover:text-background text-sm smooth-transition">
                LGPD
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;