import { QuizIcon } from "./quiz-icon";
import { AXES, INTERESTS, type Axis, type Interest, type Profile } from "@/lib/quiz";

// Keys of QUIZ_ICONS: each interest uses the quiz illustration of the same emoji.
const STAMP_EMOJI: Record<Interest, string> = {
  culture: "🖼️",
  food: "🍜",
  nature: "⛰️",
  night: "🌙",
};

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
        <span className="meta">No. {String(profile.answered).padStart(3, "0")}</span>
      </header>
      <div className="pp-id">
        <div className="pp-photo" aria-hidden>
          <QuizIcon emoji={STAMP_EMOJI[stamps[0] ?? "culture"]} big />
        </div>
        <dl>
          <dt className="meta">Holder</dt>
          <dd>{name}</dd>
          <dt className="meta">Traveller type</dt>
          <dd className="pp-title">{profile.title}</dd>
          <dt className="meta">Motto</dt>
          <dd className="muted">{profile.motto}</dd>
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
            style={{ transform: `rotate(${[-8, 6, -3, 10][i]}deg)` }}
          >
            <QuizIcon emoji={STAMP_EMOJI[k]} />
            {INTERESTS[k]}
            <small>{profile.interests[k]}%</small>
          </span>
        ))}
      </div>
      {signals.length > 0 && (
        <p className="pp-visas">
          <span className="meta">Visas</span> {signals.join(" · ")}
        </p>
      )}
      <code className="pp-mrz" aria-hidden>
        {mrz}
      </code>
    </article>
  );
}
