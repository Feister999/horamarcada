
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignupClick = () => {
    navigate("/cadastro");
  };

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">
              Hora Marcada
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-foreground hover:text-primary smooth-transition">
              Funcionalidades
            </a>
            <a href="#pricing" className="text-foreground hover:text-primary smooth-transition">
              Planos
            </a>
            <a href="#contact" className="text-foreground hover:text-primary smooth-transition">
              Contato
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="hidden sm:inline-flex"
              onClick={handleLoginClick}
            >
              Entrar
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 shadow-soft"
              onClick={handleSignupClick}
            >
              Começar Grátis
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
