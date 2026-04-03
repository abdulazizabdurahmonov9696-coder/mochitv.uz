import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Users, ArrowLeft, RefreshCw, Bell, BellOff, Search,
  Check, X, Loader, Send, User, Circle, CheckCircle,
  Clock, Calendar, MessageSquare, ChevronDown, ChevronUp,
  Activity, Inbox, Trash2, AlertTriangle
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEFAULT_AVATAR = 'https://i.pinimg.com/736x/ce/21/07/ce21071acfd1e9deb34850f70285a5f0.jpg';

const getActivityStatus = (lastSeen) => {
  if (!lastSeen) return { label: 'Noma\'lum', color: '#555', dot: '#555', active: false };
  const diff = Date.now() - new Date(lastSeen).getTime();
  const minutes = diff / 60000;
  if (minutes < 10)  return { label: 'Hozir faol', color: '#22c55e', dot: '#22c55e', active: true };
  if (minutes < 60)  return { label: `${Math.floor(minutes)} daqiqa oldin`, color: '#f59e0b', dot: '#f59e0b', active: false };
  const hours = minutes / 60;
  if (hours < 24)    return { label: `${Math.floor(hours)} soat oldin`, color: '#f59e0b', dot: '#f59e0b', active: false };
  const days = hours / 24;
  if (days < 7)      return { label: `${Math.floor(days)} kun oldin`, color: '#888', dot: '#888', active: false };
  return { label: `${Math.floor(days)} kun oldin`, color: '#ef4444', dot: '#ef4444', active: false };
};

const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('uz-UZ') + ' ' + date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
};

