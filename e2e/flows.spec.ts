import { expect, test } from "@playwright/test";
import { mockApi } from "./mock-api";

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
