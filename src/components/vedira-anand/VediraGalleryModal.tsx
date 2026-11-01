import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { GalleryItem } from '../../data/vediraAnandData';
import { FloorPlanSvg } from './FloorPlanSvg';
import { ResilientImage } from '../ResilientImage';

interface VediraGalleryModalProps {
  isOpen: boolean;
  items: GalleryItem[];
  initialIndex: number;
  onClose: () => void;
}

export function VediraGalleryModal({
  isOpen,
  items,
  initialIndex,
  onClose,
}: VediraGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [initialIndex, isOpen]);

  const currentItem = items[currentIndex] || items[0];

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [items.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [items.length]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.35, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.35, 0.7);
      if (next <= 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleResetZoom();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen || !currentItem) return null;

  const isFloorPlanItem =
    currentItem.isFloorPlan ||
    currentItem.category === '2 BHK Floor Plan' ||
    currentItem.category === '3 BHK Floor Plan' ||
    currentItem.category === '2 BHK Isometric View';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${currentItem.title} - Image Viewer`}
      className="fixed inset-0 z-50 flex flex-col bg-[#051E18]/95 backdrop-blur-md text-white select-none animate-fadeIn"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-[#072B23]/90">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-[#FFC928] px-2.5 py-0.5 text-xs font-bold text-[#073B30]">
            {currentItem.category}
          </span>
          <h2 className="text-sm sm:text-base font-semibold text-white truncate max-w-[200px] sm:max-w-md">
            {currentItem.title}
          </h2>
          <span className="text-xs text-white/60 hidden sm:inline">
            ({currentIndex + 1} of {items.length})
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.7}
              className="p-1.5 text-white/80 hover:text-white disabled:opacity-30 rounded hover:bg-white/10 transition-colors"
              title="Zoom out (-)"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-semibold px-1 min-w-[42px] text-center text-[#FFC928]">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-1.5 text-white/80 hover:text-white disabled:opacity-30 rounded hover:bg-white/10 transition-colors"
              title="Zoom in (+)"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 text-white/80 hover:text-white rounded hover:bg-white/10 transition-colors"
              title="Reset Zoom (0)"
              aria-label="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-lg bg-white/10 hover:bg-white/20 transition-colors ml-2"
            title="Close viewer (Esc)"
            aria-label="Close image viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="flex-1 relative flex items-center justify-center p-4 overflow-hidden"
        onMouseDown={handleMouseDown}
        style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {/* Navigation Arrow Previous */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-[#064E3B] text-white border border-white/20 transition-all hover:scale-105"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Display Content Container */}
        <div
          className="transition-transform duration-100 ease-out flex items-center justify-center max-w-full max-h-full"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          }}
        >
          <div className="relative max-w-5xl max-h-[82vh] flex items-center justify-center overflow-hidden rounded-xl shadow-2xl bg-white/5 p-1 sm:p-2">
            <ResilientImage
              src={currentItem.src}
              alt={currentItem.alt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Navigation Arrow Next */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-[#064E3B] text-white border border-white/20 transition-all hover:scale-105"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Caption & Thumbnail Strip */}
      <div className="p-4 bg-[#072B23]/95 border-t border-white/10 space-y-3">
        {/* Caption */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-5xl mx-auto text-center sm:text-left">
          <div>
            <p className="text-sm font-semibold text-white">{currentItem.title}</p>
            <p className="text-xs text-white/70 max-w-3xl mt-0.5">{currentItem.caption}</p>
          </div>
          {isFloorPlanItem && (
            <span className="shrink-0 text-xs font-semibold px-3 py-1 bg-[#064E3B] text-[#FFC928] rounded-full border border-[#FFC928]/30">
              High-Precision Vector Blueprint
            </span>
          )}
        </div>

        {/* Thumbnail Selector Strip */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 max-w-5xl mx-auto scrollbar-none">
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className={`relative shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'border-[#FFC928] scale-105 shadow-md'
                  : 'border-white/20 opacity-60 hover:opacity-100'
              }`}
              title={item.title}
              aria-label={`View ${item.title}`}
            >
              <ResilientImage
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute inset-0 bg-black/20" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
