import React, { useState, useEffect } from "react";

const styles = {
  movieGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)', // Changed from 'repeat(3fr, 1)'
    gap: '2rem',
    padding: '2rem',
    maxWidth: '1200px', // Added to contain the grid
    margin: '0 auto', // Center the grid
  },
  container: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease-in-out',
    cursor: 'pointer',
    backgroundColor: '#fff',
    '&:hover': {
      transform: 'scale(1.03)',
    }
  },
  poster: {
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    borderRadius: '12px 12px 0 0',
  },
  title: {
    margin: '1rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  popup: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '16px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    zIndex: 1001,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
  },
  closeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#666',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#f0f0f0',
    }
  },
  metadata: {
    color: '#666',
    fontSize: '0.9rem',
    margin: '1rem 0',
  },
  summary: {
    lineHeight: '1.6',
    color: '#444',
    margin: '1rem 0',
  },
  director: {
    display: 'block',
    color: '#555',
    fontWeight: '500',
    marginTop: '1rem',
  },
  castingList: {
    listStyle: 'none',
    padding: 0,
    margin: '1rem 0',
    color: '#666',
    '& li': {
      marginBottom: '0.5rem',
    }
  },
  screeningsSection: {
    marginTop: '1.5rem',
  },
  screeningsTitle: {
    fontSize: '1.2rem',
    fontWeight: '500',
    color: '#333',
    marginBottom: '1rem',
  },
  screeningsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    color: '#666',
  },
  screeningItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #eee',
  },
  screeningDateTime: {
    fontSize: '0.9rem',
    color: '#444',
  },
  screeningCinema: {
    fontSize: '0.9rem',
    color: '#007bff',
  }
};

function Movie({ movie }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [screenings, setScreenings] = useState([]);
  const [cinemas, setCinemas] = useState({});

  useEffect(() => {
    if (isPopupOpen) {
      Promise.all([
        fetch('http://127.0.0.1:8000/api/screening'),
        fetch('http://127.0.0.1:8000/api/cinema')
      ]).then(async ([screeningsRes, cinemasRes]) => {
        const screeningsData = await screeningsRes.json();
        const cinemasData = await cinemasRes.json();
        
        // Filter screenings for this movie
        const movieScreenings = screeningsData.filter(s => s.movie_id === movie.id);
        
        // Create cinemas lookup object
        const cinemasMap = cinemasData.reduce((acc, cinema) => {
          acc[cinema.id] = cinema;
          return acc;
        }, {});

        setScreenings(movieScreenings);
        setCinemas(cinemasMap);
      });
    }
  }, [isPopupOpen, movie.id]);

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-EN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!movie || !movie.title) {
    return null;
  }

  return (
    <>
      <div style={styles.container} onClick={() => setIsPopupOpen(true)}> 
        <img 
          src={`http://127.0.0.1:8000/storage/${movie.poster_url}`} 
          alt={movie.title}
          style={styles.poster}
        />
        <h2 style={styles.title}>{movie.title}</h2>
      </div>

      {isPopupOpen && (
        <>
          <div style={styles.overlay} onClick={() => setIsPopupOpen(false)} />
          <div style={styles.popup}>
            <button 
              style={styles.closeButton}
              onClick={() => setIsPopupOpen(false)}
            >
              ×
            </button>
            <img 
              src={`http://127.0.0.1:8000/storage/${movie.poster_url}`} 
              alt={movie.title}
              style={styles.poster}
            />
            <h2 style={styles.title}>{movie.title}</h2>
            <div style={styles.metadata}>
              {movie.year} | {movie.country} | {movie.duration_minutes} min
            </div>
            <p style={styles.summary}>{movie.summary || 'No summary available'}</p>
            <span style={styles.director}>Director: {movie.director || 'Unknown'}</span>
            <ul style={styles.castingList}>
              {(movie.casting || []).slice(0, 2).map((cast, index) => (
                <li key={index}>{cast.actor} as {cast.character}</li>
              ))}
            </ul>
            
            {screenings.length > 0 && (
              <div style={styles.screeningsSection}>
                <h3 style={styles.screeningsTitle}>Upcoming Screenings</h3>
                <div style={styles.screeningsList}>
                  {screenings.map((screening) => (
                    <div key={screening.id} style={styles.screeningItem}>
                      <div style={styles.screeningDateTime}>
                        {formatDateTime(screening.starts_at)}
                      </div>
                      <div style={styles.screeningCinema}>
                        Cinema: {cinemas[screening.cinema_id]?.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  ); 
}

function Movies({ movies }) {
  const validMovies = movies.filter(movie => 
    movie && 
    movie.id && 
    movie.title && 
    movie.poster_url
  );

  return (
    <div style={styles.movieGrid}>
      {validMovies.map((movie, index) => (
        <Movie
          key={`${movie.id}-${index}`}
          movie={movie}
        />
      ))}
    </div>
  );
}

export default Movies;