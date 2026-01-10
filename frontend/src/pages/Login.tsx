import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Rocket, Lock, AtSign, Eye, EyeOff } from "lucide-react";
import generatedImage from '@assets/generated_images/arg_academy_logo.png';

interface LoginProps {
  onLogin: (role: "student" | "admin" | "professor", name: string, id: string, planId?: number) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: "Campos incompletos", description: "Por favor ingresa usuario y contraseña.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Assuming 'username' input field is actually for email in the new schema
      // Or we can assume username = email for now, or update label to "Email"
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      });

      if (res.ok) {
        const data = await res.json();
        const user = data.user;
        const roleMap: Record<number, "admin" | "professor" | "student"> = {
          1: "admin",
          2: "professor",
          3: "student"
        };
        // Using roleId from new schema to determine frontend string role
        const role = roleMap[user.roleId] || "student";

        onLogin(role, user.nombre, user.id.toString(), user.planId);
        const targetPath = role === "admin" ? "/admin" : role === "professor" ? "/teach" : "/dashboard";
        setLocation(targetPath);
        toast({ title: "¡Bienvenido!", description: `Iniciando sesión como ${role}...` });
      } else {
        toast({ title: "Error de acceso", description: "Credenciales inválidas. Intenta nuevamente.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error de conexión", description: "No se pudo conectar con el servidor.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md border-0 shadow-2xl z-10 bg-white/95 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#0047AB] to-[#0066CC] p-8 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          {/* <img src={generatedImage} alt="Logo" className="w-20 h-20 mx-auto mb-4 invert drop-shadow-md transition-transform hover:scale-105 duration-300" /> */}
          <h1 className="text-3xl font-black tracking-tight mb-1">ARG ACADEMY</h1>
          <p className="text-blue-100 font-medium text-sm tracking-wide">Plataforma de Educación Inteligente</p>
        </div>

        <CardContent className="pt-8 px-8 pb-6">
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-xs ml-1">Email</Label>
                <div className="relative group">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0047AB] transition-colors" />
                  <Input
                    placeholder="Ingresa tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-11 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0047AB] transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-xs ml-1">Contraseña</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0047AB] transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0047AB] transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 bg-[#0047AB] hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-900/20 text-white text-base font-bold rounded-xl mt-2">
              {loading ? "Autenticando..." : "INGRESAR AL SISTEMA"} {!loading && <Rocket className="ml-2 w-5 h-5" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-slate-100 py-4 bg-slate-50/50">
          <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
            Acceso Seguro • Genios Bot Innovation
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
