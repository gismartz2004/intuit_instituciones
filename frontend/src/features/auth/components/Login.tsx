import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Rocket, Lock, AtSign, Eye, EyeOff, Sparkles, Zap, GraduationCap, Terminal, Fingerprint, ShieldCheck, Cpu, Database, Network, Globe, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from '../services/auth.api';
import { Seo } from "@/components/common/Seo";
import { cn } from "@/lib/utils";

interface LoginProps {
  onLogin: (role: "student" | "admin" | "professor" | "superadmin" | "specialist" | "specialist_professor", name: string, id: string, planId?: number, accessToken?: string, especializacion?: string) => void;
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
      const data = await authApi.login({ email: username, password });
      const user = data.user;
      const roleMap: Record<number, "admin" | "professor" | "student" | "specialist" | "specialist_professor"> = {
        1: "admin",
        2: "professor",
        3: "student",
        4: "specialist",
        5: "specialist_professor"
      };
      const role = roleMap[user.roleId] || "student";

      onLogin(role as any, user.nombre || "", user.id.toString(), user.planId || 0, data.access_token, user.especializacion || undefined);

      let targetPath = "/dashboard";
      if (role === "admin") targetPath = "/admin";
      else if (role === "professor") targetPath = "/teach";
      else if (role === "specialist") targetPath = "/dashboard";
      else if (role === "specialist_professor") targetPath = "/specialist-teach";

