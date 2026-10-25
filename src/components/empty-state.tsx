import { JourneyRoute } from "./travel-art";

// Stamped paper state shared by empty lists and unsuccessful searches.
// The next action belongs to the caller, so it always fits this page.
export function EmptyState({ title, children, action }: {
  title: string;
  children: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <section className="empty-state">
      <span className="empty-stamp" data-travel-stamp aria-hidden>BEESYDE<br />NEXT STOP</span>
      <div>
        <h2>{title}</h2>
        <div className="empty-message">{children}</div>
        <div className="actions">{action}</div>
      </div>
    </section>
  );
}

export function LoadingCards({ label, count = 3 }: { label: string; count?: number }) {
  return (
    <div aria-busy="true" className="loading-cards">
      <p className="meta" role="status">{label}</p>
      <JourneyRoute className="loading-journey-route" />
      <div className="place-grid" aria-hidden>
        {Array.from({ length: count }, (_, i) => <div className="place-card skeleton" key={i} />)}
      </div>
    </div>
  );
}
