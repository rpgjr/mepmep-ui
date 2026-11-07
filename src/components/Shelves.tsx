import { useRef, type ReactNode } from "react";
import type { Card } from "../types";
import PosterCard from "./PosterCard";

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
        <button className="row-arrow left" onClick={() => scrollBy(-1)} aria-label={`Scroll ${title} left`}>‹</button>
        <div className="row-scroll" ref={scroller}>
          {cards.map((c) => (
            <div className="row-item" key={`${c.mediaType}-${c.id}`}>
              <PosterCard card={c} />
            </div>
          ))}
        </div>
        <button className="row-arrow right" onClick={() => scrollBy(1)} aria-label={`Scroll ${title} right`}>›</button>
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

export const Spinner = () => <div className="spinner" role="status" aria-label="Loading" />;

export const ErrorBox = ({ message }: { message: string }) => <p className="error-box">⚠ {message}</p>;
