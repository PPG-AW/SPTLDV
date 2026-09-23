// Custom detailed SVG illustrations for LINIERKu

export function LogoIcon({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3A86EF" />
          <stop offset="100%" stopColor="#4EA8DE" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoGrad)" />
      <path d="M12 36V12h3v21h12v3H12z" fill="white" />
      <path d="M30 12h3v27h-3V12z" fill="#FFD166" />
      <circle cx="37" cy="36" r="3" fill="#FFD166" />
    </svg>
  );
}

export function HeroIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" fill="none" className={className}>
      {/* Background shapes */}
      <circle cx="320" cy="80" r="60" fill="#3A86EF" opacity="0.1" />
      <circle cx="80" cy="220" r="80" fill="#4EA8DE" opacity="0.1" />
      
      {/* Graph paper */}
      <rect x="50" y="40" width="300" height="220" rx="12" fill="white" stroke="#3A86EF" strokeWidth="2" />
      <path d="M50 100 L350 100 M50 160 L350 160 M50 220 L350 220" stroke="#3A86EF" strokeWidth="0.5" opacity="0.3" />
      <path d="M110 40 L110 260 M170 40 L170 260 M230 40 L230 260 M290 40 L290 260" stroke="#3A86EF" strokeWidth="0.5" opacity="0.3" />
      
      {/* Axes */}
      <path d="M80 230 L340 230" stroke="#3A86EF" strokeWidth="2" />
      <path d="M80 60 L80 240" stroke="#3A86EF" strokeWidth="2" />
      <path d="M340 228 L330 235 M340 228 L330 221" stroke="#3A86EF" strokeWidth="2" />
      <path d="M78 60 L85 70 M78 60 L71 70" stroke="#3A86EF" strokeWidth="2" />
      
      {/* Line 1 - solid blue */}
      <path d="M100 200 L300 100" stroke="#3A86EF" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="200" r="5" fill="#3A86EF" />
      <circle cx="300" cy="100" r="5" fill="#3A86EF" />
      
      {/* Line 2 - dashed tosca */}
      <path d="M100 180 L280 130" stroke="#4EA8DE" strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" />
      <circle cx="100" cy="180" r="5" fill="#4EA8DE" />
      <circle cx="280" cy="130" r="5" fill="#4EA8DE" />
      
      {/* Shaded region */}
      <path d="M100 180 L280 130 L300 100 L100 200 Z" fill="#FFD166" opacity="0.3" />
      
      {/* Labels */}
      <text x="180" y="150" fill="#3A86EF" fontSize="14" fontWeight="bold">DP</text>
      <circle cx="180" cy="145" r="2" fill="#3A86EF" />
      
      {/* Floating elements */}
      <g transform="translate(320, 200)">
        <circle r="20" fill="#FFD166" opacity="0.9" />
        <text x="0" y="5" textAnchor="middle" fill="#1E293B" fontSize="14" fontWeight="bold">x,y</text>
      </g>
      
      <g transform="translate(60, 60)">
        <rect width="30" height="30" rx="6" fill="#3A86EF" opacity="0.9" />
        <text x="15" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">≤</text>
      </g>
      
      {/* Stars decoration */}
      <g transform="translate(350, 50)">
        <path d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill="#FFD166" />
      </g>
      <g transform="translate(40, 250)">
        <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="#3A86EF" />
      </g>
    </svg>
  );
}

export function StarIcon({ filled = true, size = 24, className = '' }: { filled?: boolean; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD166" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>
      <path 
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={filled ? "url(#starGrad)" : "#E5E7EB"}
        stroke={filled ? "#F4B942" : "#D1D5DB"}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {filled && (
        <path 
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="url(#starGrad)"
          opacity="0.3"
        />
      )}
    </svg>
  );
}

