// Mock-up behaviour only: segmented toggles, live search hint, broken-photo fallback.
document.querySelectorAll(".seg").forEach((seg) =>
  seg.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    seg.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    const input = document.querySelector(seg.dataset.for);
    if (input) input.placeholder = b.dataset.ph;
  }),
);
document.querySelectorAll("[data-needs]").forEach((btn) => {
  const input = document.querySelector(btn.dataset.needs);
  const sync = () => (btn.disabled = input.value.trim().length < 2);
  input.addEventListener("input", sync);
  sync();
});
// Capture phase, so photos added later by a page script fall back too.
document.addEventListener("error", (e) => {
  const f = e.target.tagName === "IMG" && e.target.closest(".ph");
  if (!f) return;
  f.classList.add("ph-none");
  f.textContent = f.dataset.code || "";
}, true);
document.querySelectorAll("form").forEach((f) => f.addEventListener("submit", (e) => e.preventDefault()));
