import { useState, useEffect, useContext } from 'react';
import { Search, Plus, Trash2, X, GraduationCap } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';

const DEPARTMENTS = ['IT','CS','Accountancy','Nursing','Education','Business'];

export default function Students() {
  const { isAdminUser } = useContext(AppContext);

  const [students,   setStudents]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [department, setDepartment] = useState('');
  const [page,       setPage]       = useState(1);
  const [meta,       setMeta]       = useState({});
  const [showModal,  setShowModal]  = useState(false);
  const [deleting,   setDeleting]   = useState(null);
  const [confirm,    setConfirm]    = useState(null);
  const [form,       setForm]       = useState({
    name:'', email:'', student_id:'', department:'', phone:'', gender:'Other', year_level:'1st Year'
  });
  const [formError, setFormError] = useState('');
  const [saving,    setSaving]    = useState(false);

  useEffect(() => { fetchStudents(); }, [search, department, page]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)     params.append('search',     search);
      if (department) params.append('department',  department);
      params.append('page', page);
      const res = await api.get(`/students?${params}`);
      setStudents(res.data.data || []);
      setMeta({ total: res.data.total, lastPage: res.data.last_page });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = (id, name) => {
    setConfirm({
      title:   `Delete ${name}?`,
      message: 'This student record will be permanently removed. This cannot be undone.',
      onConfirm: async () => {
        setDeleting(id);
        try {
          await api.delete(`/students/${id}`);
          setStudents(prev => prev.filter(s => s.id !== id));
          setMeta(prev => ({ ...prev, total: (prev.total ?? 1) - 1 }));
        } catch { alert('Failed to delete student.'); }
        finally { setDeleting(null); setConfirm(null); }
      },
    });
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormError(''); setSaving(true);
    try {
      const res = await api.post('/students', form);
      setStudents(prev => [res.data, ...prev]);
      setMeta(prev => ({ ...prev, total: (prev.total ?? 0) + 1 }));
      setShowModal(false);
      setForm({ name:'', email:'', student_id:'', department:'', phone:'', gender:'Other', year_level:'1st Year' });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add student.');
    } finally { setSaving(false); }
  };

  const inputStyle = {
    width:'100%', background:'rgba(255,255,255,0.05)',
    border:'1px solid var(--glass-border)', borderRadius:'10px',
    padding:'10px 14px', color:'var(--text-main)', fontSize:'14px',
    outline:'none', boxSizing:'border-box',
  };
  const labelStyle = {
    fontSize:'12px', color:'var(--text-muted)', display:'block',
    marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px',
  };

  return (
    <div className="dashboard-wrapper-inner">

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    flexWrap:'wrap', gap:'16px', marginBottom:'28px' }}>
        <div>
          <h1 style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:800, margin:0,
                       color:'var(--text-main)' }}>
            Student Management
          </h1>
          <p style={{ color:'var(--text-muted)', marginTop:'5px', fontSize:'14px' }}>
            {meta.total ?? '...'} student records
          </p>
        </div>
        {isAdminUser && (
          <button onClick={() => setShowModal(true)}
            style={{ display:'flex', alignItems:'center', gap:'8px',
                     background:'var(--primary-color)', border:'none',
                     borderRadius:'10px', padding:'10px 18px',
                     color:'#fff', fontWeight:600, cursor:'pointer', fontSize:'14px' }}>
            <Plus size={16} /> Add Student
          </button>
        )}
      </div>

      {/* ── Filters ── */}
      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'20px' }}>
        <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
          <Search size={15} style={{ position:'absolute', left:'14px', top:'50%',
                                     transform:'translateY(-50%)',
                                     color:'var(--text-muted)', pointerEvents:'none' }} />
          <input
            type="text"
            placeholder="Search name, email, student ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ ...inputStyle, paddingLeft:'40px' }}
          />
        </div>
        <select
          value={department}
          onChange={e => { setDepartment(e.target.value); setPage(1); }}
          style={{ ...inputStyle, width:'auto', minWidth:'160px', cursor:'pointer' }}
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="program-card" style={{ padding:0, overflow:'hidden', cursor:'default' }}>
        {loading ? <LoadingSpinner text="Loading students..." /> : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--glass-border)' }}>
                  {['Student ID','Name','Email','Department','Year Level','Gender','Actions'].map(h => (
                    <th key={h} style={{
                      padding:'14px 16px', textAlign:'left',
                      fontSize:'11px', color:'var(--text-muted)',
                      textTransform:'uppercase', letterSpacing:'1px',
                      fontWeight:600, whiteSpace:'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding:'48px', textAlign:'center',
                                             color:'var(--text-muted)' }}>
                      No students found.
                    </td>
                  </tr>
                ) : students.map(s => (
                  <tr
                    key={s.id}
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.04)',
                             transition:'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    {/* Student ID */}
                    <td style={{ padding:'14px 16px', fontSize:'13px',
                                 color:'var(--secondary-color)', fontWeight:600 }}>
                      {s.student_id || '—'}
                    </td>

                    {/* Name */}
                    <td style={{ padding:'14px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{
                          width:'36px', height:'36px', borderRadius:'50%',
                          background:'var(--primary-color)', display:'flex',
                          alignItems:'center', justifyContent:'center',
                          fontSize:'14px', fontWeight:700, flexShrink:0, color:'#fff',
                        }}>
                          {(s.first_name || s.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize:'14px', fontWeight:500,
                                      color:'var(--text-main)', margin:0 }}>
                            {s.first_name
                              ? `${s.first_name} ${s.last_name}`
                              : (s.name || '—')}
                          </p>
                          {s.year_level && (
                            <p style={{ fontSize:'11px', color:'var(--text-muted)', margin:0 }}>
                              {s.year_level}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding:'14px 16px', fontSize:'13px',
                                 color:'var(--text-muted)' }}>
                      {s.email}
                    </td>

                    {/* Department */}
                    <td style={{ padding:'14px 16px' }}>
                      {s.department ? (
                        <span style={{
                          background:'rgba(0,212,255,0.1)', color:'var(--secondary-color)',
                          padding:'3px 10px', borderRadius:'20px',
                          fontSize:'12px', fontWeight:600,
                        }}>
                          {s.department}
                        </span>
                      ) : '—'}
                    </td>

                    {/* Year Level */}
                    <td style={{ padding:'14px 16px', fontSize:'13px',
                                 color:'var(--text-muted)' }}>
                      {s.year_level || '—'}
                    </td>

                    {/* Gender */}
                    <td style={{ padding:'14px 16px', fontSize:'13px',
                                 color:'var(--text-muted)' }}>
                      {s.gender || '—'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding:'14px 16px' }}>
                      {isAdminUser && (
                        <button
                          onClick={() => handleDelete(
                            s.id,
                            s.first_name ? `${s.first_name} ${s.last_name}` : s.name
                          )}
                          disabled={deleting === s.id}
                          style={{
                            background:'rgba(255,68,102,0.1)',
                            border:'1px solid rgba(255,68,102,0.2)',
                            borderRadius:'8px', padding:'6px 12px', cursor:'pointer',
                            color:'#ff4466', display:'flex', alignItems:'center',
                            gap:'6px', fontSize:'12px', fontWeight:600,
                          }}
                        >
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

        {/* ── Pagination ── */}
        {meta.lastPage > 1 && (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center',
                        gap:'8px', padding:'16px',
                        borderTop:'1px solid var(--glass-border)' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding:'6px 14px', borderRadius:'8px',
                border:'1px solid var(--glass-border)', background:'transparent',
                color: page === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                cursor: page === 1 ? 'default' : 'pointer', fontSize:'13px',
              }}
            >
              ← Prev
            </button>
            <span style={{ fontSize:'13px', color:'var(--text-muted)' }}>
              Page {page} of {meta.lastPage}
            </span>
            <button
              onClick={() => setPage(p => Math.min(meta.lastPage, p + 1))}
              disabled={page === meta.lastPage}
              style={{
                padding:'6px 14px', borderRadius:'8px',
                border:'1px solid var(--glass-border)', background:'transparent',
                color: page === meta.lastPage ? 'var(--text-muted)' : 'var(--text-main)',
                cursor: page === meta.lastPage ? 'default' : 'pointer', fontSize:'13px',
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Add Student Modal ── */}
      {showModal && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
          backdropFilter:'blur(8px)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000,
        }}>
          <div style={{
            background:'var(--bg-panel)', border:'1px solid var(--glass-border)',
            borderRadius:'20px', padding:'32px', width:'90%', maxWidth:'520px',
            maxHeight:'90vh', overflowY:'auto',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between',
                          alignItems:'center', marginBottom:'24px' }}>
              <h3 style={{ fontSize:'18px', fontWeight:700, color:'var(--text-main)' }}>
                Add New Student
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background:'transparent', border:'none',
                         color:'var(--text-muted)', cursor:'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{
                background:'rgba(255,68,102,0.1)', border:'1px solid rgba(255,68,102,0.2)',
                borderRadius:'8px', padding:'10px 14px', marginBottom:'16px',
                fontSize:'13px', color:'#ff4466',
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleAddStudent}
                  style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>

              {/* Full Name — full width */}
              <div style={{ gridColumn:'1 / -1' }}>
                <label style={labelStyle}>Full Name *</label>
                <input
                  type="text" placeholder="Juan Dela Cruz"
                  value={form.name}
                  onChange={e => setForm(p => ({...p, name: e.target.value}))}
                  style={inputStyle} required
                />
              </div>

              {/* Email — full width */}
              <div style={{ gridColumn:'1 / -1' }}>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email" placeholder="juan@school.edu"
                  value={form.email}
                  onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  style={inputStyle} required
                />
              </div>

              {/* Student ID */}
              <div>
                <label style={labelStyle}>Student ID</label>
                <input
                  type="text" placeholder="STU-00001"
                  value={form.student_id}
                  onChange={e => setForm(p => ({...p, student_id: e.target.value}))}
                  style={inputStyle}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  type="text" placeholder="+63 9xx xxx xxxx"
                  value={form.phone}
                  onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                  style={inputStyle}
                />
              </div>

              {/* Department */}
              <div>
                <label style={labelStyle}>Department</label>
                <select
                  value={form.department}
                  onChange={e => setForm(p => ({...p, department: e.target.value}))}
                  style={inputStyle}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Year Level */}
              <div>
                <label style={labelStyle}>Year Level</label>
                <select
                  value={form.year_level}
                  onChange={e => setForm(p => ({...p, year_level: e.target.value}))}
                  style={inputStyle}
                >
                  {['1st Year','2nd Year','3rd Year','4th Year'].map(y =>
                    <option key={y} value={y}>{y}</option>
                  )}
                </select>
              </div>

              {/* Gender */}
              <div style={{ gridColumn:'1 / -1' }}>
                <label style={labelStyle}>Gender</label>
                <select
                  value={form.gender}
                  onChange={e => setForm(p => ({...p, gender: e.target.value}))}
                  style={inputStyle}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Buttons — full width */}
              <div style={{ gridColumn:'1 / -1', display:'flex', gap:'12px', marginTop:'8px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex:1, padding:'10px', borderRadius:'10px',
                    border:'1px solid var(--glass-border)', background:'transparent',
                    color:'var(--text-main)', cursor:'pointer', fontSize:'14px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex:1, padding:'10px', borderRadius:'10px', border:'none',
                    background:'var(--primary-color)', color:'#fff',
                    cursor:'pointer', fontSize:'14px', fontWeight:600,
                  }}
                >
                  {saving ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Dialog ── */}
      <ConfirmDialog
        isOpen={!!confirm}
        title={confirm?.title ?? 'Are you sure?'}
        message={confirm?.message ?? ''}
        confirmLabel="Delete"
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}