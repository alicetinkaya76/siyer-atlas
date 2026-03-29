import { useState, useRef, useCallback, useEffect, type PointerEvent as ReactPointerEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import type { LocalizedText } from '@/types';

/* ─── TYPES ─── */
interface BattleSvgViewerProps {
  /** SVG file URL */
  src: string;
  /** Trilingual caption */
  caption?: LocalizedText;
  /** Secondary SVG (e.g. cross-section) */
  secondarySrc?: string;
  secondaryCaption?: LocalizedText;
  /** Display mode: hero (full-width banner) or tab (contained) */
  mode?: 'hero' | 'tab';
  /** Max height in px */
  maxHeight?: number;
}

/* ─── ZOOM/PAN STATE ─── */
interface ViewState {
  scale: number;
  x: number;
  y: number;
}

const INITIAL_VIEW: ViewState = { scale: 1, x: 0, y: 0 };
const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.3;

/* ─── LIGHTBOX ─── */
function SvgLightbox({
  src,
  caption,
  onClose,
}: {
  src: string;
  caption: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: 'rgba(10,10,20,0.92)', backdropFilter: 'blur(12px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
        style={{ background: 'rgba(255,255,255,0.1)' }}
        onClick={onClose}
        aria-label="Close"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {/* SVG Container */}
      <div
        className="flex max-h-[85vh] max-w-[95vw] items-center justify-center overflow-auto rounded-xl p-2"
        style={{ background: 'rgba(250,248,243,0.95)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={caption}
          className="max-h-[82vh] max-w-full object-contain"
          draggable={false}
        />
      </div>

      {/* Caption */}
      <p className="mt-3 text-center text-sm text-white/70 max-w-xl px-4">{caption}</p>
    </motion.div>
  );
}

/* ─── INLINE SVG VIEWER WITH ZOOM/PAN ─── */
function ZoomableSvg({
  src,
  caption,
  maxHeight,
  onFullscreen,
}: {
  src: string;
  caption: string;
  maxHeight: number;
  onFullscreen: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<ViewState>(INITIAL_VIEW);
  const [isPanning, setIsPanning] = useState(false);
  const lastPan = useRef({ x: 0, y: 0 });

  const zoom = useCallback((delta: number) => {
    setView((prev) => {
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale + delta));
      return { ...prev, scale: newScale };
    });
  }, []);

  const resetView = useCallback(() => {
    setView(INITIAL_VIEW);
  }, []);

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      zoom(delta);
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [zoom]);

  // Pointer pan
  const onPointerDown = (e: ReactPointerEvent) => {
    if (view.scale <= 1) return;
    setIsPanning(true);
    lastPan.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastPan.current.x;
    const dy = e.clientY - lastPan.current.y;
    lastPan.current = { x: e.clientX, y: e.clientY };
    setView((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  };

  const onPointerUp = () => {
    setIsPanning(false);
  };

  const isZoomed = view.scale !== 1;

  return (
    <div className="relative overflow-hidden rounded-xl" style={{ border: '1px solid var(--border-color)' }}>
      {/* SVG Container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{
          maxHeight,
          cursor: isZoomed ? (isPanning ? 'grabbing' : 'grab') : 'default',
          background: '#FAF8F3',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          src={src}
          alt={caption}
          className="mx-auto block w-full select-none"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.2s ease-out',
            maxHeight: maxHeight,
            objectFit: 'contain',
          }}
          draggable={false}
        />
      </div>

      {/* Controls overlay */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
        {/* Zoom controls */}
        <div
          className="flex items-center gap-0.5 rounded-lg px-1 py-0.5"
          style={{
            background: 'rgba(26,26,46,0.7)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <button
            onClick={() => zoom(-ZOOM_STEP)}
            disabled={view.scale <= MIN_SCALE}
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30"
            title="Zoom out"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
            </svg>
          </button>

          <span className="min-w-[40px] text-center text-[11px] font-mono text-white/60">
            {Math.round(view.scale * 100)}%
          </span>

          <button
            onClick={() => zoom(ZOOM_STEP)}
            disabled={view.scale >= MAX_SCALE}
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30"
            title="Zoom in"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          {isZoomed && (
            <button
              onClick={resetView}
              className="flex h-7 w-7 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10"
              title="Reset zoom"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 4.5 4.5 0 0 0-4.5 4.5" />
                <path d="M3 3v4.5h4.5" />
              </svg>
            </button>
          )}
        </div>

        {/* Fullscreen button */}
        <button
          onClick={onFullscreen}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          style={{
            background: 'rgba(26,26,46,0.7)',
            backdropFilter: 'blur(8px)',
          }}
          title="Tam ekran"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        </button>
      </div>

      {/* Caption bar */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{
          background: 'var(--bg-tertiary)',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="m9 8 6 4-6 4z" />
        </svg>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{caption}</p>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export function BattleSvgViewer({
  src,
  caption,
  secondarySrc,
  secondaryCaption,
  mode = 'tab',
  maxHeight = 480,
}: BattleSvgViewerProps) {
  const { localize } = useLocalizedField();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxCaption, setLightboxCaption] = useState('');
  const [activeView, setActiveView] = useState<'primary' | 'secondary'>('primary');

  const captionText = caption ? localize(caption) : '';
  const secondaryCaptionText = secondaryCaption ? localize(secondaryCaption) : '';

  const openLightbox = (svgSrc: string, cap: string) => {
    setLightboxSrc(svgSrc);
    setLightboxCaption(cap);
  };

  const heroHeight = mode === 'hero' ? 380 : maxHeight;

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Toggle buttons for primary/secondary SVGs */}
        {secondarySrc && (
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('primary')}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: activeView === 'primary' ? 'rgba(212,175,55,0.15)' : 'var(--bg-tertiary)',
                color: activeView === 'primary' ? 'var(--text-accent)' : 'var(--text-tertiary)',
                border: `1px solid ${activeView === 'primary' ? 'rgba(212,175,55,0.3)' : 'transparent'}`,
              }}
            >
              <svg className="mr-1.5 inline-block" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
              </svg>
              {localize({ tr: 'Genel Görünüm', en: 'Overview', ar: 'نظرة عامة' })}
            </button>
            <button
              onClick={() => setActiveView('secondary')}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: activeView === 'secondary' ? 'rgba(212,175,55,0.15)' : 'var(--bg-tertiary)',
                color: activeView === 'secondary' ? 'var(--text-accent)' : 'var(--text-tertiary)',
                border: `1px solid ${activeView === 'secondary' ? 'rgba(212,175,55,0.3)' : 'transparent'}`,
              }}
            >
              <svg className="mr-1.5 inline-block" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12h20M12 2v20" />
              </svg>
              {localize({ tr: 'Kesit', en: 'Cross-Section', ar: 'مقطع' })}
            </button>
          </div>
        )}

        {/* SVG Viewer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <ZoomableSvg
              src={activeView === 'secondary' && secondarySrc ? secondarySrc : src}
              caption={activeView === 'secondary' ? secondaryCaptionText : captionText}
              maxHeight={heroHeight}
              onFullscreen={() =>
                openLightbox(
                  activeView === 'secondary' && secondarySrc ? secondarySrc : src,
                  activeView === 'secondary' ? secondaryCaptionText : captionText,
                )
              }
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxSrc && (
          <SvgLightbox
            src={lightboxSrc}
            caption={lightboxCaption}
            onClose={() => setLightboxSrc(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
