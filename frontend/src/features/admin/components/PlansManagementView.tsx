import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "../services/admin.api";
import { type Plan } from "../types/admin.types";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";

export function PlansManagementView() {
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [formData, setFormData] = useState({
        nombrePlan: "",
        precio: "",
    });

    const { toast } = useToast();

    useEffect(() => {
        fetchPlanes();
    }, []);

    const fetchPlanes = async () => {
        try {
            const data = await adminApi.getPlanes();
            setPlanes(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudieron cargar los planes",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingPlan(null);
        setFormData({ nombrePlan: "", precio: "" });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setFormData({
            nombrePlan: plan.nombrePlan,
            precio: plan.precio || "",
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.nombrePlan) {
            toast({ title: "Error", description: "El nombre es obligatorio", variant: "destructive" });
            return;
        }

        try {
            if (editingPlan) {
                await adminApi.updatePlan(editingPlan.id, formData);
                toast({ title: "¡Éxito!", description: "Plan actualizado correctamente" });
            } else {
                await adminApi.createPlan(formData);
                toast({ title: "¡Éxito!", description: "Plan creado correctamente" });
            }
            fetchPlanes();
            setIsDialogOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo guardar el plan",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar este plan?")) return;

        try {
            await adminApi.deletePlan(id);
            toast({ title: "¡Éxito!", description: "Plan eliminado correctamente" });
            fetchPlanes();
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar el plan",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Gestión de Licencias y Planes</h2>
                <Button onClick={handleOpenCreate} className="gap-2">
                    <Plus className="w-4 h-4" /> Nuevo Plan
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                        Planes Disponibles
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-10 text-center">Cargando planes...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Nombre del Plan</TableHead>
                                    <TableHead>Precio/Info</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {planes.map((plan) => (
                                    <TableRow key={plan.id}>
                                        <TableCell>{plan.id}</TableCell>
                                        <TableCell className="font-bold">{plan.nombrePlan}</TableCell>
                                        <TableCell>{plan.precio || "N/A"}</TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEdit(plan)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(plan.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {planes.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                            No hay planes definidos.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? "Editar Plan" : "Crear Nuevo Plan"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Plan</Label>
                            <Input
                                id="name"
                                value={formData.nombrePlan}
                                placeholder="Ej: Genio Digital"
                                onChange={(e) => setFormData({ ...formData, nombrePlan: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Precio o Descripción Corta</Label>
                            <Input
                                id="price"
                                value={formData.precio}
                                placeholder="Ej: $29.99 o Free"
                                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit}>
                            {editingPlan ? "Guardar Cambios" : "Crear Plan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