      setLocation(targetPath);
      toast({ title: "¡Bienvenido!", description: `Iniciando sesión como ${role}...` });
    } catch (error) {
      toast({ title: "Error de acceso", description: "Credenciales inválidas o error de conexión.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#020617] selection:bg-cyan-500/30">
      <Seo
        title="Plataforma Genios Bot"
        description="Accede a la Plataforma Genios Bot, el ecosistema educativo líder para el aprendizaje de tecnología, programación y robótica gamificada. Entra ahora en academy.argsoft.tech."
        keywords="Plataforma Genios Bot, Plataforma de Genios Bot, academy.argsoft.tech, Genios Bot Academy, Genios Bot Login"
      />

      {/* --- TECH BACKGROUND LAYER --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dynamic Circuit Grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(34, 211, 238, 0.4) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Animated Flux Lines (Technical Circuits) */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <pattern id="tech-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M0 100 H40 L60 80 H100 M120 40 V80 L140 100 H200 M60 200 V160 L80 140 H140" fill="none" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="0.5" />
            <circle cx="40" cy="100" r="1.5" fill="rgba(34, 211, 238, 0.5)" />
            <circle cx="140" cy="100" r="1.5" fill="rgba(34, 211, 238, 0.5)" />
            <circle cx="120" cy="40" r="1.5" fill="rgba(34, 211, 238, 0.5)" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#tech-pattern)" />
        </svg>

        {/* Floating Digital Data Streams */}
        <div className="absolute inset-y-0 left-10 w-px bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />
        <div className="absolute inset-y-0 right-10 w-px bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />

        {/* Large Tech Accents */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] border border-cyan-500/10 rounded-full opacity-20"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[800px] h-[800px] border border-purple-500/10 rounded-full opacity-20"
        >
          <div className="absolute top-1/2 left-0 w-full h-px bg-purple-500/20 blur-sm" />
        </motion.div>

        {/* Interactive Matrix Blur Orbs */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-600/10 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, -60, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full"
        />
      </div>

      {/* --- LOGIN INTERFACE --- */}
      <div className="relative z-10 w-full max-w-[1200px] px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left Side: Tech Branding & Stats */}
        <div className="hidden lg:block space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
                <Cpu className="w-8 h-8 text-cyan-400" />
              </div>
              <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 px-4 py-1 uppercase tracking-[0.2em] font-black text-[10px] bg-cyan-400/5">
                Core Systems Online
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter italic leading-none mb-6 text-white">
              GENIOS <span className="text-cyan-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">BOT</span>
              <br />
              <span className="text-slate-700">ACADEMY v4.0</span>
            </h1>

            <p className="text-slate-400 text-lg lg:text-xl font-medium max-w-lg leading-relaxed border-l-2 border-cyan-500/30 pl-8">
              Protocolo de acceso al mejor ecosistema de alto rendimiento para el desarrollo de talento tecnológico avanzado.
            </p>
          </motion.div>

          {/* Micro Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-4 max-w-md"
          >
            {[
              { label: 'Network status', value: 'Encrypted', icon: ShieldCheck, color: 'text-emerald-500' },
              { label: 'Active nodes', value: '1,420+', icon: Network, color: 'text-cyan-500' },
              { label: 'Uptime core', value: '99.98%', icon: Activity, iconColor: 'text-purple-500' },
              { label: 'Data rate', value: '8.4 Gb/s', icon: Globe, iconColor: 'text-blue-500' }
            ].map((stat, i) => (
              <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
                <stat.icon className={cn("w-5 h-5 mb-2 opacity-50 group-hover:opacity-100 transition-opacity", stat.color || stat.iconColor)} />
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{stat.label}</p>
                <p className="text-base font-black text-white">{stat.value}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Side: Identity Verification Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Futuristic Card Container */}
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-[2rem] md:rounded-tl-[3rem]" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/20 rounded-br-[2rem] md:rounded-br-[3rem]" />

            {/* Header / Identity Icon */}
            <div className="text-center mb-8 md:mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-cyan-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-2xl relative group/icon"
              >
                <Fingerprint className="w-8 h-8 md:w-10 md:h-10 text-white group-hover/icon:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-cyan-400/20 rounded-2xl blur-xl opacity-0 group-hover/icon:opacity-100 transition-opacity duration-700" />
              </motion.div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest italic text-white flex items-center justify-center gap-3">
                <Terminal className="w-4 h-4 md:w-5 md:h-5 text-cyan-500" /> Identity Sync
              </h2>
              <div className="mt-2 text-slate-500 font-bold uppercase text-[8px] md:text-[9px] tracking-[0.3em]">Ingrese credenciales de acceso</div>
            </div>

            <form onSubmit={handleLogin} className="space-y-8">
              {/* Credential: Email */}
              <div className="space-y-3 group/field">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within/field:text-cyan-500 transition-colors">Credential ID / Email</label>
                  <AtSign className="w-3 h-3 text-slate-700 group-focus-within/field:text-cyan-500" />
                </div>
                <div className="relative">
                  <Input
                    placeholder="NAME@PROTOCOL.SYS"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 md:h-14 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-700 focus:bg-slate-950 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-500 rounded-xl px-5 font-mono text-xs md:text-sm tracking-wider"
                    required
                  />
                  {/* Subtle input scan line animation on focus */}
                  <div className="absolute inset-0 pointer-events-none border border-transparent group-focus-within/field:border-cyan-500/20 rounded-2xl overflow-hidden">
                    <motion.div
                      animate={{ y: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent hidden group-focus-within/field:block"
                    />
                  </div>
                </div>
              </div>

              {/* Credential: Keyphrase */}
              <div className="space-y-3 group/field">
                <div className="flex justify-between items-center px-1 md:px-2">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within/field:text-purple-500 transition-colors">Access Keyphrase</label>
                  <Lock className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-700 group-focus-within/field:text-purple-500" />
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 md:h-14 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-700 focus:bg-slate-950 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 transition-all duration-500 rounded-xl px-5 font-mono text-xs md:text-sm tracking-widest"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {/* Subtle input scan line animation on focus */}
                  <div className="absolute inset-0 pointer-events-none border border-transparent group-focus-within/field:border-purple-500/20 rounded-2xl overflow-hidden">
                    <motion.div
                      animate={{ y: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-full h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent hidden group-focus-within/field:block"
                    />
                  </div>
                </div>
              </div>

              {/* Action: Initialize Link */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-20 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white border-0 rounded-[2rem] font-black italic tracking-tighter text-xl shadow-2xl shadow-cyan-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group/btn"
                >
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-4"
                      >
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        AUTENTICANDO...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-4"
                      >
                        INGRESAR <Rocket className="w-6 h-6 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Button Glitch Effect Overlay */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none" />
                </Button>
              </div>
            </form>

            {/* Footer / Meta Data */}
            <div className="mt-8 md:mt-12 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Database className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-700" />
                <span className="text-[7px] md:text-[8px] font-bold text-slate-700 uppercase tracking-widest">Host: ARG_NET_ALPHA</span>
              </div>
              <div className="text-[7px] md:text-[8px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                Encrypted Tunnel <Lock className="w-2 h-2" />
              </div>
            </div>
          </div>

          {/* Exterior Decoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none -z-10" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none -z-10" />
        </motion.div>
      </div>

      {/* --- FOOTER CREDITS --- */}
      <footer className="absolute bottom-8 left-0 w-full px-12 flex justify-between items-center z-20 pointer-events-none">
        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">System Core v4.0.0-stable</p>
        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">Genios Bot Innovation © 2026</p>
      </footer>
    </div>
  );
}
