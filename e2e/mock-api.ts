import type { Page, Route } from "@playwright/test";

// A tiny fake backend. The tests never call TMDB or the real Spring Boot server,
// so they are fast and give the same result every time.
const movie = (id: number, title: string) => ({
  id, title, overview: `${title} overview.`, backdrop_path: "/b.jpg", poster_path: "/p.jpg",
  vote_average: 7.5, release_date: "2024-05-01",
});
const show = (id: number, name: string) => ({
  id, name, overview: `${name} overview.`, backdrop_path: "/b.jpg", poster_path: "/p.jpg",
  vote_average: 8.1, first_air_date: "2023-02-01",
});

const page = (results: unknown[]) => ({ results, total_pages: 1 });
const movies = page([movie(1, "Test Movie One"), movie(2, "Test Movie Two")]);
const shows = page([show(10, "Test Show One"), show(11, "Test Show Two")]);

export const USER = { id: 1, email: "tester@example.com", displayName: "Tester" };

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

export async function mockApi(p: Page, opts: { down?: boolean } = {}) {
  // Posters and backdrops come from TMDB's image server. Answer with an empty image.
  await p.route("https://image.tmdb.org/**", (r) =>
    r.fulfill({ status: 200, contentType: "image/gif", body: Buffer.from("R0lGODlhAQABAAAAACw=", "base64") }));

  await p.route("**/api/**", (route) => {
    if (opts.down) return json(route, { message: "Service unavailable" }, 503);
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/^.*\/api/, "");
    const method = route.request().method();

    if (path === "/auth/register" || path === "/auth/login") return json(route, { token: "test-token", user: USER }, 201);
    if (path === "/auth/me") return json(route, USER);
    if (path.startsWith("/library/status")) return json(route, { favorite: false, watchlist: false });
    if (path.startsWith("/history")) return json(route, method === "GET" ? [] : {});
    if (path.startsWith("/genres")) return json(route, { genres: [{ id: 18, name: "Drama" }] });
    if (path === "/search") {
      const q = url.searchParams.get("q")?.toLowerCase() ?? "";
      const hits = q.includes("nothing") ? [] : [{ ...movie(1, "Test Movie One"), media_type: "movie" }];
      return json(route, page(hits));
    }
    if (path.startsWith("/title/")) {
      return json(route, {
        ...movie(1, "Test Movie One"), tagline: "A tagline for tests.", runtime: 125,
        genres: [{ id: 18, name: "Drama" }], credits: { cast: [] }, similar: movies,
      });
    }
    if (path.startsWith("/trending/tv") || path.includes("/tv/")) return json(route, shows);
    return json(route, movies);
  });
}
