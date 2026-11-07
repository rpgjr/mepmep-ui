import type { ReactNode } from "react";
import type { Card } from "../types";
import PosterCard from "./PosterCard";

/** Horizontal scrolling row with a heading. */
export function Row({ title, cards, action }: { title: string; cards: Card[]; action?: ReactNode }) {
  if (!cards.length) return null;
  return (
    <section className="row">
      <div className="row-head">
        <h2>{title}</h2>
        {action}
      </div>
      <div className="row-scroll">
        {cards.map((c) => (
          <div className="row-item" key={`${c.mediaType}-${c.id}`}>
            <PosterCard card={c} />
          </div>
        ))}
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
