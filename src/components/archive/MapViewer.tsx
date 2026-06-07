import {
  useState,
  useRef,
  useCallback,
  type MouseEvent as ReactMouseEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { Upload, ImagePlus } from "lucide-react";

interface MapViewerProps {
  children?: React.ReactNode;
}

export function MapViewer({ children }: MapViewerProps): React.ReactElement {
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleWheel = useCallback((e: ReactWheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.min(Math.max(prev + delta, 0.5), 5));
  }, []);

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!mapImage) return;
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        tx: translateX,
        ty: translateY,
      };
    },
    [mapImage, translateX, translateY]
  );

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setTranslateX(dragStartRef.current.tx + dx);
      setTranslateY(dragStartRef.current.ty + dy);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setMapImage(ev.target?.result as string);
        setScale(1);
        setTranslateX(0);
        setTranslateY(0);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      className="relative w-full h-full bg-background overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {mapImage ? (
        <>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
              transformOrigin: "center center",
              cursor: isDragging ? "grabbing" : "grab",
            }}
          >
            <img
              src={mapImage}
              alt="Harita"
              className="max-w-none select-none"
              draggable={false}
            />
          </div>
          {/* Pin overlay */}
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            {children}
          </div>
          {/* Change map button */}
          <div className="absolute bottom-4 right-4 z-10">
            <button
              onClick={handleUploadClick}
              className="btn-primary flex items-center gap-2 shadow-lg"
              title="Başka harita yükle"
            >
              <ImagePlus className="w-4 h-4" />
              <span className="hidden sm:inline">Harita Değiştir</span>
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-text-muted text-sm">
            Harita yüklemek için butona tıklayın
          </p>
          <button
            onClick={handleUploadClick}
            className="btn-primary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Harita Yükle
          </button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
