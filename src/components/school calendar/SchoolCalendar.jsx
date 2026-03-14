import { useState, useEffect, useContext } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Sun, Star, AlertCircle, Plus, X } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';

const TYPE_STYLES = {
  Regular: { bg:'rgba(0,212,255,0.12)', color:'#00d4ff', icon:Sun         },
  Holiday: { bg:'rgba(255,0,85,0.12)',  color:'#ff0055', icon:AlertCircle  },
  Event:   { bg:'rgba(0,255,133,0.12)', color:'#00ff85', icon:Star         },
};

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export default function SchoolCalendar() {
  const { isAdminUser } = useContext(AppContext);
  const today = new Date();

  const [year,    setYear]    = useState(today.getFullYear());
  const [month,   setMonth]   = useState(today.getMonth());
  const [days,    setDays]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const [showEventForm, setShowEventForm] = useState(false);
  const [eventDay,      setEventDay]      = useState(null);
  const [eventForm,     setEventForm]     = useState({
    type:'Event', title:'', time:'', description:''
  });
  const [savingEvent, setSavingEvent] = useState(false);
  const [confirm,     setConfirm]     = useState(null);

  useEffect(() => { fetchDays(); }, []);

  const fetchDays = async () => {
    setLoading(true);
    try {
      const res = await api.get('/school-days');
      setDays(res.data);
    } catch {
      setDays([]);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const getDayData = (day) => {
    if (!day) return null;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return days.find(d => d.date?.startsWith(dateStr));
  };

  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const monthDays = days.filter(d => {
    const date = new Date(d.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  const stats = {
    Regular: monthDays.filter(d => d.type === 'Regular').length,
    Holiday: monthDays.filter(d => d.type === 'Holiday').length,
    Event:   monthDays.filter(d => d.type === 'Event').length,
  };

  const openAddEvent = (day) => {
    if (!isAdminUser || !day) return;
    const existing = getDayData(day);
    setEventDay(day);
    setEventForm({
      type:        existing?.type        || 'Event',
      title:       existing?.title       || existing?.label || '',
      time:        existing?.time        || '',
      description: existing?.description || '',
    });
    setShowEventForm(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setSavingEvent(true);
    try {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(eventDay).padStart(2, '0')}`;
      await api.post('/school-days', {
        date:        dateStr,
        type:        eventForm.type,
        title:       eventForm.title,
        time:        eventForm.time,
        description: eventForm.description,
      });
      await fetchDays();
      setShowEventForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setSavingEvent(false);
    }
  };

  const handleRemoveEvent = (dayData) => {
    setConfirm({
      title:   'Remove this event?',
      message: `"${dayData.title || dayData.type}" will be removed from the calendar.`,
      onConfirm: async () => {
        try {
          await api.delete(`/school-days/${dayData.id}`);
          await fetchDays();
          setSelected(null);
        } catch {}
        setConfirm(null);
      },
    });
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div className="dashboard-wrapper-inner">

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: 'clamp(20px,5vw,28px)', fontWeight: 800, margin: 0 }}>
          School Calendar
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '5px', fontSize: '14px' }}>
          Academic calendar — track holidays, events, and school days
          {isAdminUser && (
            <span style={{ color: 'var(--secondary-color)' }}>
              {' '}· Click any date to add an event or holiday
            </span>
          )}
        </p>
      </div>

      {/* ── Legend + Stats ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        {Object.entries(TYPE_STYLES).map(([type, style]) => {
          const Icon = style.icon;
          return (
            <div key={type} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: style.bg, border: `1px solid ${style.color}33`,
              borderRadius: '10px', padding: '10px 16px',
            }}>
              <Icon size={16} color={style.color} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: style.color }}>{type}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stats[type]} days</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0,320px)', gap: '20px' }}>

        {/* ── Calendar Grid ── */}
        <div className="program-card" style={{ cursor: 'default' }}>

          {/* Month navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={prevMonth} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
              borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#fff',
            }}>
              <ChevronLeft size={16} />
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
              borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#fff',
            }}>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)',
                        gap: '4px', marginBottom: '8px' }}>
            {DAYS.map(d => (
              <div key={d} style={{
                textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)',
                fontWeight: 600, textTransform: 'uppercase', padding: '6px 0',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          {loading ? (
            <LoadingSpinner text="Loading calendar..." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
              {cells.map((day, i) => {
                const data  = getDayData(day);
                const isTod = isToday(day);
                const style = data ? TYPE_STYLES[data.type] : null;
                const isSel = selected?.day === day && selected?.month === month;

                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (!day) return;
                      if (isAdminUser) {
                        openAddEvent(day);
                      } else if (data) {
                        setSelected({ day, data, month, year });
                      }
                    }}
                    style={{
                      aspectRatio: '1',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'flex-start',
                      padding: '4px 2px',
                      borderRadius: '10px',
                      position: 'relative',
                      cursor: day
                        ? (isAdminUser ? 'pointer' : (data ? 'pointer' : 'default'))
                        : 'default',
                      background: isSel
                        ? (style?.bg ?? 'rgba(255,255,255,0.08)')
                        : isTod ? 'rgba(255,0,85,0.2)'
                        : data   ? `${style.bg}88`
                        :          'transparent',
                      border: isSel
                        ? `2px solid ${style?.color ?? '#fff'}`
                        : isTod ? '2px solid var(--primary-color)'
                        :          '2px solid transparent',
                      transition: 'all 0.15s',
                      overflow: 'hidden',
                    }}
                  >
                    {day && (
                      <>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: isTod ? 800 : 400,
                          lineHeight: '1.4',
                          color: isTod ? '#fff' : data ? style.color : 'var(--text-muted)',
                        }}>
                          {day}
                        </span>

                        {/* Show title on cell for events/holidays */}
                        {data && data.type !== 'Regular' && data.title && (
                          <span style={{
                            fontSize: '7px', color: style.color, textAlign: 'center',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            width: '100%', lineHeight: '1.2', marginTop: '1px', fontWeight: 600,
                          }}>
                            {data.title.length > 8 ? data.title.substring(0, 8) + '…' : data.title}
                          </span>
                        )}

                        {/* Dot for regular days or untitled events */}
                        {data && (data.type === 'Regular' || !data.title) && (
                          <div style={{
                            width: '5px', height: '5px', borderRadius: '50%',
                            background: style.color, marginTop: '2px',
                          }} />
                        )}

                        {/* Admin add hint on empty days */}
                        {isAdminUser && !data && day && (
                          <Plus size={8} style={{ opacity: 0.2, marginTop: '2px' }} />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Detail Panel ── */}
        <div className="program-card" style={{ cursor: 'default' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px',
                       color: 'var(--secondary-color)' }}>
            Day Details
          </h3>

          {selected ? (() => {
            const { day, data } = selected;
            const style = TYPE_STYLES[data.type];
            const Icon  = style.icon;
            return (
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px',
                  background: style.bg, borderRadius: '12px', padding: '14px',
                }}>
                  <Icon size={20} color={style.color} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: style.color }}>
                      {data.title || data.type}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {MONTHS[month]} {day}, {year}
                      {data.time && ` · ${data.time}`}
                    </p>
                  </div>
                </div>

                {data.description && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)',
                                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                      Description
                    </p>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{data.description}</p>
                  </div>
                )}

                {data.type === 'Regular' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
                                  gap: '12px', marginTop: '12px' }}>
                      <div style={{ background: 'rgba(0,212,255,0.08)',
                                    borderRadius: '10px', padding: '12px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          Present
                        </p>
                        <p style={{ fontSize: '22px', fontWeight: 800, color: '#00d4ff' }}>
                          {data.present_count}
                        </p>
                      </div>
                      <div style={{ background: 'rgba(255,0,85,0.08)',
                                    borderRadius: '10px', padding: '12px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          Absent
                        </p>
                        <p style={{ fontSize: '22px', fontWeight: 800, color: '#ff0055' }}>
                          {data.absent_count}
                        </p>
                      </div>
                    </div>
                    <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.04)',
                                  borderRadius: '10px', padding: '12px' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Attendance Rate
                      </p>
                      <p style={{ fontSize: '22px', fontWeight: 800, color: '#00ff85' }}>
                        {Math.round(
                          data.present_count / (data.present_count + data.absent_count) * 100
                        )}%
                      </p>
                    </div>
                  </>
                )}

                {isAdminUser && data.type !== 'Regular' && (
                  <button
                    onClick={() => handleRemoveEvent(data)}
                    style={{
                      marginTop: '16px', width: '100%', padding: '8px',
                      borderRadius: '10px', border: '1px solid rgba(255,68,102,0.3)',
                      background: 'rgba(255,68,102,0.1)', color: '#ff4466',
                      cursor: 'pointer', fontSize: '13px',
                    }}
                  >
                    🗑 Remove Event
                  </button>
                )}
              </div>
            );
          })() : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Calendar size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: '13px' }}>
                {isAdminUser
                  ? 'Click any date to add events or holidays'
                  : 'Click on a highlighted day to see details'}
              </p>
            </div>
          )}

          {/* Holidays & Events list */}
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--glass-border)',
                        paddingTop: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase',
                        letterSpacing: '1px', marginBottom: '12px' }}>
              Holidays & Events
            </p>

            {days.filter(d => d.type !== 'Regular').slice(0, 8).map((d, i) => {
              const style = TYPE_STYLES[d.type];
              const Icon  = style.icon;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <Icon size={14} color={style.color} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 500 }}>
                      {d.title || d.label || d.type}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(d.date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                      {d.time && ` · ${d.time}`}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '11px', background: style.bg, color: style.color,
                    padding: '2px 8px', borderRadius: '20px',
                  }}>
                    {d.type}
                  </span>
                </div>
              );
            })}

            {days.filter(d => d.type !== 'Regular').length === 0 && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {isAdminUser
                  ? 'No events yet. Click a date to add one.'
                  : 'No upcoming events.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Event Modal ── */}
      {showEventForm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: 'var(--bg-panel)', border: '1px solid var(--glass-border)',
            borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '440px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  Add to Calendar
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                  {MONTHS[month]} {eventDay}, {year}
                </p>
              </div>
              <button
                onClick={() => setShowEventForm(false)}
                style={{
                  background: 'transparent', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block',
                                marginBottom: '6px', textTransform: 'uppercase' }}>
                  Type
                </label>
                <select
                  value={eventForm.type}
                  onChange={e => setEventForm(p => ({ ...p, type: e.target.value }))}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)', borderRadius: '10px',
                    padding: '10px 14px', color: '#fff', fontSize: '14px', outline: 'none',
                  }}
                >
                  <option value="Event">📅 Event</option>
                  <option value="Holiday">🏖️ Holiday</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block',
                                marginBottom: '6px', textTransform: 'uppercase' }}>
                  {eventForm.type} Title *
                </label>
                <input
                  type="text" required
                  placeholder={`Enter ${eventForm.type.toLowerCase()} title`}
                  value={eventForm.title}
                  onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block',
                                marginBottom: '6px', textTransform: 'uppercase' }}>
                  Time (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8:00 AM – 5:00 PM"
                  value={eventForm.time}
                  onChange={e => setEventForm(p => ({ ...p, time: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block',
                                marginBottom: '6px', textTransform: 'uppercase' }}>
                  Description (optional)
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Event details..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px',
                    border: '1px solid var(--glass-border)', background: 'transparent',
                    color: '#fff', cursor: 'pointer', fontSize: '14px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEvent}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px',
                    border: 'none', background: 'var(--primary-color)',
                    color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                  }}
                >
                  {savingEvent ? 'Saving...' : 'Save to Calendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirm}
        title={confirm?.title ?? 'Are you sure?'}
        message={confirm?.message ?? ''}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}