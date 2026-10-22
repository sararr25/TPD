import Link from "next/link";
export default function NotFound() {
  return (
    <section className="paper">
      <span className="meta">Page not found</span>
      <h1>
        A small
        <br />
        <em>detour.</em>
      </h1>
      <p>This page isn’t in your Passport.</p>
      <Link className="btn btn-primary" href="/">
        Back to the start
      </Link>
    </section>
  );
}
