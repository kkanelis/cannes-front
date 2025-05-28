import './App.css'
import Movies from "./Movies.jsx"
import Screenings from "./Screenings.jsx"
import { useState, useEffect } from "react"

function App() {
  const [loading, setLoading] = useState(true)
  const [movies, setMovies] = useState([])

  useEffect(() => {
    async function fetchMovies() {
      const response = await fetch(
        "http://127.0.0.1:8000/api/movies"
      );
      const moviesFromAPI = await response.json();
      setMovies(moviesFromAPI);
      setLoading(false)
    }
    fetchMovies();
  }, []);

  return (
    <>
      <h1>Movies</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Movies movies={movies} />
        </>
      )}
      <h1>Sessions</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Screenings />
        </>
      )}
    </>
  );
}

export default App
