interface GeometricPatternProps {
  opacity?: number;
  className?: string;
}

/** Decorative Islamic geometric pattern overlay */
export function GeometricPattern({ opacity = 0.04, className = '' }: GeometricPatternProps) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="islamic-geo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          {/* 8-pointed star motif */}
          <g stroke="var(--text-accent)" strokeWidth="0.5" fill="none">
            <polygon points="30,5 35,15 45,15 37,22 40,32 30,26 20,32 23,22 15,15 25,15" />
            <polygon points="30,55 35,45 45,45 37,38 40,28 30,34 20,28 23,38 15,45 25,45" />
            <polygon points="5,30 15,35 15,45 22,37 32,40 26,30 32,20 22,23 15,15 15,25" />
            <polygon points="55,30 45,35 45,45 38,37 28,40 34,30 28,20 38,23 45,15 45,25" />
          </g>
          <g stroke="var(--text-accent)" strokeWidth="0.3" fill="none" opacity="0.5">
            <circle cx="30" cy="30" r="12" />
            <circle cx="30" cy="30" r="20" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-geo)" />
    </svg>
  );
}
