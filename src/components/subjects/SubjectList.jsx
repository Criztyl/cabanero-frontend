import { useState, useMemo, useContext } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { subjectsData } from '../../data/subjectsData';
import { AppContext } from '../../context/AppContext';
import './SubjectList.css';

const EMPTY_FORM = {
  code:'', title:'', units:'', program:'BSIT',
  semester:'First Semester', yearLevel:'1st Year', description:'', prerequisites:''
};

function SubjectList() {
  const { isAdminUser } = useContext(AppContext);

  const [localSubjects, setLocalSubjects] = useState(subjectsData);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [search,          setSearch]          = useState('');
  const [filterSemester,  setFilterSemester]  = useState('all');
  const [filterProgram,   setFilterProgram]   = useState('all');

  const [showForm,  setShowForm]  = useState(false);
  const [editMode,  setEditMode]  = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving,    setSaving]    = useState(false);

  const programs  = ['all', ...new Set(localSubjects.map(s => s.program))];
  const semesters = ['all', ...new Set(localSubjects.map(s => s.semester))];

  const filteredSubjects = useMemo(() => {
    return localSubjects.filter(s => {
      const matchSem  = filterSemester === 'all' || s.semester === filterSemester;
      const matchProg = filterProgram  === 'all' || s.program  === filterProgram;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        s.code?.toLowerCase().includes(q)  ||
        s.title?.toLowerCase().includes(q) ||
        s.program?.toLowerCase().includes(q);
      return matchSem && matchProg && matchSearch;
    });
  }, [localSubjects, search, filterSemester, filterProgram]);

  const openAdd = () => {
    setForm(EMPTY_FORM); setEditMode(false); setFormError(''); setShowForm(true);
  };

  const openEdit = (e, subject) => {
    e.stopPropagation();
    setForm({
      code:         subject.code,
      title:        subject.title,
      units:        subject.units,
      program:      subject.program,
      semester:     subject.semester,
      yearLevel:    subject.yearLevel || '1st Year',
      description:  subject.description || '',
      prerequisites: subject.prerequisites?.join(', ') || '',
    });
    setEditMode(true); setFormError(''); setShowForm(true);
  };

  const handleDelete = (e, subject) => {
    e.stopPropagation();
    if (!window.confirm(`Delete subject "${subject.code}"?`)) return;
    setLocalSubjects(prev => prev.filter(s => s.id !== subject.id));
    if (selectedSubject?.id === subject.id) setSelectedSubject(null);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    setFormError(''); setSaving(true);
    if (!form.code || !form.title) {
      setFormError('Code and title are required.'); setSaving(false); return;
    }
    setTimeout(() => {
      const processed = {
        ...form,
        units: Number(form.units),
        prerequisites: form.prerequisites
          ? form.prerequisites.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      };
      if (editMode) {
        setLocalSubjects(prev => prev.map(s =>
          s.code === form.code ? { ...s, ...processed } : s
        ));
      } else {
        setLocalSubjects(prev => [{ id: Date.now(), ...processed }, ...prev]);
      }
      setShowForm(false); setSaving(false);
    }, 400);
  };

  const inputStyle = {
    width:'100%', background:'rgba(255,255,255,0.05)',
    border:'1px solid var(--glass-border)', borderRadius:'10px',
    padding:'10px 14px', color:'#fff', fontSize:'14px',
    outline:'none', boxSizing:'border-box',
  };
  const labelStyle = {
    fontSize:'12px', color:'var(--text-muted)', display:'block',
    marginBottom:'6px', textTransform:'uppercase',
  };

  return (
    <div className="subject-list-container">

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center', flexWrap:'wrap', gap:'16px', marginBottom:'28px' }}>
        <div>
          <h1 className="page-title">Subject Offerings</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'6px' }}>
            Browse all available courses and subjects
          </p>
        </div>
        {isAdminUser && (
          <button onClick={openAdd}
            style={{ display:'flex', alignItems:'center', gap:'8px',
                     background:'var(--primary-color)', border:'none',
                     borderRadius:'10px', padding:'10px 18px',
                     color:'#fff', fontWeight:600, cursor:'pointer', fontSize:'14px' }}>
            <Plus size={16} /> Add Subject
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="controls-row" style={{ marginBottom:'28px' }}>
        <div className="search-bar" style={{ flex:1, minWidth:'220px', maxWidth:'380px' }}>
          <span className="search-bar-icon"><Search size={15} /></span>
          <input className="search-input" type="text" placeholder="Search subjects or code…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterProgram}
          onChange={e => setFilterProgram(e.target.value)}>
          <option value="all">All Programs</option>
          {programs.filter(p => p !== 'all').map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="filter-select" value={filterSemester}
          onChange={e => setFilterSemester(e.target.value)}>
          <option value="all">All Semesters</option>
          {semesters.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Grid */}
      {filteredSubjects.length > 0 ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:'20px' }}>
          {filteredSubjects.map(subject => (
            <div key={subject.id} className="subject-card">
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
                <div>
                  <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'3px' }}>{subject.code}</h3>
                  <p style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{subject.title}</p>
                </div>
                <div style={{ display:'flex', alignItems:'flex-start', gap:'6px' }}>
                  <span className="badge badge-info">{subject.units} Units</span>
                  {isAdminUser && (
                    <>
                      <button onClick={e => openEdit(e, subject)}
                        style={{ background:'rgba(0,212,255,0.1)', border:'1px solid rgba(0,212,255,0.2)',
                                 borderRadius:'6px', padding:'4px 7px', cursor:'pointer',
                                 color:'#00d4ff', display:'flex', alignItems:'center' }}>
                        <Pencil size={12} />
                      </button>
                      <button onClick={e => handleDelete(e, subject)}
                        style={{ background:'rgba(255,68,102,0.1)', border:'1px solid rgba(255,68,102,0.2)',
                                 borderRadius:'6px', padding:'4px 7px', cursor:'pointer',
                                 color:'#ff4466', display:'flex', alignItems:'center' }}>
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px',
                            marginBottom:'14px', padding:'12px 0',
                            borderTop:'1px solid var(--glass-border)', fontSize:'0.8rem' }}>
                <div>
                  <p style={{ color:'var(--secondary-color)', fontSize:'10px',
                              textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'3px' }}>
                    Semester
                  </p>
                  <p style={{ fontWeight:600 }}>{subject.semester}</p>
                </div>
                <div>
                  <p style={{ color:'var(--secondary-color)', fontSize:'10px',
                              textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'3px' }}>
                    Program
                  </p>
                  <p style={{ fontWeight:600 }}>{subject.program}</p>
                </div>
              </div>

              <button className="submit-btn" onClick={() => setSelectedSubject(subject)}
                style={{ padding:'10px', width:'100%' }}>
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign:'center', padding:'64px 20px', color:'var(--text-muted)' }}>
          <Search size={32} style={{ marginBottom:'12px', opacity:0.3 }} />
          <p>No subjects match your search</p>
        </div>
      )}

      {/* View Details Modal */}
      {selectedSubject && (
        <div className="modal-overlay" onClick={() => setSelectedSubject(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedSubject.code}</h2>
              <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginTop:'4px' }}>
                {selectedSubject.title}
              </p>
            </div>
            <button className="modal-close" onClick={() => setSelectedSubject(null)}>✕</button>
            <div className="modal-body">
              <div style={{ marginBottom:'20px' }}>
                <h3 style={{ fontSize:'11px', color:'var(--secondary-color)',
                             textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'8px' }}>
                  Description
                </h3>
                <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', lineHeight:'1.7' }}>
                  {selectedSubject.description || 'No description available.'}
                </p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px',
                            padding:'14px 0', borderTop:'1px solid var(--glass-border)',
                            borderBottom:'1px solid var(--glass-border)', marginBottom:'20px' }}>
                {[['Units', selectedSubject.units], ['Year Level', selectedSubject.yearLevel],
                  ['Program', selectedSubject.program], ['Semester', selectedSubject.semester]
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
              <div>
                <h3 style={{ fontSize:'11px', color:'var(--secondary-color)',
                             textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'10px' }}>
                  Prerequisites
                </h3>
                {selectedSubject.prerequisites?.length > 0 ? (
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                    {selectedSubject.prerequisites.map((p, i) => (
                      <span key={i} className="badge badge-info">{p}</span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>None</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {isAdminUser && (
                <button className="btn-primary btn" style={{ flex:1 }}
                  onClick={() => { openEdit({ stopPropagation:()=>{} }, selectedSubject); setSelectedSubject(null); }}>
                  ✏️ Edit Subject
                </button>
              )}
              <button className="submit-btn" onClick={() => setSelectedSubject(null)}
                style={{ padding:'12px', flex:1 }}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}
               style={{ maxHeight:'90vh', overflowY:'auto' }}>
            <div className="modal-header">
              <h2>{editMode ? 'Edit Subject' : 'Add New Subject'}</h2>
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
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                  {[
                    { label:'Subject Code', name:'code',  placeholder:'e.g. IT101', disabled: editMode },
                    { label:'Units',        name:'units', placeholder:'3', type:'number' },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={labelStyle}>{f.label}</label>
                      <input type={f.type || 'text'} placeholder={f.placeholder}
                        value={form[f.name]}
                        onChange={e => setForm(p => ({...p, [f.name]: e.target.value}))}
                        disabled={f.disabled} style={{ ...inputStyle, opacity: f.disabled ? 0.5 : 1 }} />
                    </div>
                  ))}
                </div>

                <div>
                  <label style={labelStyle}>Subject Title</label>
                  <input type="text" placeholder="e.g. Introduction to Programming"
                    value={form.title}
                    onChange={e => setForm(p => ({...p, title: e.target.value}))}
                    style={inputStyle} required />
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                  <div>
                    <label style={labelStyle}>Program</label>
                    <select value={form.program}
                      onChange={e => setForm(p => ({...p, program: e.target.value}))}
                      style={inputStyle}>
                      {['BSIT','BSCS','BSIS','DICTE','BSENG'].map(p =>
                        <option key={p} value={p}>{p}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Year Level</label>
                    <select value={form.yearLevel}
                      onChange={e => setForm(p => ({...p, yearLevel: e.target.value}))}
                      style={inputStyle}>
                      {['1st Year','2nd Year','3rd Year','4th Year'].map(y =>
                        <option key={y} value={y}>{y}</option>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Semester</label>
                  <select value={form.semester}
                    onChange={e => setForm(p => ({...p, semester: e.target.value}))}
                    style={inputStyle}>
                    <option value="First Semester">First Semester</option>
                    <option value="Second Semester">Second Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={form.description}
                    onChange={e => setForm(p => ({...p, description: e.target.value}))}
                    rows={2} placeholder="Subject description..."
                    style={{ ...inputStyle, resize:'vertical' }} />
                </div>

                <div>
                  <label style={labelStyle}>Prerequisites (comma separated)</label>
                  <input type="text" placeholder="e.g. IT101, IT102"
                    value={form.prerequisites}
                    onChange={e => setForm(p => ({...p, prerequisites: e.target.value}))}
                    style={inputStyle} />
                </div>

                <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ flex:1, padding:'10px', borderRadius:'10px',
                             border:'1px solid var(--glass-border)', background:'transparent',
                             color:'#fff', cursor:'pointer', fontSize:'14px' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    style={{ flex:1, padding:'10px', borderRadius:'10px', border:'none',
                             background:'var(--primary-color)', color:'#fff',
                             cursor:'pointer', fontSize:'14px', fontWeight:600 }}>
                    {saving ? 'Saving...' : editMode ? 'Save Changes' : 'Add Subject'}
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

export default SubjectList;