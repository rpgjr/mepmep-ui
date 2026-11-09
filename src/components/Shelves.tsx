import { useEffect, useRef, useState, type ReactNode } from "react";
import { server } from "../api";
import type { Card } from "../types";
import PosterCard from "./PosterCard";
import WakeUp from "./WakeUp";

/** Horizontal scrolling row with a heading. The scrollbar is hidden; arrows (mouse) or swipe (touch) scroll it. */
export function Row({ title, cards, action }: { title: string; cards: Card[]; action?: ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  if (!cards.length) return null;
  const scrollBy = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.85, behavior: "smooth" });
  return (
    <section className="row">
      <div className="row-head">
        <h2>{title}</h2>
        {action}
      </div>
      <div className="row-wrap">
        <button type="button" className="row-arrow left" onClick={() => scrollBy(-1)} aria-label={`Scroll ${title} left`}>‹</button>
        <div className="row-scroll" ref={scroller}>
          {cards.map((c) => (
            <div className="row-item" key={`${c.mediaType}-${c.id}`}>
              <PosterCard card={c} />
            </div>
          ))}
        </div>
        <button type="button" className="row-arrow right" onClick={() => scrollBy(1)} aria-label={`Scroll ${title} right`}>›</button>
      </div>
    </section>
  );
}

/** Wrapping grid of cards. */
export function Grid({ cards }: { cards: Card[] }) {
  return (
    <div className="grid">
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
      <div className="spinner" />
    </div>
  );
}

export const ErrorBox = ({ message }: { message: string }) => <p className="error-box">⚠ {message}</p>;
