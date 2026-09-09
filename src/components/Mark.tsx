export function WolfMark({ className = "h-16 w-auto" }: { className?: string }) {
  return (
    <img
      src="/logo.jpg"
      alt="WOLF SIGNAL mark for WOLF DEFENDER"
      className={className}
    />
  );
}

export function WolfMarkFallback({ className = "size-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="64" height="64" rx="8" fill="#07090e" />
      <path d="M14 40c6-16 12-22 18-22s12 6 18 22" stroke="#ff2a2a" strokeWidth="2" />
      <circle cx="26" cy="30" r="2" fill="#ff2a2a" />
      <circle cx="38" cy="30" r="2" fill="#ff2a2a" />
      <path d="M48 18v22" stroke="#ff2a2a" strokeWidth="3" />
      <path d="M44 16h8l-4-6-4 6Z" fill="#ff2a2a" />
    </svg>
  );
}

export function ColorRail() {
  return (
    <div className="flex h-1 w-full" aria-hidden="true">
      <span className="flex-1 bg-[#2a1218]" />
      <span className="flex-1 bg-[#ff2a2a]" />
      <span className="flex-1 bg-[#3ecf8e]" />
      <span className="flex-1 bg-[#ff3b3b]" />
    </div>
  );
}

export function LiveDot() {
  return (
    <span className="relative flex size-2">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ff2a2a] opacity-40" />
      <span className="relative inline-flex size-2 rounded-full bg-[#ff2a2a]" />
    </span>
  );
}
