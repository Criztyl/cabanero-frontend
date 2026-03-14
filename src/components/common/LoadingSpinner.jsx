export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
                  justifyContent:'center', padding:'60px 20px', gap:'16px' }}>
      <div style={{
        width:'40px', height:'40px', borderRadius:'50%',
        border:'3px solid rgba(255,255,255,0.1)',
        borderTopColor:'var(--primary-color)',
        animation:'spin 0.8s linear infinite'
      }} />
      <p style={{ color:'var(--text-muted)', fontSize:'13px' }}>{text}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}