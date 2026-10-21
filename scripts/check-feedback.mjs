import assert from "node:assert/strict";
import {
  cleanFeedback, parseFeedback, voteFor, addVote, strongSignals, feedbackSignal,
  cleanSignal, feedbackParams, nudge, STRONG, removeVote,
} from "../src/lib/feedback.ts";
import { saveUserFeedback, readUserFeedback } from "../src/lib/server/user-feedback.ts";
// Undo (docs/22 F7, F8): removeVote forgets one place and keeps the rest.
{
  const p1 = { id: "00000000-0000-4000-8000-000000000101", name: "One", tags: [] };
  const p2 = { id: "00000000-0000-4000-8000-000000000102", name: "Two", tags: [] };
  const both = addVote(addVote({ votes: [], dismissed: [] }, voteFor(p1, 1)), voteFor(p2, -1));
  const left = removeVote(both, p1.id);
  assert.deepEqual(left.votes.map((v) => v.id), [p2.id]);
  assert.deepEqual(removeVote(left, "not-there").votes.length, 1);
}

const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const wine = { id: "urn:tag:offerings:place:natural_wine", name: "Natural wine", type: "urn:tag:offerings:place" };
const loud = { id: "urn:tag:ambience:qloo:loud", name: "Loud", type: "urn:tag:ambience:qloo" };
const kind = { id: "urn:tag:genre:place:restaurant", name: "Restaurant", type: "urn:tag:genre:place" };
const place = (n, ...tags) => ({ id: id(n), name: "Place " + n, tags });

// Malformed storage is ignored; only taste tags are kept with a vote.
for (const raw of [null, "broken", "[]", '{"votes":[{"id":"x","vote":1}]}']) assert.deepEqual(parseFeedback(raw), { votes: [], dismissed: [] });
assert.deepEqual(voteFor(place(1, wine, kind), 1).tags, [{ id: wine.id, name: "Natural wine" }]);

// Re-voting a place replaces its vote.
let fb = addVote(addVote({ votes: [], dismissed: [] }, voteFor(place(1, wine), 1)), voteFor(place(1, wine), -1));
assert.equal(fb.votes.length, 1);
assert.equal(fb.votes[0].vote, -1);

// Below STRONG agreeing votes: weak only (nudge), nothing sent to Qloo.
fb = { votes: [], dismissed: [] };
for (let n = 1; n < STRONG; n++) fb = addVote(fb, voteFor(place(n, wine), 1));
assert.deepEqual(strongSignals(fb).keep, []);
assert.deepEqual(feedbackSignal(fb), { keep: [], avoid: [], weak: { [wine.id]: STRONG - 1 } });
assert.deepEqual(feedbackParams(feedbackSignal(fb)), {});
// The STRONG-th agreeing vote makes it a strong signal.
fb = addVote(fb, voteFor(place(STRONG, wine), 1));
assert.deepEqual(strongSignals(fb).keep.map((s) => s.id), [wine.id]);
assert.deepEqual(feedbackSignal(fb).keep, [wine.id]);
assert.deepEqual(feedbackParams(feedbackSignal(fb)), {}); // "more" is applied locally, not sent
const ranked = nudge([place(1), place(2), place(3, wine)], feedbackSignal(fb));
assert.equal(ranked[0].name, "Place 3");
// Too many opposite votes keep it from being strong.
let mixed = fb;
for (let n = 10; n < 13; n++) mixed = addVote(mixed, voteFor(place(n, wine), -1));
assert.deepEqual(strongSignals(mixed).keep, []);
// Undo: a dismissed tag is neither strong nor weak.
const undone = cleanFeedback({ ...fb, dismissed: [wine.id] });
assert.deepEqual(feedbackSignal(undone), { keep: [], avoid: [], weak: {} });
// Strong "not for me" excludes the tag.
let no = { votes: [], dismissed: [] };
for (let n = 1; n <= STRONG; n++) no = addVote(no, voteFor(place(n, loud), -1));
assert.equal(feedbackParams(feedbackSignal(no))["filter.exclude.tags"], loud.id);

// Server accepts only the compact shape, with weak scores below STRONG.
assert.deepEqual(cleanSignal({ keep: ["DROP TABLE", wine.id], avoid: "x", weak: { [loud.id]: 9, [wine.id]: 2, bad: 1 } }), { keep: [wine.id], avoid: [], weak: { [wine.id]: 2 } });

// Nudge moves a place at most 3 positions and keeps the rest in order.
const list = [1, 2, 3, 4, 5, 6].map((n) => place(n, ...(n === 6 ? [wine] : [])));
const moved = nudge(list, { keep: [], avoid: [], weak: { [wine.id]: 4 } });
assert.deepEqual(moved.map((p) => p.name), ["Place 1", "Place 2", "Place 6", "Place 3", "Place 4", "Place 5"]);

// Account: malformed feedback is refused before the database; valid feedback needs the database.
delete process.env.DATABASE_URL;
for (const bad of [null, "x", [], { votes: [{ id: "nope", name: "x", vote: 1, tags: [] }], dismissed: [] }])
  await assert.rejects(saveUserFeedback("u", bad), (e) => e.code === "invalid_feedback");
await assert.rejects(saveUserFeedback("u", fb), (e) => e.code === "not_configured");
await assert.rejects(readUserFeedback("u"), (e) => e.code === "not_configured");
console.log("PASS: feedback votes stay weak until 5 agree, undo and exclusions work, server accepts only the compact signal, nudges are bounded, account storage validates first.");
