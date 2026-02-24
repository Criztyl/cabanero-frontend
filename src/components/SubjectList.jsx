import { useState } from 'react';
import { subjectsData } from '../data/subjectsData';
import './SubjectList.css';

function SubjectList() {
  const [subjects] = useState(subjectsData);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');

  // Get unique programs and semesters
  const programs = ['all', ...new Set(subjects.map(s => s.program))];
  const semesters = ['all', ...new Set(subjects.map(s => s.semester))];

  // Filter subjects logic
  const filteredSubjects = subjects.filter(s => {
    const semesterMatch = filterSemester === 'all' || s.semester === filterSemester;
    const programMatch = filterProgram === 'all' || s.program === filterProgram;
    return semesterMatch && programMatch;
  });

  return (
    <div className="subject-list-container">
      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '5px' }}>Subject Offerings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Browse all available courses and subjects</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Programs</option>
            {programs.filter(p => p !== 'all').map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Semesters</option>
            {semesters.filter(s => s !== 'all').map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subjects Grid/Table */}
      <div className="subjects-table">
        {filteredSubjects.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredSubjects.map(subject => (
              <div key={subject.id} className="subject-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{subject.code}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{subject.title}</p>
                  </div>
                  <span className="badge badge-info">{subject.units} Units</span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '15px',
                  padding: '12px 0',
                  borderTop: '1px solid var(--glass-border)',
                  fontSize: '12px'
                }}>
                  <div>
                    <p style={{ color: 'var(--secondary-color)' }}>Semester</p>
                    <p style={{ fontWeight: 600 }}>{subject.semester}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--secondary-color)' }}>Program</p>
                    <p style={{ fontWeight: 600 }}>{subject.program}</p>
                  </div>
                </div>

                <button
                  className="submit-btn"
                  onClick={() => setSelectedSubject(subject)}
                  style={{ width: '100%', padding: '10px' }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <p>No subjects found matching your filters</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedSubject && (
        <div className="modal-overlay" onClick={() => setSelectedSubject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <div>
                <h2>{selectedSubject.code}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{selectedSubject.title}</p>
              </div>
              <button className="modal-close" onClick={() => setSelectedSubject(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', color: 'var(--secondary-color)', marginBottom: '8px' }}>Description</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                  {selectedSubject.description || "No description available for this subject."}
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '15px',
                padding: '15px 0',
                borderTop: '1px solid var(--glass-border)',
                borderBottom: '1px solid var(--glass-border)',
                marginBottom: '20px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--secondary-color)' }}>UNITS</span>
                  <p style={{ fontWeight: 600 }}>{selectedSubject.units}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--secondary-color)' }}>YEAR LEVEL</span>
                  <p style={{ fontWeight: 600 }}>{selectedSubject.yearLevel}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--secondary-color)' }}>PROGRAM</span>
                  <p style={{ fontWeight: 600 }}>{selectedSubject.program}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--secondary-color)' }}>SEMESTER</span>
                  <p style={{ fontWeight: 600 }}>{selectedSubject.semester}</p>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ fontSize: '14px', color: 'var(--secondary-color)', marginBottom: '10px' }}>Prerequisites</h3>
                {selectedSubject.prerequisites && selectedSubject.prerequisites.length > 0 ? (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedSubject.prerequisites.map((prereq, index) => (
                      <span key={index} className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        {prereq}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>None</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="submit-btn" onClick={() => setSelectedSubject(null)} style={{ width: '100%' }}>
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