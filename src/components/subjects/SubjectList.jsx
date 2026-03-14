import { useState, useMemo, useContext, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import ConfirmDialog from '../common/ConfirmDialog';
import './SubjectList.css';
import api from '../../services/api';

const EMPTY_FORM = {
  code:'', title:'', units:'', program:'BSIT',
  semester:'First Semester', term:'Semester',
  yearLevel:'1st Year', description:'', prerequisites:''
};

const TERMS = ['Semester','First Term','Second Term','Third Term','Midterm','Finals','Summer'];

function SubjectList() {
  const { isAdminUser, myEnrollment, fetchMyEnrollment,
        subjects: ctxSubjects, setSubjects: setCtxSubjects } = useContext(AppContext);

  const [localSubjects, setLocalSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);

    useEffect(() => {
      api.get('/courses')
        .then(res => {
          // Map API course fields to match component's expected fields
          const mapped = res.data.map(c => ({
            id:          c.id,
            code:        c.course_code,
            title:       c.course_name,
            units:       c.units,
            program:     c.department,
            semester:    c.semester     ?? 'First Semester',
            term:        c.term         ?? 'Semester',
            yearLevel:   c.year_level   ?? '1st Year',
            description: c.description  ?? '',
            prerequisites: [],
          }));
          setLocalSubjects(mapped);
        })
        .catch(() => {})
        .finally(() => setLoadingSubjects(false));
    }, []);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [search,          setSearch]          = useState('');
  const [filterSemester,  setFilterSemester]  = useState('all');
  const [filterProgram,   setFilterProgram]   = useState('all');
  const [filterTerm,      setFilterTerm]      = useState('all');
  const [showForm,  setShowForm]  = useState(false);
  const [editMode,  setEditMode]  = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [confirm,   setConfirm]   = useState(null);
  const [enrollStatus,  setEnrollStatus]  = useState('none');
  const [enrolledCode,  setEnrolledCode]  = useState(null);
  const [enrolledName,  setEnrolledName]  = useState(null);

  useEffect(() => {
    fetchMyEnrollment().then(d => {
      if (d) {
        setEnrollStatus(d.status ?? 'none');
        setEnrolledCode(d.enrollment?.program_code ?? null);
        setEnrolledName(d.enrollment?.program_name ?? null);
      }
    });
  }, []);

  const isStudentEnrolled = !isAdminUser && enrollStatus === 'approved' && enrolledCode;

  // For enrolled students, filter to their program only
  const displaySubjects = useMemo(() => {
    return localSubjects.filter(s => {
      if (isStudentEnrolled) {
        if (s.program !== enrolledCode) return false;
      } else if (!isAdminUser) {
        // not enrolled — show all but can't enlist
      }
      if (!isAdminUser && !isStudentEnrolled) {
        // show all programs filter
      }
      const matchSem  = filterSemester === 'all' || s.semester === filterSemester;
      const matchProg = isStudentEnrolled ? true : (filterProgram === 'all' || s.program === filterProgram);
      const matchTerm = filterTerm === 'all' || (s.term ?? 'Semester') === filterTerm;
      const q = search.toLowerCase();
      const matchSearch = !q || s.code?.toLowerCase().includes(q) || s.title?.toLowerCase().includes(q) || s.program?.toLowerCase().includes(q);
      return matchSem && matchProg && matchTerm && matchSearch;
    });
  }, [localSubjects, search, filterSemester, filterProgram, filterTerm, isStudentEnrolled, enrolledCode]);

  const programs  = ['all', ...new Set(localSubjects.map(s => s.program))];
  const semesters = ['all', ...new Set(localSubjects.map(s => s.semester))];

  const openAdd = () => { setForm(EMPTY_FORM); setEditMode(false); setFormError(''); setShowForm(true); };
  const openEdit = (e, s) => {
    e.stopPropagation();
    setForm({
      code:s.code, title:s.title, units:s.units, program:s.program,
      semester:s.semester, term:s.term||'Semester', yearLevel:s.yearLevel||'1st Year',
      description:s.description||'', prerequisites:s.prerequisites?.join(', ')||'',
    });
    setEditMode(true); setFormError(''); setShowForm(true);
  };
  const handleDelete = (e, subject) => {
  e.stopPropagation();
  setConfirm({
    title: `Delete "${subject.code}"?`,
    message: 'This subject will be permanently removed from the database.',
    onConfirm: async () => {
      try {
        await api.delete(`/courses/${subject.id}`);
        setLocalSubjects(prev => prev.filter(s => s.id !== subject.id));
        if (selectedSubject?.id === subject.id) setSelectedSubject(null);
      } catch { alert('Failed to delete.'); }
      setConfirm(null);
    },
  });
};
  const handleSave = async (e) => {
  e.preventDefault(); setFormError(''); setSaving(true);
  if (!form.code || !form.title) {
    setFormError('Code and title required.'); setSaving(false); return;
  }
  try {
    if (editMode) {
      const existing = localSubjects.find(s => s.code === form.code);
      const res = await api.put(`/courses/${existing.id}`, {
        course_name: form.title,
        department:  form.program,
        units:       Number(form.units),
        description: form.description,
      });
      // Remap response
      const mapped = {
        id: res.data.id, code: res.data.course_code,
        title: res.data.course_name, units: res.data.units,
        program: res.data.department, semester: form.semester,
        term: form.term, yearLevel: form.yearLevel,
        description: res.data.description, prerequisites: [],
      };
      setLocalSubjects(prev => prev.map(s => s.id === mapped.id ? mapped : s));
    } else {
      const res = await api.post('/courses', {
        course_code: form.code,
        course_name: form.title,
        department:  form.program,
        units:       Number(form.units),
        description: form.description,
      });
      const mapped = {
        id: res.data.id, code: res.data.course_code,
        title: res.data.course_name, units: res.data.units,
        program: res.data.department, semester: form.semester,
        term: form.term, yearLevel: form.yearLevel,
        description: res.data.description, prerequisites: [],
      };
      setLocalSubjects(prev => [...prev, mapped]);
    }
    setShowForm(false);
  } catch (err) {
    setFormError(err.response?.data?.message || 'Failed to save subject.');
  } finally { setSaving(false); }
};

  const inputStyle = {
    width:'100%', background:'rgba(255,255,255,0.05)',
    border:'1px solid var(--glass-border)', borderRadius:'10px',
    padding:'10px 14px', color:'#fff', fontSize:'14px',
    outline:'none', boxSizing:'border-box',
  };
  const labelStyle = { fontSize:'12px', color:'var(--text-muted)', display:'block',
                       marginBottom:'6px', textTransform:'uppercase' };

  return (
    <div className="subject-list-container">

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    flexWrap:'wrap', gap:'16px', marginBottom:'28px' }}>
        <div>
          <h1 className="page-title">
            {isStudentEnrolled ? `${enrolledCode} Subject Offerings` : 'Subject Offerings'}
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'6px' }}>
            {isStudentEnrolled
              ? `Browse all available courses from ${enrolledName || enrolledCode}`
              : 'Browse all available courses and subjects'}
          </p>
        </div>
        {isAdminUser && (
          <button onClick={openAdd}
            style={{ display:'flex', alignItems:'center', gap:'8px', background:'var(--primary-color)',
                     border:'none', borderRadius:'10px', padding:'10px 18px',
                     color:'#fff', fontWeight:600, cursor:'pointer', fontSize:'14px' }}>
            <Plus size={16} /> Add Subject
          </button>
        )}
      </div>

      {/* Info banner for unenrolled students */}
      {!isAdminUser && enrollStatus !== 'approved' && (
        <div style={{ background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.2)',
                      borderRadius:'10px', padding:'12px 16px', marginBottom:'20px',
                      fontSize:'13px', color:'var(--secondary-color)' }}>
          ℹ️ You can browse all subjects below. Enroll in a program to start enlisting courses.
        </div>
      )}

      {/* Controls */}
      <div className="controls-row" style={{ marginBottom:'28px' }}>
        <div className="search-bar" style={{ flex:1, minWidth:'220px', maxWidth:'380px' }}>
          <span className="search-bar-icon"><Search size={15} /></span>
          <input className="search-input" type="text" placeholder="Search subjects or code…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {/* Hide program filter for enrolled students */}
        {(isAdminUser || !isStudentEnrolled) && (
          <select className="filter-select" value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
            <option value="all">All Programs</option>
            {programs.filter(p=>p!=='all').map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        )}
        <select className="filter-select" value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
          <option value="all">All Semesters</option>
          {semesters.filter(s=>s!=='all').map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterTerm} onChange={e => setFilterTerm(e.target.value)}>
          <option value="all">All Terms</option>
          {TERMS.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Grid */}
      {displaySubjects.length > 0 ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:'20px' }}>
          {displaySubjects.map(subject => (
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
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px',
                            marginBottom:'14px', padding:'10px 0',
                            borderTop:'1px solid var(--glass-border)', fontSize:'0.8rem' }}>
                <div>
                  <p style={{ color:'var(--secondary-color)', fontSize:'10px', textTransform:'uppercase', marginBottom:'2px' }}>Semester</p>
                  <p style={{ fontWeight:600 }}>{subject.semester}</p>
                </div>
                <div>
                  <p style={{ color:'var(--secondary-color)', fontSize:'10px', textTransform:'uppercase', marginBottom:'2px' }}>Program</p>
                  <p style={{ fontWeight:600 }}>{subject.program}</p>
                </div>
                <div>
                  <p style={{ color:'var(--secondary-color)', fontSize:'10px', textTransform:'uppercase', marginBottom:'2px' }}>Term</p>
                  <p style={{ fontWeight:600 }}>{subject.term || 'Semester'}</p>
                </div>
                <div>
                  <p style={{ color:'var(--secondary-color)', fontSize:'10px', textTransform:'uppercase', marginBottom:'2px' }}>Year</p>
                  <p style={{ fontWeight:600 }}>{subject.yearLevel}</p>
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
              <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginTop:'4px' }}>{selectedSubject.title}</p>
            </div>
            <button className="modal-close" onClick={() => setSelectedSubject(null)}>✕</button>
            <div className="modal-body">
              <div style={{ marginBottom:'20px' }}>
                <h3 style={{ fontSize:'11px', color:'var(--secondary-color)', textTransform:'uppercase', marginBottom:'8px' }}>Description</h3>
                <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', lineHeight:'1.7' }}>
                  {selectedSubject.description || 'No description available.'}
                </p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px',
                            padding:'14px 0', borderTop:'1px solid var(--glass-border)',
                            borderBottom:'1px solid var(--glass-border)', marginBottom:'20px' }}>
                {[['Units',selectedSubject.units],['Year Level',selectedSubject.yearLevel],
                  ['Program',selectedSubject.program],['Semester',selectedSubject.semester],
                  ['Term',selectedSubject.term||'Semester'],
                ].map(([l,v]) => (
                  <div key={l}>
                    <span style={{ display:'block', fontSize:'10px', color:'var(--text-muted)', textTransform:'uppercase', marginBottom:'3px' }}>{l}</span>
                    <span style={{ fontWeight:700, fontSize:'0.9rem' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 style={{ fontSize:'11px', color:'var(--secondary-color)', textTransform:'uppercase', marginBottom:'10px' }}>Prerequisites</h3>
                {selectedSubject.prerequisites?.length > 0 ? (
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                    {selectedSubject.prerequisites.map((p,i) => <span key={i} className="badge badge-info">{p}</span>)}
                  </div>
                ) : <p style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>None</p>}
              </div>
            </div>
            <div className="modal-footer">
              {isAdminUser && (
                <button className="btn-primary btn" style={{ flex:1 }}
                  onClick={() => { openEdit({stopPropagation:()=>{}}, selectedSubject); setSelectedSubject(null); }}>
                  ✏️ Edit Subject
                </button>
              )}
              <button className="submit-btn" onClick={() => setSelectedSubject(null)} style={{ padding:'12px', flex:1 }}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight:'90vh', overflowY:'auto' }}>
            <div className="modal-header"><h2>{editMode ? 'Edit Subject' : 'Add New Subject'}</h2></div>
            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            <div className="modal-body">
              {formError && (
                <div style={{ background:'rgba(255,68,102,0.1)', border:'1px solid rgba(255,68,102,0.2)',
                              borderRadius:'8px', padding:'10px 14px', marginBottom:'16px',
                              color:'#ff4466', fontSize:'13px' }}>
                  {formError}
                </div>
              )}
              <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                  <div>
                    <label style={labelStyle}>Subject Code</label>
                    <input type="text" placeholder="e.g. IT101"
                      value={form.code} onChange={e => setForm(p=>({...p,code:e.target.value}))}
                      disabled={editMode} style={{ ...inputStyle, opacity: editMode ? 0.5 : 1 }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Units</label>
                    <input type="number" placeholder="3"
                      value={form.units} onChange={e => setForm(p=>({...p,units:e.target.value}))}
                      style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Subject Title</label>
                  <input type="text" placeholder="e.g. Introduction to Programming"
                    value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))}
                    style={inputStyle} required />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                  <div>
                    <label style={labelStyle}>Program</label>
                    <select value={form.program} onChange={e => setForm(p=>({...p,program:e.target.value}))} style={inputStyle}>
                      {['BSIT','BSCS','BSIS','DICTE','BSENG'].map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Year Level</label>
                    <select value={form.yearLevel} onChange={e => setForm(p=>({...p,yearLevel:e.target.value}))} style={inputStyle}>
                      {['1st Year','2nd Year','3rd Year','4th Year'].map(y=><option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                  <div>
                    <label style={labelStyle}>Semester</label>
                    <select value={form.semester} onChange={e => setForm(p=>({...p,semester:e.target.value}))} style={inputStyle}>
                      <option value="First Semester">First Semester</option>
                      <option value="Second Semester">Second Semester</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Term</label>
                    <select value={form.term} onChange={e => setForm(p=>({...p,term:e.target.value}))} style={inputStyle}>
                      {TERMS.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))}
                    rows={2} placeholder="Subject description..." style={{ ...inputStyle, resize:'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>Prerequisites (comma separated)</label>
                  <input type="text" placeholder="e.g. IT101, IT102"
                    value={form.prerequisites} onChange={e => setForm(p=>({...p,prerequisites:e.target.value}))}
                    style={inputStyle} />
                </div>
                <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ flex:1, padding:'10px', borderRadius:'10px', border:'1px solid var(--glass-border)',
                             background:'transparent', color:'#fff', cursor:'pointer', fontSize:'14px' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    style={{ flex:1, padding:'10px', borderRadius:'10px', border:'none',
                             background:'var(--primary-color)', color:'#fff', cursor:'pointer', fontSize:'14px', fontWeight:600 }}>
                    {saving ? 'Saving...' : editMode ? 'Save Changes' : 'Add Subject'}
                  </button>
                </div>
              </form>
            </div>
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

export default SubjectList;