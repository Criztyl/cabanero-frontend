import React, { useContext, useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
  Users, BookOpen, GraduationCap, TrendingUp, Clock,
  AlertCircle, Wind, Droplets, Eye, ClipboardList,
  CalendarDays, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import api from '../../services/api';

const COLORS = ['#00d4ff','#ff0055','#a1a1aa','#00ff85','#ffaa00',
                '#8b5cf6','#f97316','#14b8a6','#84cc16','#ec4899'];

// ─────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────
function AdminDashboard() {
  const { currentUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [stats,        setStats]       = useState(null);
  const [monthly,      setMonthly]     = useState([]);
  const [distribution, setDist]        = useState([]);
  const [attendance,   setAttend]      = useState([]);
  const [dataLoading,  setLoading]     = useState(true);
  const [pendingCount, setPending]     = useState(0);

  const [weather,    setWeather]   = useState(null);
  const [cityInput,  setCityInput] = useState('Davao City');
  const [citySearch, setCity]      = useState('Davao City');
  const [wErr,       setWErr]      = useState('');
  const [wLoad,      setWLoad]     = useState(false);
  const [forecast,   setForecast]  = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/monthly-enrollment'),
      api.get('/dashboard/course-distribution'),
      api.get('/dashboard/attendance'),
      api.get('/enrollment/requests?status=pending'),
    ]).then(([s, m, d, a, r]) => {
      setStats(s.data);
      setMonthly(m.data.map(i => ({ name: i.month, students: i.count })));
      setDist(d.data.map(i => ({ name: i.course, value: i.count })));
      setAttend(a.data.map(i => ({ name: i.date, present: i.present, absent: i.absent })));
      setPending(r.data.total ?? r.data.data?.length ?? 0);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchWeather(citySearch); }, [citySearch]);

  const fetchWeather = async (city) => {
    setWLoad(true); setWErr('');
    try {
      const key = import.meta.env.VITE_WEATHER_API_KEY;
      const [cr, fr] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${key}&units=metric&cnt=40`),
      ]);
      if (!cr.ok) throw new Error('City not found.');
      const [cd, fd] = await Promise.all([cr.json(), fr.json()]);
      setWeather(cd);
      setForecast(fd.list.filter((_,i) => i%8===0).slice(0,5));
    } catch (e) { setWErr(e.message); setWeather(null); setForecast([]); }
    finally { setWLoad(false); }
  };

  const tt = { background:'var(--bg-panel)', border:'1px solid var(--glass-border)', borderRadius:'12px', fontSize:'12px' };

  return (
    <div className="dashboard-wrapper-inner">
      {/* Top bar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    flexWrap:'wrap', gap:'20px', marginBottom:'30px' }}>
        <div>
          <h1 style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:800, margin:0 }}>
            Welcome, {currentUser?.name || 'Admin'}! 
          </h1>
          <p style={{ color:'var(--text-muted)', marginTop:'5px', fontSize:'14px' }}>
            Here's your academic overview for today
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', fontSize:'13px',
                      color:'var(--secondary-color)', background:'rgba(0,212,255,0.1)',
                      padding:'8px 15px', borderRadius:'20px',
                      border:'1px solid var(--secondary-glow)', whiteSpace:'nowrap' }}>
          <Clock size={16} /> System Status: Operational
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:'20px' }}>
        {[
          { icon:BookOpen,     color:'var(--primary-color)',   label:'Courses',        val: stats?.total_courses, sub:'Total courses offered' },
          { icon:GraduationCap,color:'var(--secondary-color)', label:'School Days',    val: stats?.total_days,    sub:'Days tracked this term' },
          { icon:Users,        color:'var(--primary-color)',   label:'Students',       val: stats?.total_students?.toLocaleString(), sub:'↑ Enrolled students', green:true },
          { icon:TrendingUp,   color:'var(--secondary-color)', label:'Attendance',
            val: (()=>{
              if (!attendance.length) return '—';
              const l = attendance[attendance.length-1];
              return Math.round(l.present/(l.present+l.absent)*100)+'%';
            })(),
            sub:'Latest day attendance' },
        ].map(({ icon:Icon, color, label, val, sub, green }) => (
          <div key={label} className="stat-card">
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'15px' }}>
              <Icon size={24} color={color} />
              <span style={{ fontSize:'12px', color:'var(--secondary-color)' }}>{label}</span>
            </div>
            <div style={{ fontSize:'28px', fontWeight:700 }}>{dataLoading ? '...' : (val ?? '—')}</div>
            <div style={{ color: green ? '#00ff85' : 'var(--text-muted)', fontSize:'12px', marginTop:'5px' }}>{sub}</div>
          </div>
        ))}

        {/* Pending requests card */}
        <div className="stat-card" onClick={() => navigate('/dashboard/requests')}
          style={{ cursor:'pointer', border:'1px solid rgba(255,170,0,0.3)',
                   background:'rgba(255,170,0,0.05)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'15px' }}>
            <ClipboardList size={24} color="#ffaa00" />
            <span style={{ fontSize:'12px', color:'#ffaa00' }}>Requests</span>
          </div>
          <div style={{ fontSize:'28px', fontWeight:700, color:'#ffaa00' }}>
            {dataLoading ? '...' : pendingCount}
          </div>
          <div style={{ color:'var(--text-muted)', fontSize:'12px', marginTop:'5px' }}>
            Pending enrollments — click to review
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,400px),1fr))',
                    gap:'24px', marginTop:'30px' }}>
        <div className="program-card" style={{ cursor:'default', minHeight:'350px' }}>
          <h3 style={{ marginBottom:'25px', fontSize:'16px', fontWeight:600, color:'var(--secondary-color)' }}>
            Monthly Enrollment Trends
          </h3>
          <div style={{ width:'100%', height:250 }}>
            {dataLoading ? <p style={{ color:'var(--text-muted)', textAlign:'center', paddingTop:'80px' }}>Loading...</p> : (
              <ResponsiveContainer>
                <BarChart data={monthly} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <Tooltip contentStyle={tt} />
                  <Bar dataKey="students" fill="var(--primary-color)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="program-card" style={{ cursor:'default', minHeight:'350px' }}>
          <h3 style={{ marginBottom:'25px', fontSize:'16px', fontWeight:600, color:'var(--secondary-color)' }}>
            Student Distribution by Course
          </h3>
          <div style={{ width:'100%', height:200 }}>
            {dataLoading ? <p style={{ color:'var(--text-muted)', textAlign:'center', paddingTop:'60px' }}>Loading...</p> : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                    {distribution.map((_, i) => <Cell key={i} fill={COLORS[i%COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={tt} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'10px', marginTop:'16px' }}>
            {distribution.slice(0,6).map((e,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'10px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:COLORS[i%COLORS.length] }} />
                <span style={{ color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px' }}>
                  {e.name.length>15 ? e.name.substring(0,15)+'…' : e.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance */}
      <div className="program-card" style={{ cursor:'default', marginTop:'24px', minHeight:'300px' }}>
        <h3 style={{ marginBottom:'25px', fontSize:'16px', fontWeight:600, color:'var(--secondary-color)' }}>
          Attendance Trends — Last 30 School Days
        </h3>
        <div style={{ width:'100%', height:220 }}>
          {dataLoading ? <p style={{ color:'var(--text-muted)', textAlign:'center', paddingTop:'70px' }}>Loading...</p> : (
            <ResponsiveContainer>
              <AreaChart data={attendance} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ff0055" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff0055" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <Tooltip contentStyle={tt} />
                <Area type="monotone" dataKey="present" stroke="#00d4ff" strokeWidth={2} fillOpacity={1} fill="url(#pGrad)" name="Present" />
                <Area type="monotone" dataKey="absent"  stroke="#ff0055" strokeWidth={2} fillOpacity={1} fill="url(#aGrad)" name="Absent"  />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Weather */}
      <div className="program-card" style={{ marginTop:'24px', cursor:'default' }}>
        <h3 style={{ marginBottom:'20px', fontSize:'16px', fontWeight:600, color:'var(--secondary-color)' }}>🌤️ Live Weather</h3>
        <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
          <input type="text" value={cityInput}
            onChange={e => setCityInput(e.target.value)}
            onKeyDown={e => e.key==='Enter' && setCity(cityInput)}
            placeholder="Search city..." style={{ flex:1, background:'rgba(255,255,255,0.05)',
            border:'1px solid var(--glass-border)', borderRadius:'10px',
            padding:'10px 16px', color:'#fff', fontSize:'14px', outline:'none' }} />
          <button onClick={() => setCity(cityInput)}
            style={{ background:'var(--primary-color)', border:'none', borderRadius:'10px',
                     padding:'10px 20px', color:'#fff', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
            Search
          </button>
        </div>
        {wErr  && <p style={{ color:'#ff4466', fontSize:'13px', marginBottom:'10px' }}>{wErr}</p>}
        {wLoad && <p style={{ color:'var(--text-muted)', fontSize:'13px' }}>Fetching weather...</p>}
        {weather && !wLoad && (
          <>
            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'30px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                     alt="" style={{ width:'70px', height:'70px' }} />
                <div>
                  <div style={{ fontSize:'42px', fontWeight:800, lineHeight:1 }}>{Math.round(weather.main.temp)}°C</div>
                  <div style={{ color:'var(--text-muted)', textTransform:'capitalize', fontSize:'14px', marginTop:'4px' }}>{weather.weather[0].description}</div>
                  <div style={{ color:'var(--secondary-color)', fontWeight:600, marginTop:'2px' }}>{weather.name}, {weather.sys.country}</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 30px', fontSize:'13px', color:'var(--text-muted)' }}>
                <span><Droplets size={13} style={{ display:'inline', marginRight:'6px', color:'#00d4ff' }} />Humidity: <strong style={{ color:'#fff' }}>{weather.main.humidity}%</strong></span>
                <span><Wind size={13} style={{ display:'inline', marginRight:'6px', color:'#00d4ff' }} />Wind: <strong style={{ color:'#fff' }}>{weather.wind.speed} m/s</strong></span>
                <span>🌡️ Feels like: <strong style={{ color:'#fff' }}>{Math.round(weather.main.feels_like)}°C</strong></span>
                <span><Eye size={13} style={{ display:'inline', marginRight:'6px', color:'#00d4ff' }} />Visibility: <strong style={{ color:'#fff' }}>{(weather.visibility/1000).toFixed(1)} km</strong></span>
              </div>
            </div>
            {forecast.length > 0 && (
              <div style={{ marginTop:'24px', borderTop:'1px solid var(--glass-border)', paddingTop:'20px' }}>
                <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'14px', textTransform:'uppercase', letterSpacing:'1px' }}>5-Day Forecast</p>
                <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                  {forecast.map((day, i) => {
                    const d = new Date(day.dt*1000);
                    return (
                      <div key={i} style={{ flex:'1', minWidth:'80px', background:'rgba(255,255,255,0.04)',
                                            border:'1px solid var(--glass-border)', borderRadius:'12px',
                                            padding:'12px 8px', textAlign:'center' }}>
                        <p style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'6px' }}>
                          {i===0 ? 'Today' : d.toLocaleDateString('en-US',{ weekday:'short' })}
                        </p>
                        <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                             alt="" style={{ width:'40px', height:'40px', margin:'0 auto' }} />
                        <p style={{ fontSize:'16px', fontWeight:700, margin:'4px 0' }}>{Math.round(day.main.temp)}°C</p>
                        <p style={{ fontSize:'10px', color:'var(--text-muted)', textTransform:'capitalize' }}>{day.weather[0].description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STUDENT DASHBOARD
// ─────────────────────────────────────────────
function StudentDashboard() {
  const { currentUser, myEnrollment, fetchMyEnrollment } = useContext(AppContext);
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [weather, setWeather]   = useState(null);
  const [cityInput, setCityInput] = useState('Davao City');
  const [citySearch, setCity]   = useState('Davao City');
  const [wErr, setWErr]         = useState('');
  const [wLoad, setWLoad]       = useState(false);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetchMyEnrollment(),
      api.get('/notifications').catch(() => ({ data: { data: [] } })),
      api.get('/school-days').catch(() => ({ data: [] })),
    ]).then(([_, notifRes, daysRes]) => {
      setEnrollment(myEnrollment);
      setRecentNotifs((notifRes.data.data || []).slice(0, 3));
      // Get upcoming events/holidays
      const todayStr = new Date().toISOString().split('T')[0];
      const upcoming = (daysRes.data || [])
        .filter(d => {
          if (d.type === 'Regular') return false;
          // Normalize d.date to just YYYY-MM-DD for comparison
          const dayDate = d.date ? d.date.substring(0, 10) : '';
          return dayDate >= todayStr;
        })
        .slice(0, 4);
      setUpcomingEvents(upcoming);
      setUpcomingEvents(upcoming);
    }).finally(() => setLoading(false));
  }, []);

  // Re-sync enrollment from context
  useEffect(() => { setEnrollment(myEnrollment); }, [myEnrollment]);

  useEffect(() => { fetchWeather(citySearch); }, [citySearch]);

  const fetchWeather = async (city) => {
    setWLoad(true); setWErr('');
    try {
      const key = import.meta.env.VITE_WEATHER_API_KEY;
      const [cr, fr] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${key}&units=metric&cnt=40`),
      ]);
      if (!cr.ok) throw new Error('City not found.');
      const [cd, fd] = await Promise.all([cr.json(), fr.json()]);
      setWeather(cd);
      setForecast(fd.list.filter((_,i) => i%8===0).slice(0,5));
    } catch (e) { setWErr(e.message); setWeather(null); setForecast([]); }
    finally { setWLoad(false); }
  };

  const status = enrollment?.status ?? 'none';

  const EnrollmentBanner = () => {
    if (status === 'approved') return (
      <div style={{ background:'rgba(0,255,133,0.1)', border:'1px solid rgba(0,255,133,0.3)',
                    borderRadius:'16px', padding:'20px 24px', marginBottom:'24px',
                    display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
        <div style={{ fontSize:'40px' }}>🎓</div>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:700, color:'#00ff85', fontSize:'16px' }}>Enrolled</p>
          <p style={{ color:'var(--text-muted)', fontSize:'14px', marginTop:'2px' }}>
            {enrollment.enrollment?.program_name} ({enrollment.enrollment?.program_code})
          </p>
        </div>
        <button onClick={() => navigate('/dashboard/subjects')}
          style={{ background:'rgba(0,255,133,0.2)', border:'1px solid rgba(0,255,133,0.4)',
                   borderRadius:'10px', padding:'8px 16px', color:'#00ff85',
                   cursor:'pointer', fontSize:'13px', fontWeight:600 }}>
          View My Subjects →
        </button>
      </div>
    );
    if (status === 'pending') return (
      <div style={{ background:'rgba(255,170,0,0.1)', border:'1px solid rgba(255,170,0,0.3)',
                    borderRadius:'16px', padding:'20px 24px', marginBottom:'24px',
                    display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
        <div style={{ fontSize:'40px' }}>⏳</div>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:700, color:'#ffaa00', fontSize:'16px' }}>Enrollment Pending</p>
          <p style={{ color:'var(--text-muted)', fontSize:'14px', marginTop:'2px' }}>
            Your request for {enrollment.enrollment?.program_name} is awaiting admin approval.
          </p>
        </div>
      </div>
    );
    return (
      <div style={{ background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.2)',
                    borderRadius:'16px', padding:'20px 24px', marginBottom:'24px',
                    display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
        <div style={{ fontSize:'40px' }}>📚</div>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:700, color:'var(--secondary-color)', fontSize:'16px' }}>Not Yet Enrolled</p>
          <p style={{ color:'var(--text-muted)', fontSize:'14px', marginTop:'2px' }}>
            Browse available programs and submit an enrollment request.
          </p>
        </div>
        <button onClick={() => navigate('/dashboard/programs')}
          style={{ background:'var(--primary-color)', border:'none', borderRadius:'10px',
                   padding:'8px 16px', color:'#fff', cursor:'pointer',
                   fontSize:'13px', fontWeight:600 }}>
          Browse Programs →
        </button>
      </div>
    );
  };

  return (
    <div className="dashboard-wrapper-inner">
      {/* Top bar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    flexWrap:'wrap', gap:'20px', marginBottom:'28px' }}>
        <div>
          <h1 style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:800, margin:0 }}>
            Welcome, {currentUser?.name || 'Student'}! 👋
          </h1>
          <p style={{ color:'var(--text-muted)', marginTop:'5px', fontSize:'14px' }}>
            Your academic portal overview
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', fontSize:'13px',
                      color:'var(--secondary-color)', background:'rgba(0,212,255,0.1)',
                      padding:'8px 15px', borderRadius:'20px', border:'1px solid var(--secondary-glow)', whiteSpace:'nowrap' }}>
          <Clock size={16} /> System Status: Operational
        </div>
      </div>

      {/* Enrollment status banner */}
      <EnrollmentBanner />

      {/* Quick info cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:'16px', marginBottom:'24px' }}>
        {[
          { icon:'🏫', label:'Department', val: currentUser?.department || '—' },
          { icon:'🎓', label:'Program',    val: status === 'approved' ? enrollment?.enrollment?.program_code : status === 'pending' ? 'Pending' : 'Not enrolled' },
          { icon:'📅', label:'Upcoming Events', val: upcomingEvents.length > 0 ? `${upcomingEvents.length} event${upcomingEvents.length>1?'s':''}` : 'None' },
          { icon:'🔔', label:'Unread Notifications', val: recentNotifs.filter(n=>!n.is_read).length || '0' },
        ].map(({ icon, label, val }) => (
          <div key={label} className="stat-card">
            <div style={{ fontSize:'28px', marginBottom:'10px' }}>{icon}</div>
            <div style={{ fontSize:'18px', fontWeight:700, marginBottom:'4px' }}>{val}</div>
            <div style={{ color:'var(--text-muted)', fontSize:'12px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming events + Recent notifications — side by side */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,340px),1fr))',
                    gap:'20px', marginBottom:'24px' }}>

        {/* Upcoming events */}
        <div className="program-card" style={{ cursor:'default' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <h3 style={{ fontSize:'15px', fontWeight:600, color:'var(--secondary-color)' }}>
              📅 Upcoming Events
            </h3>
            <button onClick={() => navigate('/dashboard/calendar')}
              style={{ fontSize:'12px', color:'var(--secondary-color)', background:'transparent',
                       border:'none', cursor:'pointer' }}>
              View Calendar →
            </button>
          </div>
          {upcomingEvents.length === 0 ? (
            <div style={{ textAlign:'center', padding:'24px', color:'var(--text-muted)' }}>
              <CalendarDays size={28} style={{ margin:'0 auto 10px', opacity:0.3, display:'block' }} />
              <p style={{ fontSize:'13px' }}>No upcoming events</p>
            </div>
          ) : upcomingEvents.map((ev, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px',
                                  padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize:'20px' }}>{ev.type === 'Holiday' ? '🏖️' : '📅'}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:'13px', fontWeight:600 }}>{ev.title || ev.label || ev.type}</p>
                <p style={{ fontSize:'11px', color:'var(--text-muted)' }}>
                  {new Date(ev.date).toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' })}
                  {ev.time && ` · ${ev.time}`}
                </p>
              </div>
              <span style={{
                fontSize:'10px', padding:'2px 8px', borderRadius:'20px', fontWeight:600,
                background: ev.type==='Holiday' ? 'rgba(255,0,85,0.1)' : 'rgba(0,212,255,0.1)',
                color: ev.type==='Holiday' ? '#ff0055' : '#00d4ff',
              }}>{ev.type}</span>
            </div>
          ))}
        </div>

        {/* Recent notifications */}
        <div className="program-card" style={{ cursor:'default' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <h3 style={{ fontSize:'15px', fontWeight:600, color:'var(--secondary-color)' }}>
              🔔 Recent Notifications
            </h3>
            <button onClick={() => navigate('/dashboard/notifications')}
              style={{ fontSize:'12px', color:'var(--secondary-color)', background:'transparent',
                       border:'none', cursor:'pointer' }}>
              View All →
            </button>
          </div>
          {recentNotifs.length === 0 ? (
            <div style={{ textAlign:'center', padding:'24px', color:'var(--text-muted)' }}>
              <Bell size={28} style={{ margin:'0 auto 10px', opacity:0.3, display:'block' }} />
              <p style={{ fontSize:'13px' }}>No notifications yet</p>
            </div>
          ) : recentNotifs.map((n, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'10px',
                                  padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize:'18px', flexShrink:0 }}>{n.icon || '🔔'}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:'13px', fontWeight: n.is_read ? 500 : 700 }}>{n.title}</p>
                <p style={{ fontSize:'11px', color:'var(--text-muted)',
                            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {n.body}
                </p>
              </div>
              {!n.is_read && (
                <div style={{ width:'7px', height:'7px', borderRadius:'50%',
                              background:'var(--primary-color)', flexShrink:0, marginTop:'4px' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weather */}
      <div className="program-card" style={{ cursor:'default' }}>
        <h3 style={{ marginBottom:'20px', fontSize:'16px', fontWeight:600, color:'var(--secondary-color)' }}>🌤️ Live Weather</h3>
        <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
          <input type="text" value={cityInput}
            onChange={e => setCityInput(e.target.value)}
            onKeyDown={e => e.key==='Enter' && setCity(cityInput)}
            placeholder="Search city..."
            style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid var(--glass-border)',
                     borderRadius:'10px', padding:'10px 16px', color:'#fff', fontSize:'14px', outline:'none' }} />
          <button onClick={() => setCity(cityInput)}
            style={{ background:'var(--primary-color)', border:'none', borderRadius:'10px',
                     padding:'10px 20px', color:'#fff', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
            Search
          </button>
        </div>
        {wErr  && <p style={{ color:'#ff4466', fontSize:'13px', marginBottom:'10px' }}>{wErr}</p>}
        {wLoad && <p style={{ color:'var(--text-muted)', fontSize:'13px' }}>Fetching weather...</p>}
        {weather && !wLoad && (
          <>
            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'30px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                     alt="" style={{ width:'70px', height:'70px' }} />
                <div>
                  <div style={{ fontSize:'42px', fontWeight:800, lineHeight:1 }}>{Math.round(weather.main.temp)}°C</div>
                  <div style={{ color:'var(--text-muted)', textTransform:'capitalize', fontSize:'14px', marginTop:'4px' }}>{weather.weather[0].description}</div>
                  <div style={{ color:'var(--secondary-color)', fontWeight:600, marginTop:'2px' }}>{weather.name}, {weather.sys.country}</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 30px', fontSize:'13px', color:'var(--text-muted)' }}>
                <span><Droplets size={13} style={{ display:'inline', marginRight:'6px', color:'#00d4ff' }} />Humidity: <strong style={{ color:'#fff' }}>{weather.main.humidity}%</strong></span>
                <span><Wind size={13} style={{ display:'inline', marginRight:'6px', color:'#00d4ff' }} />Wind: <strong style={{ color:'#fff' }}>{weather.wind.speed} m/s</strong></span>
                <span>🌡️ Feels like: <strong style={{ color:'#fff' }}>{Math.round(weather.main.feels_like)}°C</strong></span>
                <span><Eye size={13} style={{ display:'inline', marginRight:'6px', color:'#00d4ff' }} />Visibility: <strong style={{ color:'#fff' }}>{(weather.visibility/1000).toFixed(1)} km</strong></span>
              </div>
            </div>
            {forecast.length > 0 && (
              <div style={{ marginTop:'24px', borderTop:'1px solid var(--glass-border)', paddingTop:'20px' }}>
                <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'14px', textTransform:'uppercase', letterSpacing:'1px' }}>5-Day Forecast</p>
                <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                  {forecast.map((day, i) => (
                    <div key={i} style={{ flex:'1', minWidth:'80px', background:'rgba(255,255,255,0.04)',
                                          border:'1px solid var(--glass-border)', borderRadius:'12px',
                                          padding:'12px 8px', textAlign:'center' }}>
                      <p style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'6px' }}>
                        {i===0 ? 'Today' : new Date(day.dt*1000).toLocaleDateString('en-US',{weekday:'short'})}
                      </p>
                      <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                           alt="" style={{ width:'40px', height:'40px', margin:'0 auto' }} />
                      <p style={{ fontSize:'16px', fontWeight:700, margin:'4px 0' }}>{Math.round(day.main.temp)}°C</p>
                      <p style={{ fontSize:'10px', color:'var(--text-muted)', textTransform:'capitalize' }}>{day.weather[0].description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN EXPORT — switches based on role
// ─────────────────────────────────────────────
const Dashboard = () => {
  const { isAdminUser } = useContext(AppContext);
  return isAdminUser ? <AdminDashboard /> : <StudentDashboard />;
};

export default Dashboard;