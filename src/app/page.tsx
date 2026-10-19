import Link from "next/link";
import { PassportCard } from "@/components/passport-card";
export default function Home() {
  return (
    <div className="grid">
      <section>
        <span className="meta">Keep the feeling. Change the place.</span>
        <h1>
          Your taste.
          <br />A different
          <br />
          <em>way in.</em>
        </h1>
        <p className="lead">
          The place you wanted doesn’t work? Find an alternative that keeps what
          you love.
        </p>
        <div className="actions">
          <Link className="ticket" href="/passport">
            Make my Passport ↗
          </Link>
          <Link href="/passport?guest=1">Try a guest profile</Link>
        </div>
        <p className="muted">Start with 3–5 favourites. No account needed.</p>
      </section>
      <PassportCard />
    </div>
  );
}
