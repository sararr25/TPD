import { ImageResponse } from "next/og";
import { AXES, INTERESTS, INTEREST_ICON, buildProfile, quizCompletion, cleanAnswers, type Axis, type Interest } from "@/lib/quiz";
import { passportInsights } from "@/lib/passport-insights";
import { QUIZ_ICONS } from "@/lib/quiz-icons";

// Share card (E07): a 1080×1350 PNG of the Passport data page. The URL
// carries only quiz answers (`a`, base64url JSON); the profile is rebuilt
// here, so no name, favourite or free text from the visitor reaches the image.
// Berry and lemon palette (docs/adr/0004, mirrors src/styles/tokens.css): the
// image is rendered outside the page, so CSS variables can't reach it.
const C = {
  bg: "#E8E9EB",
  paper: "#F8F8F9",
  ink: "#1E1630",
  ink2: "#565064",
  line: "#D4D6DA",
  pass: "#6B4A73",
  onPass2: "#F1DDF5",
  brand: "#7E2B8F",
  stamp: "#E8462E",
};

function icon(emoji: string, color: string, size: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" color="${color}" style="color:${color}">${QUIZ_ICONS[emoji].replaceAll("currentColor", color)}</svg>`;
  // eslint-disable-next-line @next/next/no-img-element
  return <img width={size} height={size} src={`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`} alt="" />;
}

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("a") ?? "";
  if (raw.length > 4000) return Response.json({ error: "invalid_request" }, { status: 400 });
  let answers;
  try {
    answers = cleanAnswers(JSON.parse(Buffer.from(raw, "base64url").toString("utf8")));
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  const profile = buildProfile(answers);
  const completion = quizCompletion(answers);
  if (!profile) return Response.json({ error: "no_profile" }, { status: 400 });
  const stamps = (Object.keys(INTERESTS) as Interest[])
    .filter((k) => profile.interests[k] >= 25)
    .sort((x, y) => profile.interests[y] - profile.interests[x]);
  const top = stamps[0] ?? "culture";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: C.pass, padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: C.onPass2, fontSize: 26, letterSpacing: 4 }}>
          <span>BEESYDE</span>
          <span>TASTE PASSPORT</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.paper, borderRadius: 32, marginTop: 40, padding: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <div style={{ width: 180, height: 220, display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, border: `2px solid ${C.line}`, borderRadius: 20 }}>
              {completion.partial ? <span style={{ fontSize: 54, color: C.stamp }}>{completion.answered}/18</span> : icon(INTEREST_ICON[top], C.stamp, 130)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <span style={{ fontSize: 24, color: C.ink2, letterSpacing: 3 }}>YOUR TRAVEL PREFERENCES</span>
              <span style={{ fontSize: 72, fontWeight: 700, color: C.brand, lineHeight: 1.05, marginTop: 12 }}>{completion.partial ? "Taste, taking shape" : profile.title}</span>
            </div>
          </div>
          <span style={{ fontSize: 34, color: C.ink, marginTop: 40 }}>{completion.partial ? `A first sketch · ${completion.answered} of ${completion.total} questions answered` : profile.motto}</span>
          {completion.partial && <div style={{ display: "flex", flexDirection: "column", gap: 36, marginTop: 64 }}>
            {passportInsights(answers).slice(0,3).map(row => <div key={row.id} style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: `2px solid ${C.line}`, paddingTop: 28 }}>
              <span style={{ fontSize: 34, color: C.brand }}>{row.title}</span>
              <span style={{ fontSize: 28, color: C.ink }}>{row.text.split(/(?<=[.!?])\s/)[0]}</span>
            </div>)}
            <span style={{ fontSize: 24, color: C.ink2 }}>Based on my answers so far. More travel preferences can be added in Settings &amp; privacy.</span>
          </div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: 56 }}>
            {(!completion.partial ? Object.keys(AXES) as Axis[] : []).map((k) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 26, color: C.ink2 }}>
                <span style={{ width: 190 }}>{AXES[k][0]}</span>
                <div style={{ flex: 1, height: 4, background: C.line, display: "flex", position: "relative" }}>
                  <div style={{ position: "absolute", left: `${profile.axes[k]}%`, top: -14, width: 32, height: 32, marginLeft: -16, borderRadius: 16, background: C.brand }} />
                </div>
                <span style={{ width: 190, textAlign: "right", justifyContent: "flex-end", display: "flex" }}>{AXES[k][1]}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 32, marginTop: "auto" }}>
            {(!completion.partial ? stamps : []).map((k, i) => (
              <div key={k} style={{ width: 170, height: 170, borderRadius: 85, border: `4px solid ${C.stamp}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.stamp, fontSize: 24, transform: `rotate(${[-8, 6, -3, 10][i]}deg)` }}>
                {icon(INTEREST_ICON[k], C.stamp, 56)}
                <span style={{ marginTop: 6 }}>{INTERESTS[k].toUpperCase()}</span>
                <span>{profile.interests[k]}%</span>
              </div>
            ))}
          </div>
        </div>
        <span style={{ color: C.onPass2, fontSize: 26, marginTop: 36 }}>Travel by taste · beesyde.vercel.app</span>
      </div>
    ),
    { width: 1080, height: 1350, headers: { "Cache-Control": "public, max-age=86400, immutable" } },
  );
}
