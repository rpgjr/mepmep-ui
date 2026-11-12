import { Clapperboard, House, Plus, Search, Tv, User } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "../auth";

const topLink = ({ isActive }: { isActive: boolean }) =>
  cn("rounded-full px-3 py-1.5 font-semibold text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground", isActive && "bg-white/10 text-foreground");

const tabLink = ({ isActive }: { isActive: boolean }) =>
  cn("flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.7rem] text-muted-foreground", isActive && "text-ring");

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

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-5 px-4 transition-colors duration-300 max-sm:gap-2.5 md:px-10",
          scrolled ? "border-b border-border bg-background/80 backdrop-blur-xl" : "bg-linear-to-b from-background/90 to-transparent",
        )}
      >
        <Link to="/" className="text-2xl font-extrabold tracking-tight max-sm:text-xl">
          mep<span className="text-primary">mep</span>
        </Link>
        <nav className="flex gap-1.5 max-[900px]:hidden">
          <NavLink to="/" end className={topLink}>Home</NavLink>
          <NavLink to="/movies" className={topLink}>Movies</NavLink>
          <NavLink to="/tv" className={topLink}>Series</NavLink>
          <NavLink to="/my/watchlist" className={topLink}>My List</NavLink>
        </nav>
        <form className="relative ml-auto max-w-105 flex-1 max-sm:max-w-none" onSubmit={onSearch}>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-10 rounded-full border-white/10 bg-white/10 pl-10 backdrop-blur placeholder:text-foreground/50 focus-visible:bg-white/15" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search movies & series" aria-label="Search" />
        </form>
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
        className="fixed inset-x-0 bottom-0 z-30 hidden border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md max-sm:flex"
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
