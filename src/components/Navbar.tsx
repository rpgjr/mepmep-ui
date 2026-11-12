import { Clapperboard, House, Palette, Plus, Search, Tv, User } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "../auth";
import { THEMES, applyTheme, currentTheme } from "../theme";
import Dropdown from "./Dropdown";

const topLink = ({ isActive }: { isActive: boolean }) =>
  cn("rounded-lg border-2 border-transparent px-3.5 py-1 font-heading font-semibold text-muted-foreground transition-all hover:-rotate-2 hover:text-foreground", isActive && "border-ink bg-sun text-ink pop hover:text-ink");

const tabLink = ({ isActive }: { isActive: boolean }) =>
  cn("flex flex-1 flex-col items-center gap-0.5 py-2 font-heading text-[0.7rem] font-semibold text-muted-foreground", isActive && "text-sun");

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Transparent at the top of the page, frosted glass once the page has scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [theme, setTheme] = useState(currentTheme);
  const pickTheme = (v: string) => {
    setTheme(v);
    applyTheme(v);
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-5 px-4 transition-colors duration-300 max-sm:gap-2.5 md:px-10",
          scrolled ? "border-b-2 border-ink bg-background/90 backdrop-blur-xl" : "bg-linear-to-b from-ink/80 to-transparent",
        )}
      >
        <Link to="/" className="font-heading text-3xl font-bold tracking-tight transition-transform hover:-rotate-3 max-sm:text-2xl">
          <span className="text-sun">mep</span><span className="text-primary">mep</span><span className="text-aqua">!</span>
        </Link>
        <nav className="flex gap-1.5 max-[900px]:hidden">
          <NavLink to="/" end className={topLink}>Home</NavLink>
          <NavLink to="/movies" className={topLink}>Movies</NavLink>
          <NavLink to="/tv" className={topLink}>Series</NavLink>
          <NavLink to="/my/watchlist" className={topLink}>My List</NavLink>
        </nav>
        <form className="relative ml-auto max-w-105 flex-1 max-sm:max-w-none" onSubmit={onSearch}>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-10 rounded-lg border-2 border-ink bg-card pl-10 pop placeholder:text-foreground/50 focus-visible:border-aqua" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search movies & series" aria-label="Search" />
        </form>
        <div className="flex shrink-0 items-center gap-1.5">
          <Palette className="size-5 text-sun max-sm:hidden" aria-hidden="true" />
          <Dropdown label="Colour scheme" value={theme} onChange={pickTheme} options={[...THEMES]} className="h-10 min-w-0 w-32 max-sm:w-28" />
        </div>
        <div className="flex items-center gap-2 max-sm:hidden">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground max-[900px]:hidden">Hi, {user.displayName}</span>
              <Button variant="secondary" size="sm" onClick={logout}>Log out</Button>
            </>
          ) : (
            <>
              <Link className={buttonVariants({ variant: "secondary", size: "sm" })} to="/login">Log in</Link>
              <Link className={buttonVariants({ size: "sm" })} to="/register">Sign up</Link>
            </>
          )}
        </div>
      </header>

      {/* Phone layout: tabs pinned to the bottom of the screen */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 hidden border-t-2 border-ink bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md max-sm:flex"
        aria-label="Main"
      >
        <NavLink to="/" end className={tabLink}><House className="size-5" />Home</NavLink>
        <NavLink to="/movies" className={tabLink}><Clapperboard className="size-5" />Movies</NavLink>
        <NavLink to="/tv" className={tabLink}><Tv className="size-5" />Series</NavLink>
        <NavLink to="/my/watchlist" className={tabLink}><Plus className="size-5" />My List</NavLink>
        <NavLink to={user ? "/my/continue" : "/login"} className={tabLink}><User className="size-5" />{user ? "Me" : "Log in"}</NavLink>
      </nav>
    </>
  );
}
