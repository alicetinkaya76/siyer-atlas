import { useState, useRef, useEffect } from 'react';

/* ─── SVG Placeholder — Islamic geometric pattern ─── */
function ImagePlaceholder({ category, className = '' }: { category: string; className?: string }) {
  const CATEGORY_ICONS: Record<string, string> = {
    weapons: '⚔️',
    architecture: '🕌',
    daily_life: '🏺',
    geography: '🌍',
    medical: '🌿',
    manuscripts: '📜',
    flags: '🏴',
  };

  const icon = CATEGORY_ICONS[category] ?? '🏛️';

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--glass-border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Geometric pattern background */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.06 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`museum-ph-${category}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <g stroke="var(--text-accent)" strokeWidth="0.4" fill="none">
              <polygon points="20,3 23,10 30,10 25,15 27,22 20,18 13,22 15,15 10,10 17,10" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#museum-ph-${category})`} />
      </svg>

      <div className="relative flex flex-col items-center gap-2 z-10">
        <span className="text-3xl opacity-40">{icon}</span>
        <span className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
          No image
        </span>
      </div>
    </div>
  );
}

/* ─── LIGHTBOX ─── */
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl z-10"
        onClick={onClose}
      >
        ✕
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
interface MuseumImageProps {
  src?: string;
  alt: string;
  category: string;
  className?: string;
  aspectRatio?: string;  // e.g. "4/3", "1/1", "16/9"
  enableLightbox?: boolean;
  rounded?: string;
}

export function MuseumImage({
  src,
  alt,
  category,
  className = '',
  aspectRatio = '4/3',
  enableLightbox = true,
  rounded = 'rounded-xl',
}: MuseumImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // No image path — show placeholder
  if (!src || error) {
    return (
      <ImagePlaceholder
        category={category}
        className={`${rounded} ${className}`}
      />
    );
  }

  return (
    <>
      <div
        ref={ref}
        className={`relative overflow-hidden ${rounded} ${className}`}
        style={{
          aspectRatio,
          background: 'var(--bg-tertiary)',
        }}
      >
        {inView && (
          <>
            {/* Loading skeleton */}
            {!loaded && (
              <div
                className="absolute inset-0 animate-pulse"
                style={{ background: 'var(--bg-tertiary)' }}
              />
            )}

            <img
              src={src}
              alt={alt}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                loaded ? 'opacity-100' : 'opacity-0'
              } ${enableLightbox ? 'cursor-zoom-in' : ''}`}
              onClick={enableLightbox ? () => setLightboxOpen(true) : undefined}
            />

            {/* Zoom icon overlay on hover */}
            {enableLightbox && loaded && (
              <div
                className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(4px)',
                }}
                onClick={() => setLightboxOpen(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                  <path d="M11 8v6M8 11h6" />
                </svg>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          src={src}
          alt={alt}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

/* ─── MUSEUM THUMBNAIL (for grid/card views) ─── */
export function MuseumThumbnail({
  src,
  alt,
  category,
  size = 'md',
}: {
  src?: string;
  alt: string;
  category: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeMap = {
    sm: 'h-20 w-20',
    md: 'h-28 w-28',
    lg: 'h-36 w-36',
  };

  return (
    <MuseumImage
      src={src}
      alt={alt}
      category={category}
      className={sizeMap[size]}
      aspectRatio="1/1"
      enableLightbox={false}
      rounded="rounded-lg"
    />
  );
}
