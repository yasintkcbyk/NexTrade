import { useState, useRef } from 'react';
import axios from 'axios';
import { TrendingUp, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const particlesRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await axios.post(`${API_BASE_URL}/api/auth/register`, {
          username: form.username,
          email: form.email,
          password: form.password,
          full_name: form.full_name || undefined,
        });
        // Başarılı kayıt → otomatik giriş yap
        setMode('login');
        setError('');
        // auto login
        const loginRes = await axios.post(
          `${API_BASE_URL}/api/auth/login`,
          new URLSearchParams({ username: form.username, password: form.password }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        localStorage.setItem('nt_token', loginRes.data.access_token);
        localStorage.setItem('nt_user', JSON.stringify(loginRes.data.user));
        onLogin(loginRes.data.user, loginRes.data.access_token);
      } else {
        const res = await axios.post(
          `${API_BASE_URL}/api/auth/login`,
          new URLSearchParams({ username: form.username, password: form.password }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        localStorage.setItem('nt_token', res.data.access_token);
        localStorage.setItem('nt_user', JSON.stringify(res.data.user));
        onLogin(res.data.user, res.data.access_token);
      }
    } catch (err) {
      const msg = err.response?.data?.detail;
      if (Array.isArray(msg)) setError(msg.map(m => m.msg).join(', '));
      else setError(msg || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background orbs */}
      <div className="login-bg">
        <div className="login-bg-orb orb1" />
        <div className="login-bg-orb orb2" />
        <div className="login-bg-orb orb3" />

        {/* Grid lines effect */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03 }}>
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4488ff" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <TrendingUp size={26} color="white" />
          </div>
          <div>
            <div className="login-title">nextTrade</div>
            <div className="login-subtitle">
              {mode === 'login' ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
            </div>
          </div>
        </div>

        {/* Form */}
        <form key={mode} className="login-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="login-input-group">
              <label className="login-label">Ad Soyad (isteğe bağlı)</label>
              <input
                className="login-input"
                type="text"
                placeholder="Adınız Soyadınız"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                autoComplete="name"
              />
            </div>
          )}

          <div className="login-input-group">
            <label className="login-label">Kullanıcı Adı</label>
            <input
              className="login-input"
              type="text"
              placeholder="kullanici_adi"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          {mode === 'register' && (
            <div className="login-input-group">
              <label className="login-label">E-posta</label>
              <input
                className="login-input"
                type="email"
                placeholder="ornek@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
          )}

          <div className="login-input-group">
            <label className="login-label">Şifre</label>
            <div style={{ position: 'relative' }}>
              <input
                className="login-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)',
                  display: 'flex', alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="login-error-container" style={{ minHeight: error ? '24px' : '0', overflow: 'hidden' }}>
            {error && <div className="login-error">{error}</div>}
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                {mode === 'login' ? 'Giriş yapılıyor...' : 'Hesap oluşturuluyor...'}
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
                {mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
              </span>
            )}
          </button>
        </form>

        <div className="login-switch">
          {mode === 'login' ? (
            <span>Hesabın yok mu? <button onClick={() => { setMode('register'); setError(''); }}>Kayıt Ol</button></span>
          ) : (
            <span>Zaten hesabın var mı? <button onClick={() => { setMode('login'); setError(''); }}>Giriş Yap</button></span>
          )}
        </div>

        {/* Version badge */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          nextTrade v2.0 · AI Yatırım Platformu
        </div>
      </div>
    </div>
  );
}
