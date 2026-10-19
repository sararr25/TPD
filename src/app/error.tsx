"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="paper">
      <h1>
        A pause in
        <br />
        <em>discoveries.</em>
      </h1>
      <p>We couldn’t load this page. You can try again.</p>
      <button className="ticket" onClick={reset}>
        Try again ↗
      </button>
    </section>
  );
}
