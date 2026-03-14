import { useState, useEffect, useContext } from 'react';
import { Users, Search, Plus, Trash2, X, GraduationCap } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const DEPARTMENTS = ['IT', 'CS', 'Accountancy', 'Nursing', 'Education', 'Business'];

export default function Students() {
  const { isAdminUser } = useContext(AppContext);  // ← was isAdmin, now isAdminUser
  const [students,   setStudents]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [department, setDepartment] = useState('');
  const [page,       setPage]       = useState(1);
  const [meta,       setMeta]       = useState({});
  const [showModal,  setShowModal]  = useState(false);
  const [deleting,   setDeleting]   = useState(null);
  const [form,       setForm]       = useState({
    name:'', email:'', password:'', student_id:'', department:'', phone:''
  });
  const [formError, setFormError] = useState('');
  const [saving,    setSaving]    = useState(false);

  useEffect(() => { fetchStudents(); }, [search, department, page]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)     params.append('search', search);
      if (department) params.append('department', department);
      params.append('page', page);
      const res = await api.get(`/students?${params}`);
      setStudents(res.data.data || []);
      setMeta({ total: res.data.total, lastPage: res.data.last_page });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/students/${id}`);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch { alert('Failed to delete student.'); }
    finally { setDeleting(null); }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormError(''); setSaving(true);
    try {
      const res = await api.post('/students', form);
      setStudents(prev => [res.data, ...prev]);
      setShowModal(false);
      setForm({ name:'', email:'', password:'', student_id:'', department:'', phone:'' });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add student.');
    } finally { setSaving(false); }
  };

  return (
    <div className="dashboard-wrapper-inner">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    flexWrap:'wrap', gap:'16px', marginBottom:'28px' }}>
        <div>
          <h1 style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:800, margin:0 }}>
            Student Management
          </h1>
          <p style={{ color:'var(--text-muted)', marginTop:'5px', fontSize:'14px' }}>
            {meta.total ?? '...'} enrolled students
          </p>
        </div>
        {isAdminUser && (  // ← changed from isAdmin()
          <button onClick={() => setShowModal(true)}
            style={{ display:'flex', alignItems:'center', gap:'8px',
                     background:'var(--primary-color)', border:'none',
                     borderRadius:'10px', padding:'10px 18px',
                     color:'#fff', fontWeight:600, cursor:'pointer', fontSize:'14px' }}>
            <Plus size={16} /> Add Student
          </button>
        )}
      </div>

      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'20px' }}>
        <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
          <Search size={15} style={{ position:'absolute', left:'14px', top:'50%',
                                     transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input type="text" placeholder="Search name, email, student ID..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ width:'100%', background:'rgba(255,255,255,0.05)',
                     border:'1px solid var(--glass-border)', borderRadius:'10px',
                     padding:'10px 14px 10px 40px', color:'#fff', fontSize:'14px',
                     outline:'none', boxSizing:'border-box' }} />
        </div>
        <select value={department} onChange={e => { setDepartment(e.target.value); setPage(1); }}
          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid var(--glass-border)',
                   borderRadius:'10px', padding:'10px 14px', color:'#fff',
                   fontSize:'14px', outline:'none', cursor:'pointer' }}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="program-card" style={{ padding:0, overflow:'hidden' }}>
        {loading ? <LoadingSpinner text="Loading students..." /> : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--glass-border)' }}>
                  {['Student ID','Name','Email','Department','Program Enrolled','Actions'].map(h => (
                    <th key={h} style={{ padding:'14px 16px', textAlign:'left',
                                        fontSize:'11px', color:'var(--text-muted)',
                                        textTransform:'uppercase', letterSpacing:'1px',
                                        fontWeight:600, whiteSpace:'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding:'40px', textAlign:'center',
                                               color:'var(--text-muted)' }}>
                    No students found.
                  </td></tr>
                ) : students.map(s => (
                  <tr key={s.id}
                      style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'14px 16px', fontSize:'13px',
                                 color:'var(--secondary-color)', fontWeight:600 }}>
                      {s.student_id || '—'}
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'34px', height:'34px', borderRadius:'50%',
                                      background:'var(--primary-color)', display:'flex',
                                      alignItems:'center', justifyContent:'center',
                                      fontSize:'13px', fontWeight:700, flexShrink:0 }}>
                          {s.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize:'14px', fontWeight:500 }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'14px 16px', fontSize:'13px',
                                 color:'var(--text-muted)' }}>{s.email}</td>
                    <td style={{ padding:'14px 16px' }}>
                      <span style={{ background:'rgba(0,212,255,0.1)', color:'var(--secondary-color)',
                                     padding:'3px 10px', borderRadius:'20px',
                                     fontSize:'12px', fontWeight:600 }}>
                        {s.department || '—'}
                      </span>
                    </td>
                    <td style={{ padding:'14px 16px', fontSize:'13px', color:'var(--text-muted)' }}>
                      {s.enrollments?.[0]?.program_code
                        ? <span style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                            <GraduationCap size={14} color="var(--primary-color)" />
                            {s.enrollments[0].program_code}
                          </span>
                        : 'Not enrolled'}
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      {isAdminUser && (  // ← changed from isAdmin()
                        <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id}
                          style={{ background:'rgba(255,68,102,0.1)',
                                   border:'1px solid rgba(255,68,102,0.2)',
                                   borderRadius:'8px', padding:'6px 10px', cursor:'pointer',
                                   color:'#ff4466', display:'flex', alignItems:'center',
                                   gap:'6px', fontSize:'12px' }}>
                          <Trash2 size={13} />
                          {deleting === s.id ? '...' : 'Delete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.lastPage > 1 && (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center',
                        gap:'8px', padding:'16px', borderTop:'1px solid var(--glass-border)' }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              style={{ padding:'6px 14px', borderRadius:'8px',
                       border:'1px solid var(--glass-border)', background:'transparent',
                       color: page===1 ? 'var(--text-muted)' : '#fff',
                       cursor: page===1 ? 'default' : 'pointer', fontSize:'13px' }}>
              ← Prev
            </button>
            <span style={{ fontSize:'13px', color:'var(--text-muted)' }}>
              Page {page} of {meta.lastPage}
            </span>
            <button onClick={() => setPage(p => Math.min(meta.lastPage, p+1))}
              disabled={page===meta.lastPage}
              style={{ padding:'6px 14px', borderRadius:'8px',
                       border:'1px solid var(--glass-border)', background:'transparent',
                       color: page===meta.lastPage ? 'var(--text-muted)' : '#fff',
                       cursor: page===meta.lastPage ? 'default' : 'pointer', fontSize:'13px' }}>
              Next →
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
                      display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'var(--bg-panel)', border:'1px solid var(--glass-border)',
                        borderRadius:'16px', padding:'32px', width:'90%', maxWidth:'480px',
                        maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between',
                          alignItems:'center', marginBottom:'24px' }}>
              <h3 style={{ fontSize:'18px', fontWeight:700 }}>Add New Student</h3>
              <button onClick={() => setShowModal(false)}
                style={{ background:'transparent', border:'none',
                         color:'var(--text-muted)', cursor:'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ background:'rgba(255,68,102,0.1)', border:'1px solid rgba(255,68,102,0.2)',
                            borderRadius:'8px', padding:'10px 14px', marginBottom:'16px',
                            fontSize:'13px', color:'#ff4466' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleAddStudent}
                  style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {[
                { label:'Full Name',  name:'name',       type:'text',     placeholder:'Juan Dela Cruz' },
                { label:'Email',      name:'email',      type:'email',    placeholder:'juan@school.edu' },
                { label:'Password',   name:'password',   type:'password', placeholder:'••••••••' },
                { label:'Student ID', name:'student_id', type:'text',     placeholder:'STU-00001' },
                { label:'Phone',      name:'phone',      type:'text',     placeholder:'+63 9xx xxx xxxx' },
              ].map(f => (
                <div key={f.name} className="form-group" style={{ margin:0 }}>
                  <label style={{ fontSize:'12px', color:'var(--text-muted)', display:'block',
                                  marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                    {f.label}
                  </label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={e => setForm(p => ({...p, [f.name]: e.target.value}))}
                    required={['name','email','password'].includes(f.name)}
                    style={{ width:'100%', boxSizing:'border-box' }} />
                </div>
              ))}
              <div className="form-group" style={{ margin:0 }}>
                <label style={{ fontSize:'12px', color:'var(--text-muted)', display:'block',
                                marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                  Department
                </label>
                <select value={form.department}
                  onChange={e => setForm(p => ({...p, department: e.target.value}))}
                  style={{ width:'100%' }}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ flex:1, padding:'10px', borderRadius:'10px',
                           border:'1px solid var(--glass-border)', background:'transparent',
                           color:'#fff', cursor:'pointer', fontSize:'14px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ flex:1, padding:'10px', borderRadius:'10px', border:'none',
                           background:'var(--primary-color)', color:'#fff',
                           cursor:'pointer', fontSize:'14px', fontWeight:600 }}>
                  {saving ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}