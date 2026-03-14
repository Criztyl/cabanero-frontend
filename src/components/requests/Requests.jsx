import { useState, useEffect, useContext } from 'react';
import { ClipboardList, Check, X, Clock, User } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const STATUS_STYLES = {
  pending:  { bg: 'rgba(255,170,0,0.1)',  color: '#ffaa00', icon: Clock },
  approved: { bg: 'rgba(0,255,133,0.1)',  color: '#00ff85', icon: Check },
  declined: { bg: 'rgba(255,68,102,0.1)', color: '#ff4466', icon: X    },
};

export default function Requests() {
  const { isAdminUser } = useContext(AppContext);

  const [requests,   setRequests]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState('pending');
  const [confirm,    setConfirm]    = useState(null);  // { type, id, name, program }
  const [note,       setNote]       = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => { loadRequests(); }, [tab]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/enrollment/requests?status=${tab}`);
      setRequests(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!confirm) return;
    setProcessing(confirm.id);
    try {
      await api.put(`/enrollment/requests/${confirm.id}/${confirm.type}`, { note });
      setRequests(prev => prev.filter(r => r.id !== confirm.id));
      setConfirm(null);
      setNote('');
    } catch (e) {
      alert(e.response?.data?.message || 'Action failed.');
    } finally {
      setProcessing(null);
    }
  };

  const tabs = ['pending', 'approved', 'declined'];

  return (
    <div className="dashboard-wrapper-inner">

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: 'clamp(20px,5vw,28px)', fontWeight: 800, margin: 0 }}>
          Enrollment Requests
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>
          Review and manage student program enrollment requests
        </p>
      </div>

      {/* ── Tab buttons ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {tabs.map(s => {
          const style = STATUS_STYLES[s];
          return (
            <button
              key={s}
              onClick={() => setTab(s)}
              style={{
                padding: '8px 20px', borderRadius: '10px', border: 'none',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                textTransform: 'capitalize', transition: 'all 0.2s',
                background:   tab === s ? style.bg        : 'rgba(255,255,255,0.04)',
                color:        tab === s ? style.color     : 'var(--text-muted)',
                borderWidth:  '1px', borderStyle: 'solid',
                borderColor:  tab === s ? `${style.color}44` : 'var(--glass-border)',
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <LoadingSpinner text="Loading requests..." />
      ) : requests.length === 0 ? (
        <div className="program-card" style={{ textAlign: 'center', padding: '56px', cursor: 'default' }}>
          <ClipboardList
            size={36}
            style={{ opacity: 0.3, margin: '0 auto 14px', display: 'block' }}
          />
          <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>
            No {tab} requests
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {tab === 'pending'
              ? 'New enrollment requests will appear here.'
              : `No ${tab} requests to show.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {requests.map(req => {
            const st   = STATUS_STYLES[req.status];
            const Icon = st.icon;
            return (
              <div key={req.id} className="program-card" style={{ cursor: 'default' }}>

                {/* Student info + status */}
                <div style={{ display: 'flex', justifyContent: 'space-between',
                              alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0,
                      background: 'var(--primary-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', fontWeight: 700,
                    }}>
                      {req.user?.name?.charAt(0).toUpperCase() ?? <User size={18} />}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '15px' }}>{req.user?.name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{req.user?.email}</p>
                    </div>
                  </div>

                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: st.bg, color: st.color,
                    padding: '5px 14px', borderRadius: '20px',
                    fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                  }}>
                    <Icon size={12} /> {req.status}
                  </span>
                </div>

                {/* Request details grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))',
                  gap: '12px', marginTop: '16px', padding: '14px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                }}>
                  {[
                    ['Program Code',  req.program_code],
                    ['Program Name',  req.program_name],
                    ['Department',    req.user?.department || '—'],
                    ['Submitted',
                      new Date(req.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p style={{
                        fontSize: '10px', color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px',
                      }}>
                        {label}
                      </p>
                      <p style={{ fontSize: '13px', fontWeight: 600 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Admin note (if declined) */}
                {req.admin_note && (
                  <div style={{
                    marginTop: '12px', padding: '10px 14px',
                    background: 'rgba(255,255,255,0.04)', borderRadius: '8px',
                    fontSize: '13px', color: 'var(--text-muted)',
                  }}>
                    📝 <em>{req.admin_note}</em>
                  </div>
                )}

                {/* Action buttons (pending only) */}
                {req.status === 'pending' && isAdminUser && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button
                      onClick={() => setConfirm({
                        type: 'approve', id: req.id,
                        name: req.user?.name, program: req.program_code,
                      })}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                        background: 'rgba(0,255,133,0.15)', color: '#00ff85',
                        cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      }}
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => setConfirm({
                        type: 'decline', id: req.id,
                        name: req.user?.name, program: req.program_code,
                      })}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                        background: 'rgba(255,68,102,0.15)', color: '#ff4466',
                        cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      }}
                    >
                      <X size={14} /> Decline
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Action Confirmation Modal ── */}
      {confirm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: 'var(--bg-panel)', border: '1px solid var(--glass-border)',
            borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '420px',
          }}>

            {/* Icon + Title */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '44px', marginBottom: '10px' }}>
                {confirm.type === 'approve' ? '✅' : '❌'}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                {confirm.type === 'approve' ? 'Approve Enrollment Request' : 'Decline Enrollment Request'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                {confirm.type === 'approve'
                  ? `Approve ${confirm.name}'s request to enroll in ${confirm.program}?`
                  : `Decline ${confirm.name}'s request for ${confirm.program}?`}
              </p>
            </div>

            {/* Optional note */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontSize: '12px', color: 'var(--text-muted)', display: 'block',
                marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                Note to Student <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                placeholder={
                  confirm.type === 'approve'
                    ? 'e.g. Welcome to the program! Orientation is on Monday.'
                    : 'e.g. Please complete missing requirements before re-applying.'
                }
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)', borderRadius: '10px',
                  padding: '10px 14px', color: '#fff', fontSize: '14px',
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setConfirm(null); setNote(''); }}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px',
                  border: '1px solid var(--glass-border)', background: 'transparent',
                  color: '#fff', cursor: 'pointer', fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={processing === confirm.id}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                  background: confirm.type === 'approve' ? '#00ff85' : 'var(--primary-color)',
                  color: confirm.type === 'approve' ? '#000' : '#fff',
                  cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                }}
              >
                {processing === confirm.id
                  ? 'Processing...'
                  : confirm.type === 'approve' ? 'Yes, Approve' : 'Yes, Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}