export function TrophyIcon({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD166" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>
      {/* Cup */}
      <path d="M20 8 H44 V24 Q44 40 32 48 Q20 40 20 24 Z" fill="url(#trophyGrad)" />
      <path d="M20 8 H44 V24 Q44 40 32 48 Q20 40 20 24 Z" fill="white" opacity="0.2" />
      {/* Handles */}
      <path d="M20 12 Q8 12 8 24 Q8 32 18 32" stroke="#FFD166" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M44 12 Q56 12 56 24 Q56 32 46 32" stroke="#FFD166" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Base */}
      <rect x="28" y="48" width="8" height="8" fill="#3A86EF" />
      <rect x="22" y="54" width="20" height="4" rx="2" fill="#3A86EF" />
      {/* Star */}
      <path d="M32 18 L34 24 L40 24 L35 28 L37 34 L32 30 L27 34 L29 28 L24 24 L30 24 Z" fill="white" opacity="0.9" />
    </svg>
  );
}

export function CheckIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#checkGrad)" />
      <path d="M7 12 L10.5 15.5 L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function LockIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <rect x="4" y="11" width="16" height="10" rx="2" fill="#CBD5E1" />
      <path d="M8 11 V7 a4 4 0 0 1 8 0 v4" stroke="#94A3B8" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.5" fill="#64748B" />
    </svg>
  );
}

export function RocketIcon({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3A86EF" />
          <stop offset="100%" stopColor="#4EA8DE" />
        </linearGradient>
      </defs>
      {/* Rocket body */}
      <path d="M32 8 Q42 20 42 40 L22 40 Q22 20 32 8 Z" fill="url(#rocketGrad)" />
      <path d="M32 8 Q42 20 42 40 L32 40 Z" fill="white" opacity="0.2" />
      {/* Window */}
      <circle cx="32" cy="26" r="5" fill="#FFD166" stroke="white" strokeWidth="2" />
      {/* Fins */}
      <path d="M22 40 L14 52 L22 48 Z" fill="#FB923C" />
      <path d="M42 40 L50 52 L42 48 Z" fill="#FB923C" />
      {/* Base */}
      <rect x="26" y="40" width="12" height="4" rx="1" fill="#2563EB" />
      {/* Flame */}
      <path d="M28 44 Q32 56 36 44 Q34 52 32 58 Q30 52 28 44 Z" fill="#FFD166" />
      <path d="M30 44 Q32 52 34 44" stroke="#FB923C" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function ConfettiPiece({ color, delay, left }: { color: string; delay: number; left: number }) {
  return (
    <div
      className="absolute w-2 h-3 rounded-sm"
      style={{
        backgroundColor: color,
        left: `${left}%`,
        top: '-20px',
        animation: `confetti-fall 3s linear ${delay}s`,
        animationFillMode: 'forwards',
      }}
    />
  );
}

export function Confetti() {
  const colors = ['#3A86EF', '#4EA8DE', '#FFD166', '#FB923C', '#10B981', '#8B5CF6'];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <ConfettiPiece
          key={i}
          color={colors[i % colors.length]}
          delay={Math.random() * 0.5}
          left={Math.random() * 100}
        />
      ))}
    </div>
  );
}

export function BookIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      <defs>
        <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3A86EF" />
          <stop offset="100%" stopColor="#4EA8DE" />
        </linearGradient>
      </defs>
      <rect x="6" y="4" width="20" height="24" rx="2" fill="url(#bookGrad)" />
      <rect x="8" y="6" width="16" height="20" rx="1" fill="white" />
      <path d="M10 10 H22 M10 14 H20 M10 18 H18" stroke="#3A86EF" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M16 4 V28" stroke="white" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

export function BrainIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      <defs>
        <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD166" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>
      <path 
        d="M16 4 Q10 4 8 8 Q4 10 4 16 Q4 22 8 24 Q10 28 16 28 Q22 28 24 24 Q28 22 28 16 Q28 10 24 8 Q22 4 16 4 Z"
        fill="url(#brainGrad)"
      />
      <path d="M16 4 V28" stroke="white" strokeWidth="1" opacity="0.5" />
      <path d="M10 10 Q12 12 10 14 M22 10 Q20 12 22 14 M10 20 Q12 22 10 24 M22 20 Q20 22 22 24" 
        stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
