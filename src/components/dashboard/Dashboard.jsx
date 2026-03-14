import React, { useContext, useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';
import { Users, BookOpen, GraduationCap, TrendingUp, Clock, AlertCircle, Wind, Droplets, Eye } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import api from '../../services/api';

const COLORS = ['#00d4ff', '#ff0055', '#a1a1aa', '#00ff85', '#ffaa00',
                '#8b5cf6', '#f97316', '#14b8a6', '#84cc16', '#ec4899'];

const Dashboard = () => {
  const { currentUser } = useContext(AppContext);

  // API data states
  const [stats,        setStats]        = useState(null);
  const [monthly,      setMonthly]      = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [attendance,   setAttendance]   = useState([]);
  const [dataLoading,  setDataLoading]  = useState(true);

  // Weather states
  const [weather,      setWeather]      = useState(null);
  const [cityInput,    setCityInput]    = useState('Davao City');
  const [citySearch,   setCitySearch]   = useState('Davao City');
  const [weatherError, setWeatherError] = useState('');
  const [weatherLoad,  setWeatherLoad]  = useState(false);

  // Fetch dashboard data from Laravel
  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/monthly-enrollment'),
      api.get('/dashboard/course-distribution'),
      api.get('/dashboard/attendance'),
    ])
      .then(([s, m, d, a]) => {
        setStats(s.data);
        // format for recharts
        setMonthly(m.data.map(item => ({ name: item.month, students: item.count })));
        setDistribution(d.data.map(item => ({ name: item.course, value: item.count })));
        setAttendance(a.data.map(item => ({ name: item.date, present: item.present, absent: item.absent })));
      })
      .catch(err => console.error('Dashboard API error:', err))
      .finally(() => setDataLoading(false));
  }, []);

  // Fetch weather
  useEffect(() => {
    fetchWeather(citySearch);
  }, [citySearch]);

const [forecast, setForecast] = useState([]);

