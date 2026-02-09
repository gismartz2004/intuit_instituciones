import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import professorApi from "@/features/professor/services/professor.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    FileText,
    Video,
    Image as ImageIcon,
    File,
    Search,
    Upload,
    Trash2,
    Download,
    Folder,
    FolderPlus,
    ChevronRight,
    Home,
    Eye,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import ImagePreviewModal from "./ImagePreviewModal";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface Resource {
    id: number;
    nombre: string;
    tipo: string;
    url: string;
    peso: number;
    fechaSubida: string;
    carpeta?: string;
}

interface FolderNode {
    name: string;
    path: string;
    children: FolderNode[];
}

export default function FileSystem() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [uploading, setUploading] = useState(false);
    const [currentFolder, setCurrentFolder] = useState<string>("");
    const [folders, setFolders] = useState<FolderNode>({
        name: "root",
        path: "",
        children: [],
    });
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    // Deletion state
    const [itemToDelete, setItemToDelete] = useState<{ id?: number; path?: string; type: 'file' | 'folder' } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Image preview state
    const [previewImage, setPreviewImage] = useState<{
        url: string;
        name: string;
        index: number;
    } | null>(null);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const data = await professorApi.getResources();
            setResources(data);
            buildFolderTree(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching resources:", error);
            setLoading(false);
        }
    };

    const buildFolderTree = (resources: Resource[]) => {
        const root: FolderNode = { name: "root", path: "", children: [] };
        const folderMap = new Map<string, FolderNode>();
        folderMap.set("", root);

        resources.forEach((resource) => {
            if (resource.carpeta) {
                const parts = resource.carpeta.split("/").filter(Boolean);
                let currentPath = "";

                parts.forEach((part, index) => {
                    const parentPath = currentPath;
                    currentPath = currentPath ? `${currentPath}/${part}` : part;

                    if (!folderMap.has(currentPath)) {
                        const newFolder: FolderNode = {
                            name: part,
                            path: currentPath,
                            children: [],
                        };
                        const parent = folderMap.get(parentPath)!;
                        parent.children.push(newFolder);
                        folderMap.set(currentPath, newFolder);
                    }
                });
            }
        });

        setFolders(root);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("profesorId", "1");
        if (currentFolder) {
            formData.append("carpeta", currentFolder);
        }

        try {
            await professorApi.uploadFile(formData);
            toast({ title: "Éxito", description: "Archivo subido correctamente" });
            fetchResources();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Error al subir el archivo",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;

        const newPath = currentFolder
            ? `${currentFolder}/${newFolderName}`
            : newFolderName;

        // Simulate folder creation (in real app, call API)
        const mockResource: Resource = {
            id: Date.now(),
            nombre: ".folder",
            tipo: "folder",
            url: "",
            peso: 0,
            fechaSubida: new Date().toISOString(),
            carpeta: newPath,
        };

        setResources([...resources, mockResource]);
        buildFolderTree([...resources, mockResource]);
        setNewFolderName("");
        setShowNewFolderDialog(false);
        toast({ title: "Carpeta creada", description: newFolderName });
    };

    const handleDeleteFile = async (resource: Resource) => {
        try {
            await professorApi.deleteResource(resource.id);
            toast({ title: "Eliminado", description: `Archivo ${resource.nombre} eliminado` });
            fetchResources();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudo eliminar el archivo", variant: "destructive" });
        }
    };

    const handleDeleteFolder = async (path: string) => {
        try {
            await professorApi.deleteFolder(path);
            toast({ title: "Carpeta eliminada", description: `La carpeta y su contenido han sido eliminados` });
            if (currentFolder === path || currentFolder.startsWith(path + '/')) {
                setCurrentFolder("");
            }
            fetchResources();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudo eliminar la carpeta", variant: "destructive" });
        }
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        if (itemToDelete.type === 'file' && itemToDelete.id) {
            handleDeleteFile(resources.find(r => r.id === itemToDelete.id)!);
        } else if (itemToDelete.type === 'folder' && itemToDelete.path) {
            handleDeleteFolder(itemToDelete.path);
        }
        setShowDeleteConfirm(false);
        setItemToDelete(null);
    };

    const getFileIcon = (tipo: string) => {
        if (tipo.includes("pdf")) return <FileText className="w-8 h-8 text-red-500" />;
        if (tipo.includes("video")) return <Video className="w-8 h-8 text-blue-500" />;
        if (tipo.includes("image")) return <ImageIcon className="w-8 h-8 text-green-500" />;
        return <File className="w-8 h-8 text-gray-500" />;
    };

    const filteredResources = resources.filter(
        (r) =>
            r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (r.carpeta || "") === currentFolder &&
            r.nombre !== ".folder"
    );

    const imageResources = filteredResources.filter((r) => r.tipo.includes("image"));

    const handleImageClick = (resource: Resource) => {
        const index = imageResources.findIndex((img) => img.id === resource.id);
        setPreviewImage({
            url: resource.url,
            name: resource.nombre,
            index,
        });
    };

    const handleImageNavigate = (newIndex: number) => {
        const newImage = imageResources[newIndex];
        setPreviewImage({
            url: newImage.url,
            name: newImage.nombre,
            index: newIndex,
        });
    };

    const breadcrumbs = currentFolder ? currentFolder.split("/") : [];

    const renderFolderTree = (node: FolderNode, level = 0) => {
        if (level === 0 && node.children.length === 0) return null;

        return (
            <div className={level > 0 ? "ml-4" : ""}>
                {node.children.map((child) => (
                    <div key={child.path}>
                        <button
                            onClick={() => setCurrentFolder(child.path)}
                            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${currentFolder === child.path
                                ? "bg-blue-50 text-blue-700 font-semibold"
                                : "hover:bg-slate-100 text-slate-700"
                                }`}
                        >
                            <Folder className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate text-sm">{child.name}</span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setItemToDelete({ path: child.path, type: 'folder' });
                                setShowDeleteConfirm(true);
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Eliminar carpeta"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        {renderFolderTree(child, level + 1)}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar - Folder Tree */}
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="font-bold text-slate-800 mb-4">Carpetas</h2>
                    <Button
                        onClick={() => setShowNewFolderDialog(true)}
                        size="sm"
                        className="w-full"
                        variant="outline"
                    >
                        <FolderPlus className="w-4 h-4 mr-2" />
                        Nueva Carpeta
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <button
                        onClick={() => setCurrentFolder("")}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left mb-2 transition-colors ${currentFolder === ""
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "hover:bg-slate-100 text-slate-700"
                            }`}
                    >
                        <Home className="w-4 h-4" />
                        <span className="text-sm">Inicio</span>
                    </button>
                    {renderFolderTree(folders)}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Sistema de Archivos</h1>
                            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                                <Home className="w-4 h-4" />
                                {breadcrumbs.length === 0 ? (
                                    <span>Inicio</span>
                                ) : (
                                    breadcrumbs.map((crumb, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <ChevronRight className="w-4 h-4" />
                                            <button
                                                onClick={() =>
                                                    setCurrentFolder(breadcrumbs.slice(0, index + 1).join("/"))
                                                }
                                                className="hover:text-blue-600 transition-colors"
                                            >
                                                {crumb}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
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
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar archivos..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* File Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <AnimatePresence>
                            {filteredResources.map((resource) => (
                                <motion.div
                                    key={resource.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <Card className="hover:shadow-lg transition-shadow border-slate-200 overflow-hidden">
                                        <CardContent className="p-4">
                                            {/* Thumbnail or Icon */}
                                            <div className="w-full aspect-square bg-slate-100 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                                                {resource.tipo.includes("image") ? (
                                                    <img
                                                        src={resource.url}
                                                        alt={resource.nombre}
                                                        className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                                                        onClick={() => handleImageClick(resource)}
                                                    />
                                                ) : (
                                                    getFileIcon(resource.tipo)
                                                )}
                                            </div>

                                            {/* File Info */}
                                            <div className="space-y-2">
                                                <h3
                                                    className="font-semibold text-sm text-slate-800 truncate"
                                                    title={resource.nombre}
                                                >
                                                    {resource.nombre}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    {(resource.peso / 1024 / 1024).toFixed(2)} MB
                                                </p>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    {resource.tipo.includes("image") && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1 text-xs"
                                                            onClick={() => handleImageClick(resource)}
                                                        >
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            Ver
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 text-xs"
                                                        onClick={() => window.open(resource.url, "_blank")}
                                                    >
                                                        <Download className="w-3 h-3 mr-1" />
                                                        Abrir
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => {
                                                            setItemToDelete({ id: resource.id, type: 'file' });
                                                            setShowDeleteConfirm(true);
                                                        }}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredResources.length === 0 && (
                        <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                            <Folder className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>No hay archivos en esta carpeta</p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Folder Dialog */}
            <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nueva Carpeta</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="folder-name">Nombre de la carpeta</Label>
                        <Input
                            id="folder-name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Mi carpeta"
                            className="mt-2"
                            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                            Crear
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Preview Modal */}
            {previewImage && (
                <ImagePreviewModal
                    isOpen={!!previewImage}
                    onClose={() => setPreviewImage(null)}
                    imageUrl={previewImage.url}
                    imageName={previewImage.name}
                    images={imageResources.map((img) => ({ url: img.url, name: img.nombre }))}
                    currentIndex={previewImage.index}
                    onNavigate={handleImageNavigate}
                />
            )}

            {/* Deletion Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-5 h-5" />
                            Confirmar Eliminación
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-slate-600">
                            {itemToDelete?.type === 'folder'
                                ? "¿Estás seguro de que deseas eliminar esta carpeta? Se eliminarán todos los archivos contenidos en ella de forma permanente."
                                : "¿Estás seguro de que deseas eliminar este archivo de forma permanente?"}
                        </p>
                        {itemToDelete?.path && (
                            <p className="mt-2 text-sm font-semibold text-slate-800">
                                Ruta: {itemToDelete.path}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
