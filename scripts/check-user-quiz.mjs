import assert from "node:assert/strict";
import { saveUserQuiz, readUserQuiz } from "../src/lib/server/user-quiz.ts";

// Offline: input checks run before the database is touched.
delete process.env.DATABASE_URL;
const code = (c) => (e) => e.code === c;
for (const bad of [undefined, null, "x", [], {}, { planning: 9 }, { planning: 2, extra: 1 }, { music: ["khruangbin", "khruangbin"] }, { places: ["cafe", "park", "museum", "bookstore"] }])
  await assert.rejects(saveUserQuiz("u", bad), code("invalid_quiz"));
// Valid answers, in any key order, reach the database, which is required.
await assert.rejects(saveUserQuiz("u", { music: ["khruangbin"], planning: 2 }), (e) => e.code === "not_configured" && e.status === 503);
await assert.rejects(readUserQuiz("u"), code("not_configured"));
console.log("PASS: account quiz accepts only answers that fit the current questions and requires the database.");
