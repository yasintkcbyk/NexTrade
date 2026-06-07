import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { Bell, Trash2, ChevronDown, Search, TrendingUp, TrendingDown, Target, Send, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CURRENCIES, formatPrice } from '../utils/constants';

// Custom styled select for asset
function AssetSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const selected = options.find(o => o.symbol === value);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter(o => o.name.toLowerCase().includes(q) || o.symbol.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setSearch(''); }}
        style={{
          width: '100%', padding: '11px 14px',
          background: 'rgba(13,21,38,0.8)', border: `1px solid ${open ? 'rgba(68,136,255,0.5)' : 'var(--border-normal)'}`,
          borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
          transition: 'all 0.2s', boxShadow: open ? '0 0 0 3px rgba(68,136,255,0.1)' : 'none',
        }}
      >
        {selected ? (
          <>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(68,136,255,0.15)', border: '1px solid rgba(68,136,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 10, color: 'var(--accent-blue)', fontFamily: 'Space Grotesk, sans-serif', flexShrink: 0 }}>
              {selected.symbol.slice(0, 3)}
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>{selected.symbol}</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{selected.name.length > 18 ? selected.name.slice(0, 18) + '…' : selected.name}</div>
            </div>
          </>
        ) : <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>Seçin...</span>}
        <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100, background: 'var(--bg-card)', border: '1px solid var(--border-normal)', borderRadius: 'var(--radius-lg)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 10px 6px', borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Ara..." style={{ width: '100%', paddingLeft: 30, paddingRight: 10, paddingTop: 7, paddingBottom: 7, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }} />
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 220 }}>
            {filtered.map(opt => (
              <button key={opt.symbol} type="button" onClick={() => { onChange(opt.symbol); setOpen(false); setSearch(''); }}
                style={{ width: '100%', padding: '9px 12px', background: opt.symbol === value ? 'rgba(68,136,255,0.1)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (opt.symbol !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (opt.symbol !== value) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(68,136,255,0.12)', border: '1px solid rgba(68,136,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 9, color: 'var(--accent-blue)', fontFamily: 'Space Grotesk, sans-serif', flexShrink: 0 }}>
                  {opt.symbol.slice(0, 3)}
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: opt.symbol === value ? 'var(--accent-blue)' : 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>{opt.symbol}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{opt.name.length > 20 ? opt.name.slice(0, 20) + '…' : opt.name}</div>
                </div>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 'var(--radius-full)', background: opt.type === 'crypto' ? 'rgba(0,212,255,0.1)' : 'rgba(68,136,255,0.1)', color: opt.type === 'crypto' ? 'var(--accent-cyan)' : 'var(--accent-blue)', fontWeight: 700 }}>
                  {opt.type === 'crypto' ? '₿' : '📈'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Condition toggle button group
function ConditionToggle({ value, onChange, t }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[
        { val: 'greater', label: t('priceGoesUp'), icon: <TrendingUp size={14} />, color: 'var(--accent-green)', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
        { val: 'less', label: t('priceGoesDown'), icon: <TrendingDown size={14} />, color: 'var(--accent-red)', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.3)' },
      ].map(opt => (
        <button
          key={opt.val}
          type="button"
          onClick={() => onChange(opt.val)}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
            border: value === opt.val ? `1px solid ${opt.border}` : '1px solid var(--border-subtle)',
            background: value === opt.val ? opt.bg : 'rgba(13,21,38,0.5)',
            color: value === opt.val ? opt.color : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 12, fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.2s',
          }}
        >
          {opt.icon}
          <span style={{ fontSize: 11 }}>{value === opt.val ? (opt.val === 'greater' ? '≥ Üstüne Çıkarsa' : '≤ Altına Düşerse') : (opt.val === 'greater' ? 'Yukarı' : 'Aşağı')}</span>
        </button>
      ))}
    </div>
  );
}

export default function AlertsPage() {
  const { marketData, currency, rates, t, user, setUser, API_BASE_URL } = useAppContext();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [form, setForm] = useState({ symbol: 'BTC', target_price: '', condition: 'greater' });
  const [chatIdInput, setChatIdInput] = useState(user?.telegram_chat_id || '');
  const [isEditingChatId, setIsEditingChatId] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedAssetData = marketData.find(m => m.symbol === form.symbol);
  const currentPrice = selectedAssetData?.price;

  const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('nt_token')}` } });

  const fetchAlerts = async () => {
    setLoading(true);
    try { const r = await axios.get(`${API_BASE_URL}/api/alerts/`, getAuthHeaders()); setAlerts(r.data || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const checkTelegram = async () => {
    if (!user?.telegram_chat_id) { setTelegramStatus('error'); return; }
    try {
      const r = await axios.get(`${API_BASE_URL}/api/alerts/test`, getAuthHeaders());
      setTelegramStatus(r.data?.success ? 'connected' : 'error');
    } catch { setTelegramStatus('error'); }
  };

  const handleSaveChatId = async () => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/auth/me/telegram`, { telegram_chat_id: chatIdInput }, getAuthHeaders());
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem('nt_user', JSON.stringify(updatedUser));
      setIsEditingChatId(false);
      setTelegramStatus('connected');
    } catch { alert("Chat ID kaydedilemedi."); }
  };

  useEffect(() => { fetchAlerts(); checkTelegram(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.target_price) return;
    setSubmitting(true);
    const rate = rates[currency] || 1;
    try {
      await axios.post(`${API_BASE_URL}/api/alerts/`, {
        symbol: form.symbol,
        target_price: parseFloat(form.target_price) / rate,
        condition: form.condition
      }, getAuthHeaders());
      setForm(prev => ({ ...prev, target_price: '' }));
      fetchAlerts();
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API_BASE_URL}/api/alerts/${id}`, getAuthHeaders()); fetchAlerts(); }
    catch (e) { console.error(e); }
  };

  return (
    <div className="alerts-module">
      {/* ─── LEFT: Form Panel ─── */}
      <div className="alerts-form-panel">
        <div>
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(68,136,255,0.12)', border: '1px solid rgba(68,136,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={17} style={{ color: 'var(--accent-blue)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>{t('setPriceAlert')}</h2>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 1 }}>Fiyat hedefine ulaşınca bildirim al</p>
            </div>
          </div>

          {/* Telegram status card */}
          <div style={{
            padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: 20,
            background: user?.telegram_chat_id ? 'rgba(16,185,129,0.06)' : 'rgba(244,63,94,0.06)',
            border: `1px solid ${user?.telegram_chat_id ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: user?.telegram_chat_id ? 'var(--accent-green)' : 'var(--accent-red)', boxShadow: user?.telegram_chat_id ? '0 0 6px var(--accent-green)' : 'none' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: user?.telegram_chat_id ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  Telegram {user?.telegram_chat_id ? t('telegramConnected') : t('telegramNotConnected')}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-dim)', marginTop: 1 }}>
                  {user?.telegram_chat_id ? `Chat ID: ${user.telegram_chat_id}` : 'Chat ID gerekli'}
                </div>
              </div>
              {user?.telegram_chat_id && !isEditingChatId && (
                <button onClick={() => setIsEditingChatId(true)} style={{ fontSize: 11, background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', padding: '4px 8px', borderRadius: 4, background: 'rgba(68,136,255,0.1)' }}>Düzenle</button>
              )}
            </div>
            {(!user?.telegram_chat_id || isEditingChatId) && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8 }}>Telegram'da <strong style={{ color: 'var(--text-secondary)' }}>@userinfobot</strong>'a yazarak ID öğrenin</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type="text" placeholder="Chat ID girin" value={chatIdInput} onChange={e => setChatIdInput(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', fontSize: 12, borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-normal)', color: 'white', outline: 'none' }} />
                  <button onClick={handleSaveChatId} style={{ padding: '8px 14px', fontSize: 12, borderRadius: 'var(--radius-md)', background: 'var(--accent-blue)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif' }}>Kaydet</button>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            {/* Asset selector */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>{t('asset')}</div>
              <AssetSelect value={form.symbol} onChange={sym => setForm(f => ({ ...f, symbol: sym }))} options={marketData} />
            </div>

            {/* Current price banner */}
            {currentPrice && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>Güncel Fiyat</span>
                <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
                  {CURRENCIES[currency].symbol}{formatPrice(currentPrice, currency, rates)}
                </span>
              </div>
            )}

            {/* Condition */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>{t('condition')}</div>
              <ConditionToggle value={form.condition} onChange={cond => setForm(f => ({ ...f, condition: cond }))} t={t} />
            </div>

            {/* Target price */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
                {t('targetPrice')} ({CURRENCIES[currency].symbol})
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 700, color: 'var(--text-dim)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {CURRENCIES[currency].symbol}
                </span>
                <input
                  type="number" step="0.000001" placeholder="65000"
                  value={form.target_price}
                  onChange={e => setForm(f => ({ ...f, target_price: e.target.value }))}
                  required
                  style={{ width: '100%', paddingLeft: 30, paddingRight: 14, paddingTop: 12, paddingBottom: 12, fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', borderRadius: 'var(--radius-md)', background: 'rgba(13,21,38,0.8)', border: '1px solid var(--border-normal)', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(68,136,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-normal)'}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !form.target_price}
              style={{
                width: '100%', padding: '13px', borderRadius: 'var(--radius-md)',
                background: submitting || !form.target_price ? 'rgba(68,136,255,0.3)' : 'linear-gradient(135deg, #4488ff, #a855f7)',
                color: 'white', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: 14, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s', letterSpacing: '0.02em',
              }}
              onMouseEnter={e => { if (!submitting && form.target_price) { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(68,136,255,0.35)'; } }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <Plus size={15} /> {t('saveAlert')}
            </button>
          </form>

          {/* Test telegram */}
          {user?.telegram_chat_id && telegramStatus === 'connected' && (
            <button
              onClick={async () => {
                try { await axios.get(`${API_BASE_URL}/api/alerts/test`, getAuthHeaders()); alert("✅ Test mesajı gönderildi!"); }
                catch { alert("❌ Test başarısız."); }
              }}
              style={{ width: '100%', marginTop: 12, padding: '10px', background: 'transparent', border: '1px dashed rgba(16,185,129,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--accent-green)', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Send size={12} /> {t('telegramTestMsg')}
            </button>
          )}
        </div>
      </div>

      {/* ─── RIGHT: Alerts List ─── */}
      <div className="alerts-list-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={16} style={{ color: 'var(--accent-blue)' }} />
            {t('activeAlerts')}
          </h3>
          <span style={{ fontSize: 12, color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
            {alerts.length} alarm
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <Bell size={40} className="empty-state-icon" />
            <div className="empty-state-title">{t('noAlertsYet')}</div>
            <div className="empty-state-desc">{t('useLeftPanelToSetAlert')}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {alerts.map(alert => {
              const assetData = marketData.find(m => m.symbol.toUpperCase() === alert.symbol.toUpperCase());
              const current = assetData?.price || 0;
              const isUp = alert.condition === 'greater';
              const progress = isUp
                ? Math.min(100, (current / alert.target_price) * 100)
                : Math.min(100, (alert.target_price / current) * 100);

              return (
                <div key={alert.id} style={{
                  background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)', padding: '16px 18px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-normal)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  {/* Icon */}
                  <div style={{ width: 46, height: 46, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isUp ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', border: `1px solid ${isUp ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}` }}>
                    {isUp ? <TrendingUp size={20} style={{ color: 'var(--accent-green)' }} /> : <TrendingDown size={20} style={{ color: 'var(--accent-red)' }} />}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 16, fontFamily: 'Space Grotesk, sans-serif' }}>{alert.symbol}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: isUp ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)', border: `1px solid ${isUp ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`, color: isUp ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>
                        {isUp ? '▲' : '▼'} {isUp ? t('ifRises') : t('ifFalls')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                        {CURRENCIES[currency].symbol}{formatPrice(alert.target_price, currency, rates)}
                      </span>
                      {current > 0 && (
                        <span style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>
                          güncel: {CURRENCIES[currency].symbol}{formatPrice(current, currency, rates)}
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    {current > 0 && (
                      <div>
                        <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(progress, 100)}%`, background: isUp ? 'var(--gradient-green)' : 'var(--gradient-red)', borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease' }} />
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
                          {progress.toFixed(1)}% hedefe ulaşıldı
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(alert.id)}
                    style={{ padding: 10, borderRadius: 'var(--radius-md)', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.12)', color: 'var(--accent-red)', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, display: 'flex', alignItems: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.18)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(244,63,94,0.06)'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
