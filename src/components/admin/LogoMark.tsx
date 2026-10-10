export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-brand text-white ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-[60%] w-[60%]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M7 9a4 4 0 0 1 0 6" />
        <path d="M11 6a9 9 0 0 1 0 12" />
        <path d="M15 3a14 14 0 0 1 0 18" />
      </svg>
    </span>
  );
}
