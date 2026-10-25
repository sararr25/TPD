/** Decorative itinerary marks: never activity stamps or a geographic map. */
export function JourneyRoute({ branching = false, className = "" }: { branching?: boolean; className?: string }) {
  return (
    <svg className={`journey-route ${className}`} viewBox="0 0 360 100" fill="none" aria-hidden="true">
      <path className="journey-route-guide" d="M24 72C85 72 74 24 143 24S210 76 264 60 306 22 337 22" />
      <path data-travel-route d="M24 72C85 72 74 24 143 24S210 76 264 60 306 22 337 22" />
      {branching && <path className="journey-branch" data-travel-route d="M160 25C221 20 218 91 287 85L336 85" />}
      <g data-travel-marker><rect x="10" y="57" width="28" height="30" rx="3" /><path d="M15 57v30M20 64h12M20 69h9" /></g>
      <g data-travel-marker><circle cx="145" cy="24" r="5" /><circle cx="145" cy="24" r="13" /></g>
      <g data-travel-marker><path d="M337 7a15 15 0 0 1 15 15c0 12-15 27-15 27s-15-15-15-27a15 15 0 0 1 15-15Z" /><circle cx="337" cy="22" r="5" /></g>
      {branching && <circle data-travel-marker cx="337" cy="85" r="7" />}
    </svg>
  );
}

export function GuideFolio({ city, country, code }: { city?: string; country?: string; code: string }) {
  return (
    <div className="guide-folio">
      <span>{country || city || "Beesyde / Taste Passport"}</span>
      <span className="guide-folio-code" aria-hidden="true">{code}</span>
    </div>
  );
}
