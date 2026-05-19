import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const WELCOME_MSG = {
  role: 'assistant',
  content: "👋 Hi! I'm **DialysisBot**, your AI assistant for dialysis and kidney care.\n\nI can help you with:\n• Dialysis procedures & types\n• Kidney disease information\n• Diet & fluid restrictions\n• Lab values (Kt/V, creatinine, etc.)\n• Medications for dialysis patients\n• DialysisTrack system questions\n\nHow can I help you today?",
};

const formatMessage = (text) => {
  return text.split('\n').map((line, i, arr) => {
    const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: formatted }} />
        {i < arr.length - 1 && <br />}
      </span>
    );
  });
};

const SUGGESTED = [
  'What is hemodialysis?',
  'What foods should I avoid?',
  'What does Kt/V mean?',
  'How often is dialysis needed?',
];

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggested, setShowSuggested] = useState(true);
  const [limitWarning, setLimitWarning] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // All hooks MUST be called before any conditional return
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [messages, open]);

  // Auth check AFTER all hooks
  const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
  if (!token) return null;

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setShowSuggested(false);
    const userMsg = { role: 'user', content: msg };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      const res = await axios.post(
        'http://localhost:8000/api/chat/',
        { message: msg, history: messages.slice(-10) },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (res.data.warning) setLimitWarning(res.data.warning);
      setMessages([...newHistory, { role: 'assistant', content: res.data.reply || 'Sorry, no response.' }]);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Connection error. Please try again.';
      setMessages([...newHistory, { role: 'assistant', content: `Sorry: ${errMsg}` }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Pulse ring */}
      {!open && (
        <span style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 99989,
          width: 60, height: 60, borderRadius: '50%',
          border: '2px solid #0891b2',
          animation: 'chatPulse 2s infinite', pointerEvents: 'none',
        }} />
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="DialysisBot AI Assistant"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 99990,
          width: 60, height: 60, borderRadius: '50%',
          background: open ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#0891b2,#0e7490)',
          color: 'white', fontSize: 26, border: 'none', cursor: 'pointer',
          boxShadow: open ? '0 4px 24px rgba(239,68,68,0.5)' : '0 4px 24px rgba(8,145,178,0.6)',
          transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 100, right: 28, zIndex: 99991,
          width: 360, height: 520, background: 'white', borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'slideUp 0.25s ease',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg,#0891b2,#0e7490)',
            padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>🤖</div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>DialysisBot</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
                  <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#4ade80', marginRight: 4 }} />
                  Dialysis AI Assistant
                </div>
              </div>
            </div>
            <button
              onClick={() => { setMessages([WELCOME_MSG]); setShowSuggested(true); }}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 11 }}
            >Clear</button>
          </div>

          {/* Limit Warning Banner */}
          {limitWarning && (
            <div style={{
              background: '#fef3c7', borderBottom: '1px solid #fcd34d',
              padding: '7px 14px', fontSize: 11.5, color: '#92400e',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            }}>
              <span>{limitWarning}</span>
              <button onClick={() => setLimitWarning(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#92400e', flexShrink: 0 }}>✕</button>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#0891b2,#0e7490)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginRight: 6, flexShrink: 0, marginTop: 2 }}>🤖</div>
                )}
                <div style={{
                  maxWidth: '78%', padding: '9px 13px',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user' ? 'linear-gradient(135deg,#0891b2,#0e7490)' : 'white',
                  color: m.role === 'user' ? 'white' : '#1e293b',
                  fontSize: 13.5, lineHeight: 1.55, boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}>
                  {formatMessage(m.content)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#0891b2,#0e7490)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                <div style={{ background: 'white', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(j => (
                    <span key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: '#0891b2', display: 'inline-block', animation: `dotBounce 1.2s ${j * 0.2}s infinite ease-in-out` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Suggested questions */}
            {showSuggested && messages.length === 1 && (
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>Suggested questions:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SUGGESTED.map((q, i) => (
                    <button key={i} onClick={() => send(q)} style={{
                      padding: '5px 10px', borderRadius: 20,
                      border: '1px solid #e0f2fe', background: '#f0f9ff',
                      color: '#0891b2', fontSize: 12, cursor: 'pointer',
                    }}>{q}</button>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #e2e8f0', background: 'white', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about dialysis or kidney care..."
              rows={1}
              disabled={loading}
              style={{ flex: 1, padding: '9px 12px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 13.5, resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, maxHeight: 80 }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                background: input.trim() && !loading ? 'linear-gradient(135deg,#0891b2,#0e7490)' : '#e2e8f0',
                color: input.trim() && !loading ? 'white' : '#94a3b8',
                border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
                fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >➤</button>
          </div>

          <div style={{ textAlign: 'center', fontSize: 10, color: '#cbd5e1', padding: '4px 0 6px', background: 'white' }}>
            Powered by Groq · Llama 3 · Dialysis-only AI
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatPulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          70%  { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default ChatBot;
