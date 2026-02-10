import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  BarChart3,
  BookOpen,
  Trophy,
  LogOut,
  Shield,
  Activity,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import { ModuleContentViewer } from "./ModuleContentViewer";
import { ExcelImportWizard } from "./ExcelImportWizard";
import { PlansManagementView } from "./PlansManagementView";
import { adminApi } from "../services/admin.api";
import {
  type Premio,
  type SystemStats,
  type ModuleWithStats,
} from "../types/admin.types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { AdminOverviewView } from "../dashboard/AdminOverviewView";
import { AdminUsersView } from "../users/AdminUsersView";
import { AdminModulesView } from "../modules/AdminModulesView";
import { AdminAssignmentsView } from "../assignments/AdminAssignmentsView";
import { AdminPrizesView } from "../prizes/AdminPrizesView";
import { ProfessorAssignmentsView } from "../modules/ProfessorAssignmentsView";

type AdminTab = "overview" | "users" | "modules" | "assignments" | "professors" | "prizes" | "licenses";

const TAB_IDS: AdminTab[] = [
  "overview",
  "users",
  "modules",
  "assignments",
  "professors",
  "prizes",
  "licenses",
];

const normalizeTab = (tab?: string): AdminTab => {
  if (tab && TAB_IDS.includes(tab as AdminTab)) return tab as AdminTab;
  return "overview";
};

interface AdminDashboardProps {
  user?: { role: string; name: string; id: string };
  onLogout?: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [location, setLocation] = useLocation();
  const getTabFromLocation = (path: string): AdminTab => {
    const segments = path.split("/").filter(Boolean);
    if (segments[0] === "admin" || segments[0] === "superadmin") {
      return normalizeTab(segments[1]);
    }
    return "overview";
  };

  const [activeTab, setActiveTab] = useState<AdminTab>(() =>
    getTabFromLocation(location),
  );

  const [modules, setModules] = useState<ModuleWithStats[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showAssignWizard, setShowAssignWizard] = useState(false);

  // Search states
  const [moduleSearch, setModuleSearch] = useState("");
  const [prizes, setPrizes] = useState<Premio[]>([]);
  const [prizeSearch, setPrizeSearch] = useState("");

  const { toast } = useToast();

  // Prize Dialog
  const [isPrizeDialogOpen, setIsPrizeDialogOpen] = useState(false);
  const [newPrize, setNewPrize] = useState({
    nombre: "",
    descripcion: "",
    costoPuntos: 100,
    imagenUrl: "",
    stock: 10,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setActiveTab(getTabFromLocation(location));
  }, [location]);

