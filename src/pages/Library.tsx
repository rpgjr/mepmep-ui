import { Link, useNavigate, useParams } from "react-router-dom";
import { del, img } from "../api";
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
    <div className="page">
      <h1>My List</h1>
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <Link key={t.key} to={`/my/${t.key}`} role="tab" aria-selected={t.key === tab} className={t.key === tab ? "active" : ""}>
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
    return <p className="empty">{list === "favorites" ? "No favorites yet. Tap ♡ on any title." : "Your list is empty. Tap ＋ My List on any title."}</p>;
  }
  const cards: Card[] = rows.map((s) => ({ mediaType: s.mediaType, id: s.tmdbId, title: s.title, posterPath: s.posterPath, voteAverage: s.voteAverage, year: s.releaseYear }));

  return (
    <div className="grid">
      {cards.map((c) => (
        <div key={`${c.mediaType}${c.id}`} className="saved">
          <Link to={`/title/${c.mediaType}/${c.id}`} className="card" title={c.title}>
            <div className="poster">{c.posterPath ? <img src={img(c.posterPath)} alt={c.title} loading="lazy" /> : <div className="no-poster">{c.title}</div>}</div>
            <div className="card-title">{c.title}</div>
          </Link>
          <button className="btn ghost sm block" onClick={async () => {
            await del(`/library/${list}/${c.mediaType}/${c.id}`);
            setRemoved((r) => [...r, `${c.mediaType}${c.id}`]);
          }}>Remove</button>
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
  if (!rows.length) return <p className="empty">Nothing here yet. Start watching something!</p>;

  return (
    <div className="history">
      {rows.map((h) => (
        <div className="history-item" key={`${h.mediaType}${h.tmdbId}`}>
          <Link to={`/watch/${h.mediaType}/${h.tmdbId}?s=${h.season}&e=${h.episode}`} className="history-img" style={{ backgroundImage: `url(${img(h.backdropPath ?? h.posterPath, "w500")})` }}>
            <span className="play">▶</span>
            <div className="bar"><div style={{ width: `${h.durationSec ? Math.min(100, (h.positionSec / h.durationSec) * 100) : 0}%` }} /></div>
          </Link>
          <div className="history-info">
            <strong>{h.title}</strong>
            <span className="muted">{h.mediaType === "tv" ? `Season ${h.season} · Episode ${h.episode}` : "Movie"}</span>
            <div className="actions">
              <Link className="btn sm" to={`/watch/${h.mediaType}/${h.tmdbId}?s=${h.season}&e=${h.episode}`}>Resume</Link>
              <button className="btn ghost sm" onClick={async () => { await del(`/history/${h.mediaType}/${h.tmdbId}`); setRemoved((r) => [...r, `${h.mediaType}${h.tmdbId}`]); }}>Remove</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
