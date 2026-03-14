export default function ForecastDisplay({ forecast }) {
  if (!forecast?.length) return null;

  return (
    <div style={{ marginTop:'24px', borderTop:'1px solid var(--glass-border)', paddingTop:'20px' }}>
      <p style={{
        fontSize:'11px', color:'var(--text-muted)', marginBottom:'14px',
        textTransform:'uppercase', letterSpacing:'1px'
      }}>
        5-Day Forecast
      </p>
      <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
        {forecast.map((day, i) => {
          const date    = new Date(day.dt * 1000);
          const dayName = i === 0
            ? 'Today'
            : date.toLocaleDateString('en-US', { weekday:'short' });

          return (
            <div key={i} style={{
              flex:'1', minWidth:'80px',
              background:'rgba(255,255,255,0.04)',
              border:'1px solid var(--glass-border)',
              borderRadius:'12px', padding:'12px 8px', textAlign:'center'
            }}>
              <p style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'4px' }}>
                {dayName}
              </p>
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                alt={day.weather[0].description}
                style={{ width:'40px', height:'40px', margin:'0 auto', display:'block' }}
              />
              <p style={{ fontSize:'16px', fontWeight:700, margin:'4px 0' }}>
                {Math.round(day.main.temp)}°C
              </p>
              <p style={{ fontSize:'10px', color:'var(--text-muted)', textTransform:'capitalize' }}>
                {day.weather[0].description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}