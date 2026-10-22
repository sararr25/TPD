import { STRONG, strongSignals, type Feedback } from "@/lib/feedback";

// What Beesyde has learned from your "Yes" / "Not for me" votes (D3).
// On the profile it is read-only; in settings, passing onUndo adds the undo buttons.
export function LearnedFromYou({
  feedback,
  onUndo,
  busy = false,
}: {
  feedback: Feedback;
  onUndo?: (tagId: string, name: string) => void;
  busy?: boolean;
}) {
  const strong = strongSignals(feedback);
  const rows = [
    ...strong.keep.map((s) => ({ ...s, label: "You like" })),
    ...strong.avoid.map((s) => ({ ...s, label: "You skip" })),
  ];
  if (!rows.length)
    return (
      <p className="muted">
        {feedback.votes.length} place{feedback.votes.length === 1 ? "" : "s"} you’ve saved, liked or marked Not for me so far.
        These choices help shape your picks. A taste appears here when at least {STRONG} choices point the same way and outweigh the opposite choices.
      </p>
    );
  return (
    <ul className="entity-list">
      {rows.map((r) => (
        <li key={r.id}>
          <div>
            <strong>
              {r.label}: {r.name}
            </strong>
            <p className="muted">
              {r.yes} saved or liked · {r.no} not for me
            </p>
          </div>
          {onUndo && (
            <button className="btn btn-quiet" disabled={busy} onClick={() => onUndo(r.id, r.name)}>
              Undo
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
