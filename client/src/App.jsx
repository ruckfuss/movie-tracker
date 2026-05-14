import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api";
const IMG = "https://image.tmdb.org/t/p/w500";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem("watchlist");
    return saved ? JSON.parse(saved) : [];
  });
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("trending");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrending();
  }, []);

  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  async function loadTrending() {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/movies/trending/week`);
      setMovies(res.data);
    } catch {
      console.error("Failed to load trending");
    }
    setLoading(false);
  }

  async function searchMovies(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setTab("search");
    try {
      const res = await axios.get(`${API}/movies/search?query=${encodeURIComponent(query)}`);
      setMovies(res.data);
    } catch {
      console.error("Search failed");
    }
    setLoading(false);
  }

  async function openMovie(id) {
    try {
      const res = await axios.get(`${API}/movies/${id}`);
      setSelected(res.data);
    } catch {
      console.error("Failed to load movie details");
    }
  }

  function toggleWatchlist(movie) {
    setWatchlist(prev =>
      prev.find(m => m.id === movie.id)
        ? prev.filter(m => m.id !== movie.id)
        : [...prev, movie]
    );
  }

  function isInWatchlist(id) {
    return watchlist.some(m => m.id === id);
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <h1>🎬 MovieTracker</h1>
          <form className="search-form" onSubmit={searchMovies}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search movies..."
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={tab === "trending" ? "active" : ""}
          onClick={() => { setTab("trending"); loadTrending(); }}
        >🔥 Trending</button>
        <button
          className={tab === "search" ? "active" : ""}
          onClick={() => setTab("search")}
        >🔍 Search Results</button>
        <button
          className={tab === "watchlist" ? "active" : ""}
          onClick={() => { setTab("watchlist"); setMovies(watchlist); }}
        >📋 Watchlist ({watchlist.length})</button>
      </nav>

      <main className="main">
        {loading && <div className="loading">Loading...</div>}
        <div className="grid">
          {movies.map(movie => (
            <div key={movie.id} className="card" onClick={() => openMovie(movie.id)}>
              {movie.poster_path
                ? <img src={`${IMG}${movie.poster_path}`} alt={movie.title} />
                : <div className="no-poster">No Poster</div>
              }
              <div className="card-info">
                <h3>{movie.title}</h3>
                <div className="card-meta">
                  <span>⭐ {movie.vote_average?.toFixed(1)}</span>
                  <span>{movie.release_date?.slice(0, 4)}</span>
                </div>
                <button
                  className={`wl-btn ${isInWatchlist(movie.id) ? "in-wl" : ""}`}
                  onClick={e => { e.stopPropagation(); toggleWatchlist(movie); }}
                >
                  {isInWatchlist(movie.id) ? "✓ In Watchlist" : "+ Watchlist"}
                </button>
              </div>
            </div>
          ))}
        </div>
        {movies.length === 0 && !loading && (
          <div className="empty">
            {tab === "watchlist" ? "Your watchlist is empty." : "No results found."}
          </div>
        )}
      </main>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            <div className="modal-inner">
              {selected.poster_path &&
                <img src={`${IMG}${selected.poster_path}`} alt={selected.title} className="modal-poster" />
              }
              <div className="modal-info">
                <h2>{selected.title}</h2>
                <div className="modal-meta">
                  <span>⭐ {selected.vote_average?.toFixed(1)}</span>
                  <span>📅 {selected.release_date?.slice(0, 4)}</span>
                  <span>⏱ {selected.runtime} min</span>
                  <span>🎭 {selected.genres?.map(g => g.name).join(", ")}</span>
                </div>
                <p className="overview">{selected.overview}</p>
                {selected.cast?.length > 0 && (
                  <div>
                    <h4>Cast</h4>
                    <p className="cast">{selected.cast.map(c => c.name).join(", ")}</p>
                  </div>
                )}
                <button
                  className={`wl-btn large ${isInWatchlist(selected.id) ? "in-wl" : ""}`}
                  onClick={() => toggleWatchlist(selected)}
                >
                  {isInWatchlist(selected.id) ? "✓ Remove from Watchlist" : "+ Add to Watchlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}