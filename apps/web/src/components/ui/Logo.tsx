interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 36, className = '' }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="NoorAI logo"
    >
      <defs>
        <radialGradient id="lg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c3e2cd" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#c3e2cd" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#40915f" />
          <stop offset="100%" stopColor="#1b3d29" />
        </linearGradient>
        <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#96cca8" />
          <stop offset="100%" stopColor="#40915f" />
        </linearGradient>
      </defs>

      {/* Ambient glow */}
      <circle cx="32" cy="32" r="30" fill="url(#lg)" />

      {/* Crescent */}
      <path
        d="M32 7 A25 25 0 1 1 32 57 A19 19 0 1 0 32 7Z"
        fill="url(#mg)"
      />

      {/* 8-pointed star — two overlapping squares */}
      <g transform="translate(32,26)">
        <rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="url(#sg)" />
        <rect
          x="-6"
          y="-6"
          width="12"
          height="12"
          rx="1.5"
          fill="url(#sg)"
          transform="rotate(45)"
          opacity="0.85"
        />
        {/* Centre dot */}
        <circle cx="0" cy="0" r="2.8" fill="white" opacity="0.92" />
      </g>
    </svg>
  );
}