export default function UsersAdmin() {
  const [authChecked, setAuthChecked]   = useState(false);
  const [currentUser, setCurrentUser]   = useState(null);
  const [users, setUsers]               = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Notification modal
  const [notifModal, setNotifModal]     = useState({ show: false, target: null });
  const [notifTitle, setNotifTitle]     = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType]       = useState('info');
  const [sending, setSending]           = useState(false);

  // Delete confirm modal
  const [deleteModal, setDeleteModal]   = useState({ show: false, target: null }); // target: user obj | 'bulk'
  const [deleting, setDeleting]         = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // Stats (added active24)
  const [stats, setStats] = useState({ total: 0, active: 0, active24: 0, inactive: 0 });

  useEffect(() => {
    const user = localStorage.getItem('anime_user');
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.username === 'Malika') {
        setCurrentUser(parsed);
        loadUsers();
      } else {
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, search, filterStatus]);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3500);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const list = data || [];
      setUsers(list);

      const activeCount = list.filter(u => {
        if (!u.last_seen) return false;
        return (Date.now() - new Date(u.last_seen).getTime()) < 10 * 60000; // 10 minutes
      }).length;

      const active24Count = list.filter(u => {
        if (!u.last_seen) return false;
        return (Date.now() - new Date(u.last_seen).getTime()) < 24 * 60 * 60000; // 24 hours
      }).length;

      setStats({ 
        total: list.length, 
        active: activeCount, 
        active24: active24Count, 
        inactive: list.length - active24Count 
      });
    } catch (e) {
      showToast('error', 'Yuklashda xatolik: ' + e.message);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let list = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }
    
    if (filterStatus === 'active') {
      list = list.filter(u => u.last_seen && (Date.now() - new Date(u.last_seen).getTime()) < 10 * 60000);
    } else if (filterStatus === 'active24') {
      list = list.filter(u => u.last_seen && (Date.now() - new Date(u.last_seen).getTime()) < 24 * 60 * 60000);
    } else if (filterStatus === 'inactive') {
      // Here inactive means older than 24 hours
      list = list.filter(u => !u.last_seen || (Date.now() - new Date(u.last_seen).getTime()) >= 24 * 60 * 60000);
    }
    
    setFiltered(list);
  };

  // ─── DELETE ────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      let ids = [];
      if (deleteModal.target === 'bulk') {
        ids = selectedUsers;
      } else {
        ids = [deleteModal.target.id];
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .in('id', ids);

      if (error) throw error;

      setUsers(prev => prev.filter(u => !ids.includes(u.id)));
      setSelectedUsers([]);
      setDeleteModal({ show: false, target: null });
      showToast('success', `${ids.length} ta foydalanuvchi o'chirildi!`);
    } catch (e) {
      showToast('error', 'O\'chirishda xatolik: ' + e.message);
    }
    setDeleting(false);
  };

  // ─── NOTIFICATION ──────────────────────────────────────────────────────────

  const handleSendNotif = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      showToast('error', 'Sarlavha va matn kiritish majburiy!');
      return;
    }
    setSending(true);
    try {
      let targetIds = [];
      if (notifModal.target === 'bulk') {
        targetIds = selectedUsers;
      } else if (notifModal.target === null) {
        targetIds = users.map(u => u.id);
      } else {
        targetIds = [notifModal.target.id];
      }

      if (targetIds.length === 0) {
        showToast('error', 'Hech qanday foydalanuvchi tanlanmagan!');
        setSending(false);
        return;
      }

      const rows = targetIds.map(uid => ({
        user_id: uid,
        title:   notifTitle.trim(),
        message: notifMessage.trim(),
        type:    notifType,
        is_read: false,
      }));

      const { error } = await supabase.from('notifications').insert(rows);
      if (error) throw error;

      setNotifModal({ show: false, target: null });
      setNotifTitle('');
      setNotifMessage('');
      setNotifType('info');
      setSelectedUsers([]);
      showToast('success', `${targetIds.length} ta foydalanuvchiga xabar yuborildi!`);
    } catch (e) {
      showToast('error', 'Xatolik: ' + e.message);
    }
    setSending(false);
  };

  const toggleSelectUser = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filtered.length && filtered.length > 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filtered.map(u => u.id));
    }
  };

  if (!authChecked || !currentUser) return null;

  // Delete modal target info
  const deleteTargetName = deleteModal.target === 'bulk'
    ? `${selectedUsers.length} ta foydalanuvchi`
    : deleteModal.target
      ? `@${deleteModal.target.username}`
      : '';

  return (
    <>
      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }

        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; outline: none; }
        body { font-family: 'Courier New', Courier, monospace; background: #000; color: #fff; padding: 20px; min-height: 100vh; }

        .page { max-width: 1300px; margin: 0 auto; }

        /* HEADER */
        .header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 24px 30px; border: 2px solid #fff; border-radius: 12px;
          margin-bottom: 28px; flex-wrap: wrap; gap: 15px;
        }
        .header-title { font-size: 26px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; display: flex; align-items: center; gap: 12px; }
        .header-btns { display: flex; gap: 10px; flex-wrap: wrap; }
        .btn {
          background: #000; border: 2px solid #fff; color: #fff;
          padding: 10px 18px; border-radius: 8px; cursor: pointer;
          font-size: 13px; font-weight: 700; font-family: 'Courier New', monospace;
          text-transform: uppercase; display: flex; align-items: center; gap: 8px;
          transition: all 0.2s; white-space: nowrap;
        }
        .btn:hover { background: #fff; color: #000; }
        .btn.accent { border-color: #d946ef; color: #d946ef; }
        .btn.accent:hover { background: #d946ef; color: #000; }
        .btn.danger { border-color: #ef4444; color: #ef4444; }
        .btn.danger:hover { background: #ef4444; color: #fff; }

        /* STATS (Changed to 4 columns) */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat-card {
          border: 2px solid #fff; border-radius: 12px; padding: 20px 24px;
          cursor: pointer; transition: all 0.2s; background: #000;
        }
        .stat-card:hover { background: rgba(255,255,255,0.04); }
        .stat-card.active-filter { background: #fff; color: #000; }
        .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; opacity: 0.6; }
        .stat-card.active-filter .stat-label { opacity: 0.7; }
        .stat-value { font-size: 32px; font-weight: 800; }
        .stat-value.green { color: #22c55e; }
        .stat-value.yellow { color: #f59e0b; }
        .stat-value.red   { color: #ef4444; }
        .stat-card.active-filter .stat-value { color: #000; }

        /* TOOLBAR */
        .toolbar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
        .search-box {
          flex: 1; min-width: 200px; display: flex; align-items: center; gap: 10px;
          border: 2px solid #fff; border-radius: 8px; padding: 10px 14px;
          background: #000;
        }
        .search-box input {
          flex: 1; background: transparent; border: none; color: #fff;
          font-size: 14px; font-family: 'Courier New', monospace;
        }
        .search-box input::placeholder { color: #555; }

        /* BULK BAR */
        .bulk-bar {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 20px; border: 2px solid #d946ef; border-radius: 10px;
          margin-bottom: 16px; background: rgba(217,70,239,0.06);
          flex-wrap: wrap;
        }
        .bulk-count { font-weight: 700; color: #d946ef; font-size: 14px; flex: 1; }

        /* Checkbox */
        .cb {
          width: 22px; height: 22px; border: 2px solid #fff; border-radius: 6px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0; background: #000;
        }
        .cb.checked { background: #d946ef; border-color: #d946ef; }

        /* ─── CARDS GRID SYSTEM ─── */
        .users-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .user-card {
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 14px;
          padding: 20px;
          background: #080808;
          transition: all 0.2s ease;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .user-card:hover {
          border-color: rgba(255,255,255,0.4);
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.5);
        }
        .user-card.selected {
          border-color: #d946ef;
          background: rgba(217,70,239,0.08);
        }
        
        .user-card .cb {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 2;
        }

        .card-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 14px;
          margin-top: 8px;
        }
        .avatar-wrap { position: relative; margin-bottom: 12px; }
        .avatar {
          width: 70px; height: 70px; border-radius: 50%;
          object-fit: cover; border: 3px solid #222;
          background: #1a1a1a;
        }
        .active-dot {
          position: absolute; bottom: 3px; right: 3px;
          width: 14px; height: 14px; border-radius: 50%;
          border: 3px solid #080808;
        }
        .active-dot.online { background: #22c55e; animation: pulse 2s infinite; }
        .active-dot.offline { background: #555; }

        .user-name { font-weight: 800; font-size: 16px; letter-spacing: 0.5px; }
        .user-email { font-size: 12px; color: #888; margin-top: 4px; word-break: break-all; }

        .card-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .status-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 20px; font-size: 11px;
          font-weight: 700; white-space: nowrap; border: 1.5px solid;
        }

        .join-date { font-size: 12px; color: #666; display: flex; align-items: center; gap: 6px; }
        
        .user-bio { 
          font-size: 12px; color: #999; text-align: center; 
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; 
          overflow: hidden; min-height: 28px;
        }

        /* Card actions */
        .card-actions {
          display: flex; gap: 10px;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 16px;
        }
        .icon-btn {
          flex: 1;
          border: 2px solid rgba(255,255,255,0.2); border-radius: 8px; 
          background: transparent; color: #fff;
          height: 38px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 0.2s; font-family: 'Courier New', monospace; font-size: 12px; font-weight: 700;
        }
        .icon-btn:hover { background: #d946ef; border-color: #d946ef; color: #000; }
        .icon-btn.delete-btn:hover { background: #ef4444; border-color: #ef4444; color: #fff; }

        /* Empty */
        .empty-state {
          padding: 80px 20px; text-align: center; color: #555; font-size: 15px; grid-column: 1 / -1;
        }

        /* MODALS */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.92);
          z-index: 99999; display: flex; align-items: center; justify-content: center;
          padding: 20px; backdrop-filter: blur(10px);
        }
        .modal {
          background: #000; border: 2px solid #fff; border-radius: 16px;
          padding: 32px; max-width: 520px; width: 100%;
        }
        .modal.danger-modal { border-color: #ef4444; animation: shake 0.4s ease; }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px; padding-bottom: 18px; border-bottom: 2px solid rgba(255,255,255,0.1);
        }
        .modal.danger-modal .modal-header { border-bottom-color: rgba(239,68,68,0.2); }
        .modal-title { font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        .modal-title.danger { color: #ef4444; }
        .close-btn {
          background: #000; border: 2px solid #fff; color: #fff;
          width: 34px; height: 34px; border-radius: 8px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all 0.2s;
        }
        .close-btn:hover { background: #fff; color: #000; }

        .delete-warn {
          display: flex; gap: 14px; align-items: flex-start;
          padding: 18px; border: 2px solid rgba(239,68,68,0.4);
          border-radius: 12px; background: rgba(239,68,68,0.06); margin-bottom: 24px;
        }
        .delete-warn-icon { flex-shrink: 0; color: #ef4444; margin-top: 2px; }
        .delete-warn-title { font-size: 15px; font-weight: 800; margin-bottom: 6px; }
        .delete-warn-sub { font-size: 13px; color: #888; line-height: 1.6; }
        .delete-warn-sub span { color: #ef4444; font-weight: 700; }

        .target-info {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border: 1.5px solid rgba(217,70,239,0.4);
          border-radius: 10px; margin-bottom: 20px;
          background: rgba(217,70,239,0.06);
        }
        .target-name { font-weight: 700; font-size: 14px; }
        .target-sub  { font-size: 11px; color: #888; margin-top: 2px; }

        .form-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 8px; display: block; }
        .form-group { margin-bottom: 18px; }
        .form-input, .form-textarea {
          width: 100%; background: #000; border: 2px solid rgba(255,255,255,0.2);
          border-radius: 10px; color: #fff; padding: 12px 14px;
          font-size: 14px; font-family: 'Courier New', monospace;
          transition: border 0.2s;
        }
        .form-input:focus, .form-textarea:focus { border-color: #d946ef; }
        .form-textarea { min-height: 100px; resize: vertical; }

        .type-selector { display: flex; gap: 8px; }
        .type-btn {
          flex: 1; padding: 9px; border: 2px solid rgba(255,255,255,0.2);
          border-radius: 8px; background: #000; color: #888; cursor: pointer;
          font-size: 12px; font-weight: 700; font-family: 'Courier New', monospace;
          text-transform: uppercase; transition: all 0.2s; text-align: center;
        }
        .type-btn.active-info    { border-color: #60a5fa; color: #60a5fa; background: rgba(96,165,250,0.08); }
        .type-btn.active-success { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,0.08); }
        .type-btn.active-warning { border-color: #f59e0b; color: #f59e0b; background: rgba(245,158,11,0.08); }

        .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }
        .modal-btn {
          padding: 11px 24px; border: 2px solid; border-radius: 8px;
          font-weight: 800; cursor: pointer; font-size: 13px;
          font-family: 'Courier New', monospace; text-transform: uppercase;
          display: flex; align-items: center; gap: 8px; transition: all 0.2s;
        }
        .modal-btn.send    { background: #000; color: #d946ef; border-color: #d946ef; }
        .modal-btn.send:hover { background: #d946ef; color: #000; }
        .modal-btn.delete  { background: #000; color: #ef4444; border-color: #ef4444; }
        .modal-btn.delete:hover { background: #ef4444; color: #fff; }
        .modal-btn.cancel  { background: #000; color: #fff; border-color: #fff; }
        .modal-btn.cancel:hover { background: #fff; color: #000; }
        .modal-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* TOAST */
        .toast {
          position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
          padding: 12px 24px; border-radius: 30px; z-index: 999999;
          display: flex; align-items: center; gap: 10px; font-weight: 700;
          font-size: 13px; font-family: 'Courier New', monospace;
          box-shadow: 0 10px 30px rgba(0,0,0,0.6); border: 2px solid;
          backdrop-filter: blur(10px); white-space: nowrap;
        }
        .toast.success { background: rgba(0,0,0,0.95); color: #22c55e; border-color: #22c55e; }
        .toast.error   { background: rgba(0,0,0,0.95); color: #ef4444; border-color: #ef4444; }

        /* RESPONSIVE GRID */
        @media (max-width: 1150px) {
          .users-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .users-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          body { padding: 12px; }
          .stats-grid { grid-template-columns: 1fr; gap: 10px; }
          .stat-value { font-size: 26px; }
          .users-grid { grid-template-columns: 1fr; }
          .header-title { font-size: 20px; }
        }
      `}</style>

      {/* TOAST */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <Check size={15} /> : <X size={15} />}
          {toast.message}
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteModal.show && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteModal({ show: false, target: null })}>
          <div className="modal danger-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title danger">
                <Trash2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                O'chirishni tasdiqlang
              </span>
              <button className="close-btn" onClick={() => setDeleteModal({ show: false, target: null })} disabled={deleting}>
                <X size={16} />
              </button>
            </div>

            <div className="delete-warn">
              <AlertTriangle size={22} className="delete-warn-icon" />
              <div>
                <div className="delete-warn-title">Bu amalni qaytarib bo'lmaydi!</div>
                <div className="delete-warn-sub">
                  <span>{deleteTargetName}</span> o'chirilsa, barcha ma'lumotlari
                  (xabarlar, bildirishnomalar, sozlamalar) ham butunlay o'chib ketadi.
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setDeleteModal({ show: false, target: null })} disabled={deleting}>
                Bekor
              </button>
              <button className="modal-btn delete" onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting
                  ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  : <Trash2 size={15} />}
                Ha, o'chir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICATION MODAL ── */}
      {notifModal.show && (
        <div className="modal-overlay" onClick={() => setNotifModal({ show: false, target: null })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                <Bell size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                Xabar yuborish
              </span>
              <button className="close-btn" onClick={() => setNotifModal({ show: false, target: null })}><X size={16} /></button>
            </div>

            <div className="target-info">
              {notifModal.target === null ? (
                <>
                  <Users size={28} style={{ color: '#d946ef', flexShrink: 0 }} />
                  <div>
                    <div className="target-name">Barcha foydalanuvchilar</div>
                    <div className="target-sub">{users.length} ta foydalanuvchiga yuboriladi</div>
                  </div>
                </>
              ) : notifModal.target === 'bulk' ? (
                <>
                  <CheckCircle size={28} style={{ color: '#d946ef', flexShrink: 0 }} />
                  <div>
                    <div className="target-name">Tanlangan foydalanuvchilar</div>
                    <div className="target-sub">{selectedUsers.length} ta foydalanuvchiga yuboriladi</div>
                  </div>
                </>
              ) : (
                <>
                  <img src={notifModal.target.avatar_url || DEFAULT_AVATAR} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                  <div>
                    <div className="target-name">@{notifModal.target.username}</div>
                    <div className="target-sub">Faqat shu foydalanuvchiga yuboriladi</div>
                  </div>
                </>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Xabar turi</label>
              <div className="type-selector">
                {['info', 'success', 'warning'].map(t => (
                  <button key={t} className={`type-btn ${notifType === t ? `active-${t}` : ''}`} onClick={() => setNotifType(t)}>
                    {t === 'info' ? 'Axborot' : t === 'success' ? 'Muvaffaq.' : 'Ogohlant.'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Sarlavha *</label>
              <input className="form-input" placeholder="Xabar sarlavhasi..." value={notifTitle} onChange={e => setNotifTitle(e.target.value)} disabled={sending} />
            </div>

            <div className="form-group">
              <label className="form-label">Matn *</label>
              <textarea className="form-textarea" placeholder="Xabar matni..." value={notifMessage} onChange={e => setNotifMessage(e.target.value)} disabled={sending} />
            </div>

            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setNotifModal({ show: false, target: null })} disabled={sending}>Bekor</button>
              <button className="modal-btn send" onClick={handleSendNotif} disabled={sending}>
                {sending ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                Yuborish
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page">
        {/* HEADER */}
        <div className="header">
          <div className="header-title">
            <Users size={26} />
            Foydalanuvchilar
          </div>
          <div className="header-btns">
            <button className="btn accent" onClick={() => { setNotifTitle(''); setNotifMessage(''); setNotifType('info'); setNotifModal({ show: true, target: null }); }}>
              <Bell size={14} /> Barchaga xabar
            </button>
            <button className="btn" onClick={loadUsers}>
              <RefreshCw size={14} /> Yangilash
            </button>
            <button className="btn" onClick={() => window.location.href = '/admin/admin'}>
              <ArrowLeft size={14} /> Orqaga
            </button>
          </div>
        </div>

        {/* STATS (Now 4 cards) */}
        <div className="stats-grid">
          <div className={`stat-card ${filterStatus === 'all' ? 'active-filter' : ''}`} onClick={() => setFilterStatus('all')}>
            <div className="stat-label"><Users size={12} /> Jami</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className={`stat-card ${filterStatus === 'active' ? 'active-filter' : ''}`} onClick={() => setFilterStatus('active')}>
            <div className="stat-label"><Activity size={12} /> Hozir faol (10 daq)</div>
            <div className={`stat-value ${filterStatus !== 'active' ? 'green' : ''}`}>{stats.active}</div>
          </div>
          <div className={`stat-card ${filterStatus === 'active24' ? 'active-filter' : ''}`} onClick={() => setFilterStatus('active24')}>
            <div className="stat-label"><Clock size={12} /> 24 soat ichida faol</div>
            <div className={`stat-value ${filterStatus !== 'active24' ? 'yellow' : ''}`}>{stats.active24}</div>
          </div>
          <div className={`stat-card ${filterStatus === 'inactive' ? 'active-filter' : ''}`} onClick={() => setFilterStatus('inactive')}>
            <div className="stat-label"><BellOff size={12} /> Faol emas (+24s)</div>
            <div className={`stat-value ${filterStatus !== 'inactive' ? 'red' : ''}`}>{stats.inactive}</div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="toolbar">
          <button 
            className={`btn ${selectedUsers.length === filtered.length && filtered.length > 0 ? 'accent' : ''}`}
            onClick={toggleSelectAll}
          >
            {selectedUsers.length === filtered.length && filtered.length > 0 ? <Check size={14} /> : <CheckCircle size={14} />}
            Barchasini tanlash
          </button>
          
          <div className="search-box">
            <Search size={16} style={{ color: '#555', flexShrink: 0 }} />
            <input
              placeholder="Username yoki email bo'yicha qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* BULK ACTION BAR */}
        {selectedUsers.length > 0 && (
          <div className="bulk-bar">
            <span className="bulk-count">{selectedUsers.length} ta foydalanuvchi tanlandi</span>
            <button className="btn accent" style={{ padding: '8px 16px', fontSize: 12 }}
              onClick={() => { setNotifTitle(''); setNotifMessage(''); setNotifType('info'); setNotifModal({ show: true, target: 'bulk' }); }}>
              <Send size={14} /> Xabar
            </button>
            <button className="btn danger" style={{ padding: '8px 16px', fontSize: 12 }}
              onClick={() => setDeleteModal({ show: true, target: 'bulk' })}>
              <Trash2 size={14} /> O'chirish
            </button>
            <button className="btn" style={{ padding: '8px 16px', fontSize: 12 }}
              onClick={() => setSelectedUsers([])}>
              <X size={14} /> Bekor
            </button>
          </div>
        )}

        {/* CARDS GRID */}
        {loading ? (
          <div className="empty-state">
            <Loader size={32} style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 16px' }} />
            Yuklanmoqda...
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Inbox size={40} style={{ display: 'block', margin: '0 auto 14px', opacity: 0.3 }} />
            Foydalanuvchilar topilmadi
          </div>
        ) : (
          <div className="users-grid">
            {filtered.map(user => {
              const status = getActivityStatus(user.last_seen);
              const isSelected = selectedUsers.includes(user.id);
              
              return (
                <div key={user.id} className={`user-card ${isSelected ? 'selected' : ''}`}>
                  {/* Absolute Checkbox */}
                  <div className={`cb ${isSelected ? 'checked' : ''}`} onClick={() => toggleSelectUser(user.id)}>
                    {isSelected && <Check size={14} color="#fff" />}
                  </div>

                  {/* Header (Avatar + Info) */}
                  <div className="card-top">
                    <div className="avatar-wrap">
                      <img className="avatar" src={user.avatar_url || DEFAULT_AVATAR} alt="" />
                      <span className={`active-dot ${status.active ? 'online' : 'offline'}`} />
                    </div>
                    <div className="user-name">@{user.username}</div>
                    {user.email && <div className="user-email">{user.email}</div>}
                  </div>

                  {/* Body (Status, Date, Bio) */}
                  <div className="card-info">
                    <span className="status-pill" style={{ color: status.color, borderColor: status.color, background: status.color + '15' }}>
                      <Circle size={8} fill={status.color} stroke="none" />
                      {status.label}
                    </span>
                    
                    <div className="join-date">
                      <Calendar size={13} />
                      {formatDate(user.created_at)}
                    </div>

                    <div className="user-bio" title={user.bio}>
                      {user.bio || <span style={{ opacity: 0.3 }}>— bio mavjud emas —</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="card-actions">
                    <button
                      className="icon-btn"
                      title="Xabar yuborish"
                      onClick={() => { setNotifTitle(''); setNotifMessage(''); setNotifType('info'); setNotifModal({ show: true, target: user }); }}
                    >
                      <MessageSquare size={14} /> Xabar
                    </button>
                    <button
                      className="icon-btn delete-btn"
                      title="O'chirish"
                      onClick={() => setDeleteModal({ show: true, target: user })}
                    >
                      <Trash2 size={14} /> O'chirish
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ textAlign: 'right', marginTop: 20, fontSize: 13, color: '#666', fontFamily: 'Courier New, monospace' }}>
            {filtered.length} / {users.length} foydalanuvchi ko'rsatilmoqda
          </div>
        )}
      </div>
    </>
  );
}