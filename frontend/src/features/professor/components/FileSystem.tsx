import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Video, Image, File, Search, Upload, Trash2, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Resource {
    id: number;
    nombre: string;
    tipo: string;
    url: string;
    peso: number;
    fechaSubida: string;
}

export default function FileSystem() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const res = await fetch("http://localhost:3000/api/professor/resources");
            if (res.ok) {
                const data = await res.json();
                setResources(data);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching resources:", error);
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("profesorId", "1"); // Hardcoded for now

        try {
            const res = await fetch("http://localhost:3000/api/professor/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                toast({ title: "Éxito", description: "Archivo subido correctamente" });
                fetchResources();
            } else {
                toast({ title: "Error", description: "Error al subir el archivo", variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Error de conexión", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = (tipo: string) => {
        if (tipo.includes("pdf")) return <FileText className="w-8 h-8 text-red-500" />;
        if (tipo.includes("video")) return <Video className="w-8 h-8 text-blue-500" />;
        if (tipo.includes("image")) return <Image className="w-8 h-8 text-green-500" />;
        return <File className="w-8 h-8 text-gray-500" />;
    };

    const filteredResources = resources.filter(r =>
        r.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Sistema de Archivos</h1>
                    <p className="text-slate-500">Biblioteca de recursos para tus cursos</p>
                </div>
                <div>
                    <Label htmlFor="file-upload" className="cursor-pointer">
                        <div className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                            <Upload className="w-4 h-4 mr-2" />
                            {uploading ? "Subiendo..." : "Subir Archivo"}
                        </div>
                    </Label>
                    <Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8 max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="Buscar archivos..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredResources.map((resource) => (
                    <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow border-slate-200">
                            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                                    {getFileIcon(resource.tipo)}
                                </div>
                                <div className="w-full">
                                    <h3 className="font-bold text-slate-800 truncate w-full" title={resource.nombre}>
                                        {resource.nombre}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {(resource.peso / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <div className="flex gap-2 w-full mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => window.open(resource.url, '_blank')}
                                    >
                                        <Download className="w-3 h-3 mr-2" />
                                        Ver
                                    </Button>
                                    {/* Delete button could go here */}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredResources.length === 0 && (
                <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                    <p>No se encontraron archivos</p>
                </div>
            )}
        </div>
    );
}
