const BASE = 'https://api.openweathermap.org/data/2.5';
const KEY  = () => import.meta.env.VITE_WEATHER_API_KEY;

export async function fetchCurrentWeather(city) {
  const res = await fetch(
    `${BASE}/weather?q=${encodeURIComponent(city)}&appid=${KEY()}&units=metric`
  );
  if (!res.ok) throw new Error('City not found. Try another name.');
  return res.json();
}

export async function fetchForecast(city) {
  const res = await fetch(
    `${BASE}/forecast?q=${encodeURIComponent(city)}&appid=${KEY()}&units=metric&cnt=40`
  );
  if (!res.ok) throw new Error('Forecast unavailable.');
  const data = await res.json();
  return data.list.filter((_, i) => i % 8 === 0).slice(0, 5);
}
