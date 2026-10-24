import { test, expect } from "@playwright/test";
const base = "http://127.0.0.1:3000";
const choice = (n: number) => ({
  entity: {
    id: `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
    name: `Fixture favourite ${n}`,
    type: "artist",
    tags: [],
    evidence: [],
    image: null,
    lat: null,
    lon: null,
    price: null,
  },
  token: `fixture-${n}`,
});
async function api(
  page: import("@playwright/test").Page,
  count: number | null = null,
  delay = 0,
  failure = false,
) {
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.startsWith("/api/auth/")) {
      if (delay) await new Promise((r) => setTimeout(r, delay));
      return route.fulfill({
        json:
          count === null
            ? null
            : {
                session: {
                  id: "fixture",
                  userId: "fixture-user",
                  expiresAt: "2099-01-01",
                },
                user: {
                  id: "fixture-user",
                  name: "Test visitor",
                  email: "test@example.invalid",
                },
              },
      });
    }
    if (path === "/api/passport")
      return route.fulfill({
        status: failure ? 503 : 200,
        json: failure
          ? { error: "unexpected_error" }
          : {
              passport: Array.from({ length: count || 0 }, (_, i) => choice(i)),
            },
      });
    if (path === "/api/quiz")
      return route.fulfill({
        json: { answers: count === null ? null : { planning: 2 } },
      });
    if (path === "/api/discovery") {
      const body = route.request().postDataJSON();
      if (body.action === "guest")
        return route.fulfill({
          json: { choices: [choice(1), choice(2), choice(3)] },
        });
      return route.fulfill({
        json: {
          places: [],
          results: [],
          checkedAt: new Date().toISOString(),
          traitsUsed: false,
          notice: "Fixture",
        },
      });
    }
    return route.fulfill({
      json: {
        stamps: [],
        collections: [],
        lists: [],
        hidden: [],
        feedback: { votes: [], dismissed: [] },
        votes: [],
        dismissed: [],
      },
    });
  });
}
for (const count of [0, 1, 2, 3, 5])
  test(`account with ${count} favourites`, async ({ page }) => {
    await api(page, count);
    await page.goto(base + "/passport");
    await expect(
      page.getByRole("heading", { name: "Your Taste Passport" }),
    ).toBeVisible();
    await expect(page.getByText(`${count} of 5 chosen`)).toBeVisible();
    if (count < 3)
      await expect(page.getByText(/Your profile is here/)).toBeVisible();
    else
      await expect(
        page.getByRole("link", { name: "Browse cities", exact: true }).first(),
      ).toBeVisible();
    await expect(page.getByText("Question 1 / 18")).toHaveCount(0);
  });
test("delayed account never starts quiz; failed load can retry", async ({
  page,
}) => {
  await api(page, 0, 1200, true);
  await page.goto(base + "/passport");
  await expect(page.getByText("Question 1 / 18")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Your Passport couldn’t load" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});
test("example preview does not write personal favourites", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "PUT") writes.push(r.url());
  });
  await api(page, 3);
  await page.goto(base + "/passport?guest=1");
  await page.getByRole("button", { name: "Preview this example" }).click();
  await expect(
    page.getByRole("heading", { name: "Example · not your Passport" }),
  ).toBeVisible();
  expect(writes).toEqual([]);
  await expect(page.getByText("3 of 5 chosen")).toBeVisible();
});
test("category filters and browser history remain distinct", async ({
  page,
}) => {
  await api(page);
  await page.goto(base + "/lisbon");
  await page.locator("#city-price").selectOption("2");
  await page.getByRole("button", { name: "Hotels", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Hotels", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator("#city-price").selectOption("4");
  await page.getByRole("button", { name: "Restaurants", exact: true }).click();
  await expect(page.locator("#city-price")).toHaveValue("2");
  await page.goBack();
  await expect(page.locator("#city-price")).toHaveValue("4");
  await page.getByRole("tab", { name: "Swap a place" }).click();
  await expect(
    page.locator('nav[aria-label="Main"] a[aria-current="page"]'),
  ).toHaveAccessibleName("Swap");
});
for (const width of [320, 390, 768, 1440])
  test(`layout ${width} and reduced motion`, async ({ page }) => {
    await api(page);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const path of ["/lisbon", "/passport", "/preview/home"]) {
      await page.goto(base + path);
      await page.waitForTimeout(350);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await expect(
      page.getByRole("heading", { name: /The city has/ }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Skip the story" }).click();
    await expect(page.locator("#story-cities")).toBeInViewport();
  });
test("Place internal return restores category, price, view and reading position", async ({
  page,
}) => {
  await api(page);
  const city = "/lisbon?category=hotel&price-hotel=3&view=map";
  await page.goto(base + city);
  await page.evaluate(() =>
    sessionStorage.setItem(
      `beesyde-scroll:${location.pathname}${location.search}`,
      "180",
    ),
  );
  await page.goto(
    base + "/preview/checks?" + new URLSearchParams({ returnTo: city }),
  );
  await expect(page.locator(".place-back")).toHaveAttribute("href", city);
  await page.locator(".place-back").click();
  await expect(page.locator("#city-price")).toHaveValue("3");
  await expect(
    page.getByRole("button", { name: "Hotels", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await page.goBack();
  await expect(page.locator(".place-back")).toBeVisible();
  await page.goForward();
  await expect(page.locator("#city-price")).toHaveValue("3");
});
test("partial save survives reload and retry preserves account binding", async ({
  page,
}) => {
  await api(page, 3);
  const writes: string[] = [];
  await page.addInitScript(() =>
    localStorage.setItem(
      "beesyde-passport-pending:fixture-user",
      JSON.stringify({
        choices: [],
        answers: { planning: 2 },
        cards: [],
        passportSaved: true,
      }),
    ),
  );
  await page.route("**/api/quiz", (r) => {
    if (r.request().method() === "PUT") {
      writes.push(r.request().headers()["x-beesyde-user"]);
      return r.fulfill({ json: { saved: true } });
    }
    return r.fulfill({ json: { answers: { planning: 2 } } });
  });
  await page.goto(base + "/passport");
  await expect(
    page.getByRole("button", { name: "Retry account save" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Retry account save" }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0]).toBe("fixture-user");
  await expect(
    page.getByRole("button", { name: "Retry account save" }),
  ).toHaveCount(0);
});
for (const width of [320, 390, 768, 1440])
  test(`Place long name and broken image ${width}`, async ({ page }) => {
    await api(page);
    await page.setViewportSize({ width, height: 900 });
    await page.route("https://images.qloo.com/**", (r) => r.abort());
    await page.goto(base + "/preview/checks");
    await expect(page.getByText("No place photo · Eat")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("link", { name: "Find its twin", exact: true }),
    ).toBeVisible();
  });
test("expired guest choices keep quiz and request a refresh", async ({
  page,
}) => {
  await api(page);
  const choices = [choice(1), choice(2), choice(3)].map((c) => ({
    ...c,
    token:
      Buffer.from(JSON.stringify({ expires: 1 })).toString("base64url") +
      ".fixture",
  }));
  await page.addInitScript((choices) => {
    localStorage.setItem("tpd-passport-v2", JSON.stringify(choices));
    localStorage.setItem("beesyde-quiz-v1", JSON.stringify({ planning: 2 }));
  }, choices);
  await page.goto(base + "/passport");
  await expect(page.getByText(/Your favourites need a refresh/)).toBeVisible();
  await expect(page.getByText("Question 1 / 18")).toHaveCount(0);
});
test("foreign pending account is never imported into the current account", async ({
  page,
}) => {
  await api(page, 0);
  let writes = 0;
  page.on("request", (r) => {
    if (r.method() === "PUT") writes++;
  });
  await page.addInitScript(() => {
    localStorage.setItem("beesyde-passport-owner", "other-account");
    localStorage.setItem(
      "beesyde-passport-pending:other-account",
      JSON.stringify({
        choices: [],
        answers: { planning: 2 },
        cards: [],
        passportSaved: false,
      }),
    );
  });
  await page.goto(base + "/passport");
  await expect(page.getByText("0 of 5 chosen")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Retry account save" }),
  ).toHaveCount(0);
  expect(writes).toBe(0);
});
