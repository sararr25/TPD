# Post-release publication and real verification — 28 October 2026

Owner explicitly requested push live, then real tests. Scope: approved #89–92 and docs/79–80. No auth/provider/schema/configuration change.

## Initial publication

`7c4dad0a67fbb3e339a828072a26130b8d1f1f8d` pushed atomically to main and the configured production branch `claude/blissful-gauss-dymbeo`. Vercel production deployment `dpl_6V9nsgL7GfFS6KYiqwXnAVxSLe1H` is READY on that exact SHA, and the public alias was resolved independently to it. Independent Standards and Spec review findings were corrected before push; both axes report zero residual actionable findings.

Public UI regressions: 6 passed, 3 explicitly skipped because the Place fixture route is development-only. These use intercepted fixture APIs and are not real-provider acceptance.

## Real-provider failure and correction

A fresh guest Chrome browser, with no API interception, opened real production Home, Cities, Passport and Lisbon. Home/Cities/Passport returned HTTP200 with no horizontal overflow at375px. Passport has one working Add what you love editor action. Actual Lisbon discovery returned nine restaurant picks.

The first suggested place, Pastéis de Belém, opened its detail page. Directions contains its coordinate link; the shared route is285px wide and above the title. Find its twin correctly selected the same actual place automatically, inferred as cafe. The subsequent real Twin request failed HTTP400 `invalid_chips`. This is retained as a real failure, not a passing test.

Confirmed cause: the signed reference contains both genre/category metadata and editable traits. The client excluded only the exact genre:cafe tag, leaving category:cafe as an Ignore choice. The server correctly allows only chipTags(reference,category), so it rejected that category tag.

A browser regression using the same genre/category pattern fails before the fix. Client selection and resumed-draft filtering now both use the existing shared chipTags rule, matching the server. The old fixture incorrectly put six editable traits in one ambience family even though the server permits two per family; it now covers two ambience, two cuisine, one offering and one beverage trait. Keep/Delete/Ignore meanings are unchanged. Independent Standards/Spec re-review: zero residual actionable findings.

The exact Gardens record is still unknown. A single public name lookup did not identify a Lisbon match; no unrelated same-name place was treated as the owner’s location. The owner has been asked for its exact link while other real checks continue.

Hotfix build/TypeScript passes; all40 affected Chrome regressions pass, including the exact genre/category case. Final browser, deployment and real-provider rerun receipts are recorded below or in the linked issue receipts after completion. All raw provider selections and screenshots remain private under `.private/qa/post-release-live`; no account, cookie or personal profile was copied. Physical-phone, assistive-technology and genuine cross-device account acceptance are separate from these fresh-guest checks.

## Hotfix publication and successful real rerun

`f698379c0e2e5f2098da806335ae28708554b818` pushed atomically to main and production. Vercel deployment `dpl_ByoAijq1yHKydsbP4tLDNxQSTbaV` is READY on that exact SHA; independently resolving beesyde.vercel.app returned that same deployment and commit.

Real, non-intercepted Chrome rerun: Pastéis de Belém selected from the nine actual Lisbon suggestions, detail opened, coordinate Directions link present, Save retained after a full reload in the isolated guest browser, same reference automatically selected in Twin, then HTTP200 with **three real Twin results**. The headline reads “3 matches found”; only the featured card is visible initially, while the two other results are deliberately behind See other matches. No API error and no pageerror occurred. Home/Cities/Passport at375px and Passport/Cities/Lisbon Twin at1440px have zero root horizontal overflow. The Place route is285px wide above the title on mobile. No API routes were mocked in this real check; no real user account was used or modified. Private summaries: real-receipt.json and retained first-failure.json under .private/qa/post-release-live.

After hotfix, public fixture regression run: **7 passed / 3 explicit development-only skips**. These are separate from real-provider checks. Build/TypeScript passes; affected local Twin/refinement browser suite40/40 passes. Review Standards0 residual; Spec0 residual.

The exact owner Gardens record remains pending its link; the real Pastéis test is not represented as that same place. Physical S24/iPhone, native assistive technologies and real cross-device Google-account checks remain untested in this release, tracked by the existing human gates.

This documentation-only continuation records the tested application commits; its own final source/deployment pointer is recorded in GitHub #89–92 after the documentation push.
