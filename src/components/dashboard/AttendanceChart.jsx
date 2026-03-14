import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import LoadingSpinner from '../common/LoadingSpinner';

export default function AttendanceChart({ data, loading }) {
  return (
    <div className="program-card" style={{ cursor:'default', minHeight:'280px' }}>
      <h3 style={{ marginBottom:'20px', fontSize:'16px', fontWeight:600, color:'var(--secondary-color)' }}>
        Attendance Trends — Last 30 School Days
      </h3>
      <div style={{ width:'100%', height:220 }}>
        {loading ? <LoadingSpinner text="Loading chart..." /> : (
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top:0, right:0, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ff0055" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff0055" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <Tooltip contentStyle={{
                background:'var(--bg-panel)', border:'1px solid var(--glass-border)',
                borderRadius:'12px', fontSize:'12px'
              }} />
              <Area type="monotone" dataKey="present" stroke="#00d4ff" strokeWidth={2}
                    fillOpacity={1} fill="url(#presentGrad)" name="Present" />
              <Area type="monotone" dataKey="absent"  stroke="#ff0055" strokeWidth={2}
                    fillOpacity={1} fill="url(#absentGrad)"  name="Absent"  />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}