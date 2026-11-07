import { Link } from "react-router-dom";
import { img } from "../api";
import type { Card } from "../types";

export default function PosterCard({ card }: { card: Card }) {
  return (
    <Link to={`/title/${card.mediaType}/${card.id}`} className="card" title={card.title}>
      <div className="poster">
        {card.posterPath ? (
          <img src={img(card.posterPath)} alt={card.title} loading="lazy" />
        ) : (
          <div className="no-poster">{card.title}</div>
        )}
        {card.voteAverage ? <span className="badge">★ {card.voteAverage.toFixed(1)}</span> : null}
        <span className="type-tag">{card.mediaType === "tv" ? "SERIES" : "MOVIE"}</span>
      </div>
      <div className="card-title">{card.title}</div>
      {card.year && <div className="card-sub">{card.year}</div>}
    </Link>
  );
}
