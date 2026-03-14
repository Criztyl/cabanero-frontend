import { useState, useMemo, useContext, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import api from '../../services/api';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingSpinner from '../common/LoadingSpinner';
import './ProgramList.css';

const EMPTY_FORM = {
  code:'', name:'', type:'Bachelor', status:'active',
  duration:'4 years', totalUnits:'', description:'',
};

function ProgramList() {
  const { isAdminUser, requestEnrollment, fetchMyEnrollment, myEnrollment } = useContext(AppContext);

  const [localPrograms,  setLocalPrograms]  = useState([]);
  const [loadingPrograms,setLoadingPrograms] = useState(true);
  const [selected,       setSelected]       = useState(null);
  const [search,         setSearch]         = useState('');
  const [filter,         setFilter]         = useState('all');
  const [showForm,       setShowForm]       = useState(false);
  const [editMode,       setEditMode]       = useState(false);
  const [form,           setForm]           = useState(EMPTY_FORM);
  const [formError,      setFormError]      = useState('');
  const [saving,         setSaving]         = useState(false);
  const [requesting,     setRequesting]     = useState(false);
  const [reqMsg,         setReqMsg]         = useState('');
  const [confirm,        setConfirm]        = useState(null);
  const [enrollStatus,   setEnrollStatus]   = useState('none');
  const [enrolledCode,   setEnrolledCode]   = useState(null);

  // Load programs from API on mount
  useEffect(() => {
    api.get('/programs')
      .then(res => setLocalPrograms(res.data))
      .catch(() => {})
      .finally(() => setLoadingPrograms(false));
  }, []);

  // Load enrollment status
  useEffect(() => {
    fetchMyEnrollment().then(d => {
      if (d) {
        setEnrollStatus(d.status ?? 'none');
        setEnrolledCode(d.enrollment?.program_code ?? null);
      }
    });
  }, []);

  // Re-sync when myEnrollment changes in context
  useEffect(() => {
    if (myEnrollment) {
      setEnrollStatus(myEnrollment.status ?? 'none');
      setEnrolledCode(myEnrollment.enrollment?.program_code ?? null);
    }
  }, [myEnrollment]);

  const enrolledProgram = localPrograms.find(p => p.code === enrolledCode);

  const filteredList = useMemo(() => {
    return localPrograms.filter(p => {
      if (!isAdminUser && enrollStatus === 'approved' && p.code === enrolledCode) return false;
      const matchStatus = filter === 'all' || p.status === filter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        p.code?.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [localPrograms, filter, search, enrolledCode, enrollStatus, isAdminUser]);

  const openAdd = () => {
    setForm(EMPTY_FORM); setEditMode(false); setFormError(''); setShowForm(true);
  };

  const openEdit = (e, p) => {
    e?.stopPropagation();
    setForm({
      code:       p.code,
      name:       p.name        || '',
      type:       p.type        || 'Bachelor',
      status:     p.status      || 'active',
      duration:   p.duration    || '4 years',
      totalUnits: p.total_units ?? p.totalUnits ?? '',
      description:p.description || '',
    });
    setEditMode(true); setFormError(''); setShowForm(true);
  };

  const handleDelete = (e, p) => {
    e.stopPropagation();
    setConfirm({
      title:   `Delete "${p.code}"?`,
      message: 'This program will be permanently removed from the database.',
      onConfirm: async () => {
        try {
          await api.delete(`/programs/${p.id}`);
          setLocalPrograms(prev => prev.filter(x => x.id !== p.id));
          if (selected?.id === p.id) setSelected(null);
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to delete.');
        }
        setConfirm(null);
      },
    });
  };

  const handleSave = async (e) => {
    e.preventDefault(); setFormError(''); setSaving(true);
    if (!form.code || !form.name) {
      setFormError('Code and name are required.'); setSaving(false); return;
    }
    try {
      if (editMode) {
        const existing = localPrograms.find(p => p.code === form.code);
        const res = await api.put(`/programs/${existing.id}`, {
          name:        form.name,
          type:        form.type,
          duration:    form.duration,
          total_units: Number(form.totalUnits),
          status:      form.status,
          description: form.description,
        });
        setLocalPrograms(prev => prev.map(p => p.id === res.data.id ? res.data : p));
      } else {
        const res = await api.post('/programs', {
          code:        form.code,
          name:        form.name,
          type:        form.type,
          duration:    form.duration,
          total_units: Number(form.totalUnits),
          status:      form.status,
          description: form.description,
        });
        setLocalPrograms(prev => [...prev, res.data]);
      }
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save program.');
    } finally { setSaving(false); }
  };

  const handleEnrollRequest = (program) => {
    setConfirm({
      icon: '📋', danger: false,
      title: `Request Enrollment in ${program.code}?`,
      message: `Submit a request to enroll in "${program.name}"? An admin will review and approve it.`,
      confirmLabel: 'Submit Request', cancelLabel: 'Cancel',
      onConfirm: async () => {
        setConfirm(null); setRequesting(true); setReqMsg('');
        try {
          await requestEnrollment(program.code, program.name || program.code);
          setEnrollStatus('pending');
          setReqMsg(`✅ Enrollment request for ${program.code} submitted! Awaiting admin approval.`);
          setSelected(null);
          setTimeout(() => setReqMsg(''), 5000);
        } catch (err) {
          setReqMsg('❌ ' + (err.response?.data?.message || 'Request failed.'));
        } finally { setRequesting(false); }
      },
    });
  };

  const inputStyle = {
    width:'100%', background:'rgba(255,255,255,0.05)',
    border:'1px solid var(--glass-border)', borderRadius:'10px',
    padding:'10px 14px', color:'var(--text-main)', fontSize:'14px',
    outline:'none', boxSizing:'border-box',
  };
  const labelStyle = {
    fontSize:'12px', color:'var(--text-muted)', display:'block',
    marginBottom:'6px', textTransform:'uppercase',
  };

  return (
    <div className="program-list-container">

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    flexWrap:'wrap', gap:'16px', marginBottom:'28px' }}>
        <div>
          <h1 className="page-title">
            {!isAdminUser && enrollStatus === 'approved' ? 'My Enrolled Program' : 'Program Offerings'}
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'6px' }}>
            {isAdminUser
              ? `${localPrograms.length} programs in database`
              : 'Browse all available degree programs'}
          </p>
        </div>
        {isAdminUser && (
          <button onClick={openAdd}
            style={{ display:'flex', alignItems:'center', gap:'8px',
                     background:'var(--primary-color)', border:'none',
                     borderRadius:'10px', padding:'10px 18px',
                     color:'#fff', fontWeight:600, cursor:'pointer', fontSize:'14px' }}>
            <Plus size={16} /> Add Program
          </button>
        )}
      </div>

      {/* ── Status messages ── */}
      {reqMsg && (
        <div style={{
          background: reqMsg.startsWith('✅') ? 'rgba(0,255,133,0.1)' : 'rgba(255,68,102,0.1)',
          border: `1px solid ${reqMsg.startsWith('✅') ? 'rgba(0,255,133,0.3)' : 'rgba(255,68,102,0.3)'}`,
          borderRadius:'10px', padding:'12px 16px', marginBottom:'16px',
          color: reqMsg.startsWith('✅') ? '#00ff85' : '#ff4466', fontSize:'14px',
        }}>
          {reqMsg}
        </div>
      )}

      {/* ── Pending banner ── */}
      {!isAdminUser && enrollStatus === 'pending' && (
        <div style={{ background:'rgba(255,170,0,0.1)', border:'1px solid rgba(255,170,0,0.3)',
                      borderRadius:'12px', padding:'14px 18px', marginBottom:'20px',
                      display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'20px' }}>⏳</span>
          <div>
            <p style={{ fontWeight:600, color:'#ffaa00', fontSize:'14px' }}>
              Enrollment Request Pending
            </p>
            <p style={{ color:'var(--text-muted)', fontSize:'12px' }}>
              Awaiting admin approval. You'll be notified once reviewed.
            </p>
          </div>
        </div>
      )}

      {/* ── Enrolled program card (student only) ── */}
      {!isAdminUser && enrollStatus === 'approved' && enrolledProgram && (
        <>
          <div className="program-card" style={{
            border:'2px solid rgba(0,255,133,0.4)',
            background:'rgba(0,255,133,0.05)',
            cursor:'default', marginBottom:'8px',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between',
                          alignItems:'flex-start', marginBottom:'14px' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
                  <h3 className="card-title">{enrolledProgram.code}</h3>
                  <span style={{ background:'rgba(0,255,133,0.2)', color:'#00ff85',
                                 fontSize:'11px', fontWeight:700, padding:'2px 10px',
                                 borderRadius:'20px', textTransform:'uppercase' }}>
                    ✅ Enrolled
                  </span>
                </div>
                <p className="card-subtitle">{enrolledProgram.name}</p>
              </div>
            </div>
            <p style={{ color:'var(--text-muted)', fontSize:'0.85rem',
                        marginBottom:'16px', lineHeight:'1.6' }}>
              {enrolledProgram.description}
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px',
                          padding:'14px 0', borderTop:'1px solid var(--glass-border)' }}>
              {[
                ['Type',     enrolledProgram.type],
                ['Duration', enrolledProgram.duration],
                ['Units',    enrolledProgram.total_units ?? enrolledProgram.totalUnits],
              ].map(([l,v]) => (
                <div key={l}>
                  <p style={{ color:'var(--secondary-color)', fontSize:'10px',
                              textTransform:'uppercase', marginBottom:'3px' }}>{l}</p>
                  <p style={{ fontWeight:700, color:'var(--text-main)' }}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section divider */}
          <div style={{ display:'flex', alignItems:'center', gap:'16px', margin:'28px 0 20px' }}>
            <div style={{ flex:1, height:'1px', background:'var(--glass-border)' }} />
            <span style={{ fontSize:'12px', color:'var(--text-muted)',
                           textTransform:'uppercase', letterSpacing:'1px', whiteSpace:'nowrap' }}>
              Other Programs
            </span>
            <div style={{ flex:1, height:'1px', background:'var(--glass-border)' }} />
          </div>
          <p style={{ color:'var(--text-muted)', fontSize:'13px', marginBottom:'20px' }}>
            Browse other available degree programs (view only)
          </p>
        </>
      )}

      {/* ── Controls ── */}
      <div className="controls-row" style={{ marginBottom:'28px' }}>
        <div className="search-bar" style={{ flex:1, minWidth:'220px', maxWidth:'400px' }}>
          <span className="search-bar-icon"><Search size={15} /></span>
          <input className="search-input" type="text" placeholder="Search programs…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="under review">Under Review</option>
        </select>
      </div>

      {/* ── Programs grid ── */}
      {loadingPrograms ? (
        <LoadingSpinner text="Loading programs..." />
      ) : filteredList.length === 0 ? (
        <div style={{ textAlign:'center', padding:'64px 20px', color:'var(--text-muted)' }}>
          <Search size={32} style={{ marginBottom:'12px', opacity:0.3 }} />
          <p>No programs match your search</p>
        </div>
      ) : (
        <div className="programs-grid">
          {filteredList.map(program => (
            <div key={program.id} className="program-card"
                 onClick={() => setSelected(program)}>
              <div style={{ display:'flex', justifyContent:'space-between',
                            alignItems:'flex-start', marginBottom:'14px' }}>
                <div>
                  <h3 className="card-title">{program.code}</h3>
                  <p className="card-subtitle">{program.type}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <span className={`badge ${program.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {program.status}
                  </span>
                  {isAdminUser && (
                    <>
                      <button onClick={e => openEdit(e, program)}
                        style={{ background:'rgba(0,212,255,0.1)',
                                 border:'1px solid rgba(0,212,255,0.2)',
                                 borderRadius:'6px', padding:'4px 7px',
                                 cursor:'pointer', color:'#00d4ff',
                                 display:'flex', alignItems:'center' }}>
                        <Pencil size={12} />
                      </button>
                      <button onClick={e => handleDelete(e, program)}
                        style={{ background:'rgba(255,68,102,0.1)',
                                 border:'1px solid rgba(255,68,102,0.2)',
                                 borderRadius:'6px', padding:'4px 7px',
                                 cursor:'pointer', color:'#ff4466',
                                 display:'flex', alignItems:'center' }}>
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p style={{ color:'var(--text-muted)', fontSize:'0.8rem',
                          marginBottom:'18px', lineHeight:'1.6', flex:1 }}>
                {program.description?.substring(0, 90)}…
              </p>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px',
                            marginBottom:'18px', paddingTop:'14px',
                            borderTop:'1px solid var(--glass-border)' }}>
                <div>
                  <p style={{ color:'var(--secondary-color)', fontSize:'10px',
                              textTransform:'uppercase', letterSpacing:'0.5px',
                              marginBottom:'3px' }}>Duration</p>
                  <p style={{ fontWeight:700, fontSize:'0.9rem',
                              color:'var(--text-main)' }}>{program.duration}</p>
                </div>
                <div>
                  <p style={{ color:'var(--secondary-color)', fontSize:'10px',
                              textTransform:'uppercase', letterSpacing:'0.5px',
                              marginBottom:'3px' }}>Units</p>
                  <p style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text-main)' }}>
                    {program.total_units ?? program.totalUnits}
                  </p>
                </div>
              </div>

              <button className="btn-primary"
                onClick={e => { e.stopPropagation(); setSelected(program); }}
                style={{ width:'100%' }}>
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── View Details Modal ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.code}</h2>
              <p className="card-subtitle" style={{ marginTop:'4px' }}>{selected.name}</p>
            </div>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>

            <div className="modal-body">
              <span className={`badge ${selected.status === 'active' ? 'badge-success' : 'badge-warning'}`}
                    style={{ marginBottom:'18px', display:'inline-block' }}>
                {selected.status?.toUpperCase()}
              </span>
              <div style={{ marginBottom:'22px' }}>
                <h4 style={{ color:'var(--secondary-color)', fontSize:'11px',
                             textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'8px' }}>
                  Description
                </h4>
                <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', lineHeight:'1.7' }}>
                  {selected.description}
                </p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'16px',
                            padding:'18px 0', borderTop:'1px solid var(--glass-border)',
                            borderBottom:'1px solid var(--glass-border)', marginBottom:'22px' }}>
                {[
                  ['Type',        selected.type],
                  ['Duration',    selected.duration],
                  ['Total Units', selected.total_units ?? selected.totalUnits],
                  ['Status',      selected.status],
                ].map(([lbl, val]) => (
                  <div key={lbl}>
                    <span style={{ display:'block', fontSize:'10px', color:'var(--text-muted)',
                                   textTransform:'uppercase', letterSpacing:'0.5px',
                                   marginBottom:'3px' }}>
                      {lbl}
                    </span>
                    <span style={{ fontWeight:700, fontSize:'0.9rem',
                                   color:'var(--text-main)' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              {/* Admin */}
              {isAdminUser && (
                <button className="btn-primary btn" style={{ flex:1 }}
                  onClick={() => { openEdit(null, selected); setSelected(null); }}>
                  ✏️ Edit Program
                </button>
              )}
              {/* Student — not yet enrolled */}
              {!isAdminUser && enrollStatus === 'none' && (
                <button className="btn-primary btn" style={{ flex:1 }}
                  onClick={() => handleEnrollRequest(selected)}
                  disabled={requesting}>
                  {requesting ? 'Submitting...' : '📋 Request Enrollment'}
                </button>
              )}
              {/* Student — pending */}
              {!isAdminUser && enrollStatus === 'pending' && (
                <button disabled className="btn-primary btn" style={{ flex:1, opacity:0.6 }}>
                  ⏳ Request Pending
                </button>
              )}
              {/* Student — already enrolled */}
              {!isAdminUser && enrollStatus === 'approved' && (
                <button disabled className="btn-primary btn" style={{ flex:1, opacity:0.6 }}>
                  👁️ View Only
                </button>
              )}
              <button className="btn btn-secondary" style={{ flex:1 }}
                onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Form Modal ── */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? 'Edit Program' : 'Add New Program'}</h2>
            </div>
            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>

            <div className="modal-body">
              {formError && (
                <div style={{ background:'rgba(255,68,102,0.1)',
                              border:'1px solid rgba(255,68,102,0.2)',
                              borderRadius:'8px', padding:'10px 14px',
                              marginBottom:'16px', color:'#ff4466', fontSize:'13px' }}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleSave}
                    style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                {[
                  { label:'Program Code', name:'code',      placeholder:'e.g. BSIT',      disabled:editMode },
                  { label:'Full Name',    name:'name',      placeholder:'Bachelor of...' },
                  { label:'Duration',     name:'duration',  placeholder:'e.g. 4 years'   },
                  { label:'Total Units',  name:'totalUnits',placeholder:'e.g. 132', type:'number' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={labelStyle}>{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      placeholder={f.placeholder}
                      value={form[f.name]}
                      onChange={e => setForm(p => ({...p, [f.name]: e.target.value}))}
                      disabled={f.disabled}
                      style={{ ...inputStyle, opacity: f.disabled ? 0.5 : 1 }}
                    />
                  </div>
                ))}

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                  <div>
                    <label style={labelStyle}>Type</label>
                    <select
                      value={form.type}
                      onChange={e => setForm(p => ({...p, type: e.target.value}))}
                      style={inputStyle}
                    >
                      {['Bachelor','Master','Diploma'].map(t =>
                        <option key={t} value={t}>{t}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm(p => ({...p, status: e.target.value}))}
                      style={inputStyle}
                    >
                      <option value="active">Active</option>
                      <option value="under review">Under Review</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({...p, description: e.target.value}))}
                    rows={3} placeholder="Program description..."
                    style={{ ...inputStyle, resize:'vertical' }}
                  />
                </div>

                <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ flex:1, padding:'10px', borderRadius:'10px',
                             border:'1px solid var(--glass-border)', background:'transparent',
                             color:'var(--text-main)', cursor:'pointer', fontSize:'14px' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    style={{ flex:1, padding:'10px', borderRadius:'10px', border:'none',
                             background:'var(--primary-color)', color:'#fff',
                             cursor:'pointer', fontSize:'14px', fontWeight:600 }}>
                    {saving ? 'Saving...' : editMode ? 'Save Changes' : 'Add Program'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirm}
        icon={confirm?.icon ?? '⚠️'}
        title={confirm?.title ?? 'Are you sure?'}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.confirmLabel ?? 'Confirm'}
        cancelLabel={confirm?.cancelLabel ?? 'Cancel'}
        danger={confirm?.danger !== false}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

export default ProgramList;