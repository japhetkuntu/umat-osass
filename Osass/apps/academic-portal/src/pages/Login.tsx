import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.email && formData.password) {
      const success = await login(formData.email, formData.password);

      if (success) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate("/dashboard");
      }
    } else {
      toast({
        title: "Sign in failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleScenarioClick = (email: string) => {
    setFormData({ email, password: "demo123" });
  };

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center p-12 overflow-hidden">
        <div className="relative z-10 max-w-lg text-primary-foreground space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary rounded-xl">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">OSASS</h1>
              <p className="text-secondary font-medium tracking-widest text-[10px] uppercase">Online Staff Appointment & Promotion System</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Staff Promotion Portal
            </h2>
            <p className="text-primary-foreground/70 text-base leading-relaxed">
              Submit and track academic promotion applications for the University of Mines and Technology, Tarkwa.
            </p>
          </div>

          <div className="pt-8 border-t border-primary-foreground/10 space-y-3">
            <p className="text-sm text-primary-foreground/60">Need help getting started?</p>
            <p className="text-sm text-primary-foreground/60">
              Contact IT Support at <span className="text-secondary font-medium">support@umat.edu.gh</span>
            </p>
          </div>
        </div>

        <div className="absolute bottom-12 left-12 flex items-center gap-2 opacity-30">
          <span className="text-sm">University of Mines and Technology, Tarkwa</span>
        </div>
      </div>

      {/* Right Side: Clean Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-background relative">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-12">
            <div className="p-4 bg-primary rounded-2xl mb-4 shadow-xl shadow-primary/20">
              <GraduationCap className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">UMaT OSASS</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Sign In</h2>
            <p className="text-muted-foreground">Enter your credentials to access the promotion portal</p>
          </div>

          <div className="border border-border rounded-lg shadow-sm">
            <div className="bg-background rounded-lg p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Staff ID or Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="text"
                      placeholder="e.g. kmensah@umat.edu.gh"
                      className="pl-10 h-12 border-muted/30 transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Password</Label>
                    <Link to="/forgot-password" title="Reset your password" className="text-xs text-primary font-bold hover:text-primary-glow transition-colors">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12 border-muted/30 transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary-glow text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20 group"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground pt-8">
            Need help? Contact <a href="mailto:support@umat.edu.gh" className="text-primary font-medium hover:underline">support@umat.edu.gh</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
