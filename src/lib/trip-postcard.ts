import type { SharedTrip } from "./shared-trip";

// Render locally so trip text is never sent to an image service or to the
// dynamic font/emoji fetchers used by server-side image renderers.
export async function tripPostcard(trip: SharedTrip): Promise<Blob> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not draw the postcard. Try sharing the link instead.");
  const body = getComputedStyle(document.body).fontFamily;
  const root = getComputedStyle(document.documentElement);
  const display = root.getPropertyValue("--font-instrument-serif").trim() || "Georgia, serif";
  const color = (name: string, fallback: string) => root.getPropertyValue(name).trim() || fallback;
  const paper = color("--paper", "#F8F8F9"), ink = color("--ink", "#1E1630"),
    muted = color("--ink-2", "#565064"), pass = color("--pass", "#6B4A73"),
    brand = color("--brand", "#7E2B8F"), lemon = color("--sun-soft", "#F6EDC4"),
    line = color("--line", "#D4D6DA");
  context.textBaseline = "top";
  context.fillStyle = pass;
  context.fillRect(0, 0, 1080, 1350);
  context.fillStyle = paper;
  context.fillRect(40, 112, 1000, 1150);
  context.fillStyle = "#FFFFFF";
  context.font = `600 28px ${body}`;
  context.fillText("BEESYDE", 64, 45);
  context.font = `400 24px ${body}`;
  context.fillText("A SHARED TRIP", 792, 47);
  context.fillStyle = ink;
  context.font = `400 76px ${display}`;
  wrappedText(context, trip.name, 80, 155, 910, 82, 2);
  context.fillStyle = muted;
  context.font = `400 25px ${body}`;
  const shown = trip.places.slice(0, 12);
  const count = shown.length === trip.places.length
    ? `${trip.places.length} saved place${trip.places.length === 1 ? "" : "s"}`
    : `First ${shown.length} of ${trip.places.length} saved places`;
  context.fillText(count, 80, 330);
  shown.forEach((place, index) => {
    const x = 80 + (index % 2) * 475;
    const y = 395 + Math.floor(index / 2) * 120;
    context.fillStyle = lemon;
    context.beginPath();
    context.arc(x + 21, y + 22, 22, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = ink;
    context.font = `600 22px ${body}`;
    context.textAlign = "center";
    context.fillText(String(index + 1), x + 21, y + 9);
    context.textAlign = "left";
    context.font = `600 29px ${body}`;
    wrappedText(context, place.name, x + 56, y, 365, 34, 2);
    if (place.city) {
      context.fillStyle = muted;
      context.font = `400 22px ${body}`;
      context.fillText(place.city, x + 56, y + 74);
    }
  });
  context.strokeStyle = line;
  context.beginPath();
  context.moveTo(80, 1140);
  context.lineTo(1000, 1140);
  context.stroke();
  context.fillStyle = muted;
  context.font = `400 22px ${body}`;
  context.fillText("A snapshot. Open the shared link for full names and place details.", 80, 1172);
  context.fillStyle = brand;
  context.font = `600 24px ${body}`;
  context.fillText("Plans worth keeping.", 80, 1214);
  context.fillStyle = "#FFFFFF";
  context.font = `400 24px ${body}`;
  context.fillText("beesyde.vercel.app", 64, 1295);
  return new Promise((resolve, reject) => canvas.toBlob(
    (blob) => blob ? resolve(blob) : reject(new Error("Your postcard could not be made. Try again.")),
    "image/png",
  ));
}

function wrappedText(context: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, lineHeight: number, maxLines: number) {
  // Break by Unicode code points as well as spaces so names in any script fit.
  const characters = Array.from(text);
  const lines: string[] = [];
  let current = "";
  for (const character of characters) {
    if (current && context.measureText(current + character).width > width) {
      lines.push(current.trimEnd());
      current = character.trimStart();
    } else current += character;
  }
  if (current) lines.push(current);
  const visible = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    let last = visible[maxLines - 1];
    while (last && context.measureText(last + "…").width > width) last = Array.from(last).slice(0, -1).join("");
    visible[maxLines - 1] = last.trimEnd() + "…";
  }
  visible.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
}
