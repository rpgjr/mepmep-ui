import { expect, test } from "@playwright/test";
import { mockApi } from "./mock-api";

// The two YouTube embeds are stubbed so the tests need no internet.
// The stub tells the page every message it receives, so a test can see the "unmute" command arrive.
const stubYouTube = async (page: import("@playwright/test").Page) => {
  await page.addInitScript(() => {
    (window as any).__yt = [];
    // A fresh visitor has not tapped anything yet (automation can report otherwise).
    Object.defineProperty(navigator, "userActivation", { get: () => ({ hasBeenActive: false }) });
    window.addEventListener("message", (e) => { if (e.data?.fromStub) (window as any).__yt.push(e.data.fromStub); });
  });
  await page.route("https://www.youtube-nocookie.com/**", (r) =>
    r.fulfill({ contentType: "text/html", body: "<script>addEventListener('message',e=>parent.postMessage({fromStub:e.data},'*'))</script>" }));
  // The rat sticker is a transparent GIF from Tenor. Answer with a 1x1 GIF.
  await page.route("https://media.tenor.com/**", (r) =>
    r.fulfill({ contentType: "image/gif", body: Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64") }));
};

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("home page shows the hero and the shelves", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Test Movie One" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trending movies" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Popular series" })).toBeVisible();
});

test("search finds a title, and says so when nothing matches", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search").fill("movie");
  await page.getByLabel("Search").press("Enter");
  await expect(page).toHaveURL(/\/search\?q=movie/);
  await expect(page.getByRole("link", { name: /Test Movie One/ }).first()).toBeVisible();

  await page.getByLabel("Search").fill("nothing here");
  await page.getByLabel("Search").press("Enter");
  await expect(page.getByText("Nothing found. Try another title.")).toBeVisible();
});

test("a card opens the title page with the details", async ({ page }) => {
  await page.goto("/movies");
  await page.getByRole("link", { name: /Test Movie One/ }).first().click();
  await expect(page).toHaveURL(/\/title\/movie\/1/);
  await expect(page.getByRole("heading", { level: 1, name: "Test Movie One" })).toBeVisible();
  await expect(page.getByText("A tagline for tests.")).toBeVisible();
  await expect(page.getByText("2h 05m")).toBeVisible();
  await expect(page.getByRole("link", { name: /Watch now/ })).toHaveAttribute("href", "/watch/movie/1");
});

test("a guest who taps a list button is sent to log in", async ({ page }) => {
  await page.goto("/title/movie/1");
  await page.getByRole("button", { name: /favorite/i }).click();
  await expect(page).toHaveURL(/\/login/);
});

test("sign up logs the user in, and log out signs them out", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Display name").fill("Tester");
  await page.getByLabel("Email").fill("tester@example.com");
  await page.getByLabel("Password").fill("secret123");
  await page.getByRole("button", { name: "Sign up" }).click();

  await expect(page.getByText("Hi, Tester")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("mepmep.token"))).toBe("test-token");

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByRole("link", { name: "Log in" }).first()).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("mepmep.token"))).toBeNull();
});

test("a failing server shows an error message, not a blank page", async ({ page }) => {
  await page.unrouteAll({ behavior: "ignoreErrors" });
  await mockApi(page, { down: true });
  await page.goto("/");
  await expect(page.getByText(/Service unavailable/)).toBeVisible();
});

test("phone layout: bottom tab bar is visible and the page does not scroll sideways", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("slow server: dancing rat and hidden song while waking up, plain spinner once it is awake", async ({ page }) => {
  await stubYouTube(page);
  await page.clock.install();

  // Hold every answer back, like Render does while the free server wakes up.
  let wake!: () => void;
  const asleep = new Promise<void>((resolve) => { wake = resolve; });
  await page.route("**/api/**", async (route) => { await asleep; await route.fallback(); });

  await page.goto("/");
  await expect(page.locator(".spinner")).toBeVisible();      // normal spinner first
  await expect(page.getByText("Waking up the server")).toHaveCount(0);

  await page.clock.fastForward(6000);                         // 5 seconds pass with no answer
  await expect(page.getByRole("heading", { name: "Waking up the server…" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Dancing rat" })).toBeVisible();

  // The song plays without showing anything, and there is no stop button.
  const song = page.locator('iframe[title="Song"]');
  await expect(song).toHaveCount(1);
  await expect(song).toHaveCSS("opacity", "0");
  await expect(page.getByRole("button", { name: /song/i })).toHaveCount(0);

  // Nobody has tapped yet, so the sound is held back. The first tap turns it on.
  await expect(page.getByText("Tap anywhere on the page to hear the song.")).toBeVisible();
  await page.mouse.click(5, 300);
  await expect(page.getByText("Tap anywhere on the page to hear the song.")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => (window as any).__yt.join(" "))).toContain("unMute");

  wake();                                                     // the server answers
  await expect(page.getByRole("heading", { level: 1, name: "Test Movie One" })).toBeVisible();
  await expect(page.locator(".wakeup")).toHaveCount(0);

  // The server is awake now, so a slow page gets the plain spinner, never the rat.
  let slowAgain!: () => void;
  const slow = new Promise<void>((resolve) => { slowAgain = resolve; });
  await page.route("**/api/discover/**", async (route) => { await slow; await route.fallback(); });
  await page.getByRole("navigation").getByRole("link", { name: "Movies" }).first().click();
  await page.clock.fastForward(6000);
  await expect(page.locator(".spinner")).toBeVisible();
  await expect(page.locator(".wakeup")).toHaveCount(0);
  slowAgain();
});

test("a fast server never shows the rat or starts the song", async ({ page }) => {
  await stubYouTube(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Test Movie One" })).toBeVisible();
  await expect(page.locator(".wakeup")).toHaveCount(0);
  await expect(page.locator('iframe[title="Song"]')).toHaveCount(0);
});
