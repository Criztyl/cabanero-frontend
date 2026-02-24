import { useState } from 'react';
import { programsData } from '../data/programsData';
import './ProgramList.css';

function ProgramList() {
  const [programs] = useState(programsData);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [filter, setFilter] = useState('all');

  const filteredPrograms = filter === 'all' 
    ? programs 
    : programs.filter(p => p.status === filter);

  return (
    <div className="program-list-container">
      {/* Header Section */}
      <div className="page-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 className="page-title">Program Offerings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>
            Browse all available degree programs
          </p>
        </div>

        {/* Status Filter - Updated to use standard Cyber classes */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['all', 'active', 'under review'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: filter === status ? 'var(--primary-color)' : 'var(--glass-bg)',
                color: 'white',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: '0.3s'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Programs Grid */}
      <div className="programs-grid">
        {filteredPrograms.map(program => (
          <div
            key={program.id}
            className="program-card"
            onClick={() => setSelectedProgram(program)}
          >
            {/* Card Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '15px'
            }}>
              <div>
                <h3 className="card-title">{program.code}</h3>
                <p className="card-subtitle">{program.type}</p>
              </div>
              <span className={`badge ${program.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                {program.status}
              </span>
            </div>

            {/* Description */}
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '13px',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              {program.description.substring(0, 80)}...
            </p>

            {/* Info Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px',
              paddingTop: '15px',
              borderTop: '1px solid var(--glass-border)'
            }}>
              <div>
                <p style={{ color: 'var(--secondary-color)', fontSize: '11px', textTransform: 'uppercase' }}>Duration</p>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>{program.duration}</p>
              </div>
              <div>
                <p style={{ color: 'var(--secondary-color)', fontSize: '11px', textTransform: 'uppercase' }}>Units</p>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>{program.totalUnits}</p>
              </div>
            </div>

            {/* Action Button */}
            <button
              className="btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProgram(program);
              }}
              style={{ width: '100%' }}
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {selectedProgram && (
        <div className="modal-overlay" onClick={() => setSelectedProgram(null)} style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--bg-panel)', border: '1px solid var(--glass-border)',
            padding: '30px', borderRadius: '24px', maxWidth: '600px', width: '90%',
            maxHeight: '90vh', overflowY: 'auto', position: 'relative'
          }}>
            <div className="modal-header" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{selectedProgram.code}</h2>
              <p className="card-subtitle">{selectedProgram.name}</p>
              <button 
                className="modal-close" 
                onClick={() => setSelectedProgram(null)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}
              >✕</button>
            </div>

            <div className="modal-body">
              <span className={`badge ${selectedProgram.status === 'active' ? 'badge-success' : 'badge-warning'}`} style={{ marginBottom: '20px', display: 'inline-block' }}>
                {selectedProgram.status.toUpperCase()}
              </span>

              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: 'var(--secondary-color)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>Description</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>{selectedProgram.description}</p>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px',
                padding: '20px 0', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)',
                marginBottom: '25px'
              }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px' }}>Type</label>
                  <span style={{ fontWeight: 600 }}>{selectedProgram.type}</span>
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px' }}>Duration</label>
                  <span style={{ fontWeight: 600 }}>{selectedProgram.duration}</span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', marginBottom: '15px' }}>Curriculum Structure</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedProgram.yearLevels.map((level, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: 500 }}>{level.year}</span>
                      <span style={{ color: 'var(--secondary-color)', fontSize: '12px' }}>{level.subjects.length} Subjects</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
              <button className="btn-primary" style={{ flex: 1 }}>Enroll Now</button>
              <button 
                onClick={() => setSelectedProgram(null)}
                style={{ flex: 1, background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}
              >Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgramList;