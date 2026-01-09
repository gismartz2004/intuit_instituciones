import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Settings as SettingsIcon, Bell, Lock, Palette } from "lucide-react";

interface ProfileProps {
  user: { name: string; role: string; plan?: string };
}

export default function Profile({ user }: ProfileProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-[#0047AB] rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-200">
          {user.name[0]}
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{user.name}</h1>
          <div className="flex gap-2 mt-2">
            <Badge className="bg-blue-100 text-[#0047AB] border-none uppercase tracking-widest text-[10px]">{user.role}</Badge>
            {user.plan && (
              <Badge className="bg-yellow-100 text-yellow-700 border-none uppercase tracking-widest text-[10px]">Plan {user.plan}</Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1 border-2 border-slate-100 rounded-xl w-full justify-start overflow-x-auto">
          <TabsTrigger value="profile" className="rounded-lg font-bold gap-2">
            <User className="w-4 h-4" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg font-bold gap-2">
            <SettingsIcon className="w-4 h-4" /> Ajustes
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg font-bold gap-2">
            <Bell className="w-4 h-4" /> Notificaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-2 border-slate-100">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Datos básicos de tu cuenta en ARG Academy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-500 font-bold uppercase text-[10px]">Nombre Completo</Label>
                  <Input defaultValue={user.name} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-500 font-bold uppercase text-[10px]">Email</Label>
                  <Input defaultValue={`${user.name.toLowerCase().replace(" ", ".")}@example.com`} />
                </div>
              </div>
              <Button className="bg-[#0047AB] btn-gamified h-10 px-6 mt-4">Guardar Cambios</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-2 border-slate-100">
            <CardHeader>
              <CardTitle>Seguridad y Apariencia</CardTitle>
              <CardDescription>Personaliza tu experiencia de aprendizaje.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Lock className="text-slate-400" />
                  <div>
                    <p className="font-bold text-slate-700">Cambiar Contraseña</p>
                    <p className="text-xs text-slate-400">Último cambio hace 3 meses</p>
                  </div>
                </div>
                <Button variant="outline">Actualizar</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Palette className="text-slate-400" />
                  <div>
                    <p className="font-bold text-slate-700">Modo de Interfaz</p>
                    <p className="text-xs text-slate-400">Actual: Claro</p>
                  </div>
                </div>
                <Button variant="outline">Cambiar a Oscuro</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
