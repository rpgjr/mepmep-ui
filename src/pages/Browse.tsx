import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toCards } from "../api";
import { Button } from "@/components/ui/button";
import Dropdown from "../components/Dropdown";
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
    <div className="mx-auto max-w-400 px-4 py-6 md:px-10">
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{type === "movie" ? "Movies" : "Series"}</h1>
      <div className="sticky top-14 z-10 -mx-4 mt-4 flex flex-wrap gap-2.5 bg-background/80 px-4 py-3 backdrop-blur-xl md:-mx-10 md:px-10">
        <Dropdown
          label="Genre"
          value={genre || "all"}
          onChange={(v) => set("genre", v === "all" ? "" : v)}
          options={[{ value: "all", label: "All genres" }, ...(genres.data?.genres.map((g) => ({ value: String(g.id), label: g.name })) ?? [])]}
        />
        <Dropdown label="Sort" value={sort} onChange={(v) => set("sort", v)} options={SORTS} />
      </div>
      {res.error && <ErrorBox message={res.error} />}
      <Grid cards={items} />
      {res.loading && <Spinner />}
      {!res.loading && res.data && page < Math.min(res.data.total_pages, 500) && (
        <div className="my-8 text-center"><Button type="button" variant="secondary" size="lg" onClick={() => setPage(page + 1)}>Load more</Button></div>
      )}
    </div>
  );
}
