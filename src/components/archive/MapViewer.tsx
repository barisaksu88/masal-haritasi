import {
  useState,
  useRef,
  useCallback,
  useEffect,
  Children,
  cloneElement,
  type MouseEvent as ReactMouseEvent,
  type WheelEvent as ReactWheelEvent,
  type ReactElement,
} from "react";
import { Upload, ImagePlus, MapPin, X } from "lucide-react";
import { useCampaignStore } from "../../stores/campaignStore";
import { useArchiveStore } from "../../stores/archiveStore";
import { saveMapImage, loadMapImage } from "../../services/campaignService";
import { generateId } from "../../utils/fileUtils";
import type { MapRecord, Location, WorldRecord } from "../../types";
import { PinCreator } from "./PinCreator";

interface MapViewerProps {
  children?: React.ReactNode;
}

export function MapViewer({ children }: MapViewerProps): React.ReactElement {
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [pendingPinCoords, setPendingPinCoords] = useState<{ x: number; y: number } | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const dragMovedRef = useRef(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const imageRequestRef = useRef(0);

  const activeCampaign = useCampaignStore((s) => s.activeCampaign);
  const addRecord = useArchiveStore((s) => s.addRecord);
  const updateRecord = useArchiveStore((s) => s.updateRecord);
  const activeRegionId = useArchiveStore((s) => s.activeRegionId);
  const setActiveRegion = useArchiveStore((s) => s.setActiveRegion);
  const records = useArchiveStore((s) => s.records);
  const activeRegionMapImage =
    activeRegionId === null
      ? null
      : records.find(
          (record): record is Location =>
            record.id === activeRegionId && record.type === "location"
        )?.mapImage ?? null;

  const displayMapImage = useCallback((imageDataUrl: string | null) => {
    const requestId = ++imageRequestRef.current;
    setMapImage(imageDataUrl);

    if (!imageDataUrl) {
      setNaturalWidth(0);
      setNaturalHeight(0);
      return;
    }

    const image = new Image();
    image.onload = () => {
      if (imageRequestRef.current !== requestId) return;
      setNaturalWidth(image.naturalWidth);
      setNaturalHeight(image.naturalHeight);
    };
    image.onerror = () => {
      if (imageRequestRef.current !== requestId) return;
      setMapImage(null);
      setNaturalWidth(0);
      setNaturalHeight(0);
    };
    image.src = imageDataUrl;
  }, []);

  // Container boyutunu izle
  useEffect(() => {
    if (!containerEl) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });
    observer.observe(containerEl);
    return () => observer.disconnect();
  }, [containerEl]);

  // Yeni harita ve container boyutu için mümkün olan en büyük sığma ölçeğini kullan.
  useEffect(() => {
    if (
      naturalWidth <= 0 ||
      naturalHeight <= 0 ||
      containerSize.width <= 0 ||
      containerSize.height <= 0
    ) {
      return;
    }

    const fitScale = Math.min(
      containerSize.width / naturalWidth,
      containerSize.height / naturalHeight,
      1
    );
    const scaledWidth = naturalWidth * fitScale;
    const scaledHeight = naturalHeight * fitScale;

    setScale(fitScale);
    setTranslateX((containerSize.width - scaledWidth) / 2);
    setTranslateY((containerSize.height - scaledHeight) / 2);
  }, [
    naturalWidth,
    naturalHeight,
    containerSize.width,
    containerSize.height,
  ]);

  // Dünya ve alt bölge haritalarını tek bir kaynaktan yöneterek yarışları önle.
  useEffect(() => {
    let cancelled = false;

    setIsAddingPin(false);
    setPendingPinCoords(null);
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);

    if (activeRegionId !== null) {
      displayMapImage(activeRegionMapImage);
      return () => {
        cancelled = true;
      };
    }

    const campaignPath = activeCampaign?.path;
    if (!campaignPath) {
      displayMapImage(null);
      return () => {
        cancelled = true;
      };
    }

    loadMapImage(campaignPath)
      .then((imageDataUrl) => {
        if (!cancelled) displayMapImage(imageDataUrl);
      })
      .catch(() => {
        if (!cancelled) displayMapImage(null);
      });

    return () => {
      cancelled = true;
    };
  }, [
    activeCampaign?.path,
    activeRegionId,
    activeRegionMapImage,
    displayMapImage,
  ]);

  const handleWheel = useCallback((e: ReactWheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerEl || !mapImage || e.deltaY === 0) return;

    const rect = containerEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const newScale = Math.min(Math.max(scale + delta, 0.25), 5);

    // Mouse'un olduğu noktayı world koordinatlarına çevir
    const worldX = (mouseX - translateX) / scale;
    const worldY = (mouseY - translateY) / scale;

    // Yeni translate: mouse noktası aynı kalacak şekilde
    const newTranslateX = mouseX - worldX * newScale;
    const newTranslateY = mouseY - worldY * newScale;

    setScale(newScale);
    setTranslateX(newTranslateX);
    setTranslateY(newTranslateY);
  }, [scale, translateX, translateY, containerEl, mapImage]);

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (
        !mapImage ||
        e.button !== 0 ||
        target.closest("button, input, label, textarea, select")
      ) {
        return;
      }

      e.preventDefault();
      dragMovedRef.current = false;
      if (!isAddingPin) {
        setIsDragging(true);
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          tx: translateX,
          ty: translateY,
        };
      }
    },
    [mapImage, isAddingPin, translateX, translateY]
  );

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        dragMovedRef.current = true;
      }
      setTranslateX(dragStartRef.current.tx + dx);
      setTranslateY(dragStartRef.current.ty + dy);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMapClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement | HTMLImageElement>) => {
      if (!isAddingPin || !imgRef.current) return;

      e.stopPropagation();
      const rect = imgRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const x = (e.clientX - rect.left) * (naturalWidth / rect.width);
      const y = (e.clientY - rect.top) * (naturalHeight / rect.height);

      setPendingPinCoords({ x, y });
      setIsAddingPin(false);
    },
    [isAddingPin, naturalWidth, naturalHeight]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        displayMapImage(dataUrl);
        setScale(1);
        setTranslateX(0);
        setTranslateY(0);

        const campaignPath = activeCampaign?.path;
        if (!campaignPath) return;

        if (activeRegionId) {
          // Alt harita: aktif location'ın mapImage'ini güncelle
          const location = records.find(
            (r): r is Location => r.id === activeRegionId && r.type === "location"
          );
          if (location) {
            await updateRecord(activeRegionId, { mapImage: dataUrl } as Partial<WorldRecord>);
          }
        } else {
          // Kampanya haritası
          const imagePath = await saveMapImage(campaignPath, dataUrl);
          if (imagePath) {
            const mapRecord: MapRecord = {
              id: generateId(),
              type: "map",
              name: `Harita ${new Date().toLocaleDateString("tr-TR")}`,
              description: "",
              playerText: "",
              tags: [],
              connections: [],
              images: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isFavorite: false,
              imageFile: imagePath,
              scale: "",
              subMapIds: [],
            };
            await addRecord(mapRecord);
          }
        }
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [
      activeCampaign?.path,
      activeRegionId,
      addRecord,
      updateRecord,
      records,
      displayMapImage,
    ]
  );

  return (
    <div
      ref={setContainerEl}
      data-map-container
      data-container-size={`${Math.round(containerSize.width)}x${Math.round(containerSize.height)}`}
      data-map-scale={scale}
      className="relative w-full h-full bg-background overflow-hidden"
      style={{ cursor: isAddingPin ? "crosshair" : undefined }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Aktif bölge göstergesi */}
      {activeRegionId && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-auto bg-surface border border-border rounded-md px-3 py-2 shadow-lg">
          <span className="text-sm text-text font-medium">
            {records.find((r) => r.id === activeRegionId)?.name}
          </span>
          <button
            onClick={() => setActiveRegion(null)}
            className="text-xs text-text-muted hover:text-text bg-background-secondary px-2 py-0.5 rounded transition-colors"
          >
            Çık
          </button>
        </div>
      )}

      {mapImage && naturalWidth > 0 && naturalHeight > 0 ? (
        <>
          <div
            className="absolute left-0 top-0"
            style={{
              width: naturalWidth,
              height: naturalHeight,
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
              transformOrigin: "top left",
              cursor: isDragging ? "grabbing" : isAddingPin ? "crosshair" : "grab",
            }}
            onClick={handleMapClick}
          >
            <img
              ref={imgRef}
              src={mapImage}
              alt="Harita"
              className="block select-none w-full h-full"
              draggable={false}
              onClick={handleMapClick}
            />
            <div className="absolute inset-0">
              {Children.map(children, (child) =>
                child && typeof child === "object" && "props" in child
                  ? cloneElement(child as ReactElement<any>, {
                      scale,
                      translateX,
                      translateY,
                      mapWidth: naturalWidth,
                      mapHeight: naturalHeight,
                      isAddingPin,
                      onPinAdd: (x: number, y: number) => {
                        setPendingPinCoords({ x, y });
                        setIsAddingPin(false);
                      },
                    })
                  : child
              )}
            </div>
          </div>

          {/* Kontrol butonları */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
            {isAddingPin ? (
              <button
                onClick={() => setIsAddingPin(false)}
                className="btn-danger flex items-center gap-2 shadow-lg"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">İptal</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAddingPin(true)}
                className="btn-primary flex items-center gap-2 shadow-lg"
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Pin Ekle</span>
              </button>
            )}
            <label className="btn-secondary flex items-center gap-2 shadow-lg cursor-pointer">
              <ImagePlus className="w-4 h-4" />
              <span className="hidden sm:inline">Harita Değiştir</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4 pointer-events-auto">
          <p className="text-text-muted text-sm">
            Harita yüklemek için butona tıklayın
          </p>
          <label className="btn-primary flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Harita Yükle
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}

      {/* Pin oluşturma dialogu */}
      <PinCreator
        isOpen={pendingPinCoords !== null}
        x={pendingPinCoords?.x ?? 0}
        y={pendingPinCoords?.y ?? 0}
        onClose={() => setPendingPinCoords(null)}
      />
    </div>
  );
}
