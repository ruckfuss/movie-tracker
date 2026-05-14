const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

app.use(cors());
app.use(express.json());

// Search movies
app.get("/api/movies/search", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Query required" });
  try {
    const response = await axios.get(`${TMDB_BASE}/search/movie`, {
      params: { api_key: TMDB_KEY, query, language: "en-US" }
    });
    res.json(response.data.results.slice(0, 12));
  } catch (err) {
    res.status(500).json({ error: "TMDB API error" });
  }
});

// Get movie details
app.get("/api/movies/:id", async (req, res) => {
  try {
    const [details, credits] = await Promise.all([
      axios.get(`${TMDB_BASE}/movie/${req.params.id}`, {
        params: { api_key: TMDB_KEY, language: "en-US" }
      }),
      axios.get(`${TMDB_BASE}/movie/${req.params.id}/credits`, {
        params: { api_key: TMDB_KEY }
      })
    ]);
    res.json({
      ...details.data,
      cast: credits.data.cast.slice(0, 6)
    });
  } catch (err) {
    res.status(500).json({ error: "TMDB API error" });
  }
});

// Trending movies
app.get("/api/movies/trending/week", async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE}/trending/movie/week`, {
      params: { api_key: TMDB_KEY }
    });
    res.json(response.data.results.slice(0, 12));
  } catch (err) {
    res.status(500).json({ error: "TMDB API error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));