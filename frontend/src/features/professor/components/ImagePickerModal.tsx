
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image as ImageIcon, Search, Check, Loader2, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import professorApi from "@/features/professor/services/professor.api";

interface ImagePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

export function ImagePickerModal({ isOpen, onClose, onSelect }: ImagePickerModalProps) {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchImages();
        }
    }, [isOpen]);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const data = await professorApi.getResources();
            // Filter only images
            const images = data.filter(r => r.tipo.toLowerCase().includes('image'));
            setResources(images);
        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("profesorId", "1"); // Default ID
        formData.append("carpeta", "Editor"); // Default folder for editor uploads

        try {
            const result = await professorApi.uploadFile(formData);
            toast({ title: "Éxito", description: "Imagen subida correctamente" });

            // Refresh images and select the new one if possible
            await fetchImages();
            if (result && result.url) {
                onSelect(result.url);
                onClose();
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Error al subir la imagen",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const filteredImages = resources.filter(img =>
        img.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-blue-600" />
                        Seleccionar Imagen
                    </DialogTitle>
                    <DialogDescription>
                        Elige una imagen de tu biblioteca de recursos.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2 my-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por nombre..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex-shrink-0">
                        <label htmlFor="modal-upload" className="cursor-pointer">
                            <div className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 rounded-md flex items-center justify-center transition-colors text-sm font-medium">
                                <Upload className="w-4 h-4 mr-2" />
                                {uploading ? "..." : "Subir"}
                            </div>
                        </label>
                        <input
                            id="modal-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-center items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <ScrollArea className="flex-1 pr-4">
                        {filteredImages.length === 0 ? (
                            <div className="text-center py-20 text-slate-400 border-2 border-dashed rounded-xl">
                                No se encontraron imágenes. Sube algunas en el Sistema de Archivos.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {filteredImages.map((img) => (
                                    <div
                                        key={img.id}
                                        className="group relative aspect-video rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:border-blue-500 transition-all"
                                        onClick={() => {
                                            onSelect(img.url);
                                            onClose();
                                        }}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.nombre}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Check className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[10px] text-white truncate font-medium">{img.nombre}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
