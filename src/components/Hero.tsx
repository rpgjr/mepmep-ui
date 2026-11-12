import { Info, Play, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { img } from "../api";

export interface HeroItem {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  vote_average: number;
  release_date?: string;
}

const ROTATE_MS = 8000;
const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Full-width featured banner. Cycles through a few titles; hovering, focusing or choosing a dot pauses it. */
export default function Hero({ items }: { items: HeroItem[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2 || reduceMotion()) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, items.length]);

  // Pause while a mouse or the keyboard is on a button, so the title does not change under the pointer
  const hold = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
  };
  const item = items[index];
  const year = item.release_date?.slice(0, 4);

  return (
    <section className="relative -mt-14 min-h-[78vh] overflow-hidden max-sm:min-h-[66vh]" aria-label="Featured">
      {/* All backdrops stay mounted and fade into each other */}
      {items.map((it, i) => (
        <div
          key={it.id}
          aria-hidden="true"
          className={cn("absolute inset-0 bg-cover bg-top transition-opacity duration-1000", i === index ? "opacity-100" : "opacity-0")}
          style={{ backgroundImage: `url(${img(it.backdrop_path, "w1280")})` }}
        />
      ))}
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-background/85 via-background/30 to-transparent" />

      <div className="relative flex min-h-[78vh] items-end px-4 pt-32 pb-16 max-sm:min-h-[66vh] max-sm:pb-12 md:px-10">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-ring uppercase">
            <span className="h-px w-8 bg-ring" />
            Trending this week
          </span>
          <h1 className="mt-3 mb-3 text-[clamp(2.2rem,7vw,4.5rem)] leading-[1.02] font-extrabold tracking-tight text-balance">{item.title}</h1>
          <div className="mb-3 flex items-center gap-3 text-sm font-medium text-foreground/80">
            <span className="inline-flex items-center gap-1 text-amber-300"><Star className="size-4 fill-current" />{item.vote_average.toFixed(1)}</span>
            {year && <span>{year}</span>}
            <span className="rounded border border-foreground/30 px-1.5 text-xs tracking-wider">MOVIE</span>
          </div>
          <p className="line-clamp-3 max-w-xl text-base text-foreground/80 max-sm:line-clamp-2">{item.overview}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link {...hold} className={cn(buttonVariants({ size: "lg" }), "shadow-lg shadow-primary/30")} to={`/watch/movie/${item.id}`}>
              <Play className="fill-current" />Watch now
            </Link>
            <Link {...hold} className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "bg-white/15 backdrop-blur hover:bg-white/25")} to={`/title/movie/${item.id}`}>
              <Info />More info
            </Link>
          </div>
        </div>

        {items.length > 1 && (
          <fieldset className="absolute right-4 bottom-6 m-0 flex gap-2 border-0 p-0 md:right-10 md:bottom-10">
            <legend className="sr-only">Featured titles</legend>
            {items.map((it, i) => (
              <button
                {...hold}
                key={it.id}
                type="button"
                aria-label={`Show ${it.title}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={cn("h-1.5 rounded-full transition-all", i === index ? "w-8 bg-primary" : "w-4 bg-white/35 hover:bg-white/60")}
              />
            ))}
          </fieldset>
        )}
      </div>
    </section>
  );
}
