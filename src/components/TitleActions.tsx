import { Check, Heart, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api, del, post } from "../api";
import { useAuth } from "../auth";
import type { Card } from "../types";

type ListName = "favorites" | "watchlist";

/** Favorite + Watch-list toggle buttons. Sends guests to the login page. */
export default function TitleActions({ card }: { card: Card }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [state, setState] = useState({ favorite: false, watchlist: false });

  useEffect(() => {
    if (!user) return setState({ favorite: false, watchlist: false });
    api<typeof state>(`/library/status/${card.mediaType}/${card.id}`).then(setState).catch(() => {});
  }, [user, card.mediaType, card.id]);

  const toggle = async (list: ListName, key: "favorite" | "watchlist") => {
    if (!user) return nav("/login", { state: { from: location.pathname } });
    const on = state[key];
    setState({ ...state, [key]: !on }); // update the button right away
    try {
      if (on) await del(`/library/${list}/${card.mediaType}/${card.id}`);
      else
        await post(`/library/${list}`, {
          mediaType: card.mediaType,
          tmdbId: card.id,
          title: card.title,
          posterPath: card.posterPath,
          voteAverage: card.voteAverage,
          releaseYear: card.year,
        });
    } catch {
      setState(state); // put it back if the server said no
    }
  };

  // A pressed toggle gets the purple tint
  const pressed = "aria-pressed:border-primary aria-pressed:bg-primary/25 aria-pressed:text-foreground";
  return (
    <>
      <Button type="button" variant="secondary" className={pressed} onClick={() => toggle("favorites", "favorite")} aria-pressed={state.favorite}>
        <Heart className={state.favorite ? "fill-current" : ""} />
        {state.favorite ? "Favorited" : "Favorite"}
      </Button>
      <Button type="button" variant="secondary" className={pressed} onClick={() => toggle("watchlist", "watchlist")} aria-pressed={state.watchlist}>
        {state.watchlist ? <Check /> : <Plus />}
        {state.watchlist ? "In My List" : "My List"}
      </Button>
    </>
  );
}
