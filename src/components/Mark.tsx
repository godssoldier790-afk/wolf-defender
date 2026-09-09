export function WolfMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M32 4L8 16v18c0 14.2 9.6 23.8 24 28 14.4-4.2 24-13.8 24-28V16L32 4Z"
        fill="#151c27"
        stroke="#d4a017"
        strokeWidth="2.2"
      />
      <path
        d="M18 26l8-8 6 4 6-4 8 8-3 8-11 14-11-14-3-8Z"
        fill="#0b0e14"
        stroke="#c9d4e4"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M26 26l6 5 6-5" stroke="#8b97ab" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="26.5" cy="29.5" r="1.6" fill="#d4a017" />
      <circle cx="37.5" cy="29.5" r="1.6" fill="#d4a017" />
      <path d="M32 34.5v5" stroke="#9eb6d4" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M28.5 42.5c2.2 1.8 4.8 1.8 7 0" stroke="#c9d4e4" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function ColorRail() {
  return (
    <div className="flex h-1 w-full" aria-hidden="true">
      <span className="flex-1 bg-[#8a9099]" />
      <span className="flex-1 bg-gold" />
      <span className="flex-1 bg-safe" />
      <span className="flex-1 bg-danger" />
    </div>
  );
}

export function LiveDot() {
  return (
    <span className="relative flex size-2">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-safe opacity-40" />
      <span className="relative inline-flex size-2 rounded-full bg-safe" />
    </span>
  );
}
