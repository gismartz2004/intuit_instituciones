import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, AtSign, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { authApi } from '../services/auth.api';
import { Seo } from "@/components/common/Seo";
import LoginOwl from "./LoginOwl";

interface LoginProps {
  onLogin: (role: "student" | "admin" | "professor" | "superadmin", name: string, id: string, planId?: number, accessToken?: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [owlState, setOwlState] = useState<"idle" | "email" | "password" | "submitting" | "success" | "error">("idle");
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: "Campos incompletos", description: "Por favor ingresa usuario y contraseña.", variant: "destructive" });
      setOwlState("error");
      setTimeout(() => setOwlState("idle"), 2000);
      return;
    }

    setLoading(true);
    setOwlState("submitting");
    try {
      const data = await authApi.login({ email: username, password });
      const user = data.user;
      const roleMap: Record<number, "admin" | "professor" | "student"> = {
        1: "admin",
        2: "professor",
        3: "student"
      };
      const role = roleMap[user.roleId] || "student";

      setOwlState("success");
      onLogin(role as any, user.nombre || "", user.id.toString(), user.planId || 0, data.access_token);

      setTimeout(() => {
        let targetPath = "/dashboard";
        if (role === "admin") targetPath = "/admin";
        else if (role === "professor") targetPath = "/teach";
        setLocation(targetPath);
        toast({ title: "¡Bienvenido!", description: `Iniciando sesión como ${role}...` });
      }, 1000);

    } catch (error) {
      setOwlState("error");
      toast({ title: "Error de acceso", description: "Credenciales inválidas o error de conexión.", variant: "destructive" });
      setTimeout(() => setOwlState("idle"), 3000);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 selection:bg-purple-500/30">
      <Seo
        title="Acceso - Intuit Model Education"
        description="Inicia sesión en la plataforma educativa Intuit Model Education."
      />

      {/* --- TECH BACKGROUND LAYER --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(168, 85, 247, 0.4) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Interactive Matrix Blur Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, -40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-fuchsia-600/10 blur-[150px] rounded-full"
        />
      </div>

      {/* --- CENTERED LOGIN INTERFACE --- */}
      <div className="relative z-10 w-full max-w-md px-6 py-12 flex flex-col items-center">
        {/* Mascot Integration */}
        <div className="relative z-20 w-full flex justify-center -mb-20 pointer-events-none">
          <LoginOwl
            state={owlState}
            inputLength={username.length}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] p-8 md:p-12 overflow-visible relative pt-24"
        >

          <div className="text-center mb-8 pt-4">
            <h1 className="text-3xl font-black text-white italic tracking-tighter">
              INTUIT <span className="text-purple-500">MODEL</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.3rem] mt-2">
              Learning Ecosystem Access
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase text-slate-500 px-1 group-focus-within:text-purple-400 transition-colors">
                Email de Usuario
              </label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-purple-400" />
                <Input
                  placeholder="estudiante@intuitmodel.edu"
                  value={username}
                  onFocus={() => setOwlState("email")}
                  onBlur={() => setOwlState("idle")}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-14 pl-12 bg-slate-950/50 border-white/5 text-white placeholder:text-slate-700 focus:bg-slate-950 focus:border-purple-500/30 transition-all rounded-2xl font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase text-slate-500 px-1 group-focus-within:text-purple-400 transition-colors">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-purple-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  onFocus={() => setOwlState("password")}
                  onBlur={() => setOwlState("idle")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 pl-12 bg-slate-950/50 border-white/5 text-white placeholder:text-slate-700 focus:bg-slate-950 focus:border-purple-500/30 transition-all rounded-2xl font-medium tracking-widest"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-900/20 transition-all mt-4"
            >
              {loading ? "Sincronizando..." : "Ingresar al Aula"}
            </Button>
          </form>

          {/* Micro Footer inside Card */}
          <div className="mt-10 border-t border-white/5 pt-6 flex justify-between items-center opacity-40">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Alpha Secure
            </span>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
              v1.0.0 Stable
            </span>
          </div>
        </motion.div>

        {/* External Branding Label */}
        <p className="text-center mt-8 text-slate-700 font-black uppercase text-[8px] tracking-[0.5em] pointer-events-none">
          Intuit Model Education © 2026
        </p>
      </div>
    </div>
  );
}
