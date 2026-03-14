import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Sun, Star, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TYPE_STYLES = {
  Regular: { bg:'rgba(0,212,255,0.12)', color:'#00d4ff',  dot:'#00d4ff',  icon: Sun      },
  Holiday: { bg:'rgba(255,0,85,0.12)',  color:'#ff0055',  dot:'#ff0055',  icon: AlertCircle },
  Event:   { bg:'rgba(0,255,133,0.12)', color:'#00ff85',  dot:'#00ff85',  icon: Star     },
};

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

export default function SchoolCalendar() {
  const today  = new Date();
  const [year,   setYear]   = useState(today.getFullYear());
  const [month,  setMonth]  = useState(today.getMonth());
  const [days,   setDays]   = useState([]);
  const [loading,setLoading]= useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchDays(); }, [year, month]);

  const fetchDays = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/attendance');
      // We also fetch all school_days from a new endpoint
      // For now use attendance data and supplement with school_days
      const schoolRes = await api.get('/school-days');
      setDays(schoolRes.data);
    } catch {
      // Fallback: generate empty calendar
      setDays([]);
    } finally { setLoading(false); }
  };

  const prevMonth = () => { if (month === 0) { setYear(y=>y-1); setMonth(11); } else setMonth(m=>m-1); };
  const nextMonth = () => { if (month === 11) { setYear(y=>y+1); setMonth(0); } else setMonth(m=>m+1); };

  // Build calendar grid
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const getDayData = (day) => {
    if (!day) return null;
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return days.find(d => d.date?.startsWith(dateStr));
  };

  const isToday = (day) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  // Stats for current month
  const monthDays = days.filter(d => {
    const date = new Date(d.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
  const stats = {
    Regular: monthDays.filter(d => d.type === 'Regular').length,
    Holiday: monthDays.filter(d => d.type === 'Holiday').length,
    Event:   monthDays.filter(d => d.type === 'Event').length,
  };

  return (
    <div className="dashboard-wrapper-inner">
      {/* Header */}
      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:800, margin:0 }}>School Calendar</h1>
        <p style={{ color:'var(--text-muted)', marginTop:'5px', fontSize:'14px' }}>
          Academic calendar — track holidays, events, and school days
        </p>
      </div>

      {/* Legend + Stats */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'12px', marginBottom:'24px' }}>
        {Object.entries(TYPE_STYLES).map(([type, style]) => {
          const Icon = style.icon;
          return (
            <div key={type} style={{ display:'flex', alignItems:'center', gap:'10px',
                                     background:style.bg, border:`1px solid ${style.color}33`,
                                     borderRadius:'10px', padding:'10px 16px' }}>
              <Icon size={16} color={style.color} />
              <span style={{ fontSize:'13px', fontWeight:600, color:style.color }}>{type}</span>
              <span style={{ fontSize:'13px', color:'var(--text-muted)' }}>{stats[type]} days</span>
            </div>
          );
        })}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr minmax(0, 320px)', gap:'20px',
                    '@media(max-width:768px)': { gridTemplateColumns:'1fr' } }}>

        {/* Calendar */}
        <div className="program-card" style={{ cursor:'default' }}>
          {/* Month nav */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <button onClick={prevMonth}
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid var(--glass-border)',
                       borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:'#fff' }}>
              <ChevronLeft size={16} />
            </button>
            <h2 style={{ fontSize:'18px', fontWeight:700 }}>{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth}
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid var(--glass-border)',
                       borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:'#fff' }}>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px', marginBottom:'8px' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign:'center', fontSize:'11px', color:'var(--text-muted)',
                                    fontWeight:600, textTransform:'uppercase', padding:'6px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          {loading ? <LoadingSpinner text="Loading calendar..." /> : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px' }}>
              {cells.map((day, i) => {
                const data    = getDayData(day);
                const isTod   = isToday(day);
                const style   = data ? TYPE_STYLES[data.type] : null;
                const isSel   = selected?.day === day;

                return (
                  <div key={i} onClick={() => day && data && setSelected({ day, data })}
                    style={{
                      aspectRatio:'1', display:'flex', flexDirection:'column',
                      alignItems:'center', justifyContent:'center', borderRadius:'10px',
                      cursor: data ? 'pointer' : 'default', position:'relative',
                      background: isSel ? style?.bg ?? 'transparent'
                                : isTod ? 'rgba(255,0,85,0.2)'
                                : data   ? `${style.bg}66`
                                :          'transparent',
                      border: isSel ? `2px solid ${style?.color ?? '#fff'}`
                            : isTod ? '2px solid var(--primary-color)'
                            :          '2px solid transparent',
                      transition:'all 0.15s',
                    }}>
                    {day && (
                      <>
                        <span style={{ fontSize:'13px', fontWeight: isTod ? 800 : 400,
                                       color: isTod ? '#fff' : data ? style.color : 'var(--text-muted)' }}>
                          {day}
                        </span>
                        {data && (
                          <div style={{ width:'5px', height:'5px', borderRadius:'50%',
                                        background:style.color, marginTop:'2px' }} />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="program-card" style={{ cursor:'default' }}>
          <h3 style={{ fontSize:'15px', fontWeight:600, marginBottom:'16px', color:'var(--secondary-color)' }}>
            Day Details
          </h3>
          {selected ? (() => {
            const { day, data } = selected;
            const style = TYPE_STYLES[data.type];
            const Icon  = style.icon;
            return (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px',
                              background:style.bg, borderRadius:'12px', padding:'14px' }}>
                  <Icon size={20} color={style.color} />
                  <div>
                    <p style={{ fontSize:'16px', fontWeight:700, color:style.color }}>{data.type}</p>
                    <p style={{ fontSize:'13px', color:'var(--text-muted)' }}>
                      {MONTHS[month]} {day}, {year}
                    </p>
                  </div>
                </div>
                {data.label && (
                  <div style={{ marginBottom:'12px' }}>
                    <p style={{ fontSize:'11px', color:'var(--text-muted)', textTransform:'uppercase',
                                letterSpacing:'1px', marginBottom:'4px' }}>Label</p>
                    <p style={{ fontSize:'14px' }}>{data.label}</p>
                  </div>
                )}
                {data.type === 'Regular' && (
                  <>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'12px' }}>
                      <div style={{ background:'rgba(0,212,255,0.08)', borderRadius:'10px', padding:'12px' }}>
                        <p style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'4px' }}>Present</p>
                        <p style={{ fontSize:'22px', fontWeight:800, color:'#00d4ff' }}>{data.present_count}</p>
                      </div>
                      <div style={{ background:'rgba(255,0,85,0.08)', borderRadius:'10px', padding:'12px' }}>
                        <p style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'4px' }}>Absent</p>
                        <p style={{ fontSize:'22px', fontWeight:800, color:'#ff0055' }}>{data.absent_count}</p>
                      </div>
                    </div>
                    <div style={{ marginTop:'12px', background:'rgba(255,255,255,0.04)',
                                  borderRadius:'10px', padding:'12px' }}>
                      <p style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'4px' }}>Attendance Rate</p>
                      <p style={{ fontSize:'22px', fontWeight:800, color:'#00ff85' }}>
                        {Math.round(data.present_count/(data.present_count+data.absent_count)*100)}%
                      </p>
                    </div>
                  </>
                )}
              </div>
            );
          })() : (
            <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--text-muted)' }}>
              <Calendar size={32} style={{ margin:'0 auto 12px', opacity:0.4 }} />
              <p style={{ fontSize:'13px' }}>Click on a highlighted day to see details</p>
            </div>
          )}

          {/* Upcoming events */}
          <div style={{ marginTop:'24px', borderTop:'1px solid var(--glass-border)', paddingTop:'16px' }}>
            <p style={{ fontSize:'12px', color:'var(--text-muted)', textTransform:'uppercase',
                        letterSpacing:'1px', marginBottom:'12px' }}>Holidays & Events</p>
            {days.filter(d => d.type !== 'Regular').slice(0, 5).map((d, i) => {
              const style = TYPE_STYLES[d.type];
              const Icon  = style.icon;
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px',
                                      padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <Icon size={14} color={style.color} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:'13px', fontWeight:500 }}>{d.label || d.type}</p>
                    <p style={{ fontSize:'11px', color:'var(--text-muted)' }}>
                      {new Date(d.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                    </p>
                  </div>
                  <span style={{ fontSize:'11px', background:style.bg, color:style.color,
                                 padding:'2px 8px', borderRadius:'20px' }}>{d.type}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}