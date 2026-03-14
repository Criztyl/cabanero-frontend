export default function ConfirmDialog({
  isOpen, onConfirm, onCancel,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  icon = '⚠️',
}) {
  if (!isOpen) return null;
  return (
    <div style={{
      position:'fixed', inset:0,
      background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:9999,
    }}>
      <div style={{
        background:'var(--bg-panel)', border:'1px solid var(--glass-border)',
        borderRadius:'20px', padding:'32px', width:'360px', textAlign:'center',
        animation:'cdFadeIn 0.2s ease',
      }}>
        <div style={{
          width:'56px', height:'56px', borderRadius:'50%',
          background: danger ? 'rgba(255,68,102,0.1)' : 'rgba(0,212,255,0.1)',
          border:`1px solid ${danger ? 'rgba(255,68,102,0.3)' : 'rgba(0,212,255,0.3)'}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 16px', fontSize:'24px',
        }}>
          {icon}
        </div>
        <h3 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'8px' }}>{title}</h3>
        <p style={{ color:'var(--text-muted)', fontSize:'13px', marginBottom:'24px', lineHeight:'1.6' }}>
          {message}
        </p>
        <div style={{ display:'flex', gap:'12px' }}>
          <button onClick={onCancel}
            className="btn btn-secondary" style={{ flex:1 }}>
            {cancelLabel}
          </button>
          <button onClick={onConfirm}
            style={{
              flex:1, padding:'10px', borderRadius:'10px', border:'none',
              background: danger ? 'var(--primary-color)' : 'var(--secondary-color)',
              color:'#fff', cursor:'pointer', fontSize:'14px', fontWeight:600,
            }}>
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes cdFadeIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
}