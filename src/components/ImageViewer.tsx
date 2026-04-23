import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from "lucide-react";

interface ImageViewerProps {
    images: string[];
    initialIndex: number;
    alt?: string;
    onClose: () => void;
}

export function ImageViewer({ images, initialIndex, alt = "Image", onClose }: ImageViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);
    const [isAnimating, setIsAnimating] = useState(true);

    const goNext = useCallback(() => {
        if (currentIndex < images.length - 1) {
            setZoom(1);
            setCurrentIndex((i) => i + 1);
        }
    }, [currentIndex, images.length]);

    const goPrev = useCallback(() => {
        if (currentIndex > 0) {
            setZoom(1);
            setCurrentIndex((i) => i - 1);
        }
    }, [currentIndex]);

    const handleZoomIn = () => setZoom((z) => Math.min(z + 0.5, 3));
    const handleZoomOut = () => setZoom((z) => Math.max(z - 0.5, 0.5));

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "+" || e.key === "=") handleZoomIn();
            if (e.key === "-") handleZoomOut();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose, goNext, goPrev]);

    // Animate in
    useEffect(() => {
        requestAnimationFrame(() => setIsAnimating(false));
    }, []);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${isAnimating ? "opacity-0" : "opacity-100"
                }`}
            onClick={onClose}
        >
            {/* Dark backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

            {/* Top bar */}
            <div
                className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Counter */}
                <div className="flex items-center gap-3">
                    <span className="text-white/80 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {currentIndex + 1} / {images.length}
                    </span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleZoomOut}
                        className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                        title="Zoom out (-)"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <span className="text-white/60 text-xs font-medium min-w-[3rem] text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                        title="Zoom in (+)"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-white/20 mx-2" />
                    <a
                        href={images[currentIndex]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                        title="Open original"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Download className="w-5 h-5" />
                    </a>
                    <div className="w-px h-6 bg-white/20 mx-2" />
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                        title="Close (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Image */}
            <div
                className="relative flex items-center justify-center w-full h-full px-20 py-20"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={images[currentIndex]}
                    alt={`${alt} ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-300 select-none"
                    style={{ transform: `scale(${zoom})` }}
                    draggable={false}
                />
            </div>

            {/* Previous button */}
            {currentIndex > 0 && (
                <button
                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 shadow-lg"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}

            {/* Next button */}
            {currentIndex < images.length - 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 shadow-lg"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-3 rounded-2xl bg-black/50 backdrop-blur-lg border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setZoom(1); setCurrentIndex(idx); }}
                            className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${idx === currentIndex
                                    ? "border-white shadow-lg shadow-white/20 scale-110"
                                    : "border-transparent opacity-50 hover:opacity-80"
                                }`}
                        >
                            <img
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
