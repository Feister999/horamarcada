import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    signIn,
    user
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    if (user) {
      const returnTo = searchParams.get('returnTo');
      if (returnTo === 'professional-plan') {
        // Redirect to Mercado Pago for professional plan
        window.open("https://mpago.la/1XdWxZ1", "_blank");
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate, searchParams]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const {
      error
    } = await signIn(email, password);
    if (!error) {
      const returnTo = searchParams.get('returnTo');
      if (returnTo === 'professional-plan') {
        // Redirect to Mercado Pago for professional plan
        window.open("https://mpago.la/1XdWxZ1", "_blank");
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
    setIsLoading(false);
  };
  return <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">Hora Marcada!</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Entrar na sua conta</CardTitle>
            <CardDescription className="text-center">
              Acesse sua agenda inteligente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Sua senha" />
              </div>

              <Button type="submit" className="w-full shadow-soft" disabled={isLoading}>
                {isLoading ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </> : 'Entrar'}
              </Button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link to="/cadastro" className="text-primary hover:underline">
                  Cadastre-se aqui
                </Link>
              </p>
              
              <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar para o início
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Login;