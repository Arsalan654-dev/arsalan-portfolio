'use client';
import { useState, useRef, useEffect } from 'react';
import publicService from '../../services/publicService';
import ChatMessage from './ChatMessage';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I\'m Arsalan\'s AI assistant. How can I help you today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { sender: 'user', text: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await publicService.sendChatMessage(input.trim());
      const botReply = data?.data?.response || data?.response || data?.data?.reply || data?.reply || data?.message || 'Sorry, I couldn\'t process that. Please try again.';
      setMessages(prev => [...prev, { sender: 'bot', text: botReply, timestamp: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I\'m having trouble connecting. Please try again later.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="position-fixed" style={{ bottom: '20px', right: '20px', zIndex: 9999 }}>
      {isOpen && (
        <div className="card border-0 shadow-lg rounded-3 overflow-hidden mb-3" style={{ width: 'min(360px, calc(100vw - 32px))', height: 'min(500px, calc(100vh - 120px))', maxWidth: '360px', background: 'var(--bs)', display: 'flex', flexDirection: 'column' }}>
          <div className="d-flex align-items-center justify-content-between px-4 py-3" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
            <div className="d-flex align-items-center gap-2">
              <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2a8 8 0 0 0-8 8c0 3.5 2.5 6.5 6 7.5V22l4-4.5c3.5-1 6-4 6-7.5a8 8 0 0 0-8-8z"/></svg>
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-white" style={{ fontSize: '0.9rem' }}>AI Assistant</h6>
                <small className="text-white-50" style={{ fontSize: '0.75rem' }}>Online</small>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="btn text-white p-0 border-0" style={{ fontSize: '1.2rem', lineHeight: 1 }}>&times;</button>
          </div>

          <div className="flex-grow-1 p-3 overflow-auto" style={{ background: 'var(--bp)' }}>
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {loading && (
              <div className="d-flex gap-2 mb-3">
                <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2a8 8 0 0 0-8 8c0 3.5 2.5 6.5 6 7.5V22l4-4.5c3.5-1 6-4 6-7.5a8 8 0 0 0-8-8z"/></svg>
                </div>
                <div className="px-3 py-2 rounded-3" style={{ background: 'var(--bt)' }}>
                  <div className="d-flex gap-1">
                    <div className="rounded-circle" style={{ width: '8px', height: '8px', background: '#7c3aed', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                    <div className="rounded-circle" style={{ width: '8px', height: '8px', background: '#7c3aed', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.16s' }} />
                    <div className="rounded-circle" style={{ width: '8px', height: '8px', background: '#7c3aed', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.32s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-top" style={{ borderColor: 'var(--bdr)' }}>
            <div className="input-group">
              <input
                ref={inputRef}
                type="text"
                className="form-control"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ background: 'var(--bs)', border: '1px solid var(--bdr)', color: 'var(--tp)' }}
                disabled={loading}
              />
              <button
                onClick={handleSend}
                className="btn"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', border: 'none' }}
                disabled={loading || !input.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn rounded-circle shadow-lg d-flex align-items-center justify-content-center border-0"
        style={{
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          color: '#fff',
          transition: 'transform 0.3s',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
        }}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
