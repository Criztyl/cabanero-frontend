import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { subjectsData } from '../data/subjectsData';
import './SubjectList.css';

function SubjectList() {
  const [subjects]              = useState(subjectsData);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [search, setSearch]     = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterProgram, setFilterProgram]   = useState('all');

  const programs  = ['all', ...new Set(subjects.map(s => s.program))];
  const semesters = ['all', ...new Set(subjects.map(s => s.semester))];

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      const matchSem  = filterSemester === 'all' || s.semester === filterSemester;
      const matchProg = filterProgram  === 'all' || s.program  === filterProgram;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.code.toLowerCase().includes(q)  ||
        s.title.toLowerCase().includes(q) ||
        s.program.toLowerCase().includes(q);
      return matchSem && matchProg && matchSearch;
    });
  }, [subjects, search, filterSemester, filterProgram]);

  return (
    <div className="subject-list-container">

      {/* ── PAGE HEADER ──────────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Subject Offerings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
          Browse all available courses and subjects
        </p>
      </div>

      {/* ── CONTROLS ROW ─────────────────────────── */}
      <div className="controls-row" style={{ marginBottom: '28px' }}>

        {/* Search */}
        <div className="search-bar" style={{ flex: 1, minWidth: '220px', maxWidth: '380px' }}>
          <span className="search-bar-icon"><Search size={15} /></span>
          <input
            className="search-input"
            type="text"
            placeholder="Search subjects or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Program filter */}
        <select
          className="filter-select"
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
        >
          <option value="all">All Programs</option>
          {programs.filter(p => p !== 'all').map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Semester filter */}
        <select
          className="filter-select"
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
        >
          <option value="all">All Semesters</option>
          {semesters.filter(s => s !== 'all').map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

      </div>

      {/* ── SUBJECTS GRID ────────────────────────── */}
      <div className="subjects-table">
        {filteredSubjects.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredSubjects.map(subject => (
              <div key={subject.id} className="subject-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '3px' }}>{subject.code}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{subject.title}</p>
                  </div>
                  <span className="badge badge-info">{subject.units} Units</span>
                </div>

                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
                  marginBottom: '14px', padding: '12px 0',
                  borderTop: '1px solid var(--glass-border)', fontSize: '0.8rem'
                }}>
                  <div>
                    <p style={{ color: 'var(--secondary-color)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Semester</p>
                    <p style={{ fontWeight: 600 }}>{subject.semester}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--secondary-color)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Program</p>
                    <p style={{ fontWeight: 600 }}>{subject.program}</p>
                  </div>
                </div>

                <button
                  className="submit-btn"
                  onClick={() => setSelectedSubject(subject)}
                  style={{ padding: '10px' }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-muted)' }}>
            <Search size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p>No subjects match your search</p>
          </div>
        )}
      </div>

      {/* ── MODAL ────────────────────────────────── */}
      {selectedSubject && (
        <div className="modal-overlay" onClick={() => setSelectedSubject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <h2>{selectedSubject.code}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>{selectedSubject.title}</p>
            </div>
            <button className="modal-close" onClick={() => setSelectedSubject(null)}>✕</button>

            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '11px', color: 'var(--secondary-color)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Description</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.7' }}>
                  {selectedSubject.description || 'No description available for this subject.'}
                </p>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px',
                padding: '14px 0', borderTop: '1px solid var(--glass-border)',
                borderBottom: '1px solid var(--glass-border)', marginBottom: '20px'
              }}>
                {[['Units', selectedSubject.units], ['Year Level', selectedSubject.yearLevel],
                  ['Program', selectedSubject.program], ['Semester', selectedSubject.semester]].map(([lbl, val]) => (
                  <div key={lbl}>
                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>{lbl}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{val}</span>
                  </div>
                ))}
              </div>

              <div>
                <h3 style={{ fontSize: '11px', color: 'var(--secondary-color)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>Prerequisites</h3>
                {selectedSubject.prerequisites?.length > 0 ? (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedSubject.prerequisites.map((prereq, i) => (
                      <span key={i} className="badge badge-info">{prereq}</span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>None</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="submit-btn" onClick={() => setSelectedSubject(null)} style={{ padding: '12px' }}>
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default SubjectList;