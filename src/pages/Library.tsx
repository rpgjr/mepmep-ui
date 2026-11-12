import { Play } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { del, img } from "../api";
import PosterCard from "../components/PosterCard";
import { useAuth } from "../auth";
import { Spinner, ErrorBox } from "../components/Shelves";
import { useGet } from "../hooks";
import type { Card, Progress, SavedTitle } from "../types";
import { useEffect, useState } from "react";

const TABS = [
  { key: "watchlist", label: "To watch" },
  { key: "favorites", label: "Favorites" },
  { key: "continue", label: "Continue watching" },
];

/** My List page: To watch, Favorites and Continue watching tabs. */
export default function Library() {
  const { tab = "watchlist" } = useParams();
  const { user, ready } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (ready && !user) nav("/login", { replace: true, state: { from: `/my/${tab}` } });
  }, [ready, user, nav, tab]);

  if (!user) return <Spinner />;

  return (
    <div className="mx-auto max-w-400 px-4 py-6 md:px-10">
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">My List</h1>
      <div className="my-5 flex gap-6 overflow-x-auto border-b-2 border-ink" role="tablist">
        {TABS.map((t) => (
          <Link
            key={t.key}
            to={`/my/${t.key}`}
            role="tab"
            aria-selected={t.key === tab}
            className={cn("-mb-px border-b-4 pb-3 font-heading text-lg font-semibold whitespace-nowrap transition-colors", t.key === tab ? "border-sun text-sun" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            {t.label}
          </Link>
        ))}
      </div>
      {tab === "continue" ? <History /> : <Saved key={tab} list={tab === "favorites" ? "favorites" : "watchlist"} />}
    </div>
  );
}

function Saved({ list }: { list: "favorites" | "watchlist" }) {
  const { data, loading, error } = useGet<SavedTitle[]>(`/library/${list}`);
  const [removed, setRemoved] = useState<string[]>([]);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;

  const rows = (data ?? []).filter((s) => !removed.includes(`${s.mediaType}${s.tmdbId}`));
  if (!rows.length) {
    return <p className="px-4 py-12 text-center text-muted-foreground">{list === "favorites" ? "No favorites yet. Tap ♡ on any title." : "Your list is empty. Tap ＋ My List on any title."}</p>;
  }
  const cards: Card[] = rows.map((s) => ({ mediaType: s.mediaType, id: s.tmdbId, title: s.title, posterPath: s.posterPath, voteAverage: s.voteAverage, year: s.releaseYear }));

  return (
    <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-4 gap-y-7 max-sm:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-sm:gap-x-3">
      {cards.map((c) => (
        <div key={`${c.mediaType}${c.id}`} className="flex flex-col gap-2">
          <PosterCard card={c} />
          <Button type="button" variant="secondary" size="sm" className="w-full" onClick={async () => {
            await del(`/library/${list}/${c.mediaType}/${c.id}`);
            setRemoved((r) => [...r, `${c.mediaType}${c.id}`]);
          }}>Remove</Button>
        </div>
      ))}
    </div>
  );
}

function History() {
  const { data, loading, error } = useGet<Progress[]>("/history");
  const [removed, setRemoved] = useState<string[]>([]);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  const rows = (data ?? []).filter((h) => !removed.includes(`${h.mediaType}${h.tmdbId}`));
  if (!rows.length) return <p className="px-4 py-12 text-center text-muted-foreground">Nothing here yet. Start watching something!</p>;

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3.5 max-sm:grid-cols-[minmax(0,1fr)]">
      {rows.map((h) => (
        <div className="flex gap-3 rounded-xl bg-card p-2.5 ring-1 ring-white/5" key={`${h.mediaType}${h.tmdbId}`}>
          <Link
            to={`/watch/${h.mediaType}/${h.tmdbId}?s=${h.season}&e=${h.episode}`}
            className="relative block aspect-video w-37.5 shrink-0 overflow-hidden rounded-xl bg-muted bg-cover bg-center max-sm:w-30"
            style={{ backgroundImage: `url(${img(h.backdropPath ?? h.posterPath, "w500")})` }}
          >
            <span className="absolute inset-0 m-auto grid size-11 place-items-center rounded-lg bg-black/60 text-white"><Play className="fill-current" /></span>
            {h.durationSec > 0 && <div className="absolute inset-x-0 bottom-0 h-1 bg-white/25"><div className="h-full bg-primary" style={{ width: `${Math.min(100, (h.positionSec / h.durationSec) * 100)}%` }} /></div>}
          </Link>
          <div className="flex min-w-0 flex-col gap-1">
            <strong>{h.title}</strong>
            <span className="text-sm text-muted-foreground">{h.mediaType === "tv" ? `Season ${h.season} · Episode ${h.episode}` : "Movie"}</span>
            <div className="mt-auto flex flex-wrap gap-2.5">
              <Link className={buttonVariants({ size: "sm" })} to={`/watch/${h.mediaType}/${h.tmdbId}?s=${h.season}&e=${h.episode}`}>Resume</Link>
              <Button type="button" variant="secondary" size="sm" onClick={async () => { await del(`/history/${h.mediaType}/${h.tmdbId}`); setRemoved((r) => [...r, `${h.mediaType}${h.tmdbId}`]); }}>Remove</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
