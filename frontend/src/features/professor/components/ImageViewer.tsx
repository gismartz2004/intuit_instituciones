import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, ZoomIn, ZoomOut, Maximize, Minimize } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ImageViewerProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    altText?: string;
}

export function ImageViewer({ isOpen, onClose, imageUrl, altText = "Vista previa de imagen" }: ImageViewerProps) {
    const [scale, setScale] = useState(1);

    const toggleZoom = () => {
        setScale(prev => prev === 1 ? 2 : 1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto h-auto p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
                <VisuallyHidden>
                    <DialogTitle>{altText}</DialogTitle>
                </VisuallyHidden>
                <div className="relative group">
                    <div
                        className="relative overflow-auto max-h-[85vh] max-w-[85vw] rounded-lg shadow-2xl bg-black/50 backdrop-blur-sm transition-all duration-300"
                    >
                        <img
                            src={imageUrl}
                            alt={altText}
                            className="max-w-full max-h-[85vh] object-contain transition-transform duration-300 ease-in-out cursor-zoom-in"
                            style={{ transform: `scale(${scale})` }}
                            onClick={toggleZoom}
                        />
                    </div>

                    {/* Controls Overlay */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                            size="icon"
                            variant="secondary"
                            className="bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md"
                            onClick={toggleZoom}
                        >
                            {scale === 1 ? <ZoomIn className="w-5 h-5" /> : <ZoomOut className="w-5 h-5" />}
                        </Button>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Caption/Footer if needed */}
                    <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                        <span className="inline-block px-4 py-2 bg-black/60 text-white text-sm rounded-full backdrop-blur-md">
                            Click para {scale === 1 ? 'acercar' : 'alejar'}
                        </span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
