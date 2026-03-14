import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header" style={{ background: '#c9184a', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
            <span>Uni Helper</span>
            <X size={20} onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }} />
          </div>
          <div className="chat-messages" style={{ flex: 1, padding: '20px', background: '#fffafa', overflowY: 'auto' }}>
            <p style={{ background: 'white', padding: '10px', borderRadius: '12px', marginBottom: '10px', fontSize: '0.9rem', border: '1px solid #eee' }}>
              <b>Bot:</b> Hi! I'm your University assistant. How can I help you today?
            </p>
          </div>
          <div style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="Type a message..." style={{ flex: 1, border: 'none', outline: 'none' }} />
            <Send size={20} color="#c9184a" style={{ cursor: 'pointer' }} />
          </div>
        </div>
      )}
      <button className="chat-fab" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default Chatbot;