import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ImagePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    imageName: string;
    images?: { url: string; name: string }[];
    currentIndex?: number;
    onNavigate?: (index: number) => void;
}

export default function ImagePreviewModal({
    isOpen,
    onClose,
    imageUrl,
    imageName,
    images = [],
    currentIndex = 0,
    onNavigate,
}: ImagePreviewModalProps) {
    const [zoom, setZoom] = useState(1);

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
    const handleReset = () => setZoom(1);

    const handlePrevious = () => {
        if (onNavigate && currentIndex > 0) {
            onNavigate(currentIndex - 1);
            setZoom(1);
        }
    };

    const handleNext = () => {
        if (onNavigate && currentIndex < images.length - 1) {
            onNavigate(currentIndex + 1);
            setZoom(1);
        }
    };

    const hasMultipleImages = images.length > 1;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden bg-slate-950/95 border-slate-800">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h3 className="text-white font-semibold truncate max-w-md">{imageName}</h3>
                        {hasMultipleImages && (
                            <span className="text-slate-400 text-sm">
                                {currentIndex + 1} / {images.length}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleZoomOut}
                            className="text-white hover:bg-white/10"
                            disabled={zoom <= 0.5}
                        >
                            <ZoomOut className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="text-white hover:bg-white/10"
                        >
                            {Math.round(zoom * 100)}%
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleZoomIn}
                            className="text-white hover:bg-white/10"
                            disabled={zoom >= 3}
                        >
                            <ZoomIn className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white hover:bg-white/10"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Image Container */}
                <div className="w-full h-full flex items-center justify-center p-16 overflow-auto">
                    <img
                        src={imageUrl}
                        alt={imageName}
                        className="max-w-full max-h-full object-contain transition-transform duration-200"
                        style={{ transform: `scale(${zoom})` }}
                    />
                </div>

                {/* Navigation Arrows */}
                {hasMultipleImages && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 w-12 h-12 rounded-full disabled:opacity-30"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNext}
                            disabled={currentIndex === images.length - 1}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 w-12 h-12 rounded-full disabled:opacity-30"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </Button>
                    </>
                )}

                {/* Keyboard hint */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-400 text-sm bg-black/50 px-4 py-2 rounded-full">
                    ESC para cerrar {hasMultipleImages && "• ← → para navegar"}
                </div>
            </DialogContent>
        </Dialog>
    );
}
