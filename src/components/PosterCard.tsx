import { Play, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { img } from "../api";
import type { Card } from "../types";

export default function PosterCard({ card }: { card: Card }) {
  return (
    <Link to={`/title/${card.mediaType}/${card.id}`} className="group block min-w-0 outline-none" title={card.title}>
      <div className="relative aspect-2/3 overflow-hidden rounded-2xl border-2 border-ink bg-card pop bouncy transition duration-300 group-hover:z-10 group-hover:-translate-y-1.5 group-hover:-rotate-2 group-hover:scale-[1.05] group-hover:shadow-[6px_8px_0_0_var(--primary)] group-focus-visible:ring-4 group-focus-visible:ring-ring">
        {card.posterPath ? (
          <img src={img(card.posterPath)} alt={card.title} loading="lazy" className="size-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center p-2.5 text-center text-muted-foreground">{card.title}</div>
        )}
        {/* Shown on hover and keyboard focus */}
        <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 bg-linear-to-t from-ink/95 via-ink/30 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="grid size-11 place-items-center rounded-lg border-2 border-ink bg-primary text-primary-foreground pop"><Play className="size-5 fill-current" /></span>
          {card.voteAverage ? (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-sun"><Star className="size-3.5 fill-current" />{card.voteAverage.toFixed(1)}</span>
          ) : null}
        </div>
        <Badge className={`absolute top-2 left-2 -rotate-3 border-2 border-ink font-extrabold tracking-wider ${card.mediaType === "tv" ? "bg-aqua text-ink" : "bg-sun text-ink"}`}>
          {card.mediaType === "tv" ? "SERIES" : "MOVIE"}
        </Badge>
      </div>
      <div className="mt-3 truncate font-heading text-[0.95rem] font-semibold">{card.title}</div>
      {card.year && <div className="text-xs text-muted-foreground">{card.year}</div>}
    </Link>
  );
}
