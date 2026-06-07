import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bot, X, MessageCircle, Send } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CURRENCIES, formatPrice } from '../utils/constants';

export default function AIChat({ selectedAsset }) {
  const { currency, rates, t, API_BASE_URL } = useAppContext();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{
    sender: 'ai',
    text: 'GREETING_MSG'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Listen for summarize news event
  useEffect(() => {
    const handleSummarize = (e) => {
      const { title } = e.detail;
      setOpen(true);
      send(`Lütfen şu haberi yorumla: "${title}"`);
    };
    window.addEventListener('nt-summarize-news', handleSummarize);
    return () => window.removeEventListener('nt-summarize-news', handleSummarize);
  }, []);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: msg,
        history: messages.slice(-10),
        context_news: selectedAsset ? `Kullanıcı şu an ${selectedAsset.name} (${selectedAsset.symbol}) bakıyor. Fiyat: ${CURRENCIES[currency].symbol}${formatPrice(selectedAsset.price, currency, rates)}, 24s değişim: ${selectedAsset.change}%` : ''
      });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: '⚠️ Şu an bağlantı kurulamıyor. Backend\'i kontrol edin.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-fab">
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-title">
              <Bot size={16} />
              {t('aiAssistant')}
              <div className="chat-online-dot" />
            </div>
            <button className="icon-btn" onClick={() => setOpen(false)}><X size={14} /></button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.sender}`}>
                <div className={`chat-bubble ${msg.sender}`} style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text === 'GREETING_MSG' ? t('aiGreeting') : msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg ai">
                <div className="chat-bubble ai" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ animation: 'blink 1s infinite', display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                  <span style={{ animation: 'blink 1s 0.3s infinite', display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                  <span style={{ animation: 'blink 1s 0.6s infinite', display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-suggestions">
            {(t('aiSuggestions') || []).map((s, i) => (
              <button key={i} className="suggestion-chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder={t('askSomething')}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button className="chat-send-btn" onClick={() => send()} disabled={loading || !input.trim()}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
      <button className="chat-toggle-btn" onClick={() => setOpen(!open)}>
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
