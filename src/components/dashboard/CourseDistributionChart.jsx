import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../common/LoadingSpinner';

const COLORS = ['#00d4ff','#ff0055','#a1a1aa','#00ff85','#ffaa00',
                '#8b5cf6','#f97316','#14b8a6','#84cc16','#ec4899'];

export default function CourseDistributionChart({ data, loading }) {
  return (
    <div className="program-card" style={{ cursor:'default', minHeight:'330px' }}>
      <h3 style={{ marginBottom:'20px', fontSize:'16px', fontWeight:600, color:'var(--secondary-color)' }}>
        Student Distribution by Course
      </h3>
      <div style={{ width:'100%', height:200 }}>
        {loading ? <LoadingSpinner text="Loading chart..." /> : (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data} cx="50%" cy="50%"
                innerRadius={60} outerRadius={80}
                paddingAngle={8} dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{
                background:'var(--bg-panel)', border:'1px solid var(--glass-border)',
                borderRadius:'12px', fontSize:'12px'
              }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'10px', marginTop:'16px' }}>
        {data.slice(0, 6).map((entry, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'10px' }}>
            <div style={{
              width:'8px', height:'8px', borderRadius:'50%',
              background: COLORS[i % COLORS.length]
            }} />
            <span style={{ color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px' }}>
              {entry.name.length > 15 ? entry.name.substring(0,15)+'…' : entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}