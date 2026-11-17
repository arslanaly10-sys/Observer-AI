/** Observer mark: a lens with the horizon passing through it, and a single point of light. */
export function Logo({ className, tone = "auto" }: { className?: string; tone?: "auto" | "light" }) {
  const ink = tone === "light" ? "#ffffff" : "currentColor";
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="11.25" fill="none" stroke={ink} strokeWidth="2.5" />
      <path d="M2.5 17.5h27" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="20.5" cy="11.5" r="2.6" fill="var(--creek)" />
    </svg>
  );
}
