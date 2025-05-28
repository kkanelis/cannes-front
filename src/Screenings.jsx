import React, { useState, useEffect } from 'react';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px',
    backgroundColor: '#000000',
  },
  screeningCard: {
    backgroundColor: '#121212',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '25px',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 12px 40px rgba(31, 38, 135, 0.25)',
    }
  },
  movieInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
  },
  moviePoster: {
    width: '100px',
    height: '150px',
    borderRadius: '8px',
    objectFit: 'cover',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
  },
  movieTitle: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '10px',
    background: 'linear-gradient(45deg, #ff6b6b, #ffd93d)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  dateTime: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  timeIcon: {
    color: '#ff6b6b',
    fontSize: '20px',
  },
  details: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
  },
  duration: {
    color: '#b8b8b8',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cinema: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#ff6b6b',
    color: '#ffffff',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(255, 107, 107, 0.4)',
    }
  },
  statusTag: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#2ecc71',
    color: '#ffffff',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    marginLeft: '10px',
  }
};

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return utcDate.toLocaleString('en-EN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: '+03:00'
    });
}

function calculateDuration(start, end) {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const durationMs = endTime - startTime;
  const minutes = Math.floor(durationMs / 1000 / 60);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
}

function Screening({ screening, movie, cinema }) {
  if (!movie || !cinema) return null;

  return (
    <div style={styles.screeningCard}>
      <div style={styles.movieInfo}>
        <img 
          src={`http://127.0.0.1:8000/storage/${movie.poster_url}`}
          alt={movie.title}
          style={styles.moviePoster}
        />
        <div>
          <h3 style={styles.movieTitle}>{movie.title}</h3>
          <div style={styles.dateTime}>
            <span role="img" aria-label="calendar" style={styles.timeIcon}>📅</span>
            {formatDateTime(screening.starts_at)}
            <span style={styles.statusTag}>Available</span>
          </div>
        </div>
      </div>
      
      <div style={styles.details}>
        <span style={styles.duration}>
          <span role="img" aria-label="clock">⏱️</span>
          Duration: {calculateDuration(screening.starts_at, screening.ends_at)}
        </span>
        <div style={styles.cinema}>
          <span role="img" aria-label="cinema" style={{marginRight: '8px'}}>🎬</span>
          {cinema.name}
        </div>
      </div>
    </div>
  );
}

function Screenings() {
  const [screenings, setScreenings] = useState([]);
  const [movies, setMovies] = useState({});
  const [cinemas, setCinemas] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch screenings, movies, and cinemas in parallel
        const [screeningsResponse, moviesResponse, cinemasResponse] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/screening'),
          fetch('http://127.0.0.1:8000/api/movies'),
          fetch('http://127.0.0.1:8000/api/cinema')
        ]);

        const screeningsData = await screeningsResponse.json();
        const moviesData = await moviesResponse.json();
        const cinemasData = await cinemasResponse.json();

        // Convert movies and cinemas arrays to objects for easier lookup
        const moviesMap = moviesData.reduce((acc, movie) => {
          acc[movie.id] = movie;
          return acc;
        }, {});

        const cinemasMap = cinemasData.reduce((acc, cinema) => {
          acc[cinema.id] = cinema;
          return acc;
        }, {});

        setScreenings(screeningsData);
        setMovies(moviesMap);
        setCinemas(cinemasMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div style={styles.container}>Loading screenings...</div>;
  }

  return (
    <div style={styles.container}>
      {screenings.map((screening) => (
        <Screening 
          key={screening.id} 
          screening={screening}
          movie={movies[screening.movie_id]}
          cinema={cinemas[screening.cinema_id]}
        />
      ))}
    </div>
  );
}

export default Screenings;