import { Link, useParams } from "react-router-dom";
import { fmtRuntime, img, toCards } from "../api";
import { useAuth } from "../auth";
import { Row, Spinner, ErrorBox } from "../components/Shelves";
import TitleActions from "../components/TitleActions";
import { useGet } from "../hooks";
import type { Card, MediaType, Progress, TitleDetail } from "../types";

export default function Detail() {
  const { type, id } = useParams() as { type: MediaType; id: string };
  const { user } = useAuth();
  const { data: t, loading, error } = useGet<TitleDetail>(`/title/${type}/${id}`);
  const resume = useGet<Progress>(user ? `/history/${type}/${id}` : null).data;

  if (loading) return <Spinner />;
  if (error || !t) return <ErrorBox message={error ?? "Not found"} />;

  const name = t.title ?? t.name ?? "Untitled";
  const date = t.release_date ?? t.first_air_date ?? "";
  const runtime = t.runtime ?? t.episode_run_time?.[0];
  const card: Card = { mediaType: type, id: t.id, title: name, posterPath: t.poster_path, voteAverage: t.vote_average, year: date.slice(0, 4) };
  const watchUrl = resume && type === "tv" ? `/watch/tv/${id}?s=${resume.season}&e=${resume.episode}` : `/watch/${type}/${id}`;

  return (
    <>
      <section className="detail-hero" style={{ backgroundImage: `url(${img(t.backdrop_path, "w1280")})` }}>
        <div className="detail-fade">
          <div className="detail-body">
            <div className="detail-poster">{t.poster_path && <img src={img(t.poster_path, "w500")} alt={name} />}</div>
            <div className="detail-info">
              <h1>{name}</h1>
              {t.tagline && <p className="tagline">{t.tagline}</p>}
              <div className="meta">
                <span>★ {t.vote_average.toFixed(1)}</span>
                {date && <span>{date.slice(0, 4)}</span>}
                {runtime ? <span>{fmtRuntime(runtime)}</span> : null}
                {type === "tv" && t.number_of_seasons ? <span>{t.number_of_seasons} season{t.number_of_seasons > 1 ? "s" : ""}</span> : null}
              </div>
              <div className="chips">{t.genres.map((g) => <span key={g.id}>{g.name}</span>)}</div>
              <p className="overview">{t.overview}</p>
              <div className="actions">
                <Link className="btn" to={watchUrl}>
                  ▶ {resume ? (type === "tv" ? `Resume S${resume.season} E${resume.episode}` : "Resume") : "Watch now"}
                </Link>
                <TitleActions card={card} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {t.credits && t.credits.cast.length > 0 && (
        <section className="row">
          <div className="row-head"><h2>Cast</h2></div>
          <div className="row-scroll">
            {t.credits.cast.slice(0, 14).map((c) => (
              <div className="cast" key={c.id}>
                {c.profile_path ? <img src={img(c.profile_path, "w185")} alt={c.name} loading="lazy" /> : <div className="cast-empty">{c.name[0]}</div>}
                <strong>{c.name}</strong>
                <span className="muted">{c.character}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <Row title="More like this" cards={toCards(t.similar?.results ?? [], type)} />
    </>
  );
}
