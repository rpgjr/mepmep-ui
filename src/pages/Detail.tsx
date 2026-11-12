import { Play, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fmtRuntime, img, toCards } from "../api";
import { useAuth } from "../auth";
import { Row, Spinner, ErrorBox, SCROLL_STRIP } from "../components/Shelves";
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
      <section className="relative -mt-14 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-top" aria-hidden="true" style={{ backgroundImage: `url(${img(t.backdrop_path, "w1280")})` }} />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-linear-to-r from-background/90 via-background/40 to-transparent" />
        <div className="relative mx-auto flex max-w-6xl gap-10 px-4 pt-32 pb-10 max-sm:flex-col max-sm:items-center max-sm:gap-6 max-sm:pt-24 max-sm:text-center md:px-10">
          <div className="w-64 shrink-0 max-[900px]:w-48 max-sm:w-40">
            {t.poster_path && <img src={img(t.poster_path, "w500")} alt={name} className="rounded-xl shadow-2xl shadow-black/70 ring-1 ring-white/10" />}
          </div>
          <div className="min-w-0 flex-1 self-end">
            <h1 className="text-[clamp(1.9rem,5vw,3.4rem)] leading-[1.05] font-extrabold tracking-tight text-balance">{name}</h1>
            {t.tagline && <p className="mt-2 text-lg text-ring italic">{t.tagline}</p>}
            <div className="my-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-foreground/80 max-sm:justify-center">
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-300/15 px-2 py-0.5 font-bold text-amber-300"><Star className="size-4 fill-current" />{t.vote_average.toFixed(1)}</span>
              {date && <span>{date.slice(0, 4)}</span>}
              {runtime ? <span>{fmtRuntime(runtime)}</span> : null}
              {type === "tv" && t.number_of_seasons ? <span>{t.number_of_seasons} season{t.number_of_seasons > 1 ? "s" : ""}</span> : null}
              <span className="rounded border border-foreground/30 px-1.5 text-xs tracking-wider">{type === "tv" ? "SERIES" : "MOVIE"}</span>
            </div>
            <div className="flex flex-wrap gap-2 max-sm:justify-center">{t.genres.map((g) => <Badge key={g.id} variant="secondary" className="h-7 bg-white/10 px-3.5 text-sm backdrop-blur">{g.name}</Badge>)}</div>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/85">{t.overview}</p>
            <div className="mt-6 flex flex-wrap gap-3 max-sm:justify-center">
              <Link className={cn(buttonVariants({ size: "lg" }), "shadow-lg shadow-primary/30")} to={watchUrl}>
                <Play className="fill-current" />{resume ? (type === "tv" ? `Resume S${resume.season} E${resume.episode}` : "Resume") : "Watch now"}
              </Link>
              <TitleActions card={card} />
            </div>
          </div>
        </div>
      </section>

      {t.credits && t.credits.cast.length > 0 && (
        <section className="pt-6">
          <div className="px-4 md:px-10"><h2 className="text-xl font-bold tracking-tight md:text-2xl">Cast</h2></div>
          <div className={SCROLL_STRIP}>
            {t.credits.cast.slice(0, 14).map((c) => (
              <div className="w-28 shrink-0 text-sm" key={c.id}>
                {c.profile_path ? (
                  <img src={img(c.profile_path, "w185")} alt={c.name} loading="lazy" className="mb-2 size-28 rounded-full object-cover ring-2 ring-white/10" />
                ) : (
                  <div className="mb-2 grid size-28 place-items-center rounded-full bg-card text-3xl text-muted-foreground">{c.name[0]}</div>
                )}
                <strong className="block text-center">{c.name}</strong>
                <span className="block text-center text-muted-foreground">{c.character}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <Row title="More like this" cards={toCards(t.similar?.results ?? [], type)} />
    </>
  );
}
