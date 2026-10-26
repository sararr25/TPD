import { PassportSecurityLines } from "./passport-art";
import { QuizIcon } from "./quiz-icon";
import { AXES, INTERESTS, INTEREST_ICON, type Axis, type Interest, type Profile } from "@/lib/quiz";


// The Passport data page built from the quiz: a traveller type, four axes,
// interest stamps and the artists/films in use as "visas".
export function PassportProfile({
  profile,
  holder,
  signals,
}: {
  profile: Profile;
  holder?: string | null;
  signals: readonly string[];
}) {
  const name = holder?.trim() || "Traveller";
  const stamps = (Object.keys(INTERESTS) as Interest[])
    .filter((k) => profile.interests[k] >= 25)
    .sort((x, y) => profile.interests[y] - profile.interests[x]);
  // Machine-readable line: accents stripped, everything else becomes "<".
  const code = (s: string) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z]+/g, "<");
  const mrz = `P<BSY<${code(name)}<<${code(profile.title)}`
    .padEnd(44, "<")
    .slice(0, 44);
  return (
    <article className="pp" aria-label={`Taste Passport of ${name}: ${profile.title}`}>
      <header className="pp-head">
        <span className="meta">Beesyde · Taste Passport</span>
        <span className="pp-personal-note">A portrait of your taste</span>
      </header>
      <div className="pp-id">
        <PassportSecurityLines />
        <div className="pp-photo" aria-hidden>
          <QuizIcon emoji={INTEREST_ICON[stamps[0] ?? "culture"]} big />
        </div>
        <dl>
          <dt className="meta">Made for {name}</dt>
          <dd className="pp-title">{profile.title}</dd>
          <dt className="sr-only">Motto</dt>
          <dd className="pp-motto">{profile.motto}</dd>
        </dl>
      </div>
      <ul className="pp-axes">
        {(Object.keys(AXES) as Axis[]).map((k) => (
          <li key={k}>
            <span className="meta">{AXES[k][0]}</span>
            <span
              className="pp-bar"
              role="meter"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={profile.axes[k]}
              aria-label={`${AXES[k][0]} to ${AXES[k][1]}`}
            >
              <i style={{ left: `${profile.axes[k]}%` }} />
            </span>
            <span className="meta">{AXES[k][1]}</span>
          </li>
        ))}
      </ul>
      <div className="pp-stamps" aria-label="Interests">
        {stamps.map((k, i) => (
          <span
            key={k}
            className="pp-stamp"
            style={{ transform: `rotate(${[-8, 6, -3, 10][i % 4]}deg)` }}
          >
            <QuizIcon emoji={INTEREST_ICON[k]} />
            {INTERESTS[k]}
          </span>
        ))}
      </div>
      {signals.length > 0 && (
        <p className="pp-visas">
          <span className="meta">Favourites</span> {signals.join(" · ")}
        </p>
      )}
      <code className="pp-mrz" aria-hidden>
        {mrz}
      </code>
    </article>
  );
}
