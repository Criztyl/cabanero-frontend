import React, { useContext } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, GraduationCap, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { programsData } from '../data/programsData';
import { subjectsData } from '../data/subjectsData';

const enrollmentData = [
  { name: 'Jan', students: 400, active: 320 },
  { name: 'Feb', students: 600, active: 450 },
  { name: 'Mar', students: 800, active: 600 },
  { name: 'Apr', students: 1200, active: 950 },
  { name: 'May', students: 1400, active: 1100 },
  { name: 'Jun', students: 1600, active: 1280 }
];

const programStatusData = [
  { name: 'Active', value: 3 },
  { name: 'Under Review', value: 1 },
  { name: 'Phased Out', value: 0 }
];

const COLORS = ['#00d4ff', '#ff0055', '#a1a1aa']; 

const Dashboard = () => {
  const { currentUser } = useContext(AppContext);

  const totalPrograms = programsData.length;
  const activePrograms = programsData.filter(p => p.status === 'active').length;
  const totalSubjects = subjectsData.length;
  const avgUnitPerProgram = Math.round(programsData.reduce((sum, p) => sum + p.totalUnits, 0) / totalPrograms);

  return (
    // REMOVED "main-content" class to prevent double-padding from App.jsx
    <div className="dashboard-wrapper-inner">
      {/* Top Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '20px',
        marginBottom: '30px' 
      }}>
        <div>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, margin: 0 }}>
            Welcome, {currentUser?.name || 'Academic Lead'}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px', fontSize: '14px' }}>
            Here's your academic overview for today
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          fontSize: '13px', 
          color: 'var(--secondary-color)', 
          background: 'rgba(0, 212, 255, 0.1)', 
          padding: '8px 15px', 
          borderRadius: '20px', 
          border: '1px solid var(--secondary-glow)',
          whiteSpace: 'nowrap'
        }}>
          <Clock size={16} />
          System Status: Operational
        </div>
      </div>

      {/* Stats Grid - Responsive 1 to 4 columns */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px' 
      }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <BookOpen size={24} color="var(--primary-color)" />
            <span style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>Programs</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>{totalPrograms}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '5px' }}>{activePrograms} currently active</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <GraduationCap size={24} color="var(--secondary-color)" />
            <span style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>Curriculum</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>{totalSubjects}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '5px' }}>Subjects across departments</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <Users size={24} color="var(--primary-color)" />
            <span style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>Students</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>1,280</div>
          <div style={{ color: '#00ff85', fontSize: '12px', marginTop: '5px' }}>↑ 12% from last term</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <TrendingUp size={24} color="var(--secondary-color)" />
            <span style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>Avg. Units</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>{avgUnitPerProgram}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '5px' }}>Per degree program</div>
        </div>
      </div>

      {/* Charts Section - Responsive 1 to 2 columns */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', 
        gap: '24px', 
        marginTop: '30px' 
      }}>
        {/* Enrollment Trend */}
        <div className="program-card" style={{ cursor: 'default', minHeight: '350px' }}>
          <h3 style={{ marginBottom: '25px', fontSize: '16px', fontWeight: 600, color: 'var(--secondary-color)' }}>Enrollment Analytics</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <AreaChart data={enrollmentData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="active" stroke="var(--primary-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Program Distribution */}
        <div className="program-card" style={{ cursor: 'default', minHeight: '350px' }}>
          <h3 style={{ marginBottom: '25px', fontSize: '16px', fontWeight: 600, color: 'var(--secondary-color)' }}>Program Distribution</h3>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={programStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {programStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
            {programStatusData.map((entry, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[index] }}></div>
                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Alerts */}
      <div className="program-card" style={{ 
        marginTop: '30px', 
        borderLeft: '4px solid var(--primary-color)', 
        background: 'linear-gradient(90deg, rgba(255,0,85,0.05), transparent)',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
          <AlertCircle color="var(--primary-color)" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>System Notification</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Curriculum review for "Bachelor of Science in Cyber Security" is pending for the next semester.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;