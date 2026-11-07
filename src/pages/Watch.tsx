import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api, img, put } from "../api";
import { useAuth } from "../auth";
import { ErrorBox, Spinner } from "../components/Shelves";
import TitleActions from "../components/TitleActions";
import { useGet } from "../hooks";
import type { Card, Episode, MediaType, Progress, TitleDetail } from "../types";

const PLAYER = "https://vidy.st";
const COLOR = "8B5CF6"; // player accent color, matches the site

/** Builds the Vidy embed URL for a movie or an episode. */
function playerUrl(type: MediaType, id: string, season: number, episode: number, startAt: number) {
  const path = type === "movie" ? `/movie/${id}` : `/tv/${id}/${season}/${episode}`;
  const q = new URLSearchParams({ color: COLOR, autoplay: "true" });
  if (startAt > 10) q.set("progress", String(startAt));
  return `${PLAYER}${path}?${q}`;
}

export default function Watch() {
  const { type, id } = useParams() as { type: MediaType; id: string };
  const [params, setParams] = useSearchParams();
  const season = Number(params.get("s") ?? 1) || 1;
  const episode = Number(params.get("e") ?? 1) || 1;
  const { user } = useAuth();

  const title = useGet<TitleDetail>(`/title/${type}/${id}`);
  const episodes = useGet<{ episodes: Episode[] }>(type === "tv" ? `/tv/${id}/season/${season}` : null);

  // Resume point: wait for the saved history before showing the player so the URL never changes mid-play.
  const [startAt, setStartAt] = useState<number | null>(user ? null : 0);
  useEffect(() => {
    setStartAt(user ? null : 0);
    if (!user) return;
    let cancelled = false;
    api<Progress>(`/history/${type}/${id}`)
      .then((h) => !cancelled && setStartAt(h.season === season && h.episode === episode ? h.positionSec : 0))
      .catch(() => !cancelled && setStartAt(0)); // 404 = never watched
    return () => {
      cancelled = true;
    };
  }, [user, type, id, season, episode]);

  // ---- save progress ----
  const lastSave = useRef(0);
  const save = useCallback(
    (positionSec: number, durationSec: number) => {
      const t = title.data;
      if (!user || !t) return;
      put("/history", {
        mediaType: type,
        tmdbId: Number(id),
        title: t.title ?? t.name ?? "Untitled",
        posterPath: t.poster_path,
        backdropPath: t.backdrop_path,
        season,
        episode,
        positionSec: Math.floor(positionSec),
        durationSec: Math.floor(durationSec),
      }).catch(() => {});
    },
    [user, title.data, type, id, season, episode],
  );

  // Make sure the title appears in "Continue watching" as soon as the player opens.
  useEffect(() => {
    if (startAt !== null && title.data) save(startAt, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAt, title.data]);

  const nextEp = type === "tv" ? episodes.data?.episodes.find((e) => e.episode_number === episode + 1) : undefined;
  const goTo = useCallback((s: number, e: number) => setParams({ s: String(s), e: String(e) }, { replace: true }), [setParams]);

  // ---- listen to the player ----
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (ev.source !== frame.current?.contentWindow || typeof ev.data !== "string") return; // only our player
      try {
        const p = JSON.parse(ev.data);
        if (p.event === "timeupdate" && Date.now() - lastSave.current > 10_000) {
          lastSave.current = Date.now();
          save(p.currentTime, p.duration ?? 0);
        } else if (p.event === "pause") {
          save(p.currentTime, p.duration ?? 0);
        } else if (p.event === "ended" && nextEp) {
          goTo(season, nextEp.episode_number); // auto-play next episode
        }
      } catch {
        /* not a JSON message */
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [save, nextEp, season, goTo]);

  if (title.loading) return <Spinner />;
  if (title.error || !title.data) return <ErrorBox message={title.error ?? "Not found"} />;

  const t = title.data;
  const name = t.title ?? t.name ?? "Untitled";
  const card: Card = { mediaType: type, id: t.id, title: name, posterPath: t.poster_path, voteAverage: t.vote_average, year: (t.release_date ?? t.first_air_date ?? "").slice(0, 4) };
  const seasons = (t.seasons ?? []).filter((s) => s.season_number > 0);
  const currentEp = episodes.data?.episodes.find((e) => e.episode_number === episode);

  return (
    <div className="watch">
      <div className="watch-top">
        <Link to={`/title/${type}/${id}`} className="back">← Details</Link>
        <h1>{name}{type === "tv" && <span className="muted"> · S{season} E{episode}{currentEp ? ` – ${currentEp.name}` : ""}</span>}</h1>
      </div>

      <div className="player">
        {startAt === null ? (
          <Spinner />
        ) : (
          <iframe
            ref={frame}
            key={`${type}-${id}-${season}-${episode}`}
            src={playerUrl(type, id, season, episode, startAt)}
            title={`Player – ${name}`}
            allowFullScreen
            allow="encrypted-media; autoplay *; fullscreen *"
            referrerPolicy="origin"
          />
        )}
      </div>

      <div className="watch-actions">
        <TitleActions card={card} />
        {type === "tv" && nextEp && (
          <button className="btn" onClick={() => goTo(season, nextEp.episode_number)}>Next episode ▶</button>
        )}
        {!user && <span className="muted">Log in to save your progress. <Link to="/login" state={{ from: `/watch/${type}/${id}` }}>Log in</Link></span>}
      </div>

      {type === "tv" && (
        <section className="episodes">
          <div className="row-head">
            <h2>Episodes</h2>
            <select value={season} onChange={(e) => goTo(Number(e.target.value), 1)} aria-label="Season">
              {seasons.map((s) => <option key={s.season_number} value={s.season_number}>{s.name}</option>)}
            </select>
          </div>
          {episodes.loading && <Spinner />}
          <div className="ep-list">
            {episodes.data?.episodes.map((ep) => (
              <button key={ep.episode_number} className={`ep ${ep.episode_number === episode ? "current" : ""}`} onClick={() => { goTo(season, ep.episode_number); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                <div className="ep-img" style={{ backgroundImage: ep.still_path ? `url(${img(ep.still_path, "w300")})` : undefined }}>
                  <span className="ep-num">{ep.episode_number}</span>
                </div>
                <div className="ep-text">
                  <strong>{ep.name}</strong>
                  <span className="muted">{ep.runtime ? `${ep.runtime}m` : ""}{ep.air_date ? ` · ${ep.air_date}` : ""}</span>
                  <p>{ep.overview}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
