import React, { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  isDark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', isDark = false }) => {
  const [imgFailed, setImgFailed] = useState(false);

  // Dimension presets maintaining strict aspect ratio and clear spacing
  const dimensions = {
    sm: { width: 140, height: 42, iconSize: 28, textScale: 'text-sm' },
    md: { width: 190, height: 56, iconSize: 36, textScale: 'text-base' },
    lg: { width: 260, height: 76, iconSize: 48, textScale: 'text-xl' },
    hero: { width: 320, height: 94, iconSize: 62, textScale: 'text-2xl' },
  }[size];

  // Try loading exact logo file if user provided one in public/logo.png or logo.svg
  if (!imgFailed) {
    return (
      <div
        className={`inline-flex items-center justify-center select-none transition-all duration-300 ${className}`}
        style={{ maxWidth: '100%' }}
      >
        <img
          src="/logo.png"
          alt="Pianotastic Academy Logo"
          className="object-contain transition-all duration-200"
          style={{
            height: `${dimensions.height}px`,
            maxHeight: '100%',
            maxWidth: '100%',
          }}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  // Exact vector brand emblem maintaining exact proportions, colors (#081F5C and #F7F2EB), and clear spacing
  const navyColor = '#081F5C';
  const creamColor = '#F7F2EB';
  const goldColor = '#C5A869';

  return (
    <div
      className={`inline-flex items-center gap-3.5 select-none transition-all duration-300 ${className}`}
      aria-label="Pianotastic Academy"
    >
      {/* Visual Emblem: Grand Piano Wing & Stylized Keyboard Keys */}
      <div
        className="relative flex-shrink-0 flex items-center justify-center rounded-xl p-2 transition-colors duration-300"
        style={{
          width: `${dimensions.iconSize + 14}px`,
          height: `${dimensions.iconSize + 14}px`,
          background: isDark
            ? 'linear-gradient(145deg, #0A246B 0%, #081F5C 100%)'
            : 'linear-gradient(145deg, #081F5C 0%, #0E2E80 100%)',
          boxShadow: isDark
            ? '0 6px 18px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.15)'
            : '0 6px 20px rgba(8,31,92,0.18), inset 0 1px 1px rgba(255,255,255,0.2)',
          border: isDark ? '1px solid rgba(197, 168, 105, 0.35)' : '1px solid rgba(8, 31, 92, 0.1)',
        }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Grand Piano Wing Silhouette */}
          <path
            d="M10 44C10 24 18 10 38 10C48 10 54 16 54 26C54 36 50 44 48 44H10Z"
            fill={goldColor}
            fillOpacity="0.88"
          />
          {/* Inner Grand Piano Soundboard contour */}
          <path
            d="M14 42C14 26 22 14 38 14C46 14 50 18 50 26C50 34 46 42 44 42H14Z"
            fill={isDark ? '#081F5C' : '#05143D'}
          />
          {/* Harp strings subtle resonance */}
          <line x1="24" y1="20" x2="24" y2="40" stroke={goldColor} strokeWidth="1" strokeOpacity="0.4" />
          <line x1="29" y1="22" x2="29" y2="40" stroke={goldColor} strokeWidth="1" strokeOpacity="0.4" />
          <line x1="34" y1="25" x2="34" y2="40" stroke={goldColor} strokeWidth="1" strokeOpacity="0.4" />
          <line x1="39" y1="29" x2="39" y2="40" stroke={goldColor} strokeWidth="1" strokeOpacity="0.4" />

          {/* Piano Keyboard Base Bar */}
          <rect x="8" y="44" width="48" height="12" rx="2" fill={creamColor} />
          {/* Keyboard Key Separator Lines */}
          <line x1="16" y1="44" x2="16" y2="56" stroke="#081F5C" strokeWidth="0.75" />
          <line x1="24" y1="44" x2="24" y2="56" stroke="#081F5C" strokeWidth="0.75" />
          <line x1="32" y1="44" x2="32" y2="56" stroke="#081F5C" strokeWidth="0.75" />
          <line x1="40" y1="44" x2="40" y2="56" stroke="#081F5C" strokeWidth="0.75" />
          <line x1="48" y1="44" x2="48" y2="56" stroke="#081F5C" strokeWidth="0.75" />

          {/* Black Keys */}
          <rect x="13.5" y="44" width="5" height="7" rx="1" fill="#081F5C" />
          <rect x="21.5" y="44" width="5" height="7" rx="1" fill="#081F5C" />
          <rect x="37.5" y="44" width="5" height="7" rx="1" fill="#081F5C" />
          <rect x="45.5" y="44" width="5" height="7" rx="1" fill="#081F5C" />
        </svg>
      </div>

      {/* Official Typography Unit with strict proportions */}
      <div className="flex flex-col justify-center leading-none">
        <span
          className="font-display font-bold tracking-[0.14em] uppercase transition-colors duration-300"
          style={{
            fontSize: size === 'hero' ? '1.75rem' : size === 'lg' ? '1.35rem' : size === 'md' ? '1.1rem' : '0.9rem',
            color: isDark ? creamColor : navyColor,
            textShadow: isDark ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
          }}
        >
          Pianotastic
        </span>
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className="w-2.5 h-[1px]"
            style={{ backgroundColor: goldColor }}
          />
          <span
            className="font-body font-semibold tracking-[0.32em] text-[10px] md:text-[11px] uppercase transition-colors duration-300"
            style={{
              color: isDark ? '#D8CFBC' : '#3E4F7D',
            }}
          >
            Academy
          </span>
          <span
            className="w-2.5 h-[1px]"
            style={{ backgroundColor: goldColor }}
          />
        </div>
      </div>
    </div>
  );
};
