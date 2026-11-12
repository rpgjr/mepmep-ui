import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { server } from "../api";
import type { Card } from "../types";
import PosterCard from "./PosterCard";
import WakeUp from "./WakeUp";

/** Scroll strip with hidden scrollbar: used by every horizontal row. Mouse users get arrows, touch users swipe. */
export const SCROLL_STRIP =
  "flex gap-4 overflow-x-auto px-4 py-3 md:px-10 snap-x snap-proximity scroll-px-4 md:scroll-px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-sm:gap-3";

/** Width of one poster in a row, so that 5 fit and a sliver of the next shows. This is what tells people the row scrolls.
 * Each size is (row width - gaps) / posters on screen: 2.4 on phones, 3.4, 4.4, then 5.4 on desktop and 6.4 on very wide screens. */
export const ROW_ITEM =
  "w-[calc((100%-1.05rem)/2.4)] min-w-0 shrink-0 snap-start sm:w-[calc((100%-2.4rem)/3.4)] md:w-[calc((100%-3.4rem)/4.4)] lg:w-[calc((100%-4.4rem)/5.4)] min-[1600px]:w-[calc((100%-5.4rem)/6.4)]";

/** Arrows only exist for a mouse; on touch screens the row is swiped. */
const ARROW =
  "absolute top-[calc(50%-1.5rem)] z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-lg border-2 border-ink bg-sun text-ink pop opacity-0 transition hover:bg-primary group-hover/row:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:flex";

/** Horizontal scrolling row with a heading. */
export const TONES = { pink: "bg-primary", sun: "bg-sun", aqua: "bg-aqua", lime: "bg-lime" } as const;
export type Tone = keyof typeof TONES;

/** Section heading: a tilted colour block in front of the title, like a sticker. */
export function SectionTitle({ children, tone = "pink" }: { children: ReactNode; tone?: Tone }) {
  return (
    <h2 className="flex items-center gap-3 text-xl font-bold tracking-tight md:text-2xl">
      <span aria-hidden="true" className={`size-5 shrink-0 rotate-12 rounded-md border-2 border-ink ${TONES[tone]} pop`} />
      {children}
    </h2>
  );
}

export function Row({ title, cards, action, tone }: { title: string; cards: Card[]; action?: ReactNode; tone?: Tone }) {
  const scroller = useRef<HTMLDivElement>(null);
  if (!cards.length) return null;
  const scrollBy = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.85, behavior: "smooth" });
  return (
    <section className="pt-6">
      <div className="flex items-center justify-between gap-3 px-4 md:px-10">
        <SectionTitle tone={tone}>{title}</SectionTitle>
        {action}
      </div>
      <div className="group/row relative">
        <button type="button" className={`${ARROW} left-2`} onClick={() => scrollBy(-1)} aria-label={`Scroll ${title} left`}>
          <ChevronLeft className="size-7" />
        </button>
        <div className={SCROLL_STRIP} ref={scroller}>
          {cards.map((c) => (
            <div className={ROW_ITEM} key={`${c.mediaType}-${c.id}`}>
              <PosterCard card={c} />
            </div>
          ))}
        </div>
        <button type="button" className={`${ARROW} right-2`} onClick={() => scrollBy(1)} aria-label={`Scroll ${title} right`}>
          <ChevronRight className="size-7" />
        </button>
      </div>
    </section>
  );
}

/** Wrapping grid of cards. */
export function Grid({ cards }: { cards: Card[] }) {
  return (
    <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-4 gap-y-7 max-sm:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-sm:gap-x-3">
      {cards.map((c) => (
        <PosterCard key={`${c.mediaType}-${c.id}`} card={c} />
      ))}
    </div>
  );
}

/** How long a load may take before we assume the free server was asleep. A normal answer takes well under a second. */
const SLOW_MS = 5000;

/** Loading spinner. If the server has not answered after 5 seconds, show the dancing rat until it does. */
export function Spinner() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (server.awake) return;
    const t = setTimeout(() => setSlow(!server.awake), SLOW_MS);
    return () => clearTimeout(t);
  }, []);
  if (slow && !server.awake) return <WakeUp />;
  return (
    <div role="status" aria-label="Loading">
      {/* "spinner" is only a hook for the tests */}
      <div className="spinner mx-auto my-15 size-9 animate-spin rounded-full border-4 border-accent border-t-primary border-r-sun border-b-aqua" />
    </div>
  );
}

export const ErrorBox = ({ message }: { message: string }) => (
  <Alert variant="destructive" className="mx-4 my-3 w-auto md:mx-10">
    <AlertDescription>⚠ {message}</AlertDescription>
  </Alert>
);
