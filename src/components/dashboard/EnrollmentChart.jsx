import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../common/LoadingSpinner';

export default function EnrollmentChart({ data, loading }) {
  return (
    <div className="program-card" style={{ cursor:'default', minHeight:'330px' }}>
      <h3 style={{ marginBottom:'20px', fontSize:'16px', fontWeight:600, color:'var(--secondary-color)' }}>
        Monthly Enrollment Trends
      </h3>
      <div style={{ width:'100%', height:250 }}>
        {loading ? <LoadingSpinner text="Loading chart..." /> : (
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top:0, right:0, left:-20, bottom:0 }}>
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <Tooltip contentStyle={{
                background:'var(--bg-panel)', border:'1px solid var(--glass-border)',
                borderRadius:'12px', fontSize:'12px'
              }} />
              <Bar dataKey="students" fill="var(--primary-color)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}