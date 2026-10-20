import assert from "node:assert/strict";
import { QUESTIONS, ENTITY_CARDS, cleanAnswers, parseQuiz, likedEntities, profileLines, buildProfile, BOTH, qlooParams } from "../src/lib/quiz.ts";
import { quiz } from "../src/lib/server/discovery-service.ts";

assert.ok(QUESTIONS.length >= 15 && QUESTIONS.length <= 20);
assert.equal(new Set(QUESTIONS.map((q) => q.id)).size, QUESTIONS.length);
assert.equal(Object.keys(ENTITY_CARDS).length, 8);
for (const raw of [null, "broken", "[]", "1"]) assert.deepEqual(parseQuiz(raw), {});
const answers = cleanAnswers({
  planning: 9, crowds: 2, base: "moon", dinner: "noodles",
  places: ["cafe", "cafe", "park", "museum", "gallery", "<script>"],
  music: ["khruangbin", "nope"], films: ["amelie"], openness: ["get-lost", "khruangbin"],
  extra: "ignored",
});
assert.deepEqual(answers, {
  crowds: 2, dinner: "noodles", places: ["cafe", "park", "museum"],
  music: ["khruangbin"], films: ["amelie"], openness: ["get-lost"],
});
assert.deepEqual(likedEntities(answers), ["khruangbin", "amelie"]);
assert.ok(profileLines(answers).includes("Crowds: 2/5 (1 = Love the buzz, 5 = Empty streets only)"));
assert.ok(profileLines(answers).includes("Which would you walk into?: Café, Park, Big museum"));
process.env.QLOO_API_KEY ||= "test";
for (const bad of [undefined, [], ["get-lost"], ["amelie", "amelie"], ["a", "b", "c", "d", "e", "f"], ["toString"]])
  await assert.rejects(quiz(bad), (e) => e.code === "invalid_request");
console.log("PASS: quiz answers are cleaned, liked entities and profile lines derived, bad quiz requests rejected before Qloo.");

// Trait profile: no answers, no profile; opposite answers give opposite types.
assert.equal(buildProfile({}), null);
assert.equal(cleanAnswers({ dinner: BOTH }).dinner, BOTH);
const night = buildProfile({ crowds: 1, rhythm: 5, company: 5, places: ["jazz-club", "brewery"], playlist: "electronic" });
const nature = buildProfile({ crowds: 5, rhythm: 1, company: 1, afternoon: "trail", base: "remote", places: ["park"] });
assert.match(night.title, /Night Owl$/);
assert.match(nature.title, /Wanderer$/);
assert.ok(night.axes.energy > 60 && nature.axes.energy < 40);
const both = buildProfile({ dinner: BOTH });
assert.ok(both.interests.food === 100 && both.interests.night > 0);

// Quiz traits → Qloo parameters (C7): neutral sends nothing, museums never, hotels no price.
assert.deepEqual(qlooParams(null, "restaurant"), {});
assert.deepEqual(qlooParams(buildProfile({ planning: 3 }), "restaurant"), {});
const calm = buildProfile({ crowds: 5, company: 1, "food-adventure": 5, budget: 1 });
assert.ok(Number(qlooParams(calm, "restaurant")["filter.popularity.max"]) < 1);
assert.equal(qlooParams(calm, "restaurant")["filter.price_level.max"], "2");
assert.equal(qlooParams(calm, "hotel")["filter.price_level.max"], undefined);
assert.deepEqual(qlooParams(calm, "museum"), {});
const familiar = buildProfile({ crowds: 1, company: 5, "food-adventure": 1, budget: 5 });
assert.equal(qlooParams(familiar, "restaurant")["filter.popularity.min"], "0.8");
assert.equal(qlooParams(familiar, "restaurant")["filter.price_level.min"], "3");
