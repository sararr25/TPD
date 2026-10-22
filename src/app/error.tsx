"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="route-state">
      <span className="route-state-mark" aria-hidden>↻</span>
      <div>
        <h1>This page couldn’t load.</h1>
        <p>Something went wrong while loading it. Try again to pick up where you left off.</p>
        <button className="btn btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </section>
  );
}
