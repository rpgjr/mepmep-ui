import { Link } from "react-router-dom";
import { img, toCards } from "../api";
import { useAuth } from "../auth";
import { Row, Spinner, ErrorBox } from "../components/Shelves";
import { useGet } from "../hooks";
import type { MediaType, Progress } from "../types";

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

  const hero = trending.data!.results.find((r) => r.backdrop_path)!;
  const trendingMovies = toCards(trending.data!.results, "movie");

  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${img(hero.backdrop_path, "w1280")})` }}>
        <div className="hero-fade">
          <span className="eyebrow">Trending this week</span>
          <h1>{hero.title}</h1>
          <p>{hero.overview}</p>
          <div className="actions">
            <Link className="btn" to={`/watch/movie/${hero.id}`}>▶ Watch now</Link>
            <Link className="btn ghost" to={`/title/movie/${hero.id}`}>More info</Link>
          </div>
        </div>
      </section>

      {user && history.data && history.data.length > 0 && (
        <section className="row">
          <div className="row-head"><h2>Continue watching</h2></div>
          <div className="row-scroll">
            {history.data.map((h) => (
              <Link key={`${h.mediaType}${h.tmdbId}`} className="resume" to={`/watch/${h.mediaType}/${h.tmdbId}?s=${h.season}&e=${h.episode}`}>
                <div className="resume-img" style={{ backgroundImage: `url(${img(h.backdropPath ?? h.posterPath, "w500")})` }}>
                  <span className="play">▶</span>
                  <div className="bar"><div style={{ width: `${h.durationSec ? Math.min(100, (h.positionSec / h.durationSec) * 100) : 0}%` }} /></div>
                </div>
                <div className="card-title">{h.title}</div>
                {h.mediaType === "tv" && <div className="card-sub">S{h.season} · E{h.episode}</div>}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Row title="Trending movies" cards={trendingMovies} />
      <Row title="Trending series" cards={trendingTv} />
      <Row title="Popular movies" cards={popularMovies} action={<Link to="/movies">See all</Link>} />
      <Row title="Top rated movies" cards={topMovies} />
      <Row title="Popular series" cards={popularTv} action={<Link to="/tv">See all</Link>} />
      <Row title="Top rated series" cards={topTv} />
    </>
  );
}
