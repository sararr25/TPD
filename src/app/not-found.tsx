import Link from "next/link";
export default function NotFound() {
  return (
    <section className="route-state">
      <span className="route-state-mark" aria-hidden>404</span>
      <div>
        <h1>We couldn’t find this page.</h1>
        <p>The link may have changed. Pick a city and start exploring from there.</p>
        <Link className="btn btn-primary" href="/explore">
          Browse cities
        </Link>
      </div>
    </section>
  );
}
