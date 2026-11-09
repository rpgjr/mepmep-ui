import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toCards } from "../api";
import { Grid, Spinner, ErrorBox } from "../components/Shelves";
import { useGet } from "../hooks";
import type { Genre, MediaType } from "../types";

const SORTS = [
  { value: "popularity.desc", label: "Popular" },
  { value: "vote_average.desc", label: "Top rated" },
  { value: "primary_release_date.desc", label: "Newest" },
];

/** Movies or Series page: genre + sort filters and a "load more" button. */
export default function Browse({ type }: { type: MediaType }) {
  const [params, setParams] = useSearchParams();
  const genre = params.get("genre") ?? "";
  const sort = params.get("sort") ?? "popularity.desc";
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ReturnType<typeof toCards>>([]);

  const genres = useGet<{ genres: Genre[] }>(`/genres/${type}`);
  // TV uses a different field name for "newest"
  const sortParam = type === "tv" ? sort.replace("primary_release_date", "first_air_date") : sort;
  const res = useGet<{ results: Record<string, any>[]; total_pages: number }>(
    `/discover/${type}?genre=${genre}&sort=${sortParam}&page=${page}`,
  );

  // Start over whenever the filters or the media type change.
  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [type, genre, sort]);

  // Append each new page of results.
  useEffect(() => {
    if (res.data) setItems((prev) => (page === 1 ? [] : prev).concat(toCards(res.data!.results, type)));
  }, [res.data, page, type]);

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    v ? next.set(k, v) : next.delete(k);
    setParams(next);
  };

  return (
    <div className="page">
      <h1>{type === "movie" ? "Movies" : "Series"}</h1>
      <div className="filters">
        <select value={genre} onChange={(e) => set("genre", e.target.value)} aria-label="Genre">
          <option value="">All genres</option>
          {genres.data?.genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => set("sort", e.target.value)} aria-label="Sort">
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      {res.error && <ErrorBox message={res.error} />}
      <Grid cards={items} />
      {res.loading && <Spinner />}
      {!res.loading && res.data && page < Math.min(res.data.total_pages, 500) && (
        <div className="center"><button type="button" className="btn ghost" onClick={() => setPage(page + 1)}>Load more</button></div>
      )}
    </div>
  );
}
