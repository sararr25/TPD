// Decorative linework shared by the Home cover and its paper page.
export function PassportSecurityLines() {
  return (
    <svg className="h-security" viewBox="0 0 600 700" preserveAspectRatio="none" fill="none" aria-hidden="true">
      {Array.from({ length: 60 }, (_, i) => (
        <path key={i} d={`M-100 ${i * 14} C150 ${i * 14 - 145} 350 ${i * 14 + 145} 700 ${i * 14 - 40}`} />
      ))}
    </svg>
  );
}

export function PassportEmblem({ className = "h-emblem" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <circle cx="100" cy="100" r="86" />
      <circle cx="100" cy="100" r="77" strokeDasharray="1 5" />
      <circle cx="100" cy="100" r="53" />
      <ellipse cx="100" cy="100" rx="23" ry="53" />
      <path d="M47 100h106M58 71h84M58 129h84" />
      <text x="100" y="32" textAnchor="middle">BEESYDE</text>
      <text x="100" y="173" textAnchor="middle">TASTE PASSPORT</text>
    </svg>
  );
}
