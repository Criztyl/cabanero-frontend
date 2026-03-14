import { useState, useEffect, useContext } from 'react';
import { BellOff, CheckCheck, Bell } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const TYPE_STYLES = {
  info: {
    bg: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: 'rgba(0,212,255,0.25)',
  },
  success: {
    bg: 'rgba(0,255,133,0.1)', color: '#00ff85', border: 'rgba(0,255,133,0.25)',
  },
  warning: {
    bg: 'rgba(255,170,0,0.1)', color: '#ffaa00', border: 'rgba(255,170,0,0.25)',
  },
  alert: {
    bg: 'rgba(255,68,102,0.1)', color: '#ff4466', border: 'rgba(255,68,102,0.25)',
  },
  enrollment_request: {
    bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: 'rgba(139,92,246,0.25)',
  },
};

const defaultStyle = {
  bg: 'rgba(255,255,255,0.05)', color: '#a1a1aa', border: 'rgba(255,255,255,0.1)',
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m    = Math.floor(diff / 60000);
  const h    = Math.floor(diff / 3600000);
  const d    = Math.floor(diff / 86400000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
};

export default function Notifications() {
  const { setUnreadCount } = useContext(AppContext);

  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [filter,  setFilter]  = useState('all'); // 'all' | 'unread'

  useEffect(() => {
    api.get('/notifications')
      .then(r => setNotifs(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      await api.put('/notifications/read-all');
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
    finally { setMarking(false); }
  };

  const unreadCount  = notifs.filter(n => !n.is_read).length;
  const displayNotifs = filter === 'unread' ? notifs.filter(n => !n.is_read) : notifs;

  return (
    <div className="dashboard-wrapper-inner">

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '16px', marginBottom: '28px',
      }}>
        <div>
          <h1 style={{ fontSize: 'clamp(20px,5vw,28px)', fontWeight: 800, margin: 0 }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px', fontSize: '14px' }}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Filter toggle */}
          {['all', 'unread'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '7px 16px', borderRadius: '10px', border: 'none',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                textTransform: 'capitalize', transition: 'all 0.2s',
                background: filter === f ? 'rgba(255,0,85,0.15)' : 'rgba(255,255,255,0.05)',
                color:      filter === f ? 'var(--primary-color)' : 'var(--text-muted)',
                borderWidth: '1px', borderStyle: 'solid',
                borderColor: filter === f ? 'rgba(255,0,85,0.3)' : 'var(--glass-border)',
              }}
            >
              {f === 'all' ? 'All' : `Unread (${unreadCount})`}
            </button>
          ))}

          {/* Mark all read */}
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={marking}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '7px 16px', borderRadius: '10px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: '13px',
              }}
            >
              <CheckCheck size={15} />
              {marking ? 'Marking…' : 'Mark all as read'}
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <LoadingSpinner text="Loading notifications..." />
      ) : displayNotifs.length === 0 ? (
        <div className="program-card" style={{ textAlign: 'center', padding: '64px', cursor: 'default' }}>
          <BellOff size={40} style={{ opacity: 0.3, margin: '0 auto 16px', display: 'block' }} />
          <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {filter === 'unread'
              ? 'You have read all your notifications.'
              : "You'll be notified about enrollments, events, and system updates here."}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {displayNotifs.map(n => {
            const s = TYPE_STYLES[n.type] ?? defaultStyle;
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  padding: '16px 18px', borderRadius: '14px',
                  cursor: n.is_read ? 'default' : 'pointer',
                  background: n.is_read ? 'rgba(255,255,255,0.02)' : s.bg,
                  border: `1px solid ${n.is_read ? 'var(--glass-border)' : s.border}`,
                  opacity: n.is_read ? 0.75 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {/* Icon circle */}
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                  background: n.is_read ? 'rgba(255,255,255,0.05)' : s.bg,
                  border: `1px solid ${n.is_read ? 'var(--glass-border)' : s.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px',
                }}>
                  {n.icon || '🔔'}
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0 }}>

                  {/* Title + time + unread dot */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', gap: '8px', marginBottom: '4px',
                  }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: n.is_read ? 500 : 700,
                      color: n.is_read ? '#fff' : s.color,
                    }}>
                      {n.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {timeAgo(n.created_at)}
                      </span>
                      {!n.is_read && (
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: s.color, flexShrink: 0,
                        }} />
                      )}
                    </div>
                  </div>

                  {/* Body text */}
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {n.body}
                  </p>

                  {/* Type badge + click hint */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <span style={{
                      fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px',
                      background: s.bg, color: s.color,
                      padding: '2px 10px', borderRadius: '20px', fontWeight: 600,
                      border: `1px solid ${s.border}`,
                    }}>
                      {n.type.replace('_', ' ')}
                    </span>
                    {!n.is_read && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Click to mark as read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}