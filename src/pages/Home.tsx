import { Play, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { img, toCards } from "../api";
import { useAuth } from "../auth";
import Hero, { type HeroItem } from "../components/Hero";
import { Row, Spinner, ErrorBox, SCROLL_STRIP } from "../components/Shelves";
import { useGet } from "../hooks";
import type { MediaType, Progress } from "../types";

const SeeAll = ({ to }: { to: string }) => (
  <Link to={to} className="inline-flex items-center gap-0.5 text-sm font-semibold text-ring hover:underline">See all<ChevronRight className="size-4" /></Link>
);

interface Page { results: Record<string, any>[] }

/** Loads one TMDB list and turns it into cards. */
function useCards(path: string, type: MediaType) {
  const { data } = useGet<Page>(path);
  return toCards(data?.results ?? [], type);
}

export default function Home() {
  const { user } = useAuth();
  const trending = useGet<Page>("/trending/movie");
  const trendingTv = useCards("/trending/tv", "tv");
  const popularMovies = useCards("/list/movie/popular", "movie");
  const topMovies = useCards("/list/movie/top_rated", "movie");
  const popularTv = useCards("/list/tv/popular", "tv");
  const topTv = useCards("/list/tv/top_rated", "tv");
  const history = useGet<Progress[]>(user ? "/history" : null);

  if (trending.loading) return <Spinner />;
  if (trending.error) return <ErrorBox message={trending.error} />;

  const featured: HeroItem[] = trending.data!.results.filter((r) => r.backdrop_path).slice(0, 5) as HeroItem[];
  const trendingMovies = toCards(trending.data!.results, "movie");

  return (
    <>
      {featured.length > 0 && <Hero items={featured} />}

      {user && history.data && history.data.length > 0 && (
        <section className="pt-6">
          <div className="px-4 md:px-10"><h2 className="text-xl font-bold tracking-tight md:text-2xl">Continue watching</h2></div>
          <div className={SCROLL_STRIP}>
            {history.data.map((h) => (
              <Link key={`${h.mediaType}${h.tmdbId}`} className="group w-[calc((100%-0.3rem)/1.4)] min-w-0 shrink-0 snap-start sm:w-[calc((100%-1rem)/2.4)] lg:w-[calc((100%-2rem)/3.4)]" to={`/watch/${h.mediaType}/${h.tmdbId}?s=${h.season}&e=${h.episode}`}>
                <div className="relative aspect-video overflow-hidden rounded-lg bg-card bg-cover bg-center ring-1 ring-white/5 transition duration-300 group-hover:scale-[1.03] group-hover:shadow-2xl group-hover:shadow-primary/30" style={{ backgroundImage: `url(${img(h.backdropPath ?? h.posterPath, "w500")})` }}>
                  <span className="absolute inset-0 m-auto grid size-12 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition group-hover:bg-primary"><Play className="fill-current" /></span>
                  {h.durationSec > 0 && <div className="absolute inset-x-0 bottom-0 h-1 bg-white/25"><div className="h-full bg-primary" style={{ width: `${Math.min(100, (h.positionSec / h.durationSec) * 100)}%` }} /></div>}
                </div>
                <div className="mt-2 truncate text-sm font-semibold">{h.title}</div>
                {h.mediaType === "tv" && <div className="text-xs text-muted-foreground">S{h.season} · E{h.episode}</div>}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Row title="Trending movies" cards={trendingMovies} />
      <Row title="Trending series" cards={trendingTv} />
      <Row title="Popular movies" cards={popularMovies} action={<SeeAll to="/movies" />} />
      <Row title="Top rated movies" cards={topMovies} />
      <Row title="Popular series" cards={popularTv} action={<SeeAll to="/tv" />} />
      <Row title="Top rated series" cards={topTv} />
    </>
  );
}
