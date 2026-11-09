import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api, img, put } from "../api";
import { useAuth } from "../auth";
import { ErrorBox, Spinner } from "../components/Shelves";
import TitleActions from "../components/TitleActions";
import { useGet } from "../hooks";
import type { Card, Episode, MediaType, Progress, TitleDetail } from "../types";

const VIDLINK = "https://vidlink.pro";
const EMBEDWAVE = "https://embedwave.cc/embed";
const VIDY = "https://vidy.st";
const COLOR = "8B5CF6"; // player accent color, same purple as the site

/** The video sources a viewer can pick. Only VidLink reports progress, so only it can resume mid-episode. */
const SOURCES = [
  { id: "vidlink", label: "VidLink · resume, may show pop-ups" },
  { id: "vidlink-jw", label: "VidLink alt player · fewer pop-ups" },
  { id: "embedwave", label: "EmbedWave · no ads, no resume" },
  { id: "vidy", label: "Vidy · opens at saved time, no tracking" },
] as const;
type SourceId = (typeof SOURCES)[number]["id"];

/** Builds the embed URL for the chosen source. `startAt` is the second to resume from (VidLink only). */
function playerUrl(source: SourceId, type: MediaType, id: string, season: number, episode: number, startAt: number) {
  if (source === "vidy") {
    const path = type === "movie" ? `/movie/${id}` : `/tv/${id}/${season}/${episode}`;
    const q = new URLSearchParams({ color: COLOR, autoplay: "true" });
    if (startAt > 10) q.set("progress", String(startAt));
    return `${VIDY}${path}?${q}`;
  }
  if (source === "embedwave") {
    const path = type === "movie" ? `/movie/${id}` : `/tv/${id}/${season}/${episode}`;
    return `${EMBEDWAVE}${path}?autoplay=1`;
  }
  const path = type === "movie" ? `/movie/${id}` : `/tv/${id}/${season}/${episode}`;
  const q = new URLSearchParams({ primaryColor: COLOR, autoplay: "true" });
  if (source === "vidlink-jw") q.set("player", "jw");
  if (startAt > 10) q.set("startAt", String(startAt));
  return `${VIDLINK}${path}?${q}`;
}

export default function Watch() {
  const { type, id } = useParams() as { type: MediaType; id: string };
  const [params, setParams] = useSearchParams();
  const season = Number(params.get("s") ?? 1) || 1;
  const episode = Number(params.get("e") ?? 1) || 1;
  const { user } = useAuth();

  const title = useGet<TitleDetail>(`/title/${type}/${id}`);
  const episodes = useGet<{ episodes: Episode[] }>(type === "tv" ? `/tv/${id}/season/${season}` : null);

  // Which video source to use. Remembered in this browser only.
  const [source, setSource] = useState<SourceId>(() => {
    try {
      const saved = localStorage.getItem("mepmep.source");
      return SOURCES.some((s) => s.id === saved) ? (saved as SourceId) : "vidlink";
    } catch {
      return "vidlink";
    }
  });
  const pickSource = (v: SourceId) => {
    setSource(v);
    try { localStorage.setItem("mepmep.source", v); } catch { /* storage blocked */ }
  };

  // Resume point: wait for the saved history before showing the player so its URL never changes mid-play.
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

  // Make sure the title shows in "Continue watching" as soon as the player opens (works for every source).
  useEffect(() => {
    if (startAt !== null && title.data) save(startAt, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAt, title.data]);

  const nextEp = type === "tv" ? episodes.data?.episodes.find((e) => e.episode_number === episode + 1) : undefined;
  const goTo = useCallback((s: number, e: number) => setParams({ s: String(s), e: String(e) }, { replace: true }), [setParams]);

  // ---- listen to VidLink ----
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (source === "embedwave" || source === "vidy") return; // these send no events we read
    const onMessage = (ev: MessageEvent) => {
      // Only trust messages that come from VidLink AND from our own iframe.
      if (ev.origin !== VIDLINK || ev.source !== frame.current?.contentWindow) return;
      if (ev.data?.type !== "PLAYER_EVENT") return;
      const { event, currentTime, duration } = ev.data.data ?? {};
      if (event === "timeupdate" && Date.now() - lastSave.current > 10_000) {
        lastSave.current = Date.now();
        save(currentTime, duration ?? 0);
      } else if (event === "pause") {
        save(currentTime, duration ?? 0);
      } else if (event === "ended" && nextEp) {
        goTo(season, nextEp.episode_number); // auto-play next episode
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [source, save, nextEp, season, goTo]);

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
            key={`${source}-${type}-${id}-${season}-${episode}`}
            src={playerUrl(source, type, id, season, episode, startAt)}
            title={`Player – ${name}`}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            referrerPolicy={source === "embedwave" ? "no-referrer" : undefined}
          />
        )}
      </div>

      <div className="watch-actions">
        <TitleActions card={card} />
        {type === "tv" && nextEp && (
          <button type="button" className="btn" onClick={() => goTo(season, nextEp.episode_number)}>Next episode ▶</button>
        )}
        <label className="server">
          <span className="muted">Source</span>
          <select value={source} onChange={(e) => pickSource(e.target.value as SourceId)} aria-label="Video source">
            {SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        {!user && <span className="muted">Log in to save your progress. <Link to="/login" state={{ from: `/watch/${type}/${id}` }}>Log in</Link></span>}
      </div>

      {source !== "embedwave" && (
        <p className="popup-note" role="note">
          ⚠ VidLink can open pop-up tabs when you click the player. Close them, or switch <b>Source</b> to EmbedWave (no ads).
          A browser ad blocker such as uBlock Origin, or Brave, stops pop-ups for good.
        </p>
      )}

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
              <button type="button" key={ep.episode_number} className={`ep ${ep.episode_number === episode ? "current" : ""}`} onClick={() => { goTo(season, ep.episode_number); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
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
