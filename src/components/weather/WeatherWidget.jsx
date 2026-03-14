import { useState, useEffect } from 'react';
import { Droplets, Wind, Eye } from 'lucide-react';
import { fetchCurrentWeather, fetchForecast } from '../../services/weatherApi';
import ForecastDisplay from './ForecastDisplay';
import LoadingSpinner  from '../common/LoadingSpinner';

export default function WeatherWidget() {
  const [weather,    setWeather]    = useState(null);
  const [forecast,   setForecast]   = useState([]);
  const [cityInput,  setCityInput]  = useState('Davao City');
  const [citySearch, setCitySearch] = useState('Davao City');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  useEffect(() => { loadWeather(citySearch); }, [citySearch]);

  const loadWeather = async (city) => {
    setLoading(true); setError('');
    try {
      const [cur, fore] = await Promise.all([
        fetchCurrentWeather(city),
        fetchForecast(city),
      ]);
      setWeather(cur);
      setForecast(fore);
    } catch (e) {
      setError(e.message);
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="program-card" style={{ cursor:'default' }}>
      <h3 style={{ marginBottom:'20px', fontSize:'16px', fontWeight:600, color:'var(--secondary-color)' }}>
        🌤️ Live Weather
      </h3>

      {/* Search */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
        <input
          type="text" value={cityInput}
          onChange={e => setCityInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setCitySearch(cityInput)}
          placeholder="Search city..."
          style={{
            flex:1, background:'rgba(255,255,255,0.05)',
            border:'1px solid var(--glass-border)', borderRadius:'10px',
            padding:'10px 16px', color:'#fff', fontSize:'14px', outline:'none'
          }}
        />
        <button onClick={() => setCitySearch(cityInput)}
          style={{
            background:'var(--primary-color)', border:'none', borderRadius:'10px',
            padding:'10px 20px', color:'#fff', fontSize:'13px', fontWeight:600, cursor:'pointer'
          }}>
          Search
        </button>
      </div>

      {error   && <p style={{ color:'#ff4466', fontSize:'13px', marginBottom:'10px' }}>{error}</p>}
      {loading && <LoadingSpinner text="Fetching weather..." />}

      {weather && !loading && (
        <>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'30px' }}>
            {/* Temp + icon */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                style={{ width:'70px', height:'70px' }}
              />
              <div>
                <div style={{ fontSize:'42px', fontWeight:800, lineHeight:1 }}>
                  {Math.round(weather.main.temp)}°C
                </div>
                <div style={{ color:'var(--text-muted)', textTransform:'capitalize',
                              fontSize:'14px', marginTop:'4px' }}>
                  {weather.weather[0].description}
                </div>
                <div style={{ color:'var(--secondary-color)', fontWeight:600, marginTop:'2px' }}>
                  {weather.name}, {weather.sys.country}
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr',
                          gap:'12px 30px', fontSize:'13px', color:'var(--text-muted)' }}>
              <span>
                <Droplets size={13} style={{ display:'inline', marginRight:'6px', color:'#00d4ff' }} />
                Humidity: <strong style={{ color:'#fff' }}>{weather.main.humidity}%</strong>
              </span>
              <span>
                <Wind size={13} style={{ display:'inline', marginRight:'6px', color:'#00d4ff' }} />
                Wind: <strong style={{ color:'#fff' }}>{weather.wind.speed} m/s</strong>
              </span>
              <span>
                🌡️ Feels like: <strong style={{ color:'#fff' }}>{Math.round(weather.main.feels_like)}°C</strong>
              </span>
              <span>
                <Eye size={13} style={{ display:'inline', marginRight:'6px', color:'#00d4ff' }} />
                Visibility: <strong style={{ color:'#fff' }}>{(weather.visibility/1000).toFixed(1)} km</strong>
              </span>
            </div>
          </div>

          <ForecastDisplay forecast={forecast} />
        </>
      )}
    </div>
  );
}