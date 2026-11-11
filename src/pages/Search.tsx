import { useSearchParams } from "react-router-dom";
import { toCards } from "../api";
import { Grid, Spinner, ErrorBox } from "../components/Shelves";
import { useGet } from "../hooks";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q")?.trim() ?? "";
  const { data, loading, error } = useGet<{ results: Record<string, any>[] }>(q ? `/search?q=${encodeURIComponent(q)}` : null);
  const cards = toCards(data?.results ?? []);

  return (
    <div className="mx-auto max-w-400 px-4 py-6 md:px-10">
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{q ? <>Results for “{q}”</> : "Search"}</h1>
      {loading && <Spinner />}
      {error && <ErrorBox message={error} />}
      {!loading && q && !cards.length && !error && <p className="px-4 py-12 text-center text-muted-foreground">Nothing found. Try another title.</p>}
      <Grid cards={cards} />
    </div>
  );
}
