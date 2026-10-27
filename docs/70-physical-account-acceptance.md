# Guided physical-device and account acceptance

28 October 2026 · Owner selected this manual handoff while agent completes all
available local checks. **Not executed / not accepted yet.** Historical technical
ticket closure must link this checklist and its open human follow-up; it must not
imply these criteria passed. No credentials or personal screenshots go into GitHub.

## Record the environment first

Use the production URL https://beesyde.vercel.app and the exact READY deployment
SHA in the latest #44 release receipt. For each run record date, physical model,
OS/browser version, network, text size, motion setting and screen-reader state.
Use owner-controlled test accounts and a trip named `QA acceptance` with public
places and synthetic notes. Keep unrelated personal data unchanged.

| Environment | Model / OS / browser | Outcome / evidence |
|---|---|---|
| Physical iPhone / Safari | To record | Not run |
| Physical Android / Chrome | To record | Not run |
| iPhone VoiceOver | To record | Not run |
| Android TalkBack | To record | Not run |
| macOS Safari / VoiceOver | To record | Not run |
| Same Google test account on two devices | Private account alias only | Not run |
| Second Google test account / shared-device isolation | Private account alias only | Not run |

## P1 — discovery, touch and navigation

1. Cold-open Home in portrait; reach both Pick a city and Find its twin. Repeat in
   landscape and with enlarged text. Read the full labels, reach every action,
   and check that fixed navigation does not cover the active control.
2. Open Lisbon, choose Bars and a supported price tier. Open Map, select a pin or
   overlapping-pin chooser, then return to List. Places/count/order must agree.
   Open a Place and return: category, price, view and reading position persist.
3. Find one real starting place for Twin. Set Keep, Delete and Ignore deliberately;
   verify they are mutually exclusive and Delete is confined to this search.
   Submit once. The first match appears at the task position; See other matches
   reaches the next heading. Edit/retry preserves choices. Unknown prices stay
   unknown. Keep provider use bounded; stop on auth/quota errors.
4. Save one test place, change its list/note, close and reopen the panel. Check
   Undo and Change remain actionable, errors do not erase input, and scrolling
   does not put the panel beyond the screen. Do not change unrelated lists.

## P2 — quiz, audio and recovery

1. Open the quiz from Home/Passport/Settings. Background interaction is excluded;
   Close returns to the opener, completion reaches the result heading.
2. Make a deliberate swipe/selection, Undo, then close/reopen and reload. Continue
   restores the draft only after choosing it; Start again resets deliberately.
3. Mute, close and resume. Mute persists and resume is silent. Complete the normal
   18-question flow once; count unique favourites and verify the 3–5 rule.
4. On the test account, briefly take the device offline immediately before save.
   The failed save retains answers with explicit retry; reconnect and retry once.
   The success sound occurs only after success and only if unmuted. Record what
   was actually heard; DOM/audio-call assertions do not substitute for perception.

## P3 — actual assistive technology and motion

With VoiceOver/TalkBack actually enabled, follow P1 and the quiz entry/exit using
screen-reader gestures/keyboard, not only visual taps. Record spoken action names,
selected/expanded states, count/result/error announcements, focus containment and
return focus. Check Save, group selection, visit feedback and notebook selection.
Verify both normal and reduced motion keep the same readable information; no
uncontrolled loop, blocked input, replay on Back or moving text is acceptable.
Report the first blocked task, exact action and spoken/visible result.

## P4 — private account boundaries and two devices

1. Sign in normally to test account A on device 1 and device 2; never copy cookies,
   tokens or sessions. In A create a test Saved trip, add a synthetic private note,
   group/order and explicit visit feedback. Reload on device 2 and compare.
2. Make competing organisation edits from the two devices. A stale revision must
   retain the visible draft and expose conflict/Retry/Reload, not silently replace
   the newer server state. Reload deliberately chooses the server copy.
3. Sign out and enter test account B on the shared device. A's private notes,
   preferences, results and travel metadata must disappear. Return normally to A
   and confirm its own data remains. Do not assume guest drafts/groups migrate.
4. Separately check that **visited-city account sync is currently disabled**:
   the UI must explain the limitation; do not record browser-local visited cities
   as cross-device synced. Activity stamps and explicit trip visits are different.
5. Export selected public places and open the downloaded notebook. Names/groups/
   cities/available addresses agree; synthetic private note/reason, account data,
   signed tokens and coordinates are absent. Check native download/print and any
   system dialogs manually. Existing postcard/link sharing must still work.

## P5 — actual-device performance observation

Repeat one cold Home → City → Twin → Saved journey three times on the same phone,
network and power state. Record the baseline, visible loading, input response,
layout movement and map/motion pauses; save an owner-private recording if useful.
Compare like-for-like before proposing budgets. Browser fixture timing is lab
evidence; this procedure alone is not an aggregate field Core Web Vitals dataset.

## Receipt template and completion

For each row: `date | device/OS/browser | release SHA | task | expected | observed |
pass/fail/not-run | private evidence reference | blocker`. Keep failed and not-run
rows visible. A genuine account run is not established by a connected OAuth label.

After testing, remove only the dedicated test records through normal product UI;
never clear accounts or unrelated browser data for cleanup. Close the human
follow-up only when each required row has actual evidence, or an explicit owner
decision changes the scope. Catalogue rights/import remain a separate proposal.

Tracker: [#59 — manual acceptance](https://github.com/sararr25/TPD/issues/59), `ready-for-human`.