  const loadData = async () => {
    try {
      const [modulesData, statsData, prizesData] = await Promise.all([
        adminApi.getAllModulesWithStats(),
        adminApi.getSystemStats(),
        adminApi.getPrizes(),
      ]);
      setModules(modulesData);
      setStats(statsData);
      setPrizes(prizesData);
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToTab = (tab: AdminTab) => {
    const basePath = location.startsWith("/superadmin")
      ? "/superadmin"
      : "/admin";
    const nextPath = tab === "overview" ? basePath : `${basePath}/${tab}`;
    setActiveTab(tab);
    setLocation(nextPath);
  };

  const handleCreatePrize = async () => {
    try {
      await adminApi.createPrize(newPrize);
      loadData();
      setIsPrizeDialogOpen(false);
      setNewPrize({
        nombre: "",
        descripcion: "",
        costoPuntos: 100,
        imagenUrl: "",
        stock: 10,
      });
      toast({ title: "¡Éxito!", description: "Premio creado correctamente" });
    } catch (e) {
      toast({
        title: "Error",
        description: "No se pudo crear el premio",
        variant: "destructive",
      });
    }
  };

  const handleDeletePrize = async (prizeId: number) => {
    if (!confirm("¿Estás seguro de eliminar este premio?")) return;
    try {
      await adminApi.deletePrize(prizeId);
      loadData();
      toast({
        title: "¡Éxito!",
        description: "Premio eliminado correctamente",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el premio",
        variant: "destructive",
      });
    }
  };

  const handleInternalLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("edu_user");
      localStorage.removeItem("edu_token");
      setLocation("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f172a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold tracking-tight">
            Cargando sistema central...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background premium-gradient-bg flex">
      {/* Sidebar Command Center */}
      <div className="w-72 bg-[#0f172a] text-white flex flex-col shadow-2xl z-20 sticky top-0 h-screen border-r border-white/5">
        <div className="p-8 pb-12 flex items-center gap-3">
          <div className="bg-blue-600/20 p-2 rounded-xl backdrop-blur-md border border-blue-500/30">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase">
              ARG COMMAND
            </h1>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest leading-none">
              Management & Control
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            {
              id: "overview",
              label: "Dashboard",
              icon: BarChart3,
              color: "text-blue-400",
            },
            {
              id: "users",
              label: "Usuarios",
              icon: Users,
              color: "text-emerald-400",
            },
            {
              id: "modules",
              label: "Academia",
              icon: BookOpen,
              color: "text-purple-400",
            },
            {
              id: "assignments",
              label: "Asignaciones",
              icon: ClipboardList,
              color: "text-orange-400",
            },
            {
              id: "professors",
              label: "Docentes",
              icon: Users,
              color: "text-purple-400",
            },
            {
              id: "prizes",
              label: "Premios",
              icon: Trophy,
              color: "text-pink-400",
            },
            {
              id: "licenses",
              label: "Licencias",
              icon: CreditCard,
              color: "text-cyan-400",
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => navigateToTab(item.id as AdminTab)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold transition-all duration-300 group relative",
                activeTab === item.id
                  ? "bg-white/10 text-white shadow-lg border border-white/5"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  activeTab === item.id
                    ? item.color
                    : "text-white/20 group-hover:text-white/60",
                )}
              />
              {item.label}
              {activeTab === item.id && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 space-y-4">
          <Button
            variant="ghost"
            onClick={handleInternalLogout}
            className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-bold text-white/40 hover:text-white hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 group"
          >
            <LogOut className="w-5 h-5 text-white/20 group-hover:text-red-400 transition-colors" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Main Action Area */}
      <main className="flex-1 p-6 overflow-auto h-screen">
        <header className="flex justify-between items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-blue-200 text-blue-600 px-2 py-0.5 rounded-md text-[10px]"
              >
                ADMIN CONSOLE
              </Badge>
              /{" "}
              {activeTab === "overview"
                ? "Vista General"
                : activeTab === "users"
                  ? "Gestión de Usuarios"
                  : activeTab === "modules"
                    ? "Contenido Académico"
                    : activeTab === "assignments"
                      ? "Centro de Asignaciones"
                      : activeTab === "professors"
                        ? "Gestión de Docentes"
                        : activeTab === "prizes"
                          ? "Catálogo de Premios"
                          : "Gestión de Licencias"}
            </h2>
            <h3 className="text-4xl font-black text-slate-800 tracking-tight">
              {activeTab === "overview" && "Panel de Control"}
              {activeTab === "users" && "Directorio Global"}
              {activeTab === "modules" && "Matriz Curricular"}
              {activeTab === "assignments" && "Gestión de Accesos"}
              {activeTab === "professors" && "Staff de Módulos"}
              {activeTab === "prizes" && "Recompensas"}
              {activeTab === "licenses" && "Planes y Suscripciones"}
            </h3>
          </div>
        </header>

        <div className="space-y-6">
          {activeTab === "overview" && (
            <AdminOverviewView
              stats={stats}
              onOpenImport={() => setShowImportWizard(true)}
              onOpenAssign={() => setShowAssignWizard(true)}
            />
          )}

          {activeTab === "users" && <AdminUsersView />}

          {activeTab === "modules" && (
            <AdminModulesView
              modules={modules}
              moduleSearch={moduleSearch}
              onModuleSearchChange={setModuleSearch}
              onSelectModule={setSelectedModuleId}
            />
          )}

          {activeTab === "assignments" && <AdminAssignmentsView />}

          {activeTab === "professors" && <ProfessorAssignmentsView />}

          {activeTab === "prizes" && (
            <AdminPrizesView
              prizes={prizes}
              prizeSearch={prizeSearch}
              onPrizeSearchChange={setPrizeSearch}
              onCreatePrize={() => setIsPrizeDialogOpen(true)}
              onDeletePrize={handleDeletePrize}
            />
          )}

          {activeTab === "licenses" && <PlansManagementView />}
        </div>
      </main>

      {/* Modals */}
      {selectedModuleId && (
        <ModuleContentViewer
          moduleId={selectedModuleId}
          onClose={() => setSelectedModuleId(null)}
        />
      )}

      {showImportWizard && (
        <ExcelImportWizard
          onClose={() => setShowImportWizard(false)}
          onSuccess={() => {
            setShowImportWizard(false);
            loadData();
          }}
        />
      )}


      <Dialog open={isPrizeDialogOpen} onOpenChange={setIsPrizeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Premio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={newPrize.nombre}
                onChange={(e) =>
                  setNewPrize({ ...newPrize, nombre: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={newPrize.descripcion}
                onChange={(e) =>
                  setNewPrize({ ...newPrize, descripcion: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Costo</Label>
                <Input
                  type="number"
                  value={newPrize.costoPuntos}
                  onChange={(e) =>
                    setNewPrize({
                      ...newPrize,
                      costoPuntos: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={newPrize.stock}
                  onChange={(e) =>
                    setNewPrize({
                      ...newPrize,
                      stock: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPrizeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePrize}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