const fetchWeather = async (city) => {
  setWeatherLoad(true);
  setWeatherError('');
  try {
    const key = import.meta.env.VITE_WEATHER_API_KEY;
    
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${key}&units=metric&cnt=40`)
    ]);
    
    if (!currentRes.ok) throw new Error('City not found. Try another name.');
    
    const currentData  = await currentRes.json();
    const forecastData = await forecastRes.json();
    
    setWeather(currentData);
    
    const dailyForecast = forecastData.list.filter((_, index) => index % 8 === 0).slice(0, 5);
    setForecast(dailyForecast);
    
  } catch (e) {
    setWeatherError(e.message);
    setWeather(null);
    setForecast([]);
  } finally {
    setWeatherLoad(false);
  }
};

  return (
    <div className="dashboard-wrapper-inner">

      {/* ── Top Bar ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    flexWrap:'wrap', gap:'20px', marginBottom:'30px' }}>
        <div>
          <h1 style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:800, margin:0 }}>
            Welcome, {currentUser?.name || 'Academic Lead'}! 
          </h1>
          <p style={{ color:'var(--text-muted)', marginTop:'5px', fontSize:'14px' }}>
            Here's your academic overview for today
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', fontSize:'13px',
                      color:'var(--secondary-color)', background:'rgba(0,212,255,0.1)',
                      padding:'8px 15px', borderRadius:'20px',
                      border:'1px solid var(--secondary-glow)', whiteSpace:'nowrap' }}>
          <Clock size={16} />
          System Status: Operational
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:'20px' }}>
        
        <div className="stat-card">
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'15px' }}>
            <BookOpen size={24} color="var(--primary-color)" />
            <span style={{ fontSize:'12px', color:'var(--secondary-color)' }}>Courses</span>
          </div>
          <div style={{ fontSize:'28px', fontWeight:700 }}>
            {dataLoading ? '...' : (stats?.total_courses ?? '—')}
          </div>
          <div style={{ color:'var(--text-muted)', fontSize:'12px', marginTop:'5px' }}>
            Total courses offered
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'15px' }}>
            <GraduationCap size={24} color="var(--secondary-color)" />
            <span style={{ fontSize:'12px', color:'var(--secondary-color)' }}>School Days</span>
          </div>
          <div style={{ fontSize:'28px', fontWeight:700 }}>
            {dataLoading ? '...' : (stats?.total_days ?? '—')}
          </div>
          <div style={{ color:'var(--text-muted)', fontSize:'12px', marginTop:'5px' }}>
            Days tracked this term
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'15px' }}>
            <Users size={24} color="var(--primary-color)" />
            <span style={{ fontSize:'12px', color:'var(--secondary-color)' }}>Students</span>
          </div>
          <div style={{ fontSize:'28px', fontWeight:700 }}>
            {dataLoading ? '...' : (stats?.total_students?.toLocaleString() ?? '—')}
          </div>
          <div style={{ color:'#00ff85', fontSize:'12px', marginTop:'5px' }}>↑ Enrolled students</div>
        </div>

        <div className="stat-card">
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'15px' }}>
            <TrendingUp size={24} color="var(--secondary-color)" />
            <span style={{ fontSize:'12px', color:'var(--secondary-color)' }}>Attendance</span>
          </div>
          <div style={{ fontSize:'28px', fontWeight:700 }}>
            {dataLoading ? '...' : (
              attendance.length > 0
                ? Math.round((attendance[attendance.length-1]?.present /
                    (attendance[attendance.length-1]?.present + attendance[attendance.length-1]?.absent)) * 100) + '%'
                : '—'
            )}
          </div>
          <div style={{ color:'var(--text-muted)', fontSize:'12px', marginTop:'5px' }}>Latest day attendance</div>
        </div>
      </div>

      {/* ── Charts Section ── */}
      <div style={{ display:'grid',
                    gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,400px),1fr))',
                    gap:'24px', marginTop:'30px' }}>

        {/* Monthly Enrollment Bar Chart */}
        <div className="program-card" style={{ cursor:'default', minHeight:'350px' }}>
          <h3 style={{ marginBottom:'25px', fontSize:'16px', fontWeight:600, color:'var(--secondary-color)' }}>
            Monthly Enrollment Trends
          </h3>
          <div style={{ width:'100%', height:250 }}>
            {dataLoading ? (
              <div style={{ color:'var(--text-muted)', textAlign:'center', paddingTop:'80px' }}>Loading chart...</div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={monthly} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <Tooltip contentStyle={{ background:'var(--bg-panel)', border:'1px solid var(--glass-border)', borderRadius:'12px', fontSize:'12px' }} />
                  <Bar dataKey="students" fill="var(--primary-color)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Course Distribution Pie Chart */}
        <div className="program-card" style={{ cursor:'default', minHeight:'350px' }}>
          <h3 style={{ marginBottom:'25px', fontSize:'16px', fontWeight:600, color:'var(--secondary-color)' }}>
            Student Distribution by Course
          </h3>
          <div style={{ width:'100%', height:200 }}>
            {dataLoading ? (
              <div style={{ color:'var(--text-muted)', textAlign:'center', paddingTop:'60px' }}>Loading chart...</div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={distribution} cx="50%" cy="50%"
                       innerRadius={60} outerRadius={80}
                       paddingAngle={8} dataKey="value">
                    {distribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background:'var(--bg-panel)', border:'1px solid var(--glass-border)', borderRadius:'12px', fontSize:'12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'12px', marginTop:'20px' }}>
            {distribution.slice(0,6).map((entry, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'10px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:COLORS[i % COLORS.length] }} />
                <span style={{ color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px' }}>
                  {entry.name.length > 15 ? entry.name.substring(0,15)+'…' : entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Attendance Line Chart (full width) ── */}
      <div className="program-card" style={{ cursor:'default', marginTop:'24px', minHeight:'300px' }}>
        <h3 style={{ marginBottom:'25px', fontSize:'16px', fontWeight:600, color:'var(--secondary-color)' }}>
          Attendance Trends — Last 30 School Days
        </h3>
        <div style={{ width:'100%', height:220 }}>
          {dataLoading ? (
            <div style={{ color:'var(--text-muted)', textAlign:'center', paddingTop:'70px' }}>Loading chart...</div>
          ) : (
            <ResponsiveContainer>
              <AreaChart data={attendance} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff0055" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff0055" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <Tooltip contentStyle={{ background:'var(--bg-panel)', border:'1px solid var(--glass-border)', borderRadius:'12px', fontSize:'12px' }} />
                <Area type="monotone" dataKey="present" stroke="#00d4ff" strokeWidth={2}
                      fillOpacity={1} fill="url(#presentGrad)" name="Present" />
                <Area type="monotone" dataKey="absent" stroke="#ff0055" strokeWidth={2}
                      fillOpacity={1} fill="url(#absentGrad)" name="Absent" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Weather Widget ── */}
      <div className="program-card" style={{ marginTop:'24px', cursor:'default' }}>
        <h3 style={{ marginBottom:'20px', fontSize:'16px', fontWeight:600, color:'var(--secondary-color)' }}>
          🌤️ Live Weather
        </h3>

        {/* Search Bar */}
        <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
          <input
            type="text"
            value={cityInput}
            onChange={e => setCityInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setCitySearch(cityInput)}
            placeholder="Search city..."
            style={{
              flex:1, background:'rgba(255,255,255,0.05)',
              border:'1px solid var(--glass-border)',
              borderRadius:'10px', padding:'10px 16px',
              color:'#fff', fontSize:'14px', outline:'none'
            }}
          />
          <button
            onClick={() => setCitySearch(cityInput)}
            style={{
              background:'var(--primary-color)', border:'none',
              borderRadius:'10px', padding:'10px 20px',
              color:'#fff', fontSize:'13px', fontWeight:600,
              cursor:'pointer'
            }}
          >
            Search
          </button>
        </div>

        {weatherError && (
          <p style={{ color:'#ff4466', fontSize:'13px', marginBottom:'10px' }}>{weatherError}</p>
        )}
        {weatherLoad && (
          <p style={{ color:'var(--text-muted)', fontSize:'13px' }}>Fetching weather...</p>
        )}

        {weather && !weatherLoad && (
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'30px' }}>
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
                <div style={{ color:'var(--text-muted)', textTransform:'capitalize', fontSize:'14px', marginTop:'4px' }}>
                  {weather.weather[0].description}
                </div>
                <div style={{ color:'var(--secondary-color)', fontWeight:600, marginTop:'2px' }}>
                  {weather.name}, {weather.sys.country}
                </div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 30px', fontSize:'13px', color:'var(--text-muted)' }}>
              <span><Droplets size={13} style={{ display:'inline', marginRight:'6px', color:'#00d4ff' }} />
                Humidity: <strong style={{ color:'#fff' }}>{weather.main.humidity}%</strong>
              </span>
              <span><Wind size={13} style={{ display:'inline', marginRight:'6px', color:'#00d4ff' }} />
                Wind: <strong style={{ color:'#fff' }}>{weather.wind.speed} m/s</strong>
              </span>
              <span>🌡️ Feels like: <strong style={{ color:'#fff' }}>{Math.round(weather.main.feels_like)}°C</strong></span>
              <span><Eye size={13} style={{ display:'inline', marginRight:'6px', color:'#00d4ff' }} />
                Visibility: <strong style={{ color:'#fff' }}>{(weather.visibility/1000).toFixed(1)} km</strong>
              </span>
            </div>
          </div>
        )}
        {/* 5-Day Forecast */}
{forecast.length > 0 && (
  <div style={{ marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px',
                textTransform: 'uppercase', letterSpacing: '1px' }}>5-Day Forecast</p>
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {forecast.map((day, i) => {
        const date = new Date(day.dt * 1000);
        const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
        return (
          <div key={i} style={{
            flex: '1', minWidth: '80px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px', padding: '12px 8px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>{dayName}</p>
            <img
              src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
              alt={day.weather[0].description}
              style={{ width: '40px', height: '40px', margin: '0 auto' }}
            />
            <p style={{ fontSize: '16px', fontWeight: 700, margin: '4px 0' }}>
              {Math.round(day.main.temp)}°C
            </p>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {day.weather[0].description}
            </p>
          </div>
        );
      })}
    </div>
  </div>
)}
      </div>

      {/* ── System Alert ── */}
      <div className="program-card" style={{
        marginTop:'24px',
        borderLeft:'4px solid var(--primary-color)',
        background:'linear-gradient(90deg, rgba(255,0,85,0.05), transparent)',
        padding:'20px'
      }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'15px' }}>
          <AlertCircle color="var(--primary-color)" style={{ flexShrink:0 }} />
          <div>
            <h4 style={{ fontSize:'14px', fontWeight:600, margin:0 }}>System Notification</h4>
            <p style={{ fontSize:'13px', color:'var(--text-muted)', marginTop:'4px' }}>
              Curriculum review for "Bachelor of Science in Cyber Security" is pending for the next semester.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;