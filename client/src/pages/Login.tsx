import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Shield, User, Rocket } from "lucide-react";
import generatedImage from '@assets/generated_images/arg_academy_logo.png';

interface LoginProps {
  onLogin: (role: "student" | "admin" | "professor", name: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [role, setRole] = useState<"student" | "admin" | "professor">("student");
  const [name, setName] = useState("");
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onLogin(role, name);
    setLocation(role === "admin" ? "/admin" : role === "professor" ? "/teach" : "/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-2 border-slate-100 shadow-xl overflow-hidden">
        <div className="bg-[#0047AB] p-8 text-center text-white">
          <img src={generatedImage} alt="Logo" className="w-16 h-16 mx-auto mb-4 invert" />
          <h1 className="text-3xl font-black tracking-tight mb-2">ARG ACADEMY</h1>
          <p className="text-blue-100 font-medium">Portal de Ecosistema Educativo</p>
        </div>
        <CardContent className="pt-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-600 font-bold uppercase text-xs tracking-widest">Tu Nombre</Label>
              <Input 
                placeholder="Ingresa tu nombre..." 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 border-2 border-slate-100 focus:border-[#0047AB] transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600 font-bold uppercase text-xs tracking-widest">Rol de Acceso</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "student", icon: User, label: "Alumno" },
                  { id: "professor", icon: GraduationCap, label: "Profe" },
                  { id: "admin", icon: Shield, label: "Admin" }
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      role === r.id 
                        ? "border-[#0047AB] bg-blue-50 text-[#0047AB]" 
                        : "border-slate-100 text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <r.icon className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold uppercase">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full h-12 bg-[#0047AB] hover:bg-blue-700 btn-gamified text-white text-lg font-black">
              ENTRAR <Rocket className="ml-2 w-5 h-5" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-slate-50 py-4">
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Genios Bot Innovation Center</p>
        </CardFooter>
      </Card>
    </div>
  );
}
