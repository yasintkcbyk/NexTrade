import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import { Shield, Users, Database, Bell, Send, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { user, API_BASE_URL, fetchAnnouncements } = useAppContext();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', send_to_telegram: false });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, annRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/stats`),
        axios.get(`${API_BASE_URL}/api/admin/users`),
        axios.get(`${API_BASE_URL}/api/admin/announcements`)
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setAnnouncements(annRes.data);
    } catch (error) {
      console.error("Admin data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.is_admin) return;
    fetchData();
  }, [user, API_BASE_URL]);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    
    setSubmitting(true);
    setMessage('');
    try {
      await axios.post(`${API_BASE_URL}/api/admin/announcements`, newAnnouncement);
      setMessage('Duyuru başarıyla yayınlandı!');
      setNewAnnouncement({ title: '', content: '', send_to_telegram: false });
      fetchData(); // Refresh all
      fetchAnnouncements(); // Refresh global context
    } catch (error) {
      console.error("Failed to post announcement:", error);
      setMessage('Duyuru yayınlanırken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/announcements/${id}`);
      fetchData();
      fetchAnnouncements();
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      alert("Duyuru silinirken hata oluştu.");
    }
  };

  const handleToggleUserStatus = async (targetUser, field) => {
    try {
      const payload = {};
      if (field === 'is_active') payload.is_active = !targetUser.is_active;
      if (field === 'is_admin') payload.is_admin = !targetUser.is_admin;
      
      await axios.put(`${API_BASE_URL}/api/admin/users/${targetUser.id}`, payload);
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Kullanıcı güncellenirken hata oluştu.");
    }
  };

  if (!user?.is_admin) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
          <Shield size={48} style={{ margin: '0 auto', marginBottom: 16, opacity: 0.5 }} />
          <h2>Erişim Engellendi</h2>
          <p>Bu sayfayı görüntülemek için yönetici yetkisine sahip olmalısınız.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="page-container" style={{ padding: 20 }}>Yükleniyor...</div>;
  }

  return (
    <div className="page-container" style={{ padding: 24, overflowY: 'auto', height: '100%' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={24} color="var(--accent-blue)" /> Yönetici Paneli
        </h1>
        <p className="page-subtitle">Sistem istatistikleri ve genel yönetim araçları</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 30 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(68,136,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Toplam Kullanıcı</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{stats?.total_users || 0}</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,170,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-orange)' }}>
            <Database size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Toplam Portföy Kaydı</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{stats?.total_portfolio_items || 0}</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-red)' }}>
            <Bell size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Aktif Fiyat Alarmları</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{stats?.total_alerts || 0}</div>
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, marginBottom: 24 }}>
        {/* Kullanıcı Listesi */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} /> Kayıtlı Kullanıcılar & Yetkilendirme
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '10px 0', color: 'var(--text-dim)' }}>Kullanıcı Adı</th>
                  <th style={{ padding: '10px 0', color: 'var(--text-dim)' }}>E-posta</th>
                  <th style={{ padding: '10px 0', color: 'var(--text-dim)' }}>Durum</th>
                  <th style={{ padding: '10px 0', color: 'var(--text-dim)' }}>Yetki</th>
                  <th style={{ padding: '10px 0', color: 'var(--text-dim)', textAlign: 'right' }}>Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 0', fontWeight: 500 }}>{u.username}</td>
                    <td style={{ padding: '12px 0', color: 'var(--text-dim)' }}>{u.email}</td>
                    <td style={{ padding: '12px 0' }}>
                      {u.is_active ? (
                        <span style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', fontSize: 11 }}>Aktif</span>
                      ) : (
                        <span style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(244,63,94,0.1)', color: 'var(--accent-red)', fontSize: 11 }}>Engelli</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      {u.is_admin ? (
                        <span style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(68,136,255,0.2)', color: 'var(--accent-blue)', fontSize: 11 }}>Admin</span>
                      ) : (
                        <span style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', color: 'var(--text-dim)', fontSize: 11 }}>Kullanıcı</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 0', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleToggleUserStatus(u, 'is_admin')}
                          style={{ padding: '4px 8px', fontSize: 11, background: 'transparent', border: `1px solid ${u.is_admin ? 'var(--accent-orange)' : 'var(--accent-blue)'}`, color: u.is_admin ? 'var(--accent-orange)' : 'var(--accent-blue)', borderRadius: 4, cursor: 'pointer' }}
                        >
                          {u.is_admin ? 'Yetkiyi Al' : 'Admin Yap'}
                        </button>
                        <button 
                          onClick={() => handleToggleUserStatus(u, 'is_active')}
                          style={{ padding: '4px 8px', fontSize: 11, background: 'transparent', border: `1px solid ${u.is_active ? 'var(--accent-red)' : 'var(--accent-green)'}`, color: u.is_active ? 'var(--accent-red)' : 'var(--accent-green)', borderRadius: 4, cursor: 'pointer' }}
                        >
                          {u.is_active ? 'Engelle' : 'Engeli Aç'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } }}>
        
        {/* Duyuru Ekleme */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Send size={18} /> Yeni Duyuru Yayınla
          </h2>
          <form onSubmit={handlePostAnnouncement}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>Duyuru Başlığı</label>
              <input 
                type="text" 
                value={newAnnouncement.title}
                onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                placeholder="Örn: Sistem Bakımı"
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-elevated)', color: 'white' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>Duyuru İçeriği</label>
              <textarea 
                value={newAnnouncement.content}
                onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                placeholder="Duyuru mesajınızı buraya yazın..."
                required
                rows={4}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-elevated)', color: 'white', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input 
                type="checkbox" 
                id="tg_notify" 
                checked={newAnnouncement.send_to_telegram}
                onChange={e => setNewAnnouncement({...newAnnouncement, send_to_telegram: e.target.checked})}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="tg_notify" style={{ fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
                <Send size={14} color="var(--accent-blue)" /> Telegram abonelerine de gönder
              </label>
            </div>
            
            {message && <div style={{ fontSize: 12, color: message.includes('hata') ? 'var(--accent-red)' : 'var(--accent-green)', marginBottom: 16 }}>{message}</div>}

            <button 
              type="submit" 
              disabled={submitting}
              className="action-btn positive" 
              style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
            >
              <Send size={16} /> {submitting ? 'Yayınlanıyor...' : 'Duyuruyu Yayınla'}
            </button>
          </form>
        </div>

        {/* Mevcut Duyurular Listesi */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={18} /> Mevcut Duyurular
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '350px', overflowY: 'auto' }}>
            {announcements.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Hiç duyuru yok.</div>
            ) : (
              announcements.map(ann => (
                <div key={ann.id} style={{ background: 'var(--bg-elevated)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 14, margin: 0, paddingRight: 30 }}>{ann.title}</h3>
                    <button 
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', opacity: 0.7 }}
                      title="Duyuruyu Sil"
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: 0, whiteSpace: 'pre-wrap' }}>{ann.content}</p>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8, opacity: 0.6 }}>
                    {new Date(ann.created_at).toLocaleString('tr-TR')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
