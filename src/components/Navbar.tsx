import { useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      <header className="nav">
        <Link to="/" className="logo">
          mep<span>mep</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/movies">Movies</NavLink>
          <NavLink to="/tv">Series</NavLink>
          <NavLink to="/my/watchlist">My List</NavLink>
        </nav>
        <form className="search" onSubmit={onSearch}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search movies & series" aria-label="Search" />
        </form>
        <div className="nav-user">
          {user ? (
            <>
              <span className="hello">Hi, {user.displayName}</span>
              <button type="button" className="btn ghost sm" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link className="btn ghost sm" to="/login">Log in</Link>
              <Link className="btn sm" to="/register">Sign up</Link>
            </>
          )}
        </div>
      </header>

      {/* Phone layout: tabs pinned to the bottom of the screen */}
      <nav className="tabbar" aria-label="Main">
        <NavLink to="/" end><i>⌂</i>Home</NavLink>
        <NavLink to="/movies"><i>🎬</i>Movies</NavLink>
        <NavLink to="/tv"><i>📺</i>Series</NavLink>
        <NavLink to="/my/watchlist"><i>＋</i>My List</NavLink>
        <NavLink to={user ? "/my/continue" : "/login"}><i>👤</i>{user ? "Me" : "Log in"}</NavLink>
      </nav>
    </>
  );
}
