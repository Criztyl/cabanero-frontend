import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { programsData } from '../data/programsData';
import './ProgramList.css';

function ProgramList() {
  const [programs]          = useState(programsData);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchStatus = filter === 'all' || p.status === filter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.code.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [programs, filter, search]);

  return (
    <div className="program-list-container">

      {/* ── PAGE HEADER ──────────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Program Offerings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
          Browse all available degree programs
        </p>
      </div>

      {/* ── CONTROLS ROW ─────────────────────────── */}
      <div className="controls-row" style={{ marginBottom: '28px' }}>

        {/* Search bar */}
        <div className="search-bar" style={{ flex: 1, minWidth: '220px', maxWidth: '400px' }}>
          <span className="search-bar-icon"><Search size={15} /></span>
          <input
            className="search-input"
            type="text"
            placeholder="Search programs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter — dropdown */}
        <select
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="under review">Under Review</option>
        </select>

      </div>

      {/* ── PROGRAMS GRID ────────────────────────── */}
      {filteredPrograms.length > 0 ? (
        <div className="programs-grid">
          {filteredPrograms.map(program => (
            <div
              key={program.id}
              className="program-card"
              onClick={() => setSelectedProgram(program)}
            >
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <h3 className="card-title">{program.code}</h3>
                  <p className="card-subtitle">{program.type}</p>
                </div>
                <span className={`badge ${program.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                  {program.status}
                </span>
              </div>

              {/* Description */}
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '18px', lineHeight: '1.6', flex: 1 }}>
                {program.description?.substring(0, 90)}…
              </p>

              {/* Info grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
                marginBottom: '18px', paddingTop: '14px', borderTop: '1px solid var(--glass-border)'
              }}>
                <div>
                  <p style={{ color: 'var(--secondary-color)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Duration</p>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{program.duration}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--secondary-color)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Units</p>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{program.totalUnits}</p>
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={(e) => { e.stopPropagation(); setSelectedProgram(program); }}
                style={{ width: '100%' }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-muted)' }}>
          <Search size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p>No programs match your search</p>
        </div>
      )}

      {/* ── MODAL ────────────────────────────────── */}
      {selectedProgram && (
        <div className="modal-overlay" onClick={() => setSelectedProgram(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <h2>{selectedProgram.code}</h2>
              <p className="card-subtitle" style={{ marginTop: '4px' }}>{selectedProgram.name}</p>
            </div>
            <button className="modal-close" onClick={() => setSelectedProgram(null)}>✕</button>

            <div className="modal-body">
              <span className={`badge ${selectedProgram.status === 'active' ? 'badge-success' : 'badge-warning'}`}
                style={{ marginBottom: '18px', display: 'inline-block' }}>
                {selectedProgram.status.toUpperCase()}
              </span>

              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ color: 'var(--secondary-color)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Description</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.7' }}>{selectedProgram.description}</p>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px',
                padding: '18px 0', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', marginBottom: '22px'
              }}>
                {[['Type', selectedProgram.type], ['Duration', selectedProgram.duration],
                  ['Total Units', selectedProgram.totalUnits], ['Status', selectedProgram.status]].map(([lbl, val]) => (
                  <div key={lbl}>
                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>{lbl}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{val}</span>
                  </div>
                ))}
              </div>

              {selectedProgram.yearLevels && (
                <div>
                  <h4 style={{ fontSize: '0.875rem', marginBottom: '12px', fontWeight: 700 }}>Curriculum Structure</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedProgram.yearLevels.map((level, idx) => (
                      <div key={idx} style={{
                        background: 'rgba(255,255,255,0.04)', padding: '13px 16px', borderRadius: '10px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        border: '1px solid var(--glass-border)'
                      }}>
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{level.year}</span>
                        <span style={{ color: 'var(--secondary-color)', fontSize: '11px', fontWeight: 600 }}>
                          {level.subjects.length} Subjects
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-primary btn" style={{ flex: 1 }}>Enroll Now</button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedProgram(null)}>Close</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ProgramList;