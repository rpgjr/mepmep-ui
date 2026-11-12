import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Search from "./pages/Search";
import Detail from "./pages/Detail";
import Watch from "./pages/Watch";
import Library from "./pages/Library";
import { Login, Register } from "./pages/AuthPages";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-14 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Browse type="movie" />} />
          <Route path="/tv" element={<Browse type="tv" />} />
          <Route path="/search" element={<Search />} />
          <Route path="/title/:type/:id" element={<Detail />} />
          <Route path="/watch/:type/:id" element={<Watch />} />
          <Route path="/my/:tab" element={<Library />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<p className="px-4 py-12 text-center text-muted-foreground">Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
