import { useState, useMemo, useContext } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import { programsData } from '../../data/programsData';
import { AppContext } from '../../context/AppContext';
import api from '../../services/api';
import './ProgramList.css';

const EMPTY_FORM = {
  code: '', name: '', type: 'Bachelor', status: 'active',
  duration: '4 years', totalUnits: '', description: '',
};

function ProgramList() {
  const { isAdminUser, enrollInProgram, myEnrollment } = useContext(AppContext);

  const [localPrograms, setLocalPrograms] = useState(programsData);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');

  // Add/Edit modal
  const [showForm,  setShowForm]  = useState(false);
  const [editMode,  setEditMode]  = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving,    setSaving]    = useState(false);

  // Enroll state
  const [enrolling,    setEnrolling]    = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState('');

  const filteredPrograms = useMemo(() => {
    return localPrograms.filter(p => {
      const matchStatus = filter === 'all' || p.status === filter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        p.code?.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [localPrograms, filter, search]);

  const openAdd = () => {
    setForm(EMPTY_FORM); setEditMode(false);
    setFormError(''); setShowForm(true);
  };

  const openEdit = (e, program) => {
    e.stopPropagation();
    setForm({
      code: program.code, name: program.name || '',
      type: program.type || 'Bachelor', status: program.status || 'active',
      duration: program.duration || '4 years',
      totalUnits: program.totalUnits || '',
      description: program.description || '',
    });
    setEditMode(true); setFormError(''); setShowForm(true);
  };

  const handleDelete = (e, program) => {
    e.stopPropagation();
    if (!window.confirm(`Delete program "${program.code}"? This cannot be undone.`)) return;
    setLocalPrograms(prev => prev.filter(p => p.id !== program.id));
    if (selectedProgram?.id === program.id) setSelectedProgram(null);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    setFormError(''); setSaving(true);
    if (!form.code || !form.name) { setFormError('Code and name are required.'); setSaving(false); return; }

    setTimeout(() => {
      if (editMode) {
        setLocalPrograms(prev => prev.map(p =>
          p.code === form.code ? { ...p, ...form, totalUnits: Number(form.totalUnits) } : p
        ));
      } else {
        const newProgram = {
          id: Date.now(), ...form,
          totalUnits: Number(form.totalUnits),
          yearLevels: [],
        };
        setLocalPrograms(prev => [newProgram, ...prev]);
      }
      setShowForm(false); setSaving(false);
    }, 400);
  };

  const handleEnroll = async (program) => {
    setEnrolling(true); setEnrollSuccess('');
    try {
      await enrollInProgram(program.code, program.name || program.code);
      setEnrollSuccess(`Successfully enrolled in ${program.code}!`);
      setTimeout(() => setEnrollSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed.');
    } finally { setEnrolling(false); }
  };

  const isEnrolled = (program) => myEnrollment?.program?.program_code === program.code;

  return (
    <div className="program-list-container">

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center', flexWrap:'wrap', gap:'16px', marginBottom:'28px' }}>
        <div>
          <h1 className="page-title">Program Offerings</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'6px' }}>
            Browse all available degree programs
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

      {enrollSuccess && (
        <div style={{ background:'rgba(0,255,133,0.1)', border:'1px solid rgba(0,255,133,0.3)',
                      borderRadius:'10px', padding:'12px 16px', marginBottom:'16px',
                      color:'#00ff85', fontSize:'14px' }}>
          ✅ {enrollSuccess}
        </div>
      )}

      {/* Controls */}
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

      {/* Grid */}
      {filteredPrograms.length > 0 ? (
        <div className="programs-grid">
          {filteredPrograms.map(program => (
            <div key={program.id} className="program-card"
                 onClick={() => setSelectedProgram(program)}>
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
                        style={{ background:'rgba(0,212,255,0.1)', border:'1px solid rgba(0,212,255,0.2)',
                                 borderRadius:'6px', padding:'4px 7px', cursor:'pointer',
                                 color:'#00d4ff', display:'flex', alignItems:'center' }}>
                        <Pencil size={12} />
                      </button>
                      <button onClick={e => handleDelete(e, program)}
                        style={{ background:'rgba(255,68,102,0.1)', border:'1px solid rgba(255,68,102,0.2)',
                                 borderRadius:'6px', padding:'4px 7px', cursor:'pointer',
                                 color:'#ff4466', display:'flex', alignItems:'center' }}>
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
                              textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'3px' }}>Duration</p>
                  <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{program.duration}</p>
                </div>
                <div>
                  <p style={{ color:'var(--secondary-color)', fontSize:'10px',
                              textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'3px' }}>Units</p>
                  <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{program.totalUnits}</p>
                </div>
              </div>

              <button className="btn-primary"
                onClick={e => { e.stopPropagation(); setSelectedProgram(program); }}
                style={{ width:'100%' }}>
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign:'center', padding:'64px 20px', color:'var(--text-muted)' }}>
          <Search size={32} style={{ marginBottom:'12px', opacity:0.3 }} />
          <p>No programs match your search</p>
        </div>
      )}

      {/* ── View Details Modal ── */}
      {selectedProgram && (
        <div className="modal-overlay" onClick={() => setSelectedProgram(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProgram.code}</h2>
              <p className="card-subtitle" style={{ marginTop:'4px' }}>{selectedProgram.name}</p>
            </div>
            <button className="modal-close" onClick={() => setSelectedProgram(null)}>✕</button>

            <div className="modal-body">
              <span className={`badge ${selectedProgram.status === 'active' ? 'badge-success' : 'badge-warning'}`}
                    style={{ marginBottom:'18px', display:'inline-block' }}>
                {selectedProgram.status?.toUpperCase()}
              </span>
              <div style={{ marginBottom:'22px' }}>
                <h4 style={{ color:'var(--secondary-color)', fontSize:'11px',
                             textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'8px' }}>
                  Description
                </h4>
                <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', lineHeight:'1.7' }}>
                  {selectedProgram.description}
                </p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'16px',
                            padding:'18px 0', borderTop:'1px solid var(--glass-border)',
                            borderBottom:'1px solid var(--glass-border)', marginBottom:'22px' }}>
                {[['Type', selectedProgram.type], ['Duration', selectedProgram.duration],
                  ['Total Units', selectedProgram.totalUnits], ['Status', selectedProgram.status]
                ].map(([lbl, val]) => (
                  <div key={lbl}>
                    <span style={{ display:'block', fontSize:'10px', color:'var(--text-muted)',
                                   textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'3px' }}>
                      {lbl}
                    </span>
                    <span style={{ fontWeight:700, fontSize:'0.9rem' }}>{val}</span>
                  </div>
                ))}
              </div>
              {selectedProgram.yearLevels?.length > 0 && (
                <div>
                  <h4 style={{ fontSize:'0.875rem', marginBottom:'12px', fontWeight:700 }}>
                    Curriculum Structure
                  </h4>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {selectedProgram.yearLevels.map((level, idx) => (
                      <div key={idx} style={{ background:'rgba(255,255,255,0.04)',
                                              padding:'13px 16px', borderRadius:'10px',
                                              display:'flex', justifyContent:'space-between',
                                              border:'1px solid var(--glass-border)' }}>
                        <span style={{ fontWeight:500, fontSize:'0.875rem' }}>{level.year}</span>
                        <span style={{ color:'var(--secondary-color)', fontSize:'11px', fontWeight:600 }}>
                          {level.subjects?.length} Subjects
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {!isAdminUser && (
                isEnrolled(selectedProgram) ? (
                  <button className="btn-primary btn" style={{ flex:1 }} disabled>
                    ✅ Already Enrolled
                  </button>
                ) : (
                  <button className="btn-primary btn" style={{ flex:1 }}
                    onClick={() => { handleEnroll(selectedProgram); setSelectedProgram(null); }}
                    disabled={enrolling}>
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )
              )}
              {isAdminUser && (
                <button className="btn-primary btn" style={{ flex:1 }}
                  onClick={e => { openEdit(e, selectedProgram); setSelectedProgram(null); }}>
                  ✏️ Edit Program
                </button>
              )}
              <button className="btn btn-secondary" style={{ flex:1 }}
                onClick={() => setSelectedProgram(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add/Edit Form Modal ── */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? 'Edit Program' : 'Add New Program'}</h2>
            </div>
            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>

            <div className="modal-body">
              {formError && (
                <div style={{ background:'rgba(255,68,102,0.1)', border:'1px solid rgba(255,68,102,0.2)',
                              borderRadius:'8px', padding:'10px 14px', marginBottom:'16px',
                              color:'#ff4466', fontSize:'13px' }}>
                  {formError}
                </div>
              )}
              <form onSubmit={handleSaveForm}
                    style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                {[
                  { label:'Program Code', name:'code',     placeholder:'e.g. BSIT',         disabled: editMode },
                  { label:'Full Name',    name:'name',     placeholder:'e.g. Bachelor of...' },
                  { label:'Duration',     name:'duration', placeholder:'e.g. 4 years'        },
                  { label:'Total Units',  name:'totalUnits', placeholder:'e.g. 132', type:'number' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={{ fontSize:'12px', color:'var(--text-muted)', display:'block',
                                    marginBottom:'6px', textTransform:'uppercase' }}>
                      {f.label}
                    </label>
                    <input type={f.type || 'text'} placeholder={f.placeholder}
                      value={form[f.name]}
                      onChange={e => setForm(p => ({...p, [f.name]: e.target.value}))}
                      disabled={f.disabled}
                      style={{ width:'100%', background:'rgba(255,255,255,0.05)',
                               border:'1px solid var(--glass-border)', borderRadius:'10px',
                               padding:'10px 14px', color:'#fff', fontSize:'14px',
                               outline:'none', boxSizing:'border-box',
                               opacity: f.disabled ? 0.5 : 1 }} />
                  </div>
                ))}

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                  <div>
                    <label style={{ fontSize:'12px', color:'var(--text-muted)', display:'block',
                                    marginBottom:'6px', textTransform:'uppercase' }}>Type</label>
                    <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}
                      style={{ width:'100%', background:'rgba(255,255,255,0.05)',
                               border:'1px solid var(--glass-border)', borderRadius:'10px',
                               padding:'10px 14px', color:'#fff', fontSize:'14px', outline:'none' }}>
                      <option value="Bachelor">Bachelor</option>
                      <option value="Master">Master</option>
                      <option value="Diploma">Diploma</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:'12px', color:'var(--text-muted)', display:'block',
                                    marginBottom:'6px', textTransform:'uppercase' }}>Status</label>
                    <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}
                      style={{ width:'100%', background:'rgba(255,255,255,0.05)',
                               border:'1px solid var(--glass-border)', borderRadius:'10px',
                               padding:'10px 14px', color:'#fff', fontSize:'14px', outline:'none' }}>
                      <option value="active">Active</option>
                      <option value="under review">Under Review</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize:'12px', color:'var(--text-muted)', display:'block',
                                  marginBottom:'6px', textTransform:'uppercase' }}>Description</label>
                  <textarea value={form.description}
                    onChange={e => setForm(p => ({...p, description: e.target.value}))}
                    rows={3} placeholder="Program description..."
                    style={{ width:'100%', background:'rgba(255,255,255,0.05)',
                             border:'1px solid var(--glass-border)', borderRadius:'10px',
                             padding:'10px 14px', color:'#fff', fontSize:'14px',
                             outline:'none', resize:'vertical', boxSizing:'border-box' }} />
                </div>

                <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ flex:1, padding:'10px', borderRadius:'10px',
                             border:'1px solid var(--glass-border)', background:'transparent',
                             color:'#fff', cursor:'pointer', fontSize:'14px' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    style={{ flex:1, padding:'10px', borderRadius:'10px',
                             border:'none', background:'var(--primary-color)',
                             color:'#fff', cursor:'pointer', fontSize:'14px', fontWeight:600 }}>
                    {saving ? 'Saving...' : editMode ? 'Save Changes' : 'Add Program'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgramList;