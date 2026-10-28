'use client';
import { formatDate } from '../../utils/helpers';

export default function ChatMessage({ message }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`d-flex gap-2 mb-3 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}>
      {!isUser && (
        <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2a8 8 0 0 0-8 8c0 3.5 2.5 6.5 6 7.5V22l4-4.5c3.5-1 6-4 6-7.5a8 8 0 0 0-8-8z"/></svg>
        </div>
      )}
      <div className="d-flex flex-column" style={{ maxWidth: '75%' }}>
        <div
          className="px-3 py-2 rounded-3"
          style={{
            background: isUser ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'var(--bt)',
            color: isUser ? '#fff' : 'var(--tp)',
            borderBottomRightRadius: isUser ? '4px' : '12px',
            borderBottomLeftRadius: isUser ? '12px' : '4px',
            wordBreak: 'break-word'
          }}
        >
          {message.text}
        </div>
        <small className={`mt-1 ${isUser ? 'text-end' : 'text-start'}`} style={{ color: 'var(--tm)', fontSize: '0.7rem' }}>
          {message.timestamp ? formatDate(message.timestamp) : ''}
        </small>
      </div>
      {isUser && (
        <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '32px', height: '32px', background: 'var(--bt)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tm)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      )}
    </div>
  );
}
