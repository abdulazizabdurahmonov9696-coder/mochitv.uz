import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import { Heart, LogOut, Lock, Loader, Eye, Play, Youtube, X, Search, Calendar, ExternalLink, ThumbsUp, Share2, CheckCircle, Star, Bell, ChevronRight, Grid, AlignJustify } from 'lucide-react';
import { FaTelegramPlane } from "react-icons/fa";
import { IoBookmarkOutline, IoBookmark } from "react-icons/io5";
import { LuInstagram } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";
import { AiFillFire } from "react-icons/ai";
import Head from "next/head";
import { createClient } from '@supabase/supabase-js';
import MobileNavbar from '../components/MobileNavbar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOGO_URL = '/assets/lego.png';
const DEFAULT_AVATAR = "https://i.pinimg.com/736x/ce/21/07/ce21071acfd1e9deb34850f70285a5f0.jpg";

const getDailySeed = () => {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
};

const dailyShuffle = (array) => {
  const seed = getDailySeed();
  const shuffled = [...array];
  const random = (seedValue) => { var x = Math.sin(seedValue) * 10000; return x - Math.floor(x); };
  let currentSeed = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    const r = random(currentSeed++);
    const j = Math.floor(r * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const SkeletonCard = () => (
  <div className="anime-card-skeleton">
    <div className="skeleton-image-wrapper"><div className="skel-shimmer"></div></div>
    <div className="skeleton-text-line title"><div className="skel-shimmer"></div></div>
    <div className="skeleton-text-line meta"><div className="skel-shimmer"></div></div>
  </div>
);

function AnimeCard({ anime, allViews, favorites, toggleFavorite, goToAnime, isHorizontal = false }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isFav = favorites.includes(anime.id);

  return (
    <div className={`anime-card ${isHorizontal ? 'horizontal-card' : ''}`} onClick={() => goToAnime(anime)}>
      <div className="card-image-wrapper">
        {!imageLoaded && <div className="skeleton-image-overlay"><div className="skel-shimmer"></div></div>}
        <img
          className={`card-image ${imageLoaded ? 'loaded' : 'loading'}`}
          src={anime.image_url}
          alt={anime.title}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="card-top-row">
          <div className="card-rating-badge">
            <Star size={10} fill="currentColor" />
            <span>{anime.rating}</span>
          </div>
          <button
            className={`card-bookmark-btn ${isFav ? 'bookmarked' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleFavorite(anime.id); }}
          >
            {isFav ? <IoBookmark size={18} /> : <IoBookmarkOutline size={18} />}
          </button>
        </div>
        <div className="card-hover-overlay">
          <div className="card-play-circle">
            <Play size={22} fill="white" />
          </div>
          <div className="card-ep-badge">{anime.episodes} qism</div>
        </div>
      </div>
      <div className="card-info">
        <div className="card-title">{anime.title}</div>
      </div>
    </div>
  );
}

function SearchModal({ onClose, animeCards, onAnimeClick, allViews }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSearchResults(animeCards.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [searchQuery, animeCards]);

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-panel" onClick={e => e.stopPropagation()}>
        <div className="search-panel-header">
          <div className="search-field">
            <Search size={18} className="search-field-icon" />
            <input
              type="text"
              className="search-field-input"
              placeholder="Anime qidirish..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}><X size={16} /></button>
            )}
          </div>
          <button className="search-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="search-body">
          {!searchQuery.trim() ? (
            <div className="search-placeholder">
              <Search size={40} strokeWidth={1.5} />
              <p>Anime nomini kiriting</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="search-placeholder"><p>Natija topilmadi</p></div>
          ) : (
            <div className="search-list">
              {searchResults.map(anime => (
                <div key={anime.id} className="search-item" onClick={() => { onAnimeClick(anime); onClose(); }}>
                  <img src={anime.image_url} alt={anime.title} className="search-item-thumb" />
                  <div className="search-item-info">
                    <div className="search-item-title">{anime.title}</div>
                    <div className="search-item-meta">
                      <span>⭐ {anime.rating}</span>
                      <span>📺 {anime.episodes} qism</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="search-item-arrow" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TelegramCodeModal({ onClose, onVerify, onStart, loading, errorText }) {
  const [code, setCode] = useState('');
  const submit = (e) => { e.preventDefault(); if (String(code).trim().length !== 5) return; onVerify(code); };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-box" onClick={e => e.stopPropagation()}>
        <button className="auth-box-close" onClick={onClose}><X size={18} /></button>
        <div className="auth-box-head">
          <div className="auth-icon tg"><FaTelegramPlane size={22} /></div>
          <h2 className="auth-box-title">Telegram orqali kirish</h2>
          <p className="auth-box-sub">Botga <b>Start</b> bosing — 5 xonali kod keladi.</p>
        </div>
        <button className="tg-start-btn" onClick={onStart} disabled={loading}>
          <FaTelegramPlane size={18} /> Botga o'tish / Start
        </button>
        <form className="auth-form" onSubmit={submit}>
          <div className="field-group">
            <label className="field-label">5 xonali kod</label>
            <input type="text" inputMode="numeric" maxLength={5} className="field-input" placeholder="XXXXX"
              value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} disabled={loading} required />
          </div>
          {errorText && <div className="auth-error">{errorText}</div>}
          <button type="submit" className="auth-submit-btn" disabled={loading || String(code).trim().length !== 5}>
            {loading ? <><Loader className="spin" size={16} /> Tekshirilmoqda...</> : "Kodni tasdiqlash"}
          </button>
        </form>
        <p className="auth-hint">Kod kelmadimi? <b>/start</b> ni qayta bosing.</p>
      </div>
    </div>
  );
}

function AuthModal({ mode, onClose, onLogin, onRegister, onTelegramOpen, loading }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentMode, setCurrentMode] = useState(mode);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentMode === 'login') onLogin(username, password);
    else onRegister(username, password, confirmPassword);
  };

  const switchMode = () => {
    setCurrentMode(m => m === 'login' ? 'register' : 'login');
    setUsername(''); setPassword(''); setConfirmPassword('');
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-box" onClick={e => e.stopPropagation()}>
        <button className="auth-box-close" onClick={onClose}><X size={18} /></button>
        <div className="auth-box-head">
          <div className="auth-brand-dot"></div>
          <h2 className="auth-box-title">{currentMode === 'login' ? 'Xush kelibsiz' : "Ro'yxatdan o'tish"}</h2>
          <p className="auth-box-sub">{currentMode === 'login' ? 'Akkauntingizga kiring' : 'Yangi akkount yarating'}</p>
        </div>
        <button className="tg-start-btn" onClick={onTelegramOpen} disabled={loading}>
          <FaTelegramPlane size={18} />
          Telegram orqali {currentMode === 'login' ? 'kirish' : "ro'yxatdan o'tish"}
        </button>
        <div className="auth-sep"><span>yoki</span></div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Username</label>
            <input type="text" maxLength={10} className="field-input" placeholder="Username kiriting"
              value={username} onChange={e => setUsername(e.target.value)} required disabled={loading} />
          </div>
          <div className="field-group">
            <label className="field-label">Parol</label>
            <input type="password" className="field-input" placeholder="Parol kiriting"
              value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
          </div>
          {currentMode === 'register' && (
            <div className="field-group">
              <label className="field-label">Parolni tasdiqlang</label>
              <input type="password" className="field-input" placeholder="Parolni qayta kiriting"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={loading} />
            </div>
          )}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <><Loader className="spin" size={16} /> Kuting...</> : (currentMode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish")}
          </button>
        </form>
        <div className="auth-switch">
          {currentMode === 'login' ? "Akkauntingiz yo'qmi? " : "Akkauntingiz bormi? "}
          <span className="auth-switch-link" onClick={switchMode}>
            {currentMode === 'login' ? "Ro'yxatdan o'tish" : 'Kirish'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [modal, setModal] = useState({ show: false, type: '', message: '', onConfirm: null });
  const [authModal, setAuthModal] = useState({ show: false, mode: 'login' });
  const [searchModal, setSearchModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [tgModal, setTgModal] = useState(false);
  const [tgAuthLoading, setTgAuthLoading] = useState(false);
  const [tgAuthError, setTgAuthError] = useState('');
  const [carouselData, setCarouselData] = useState([]);
  const [animeCards, setAnimeCards] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [row1, setRow1] = useState([]);
  const [row2, setRow2] = useState([]);
  const [row3, setRow3] = useState([]);
  const [row4, setRow4] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [allViews, setAllViews] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userLayout, setUserLayout] = useState('horizontal');
  const [displayedGridItems, setDisplayedGridItems] = useState(15);
  const [isMountedForGrid, setIsMountedForGrid] = useState(false);
  const avatarMenuRef = useRef(null);

  const showModal = (type, message, onConfirm = null) => setModal({ show: true, type, message, onConfirm });
  const hideModal = () => setModal({ show: false, type: '', message: '', onConfirm: null });
  const showAuthModal = (mode = 'login') => setAuthModal({ show: true, mode });
  const hideAuthModal = () => setAuthModal({ show: false, mode: 'login' });
  const showSearchModal = () => { setSearchModal(true); setActiveTab('search'); };
  const hideSearchModal = () => { setSearchModal(false); setActiveTab('home'); };
  const openTelegramModal = () => { setTgAuthError(''); setTgModal(true); };
  const closeTelegramModal = () => { setTgAuthError(''); setTgModal(false); };
  const handleHomeClick = () => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleSearchClick = () => { setActiveTab('search'); showSearchModal(); };
  const handleProfileClick = () => { setActiveTab('profile'); if (currentUser) goToProfile(); else showAuthModal('login'); };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) setShowAvatarMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMounted(true);
    setIsMountedForGrid(true);
    checkCurrentUser();
    loadData();
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    if (carouselData.length > 0) {
      const interval = setInterval(() => setCurrentSlide(p => (p + 1) % carouselData.length), 5000);
      return () => clearInterval(interval);
    }
  }, [carouselData]);

  useEffect(() => {
    if (isMountedForGrid && userLayout === 'grid') setDisplayedGridItems(getResponsiveLoadCount());
  }, [userLayout, isMountedForGrid]);

  const checkIsMobile = () => setIsMobile(window.innerWidth < 1200);
  const getResponsiveLoadCount = () => {
    if (typeof window === 'undefined') return 15;
    const w = window.innerWidth;
    if (w < 768) return 14;
    if (w < 1200) return 12;
    return 15;
  };

  const checkCurrentUser = async () => {
    try {
      const user = localStorage.getItem('anime_user');
      if (user) {
        const userData = JSON.parse(user);
        setCurrentUser(userData);
        await loadUserFavorites(userData.id);
        await loadNotifications(userData.id);
        await loadUserLayout(userData.id);
      } else { setUserLayout('horizontal'); }
    } catch (error) { console.error('User check error:', error); setUserLayout('horizontal'); }
  };

  const loadUserFavorites = async (userId) => {
    try {
      const { data, error } = await supabase.from('user_favorites').select('anime_id').eq('user_id', userId);
      if (!error && data) setFavorites(data.map(f => f.anime_id));
    } catch (error) { console.error('Load favorites error:', error); }
  };

  const loadNotifications = async (userId) => {
    try {
      const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (data) setNotifications(data);
    } catch (e) { console.warn('Notifications load error:', e.message); }
  };

  const loadUserLayout = async (userId) => {
    try {
      const { data } = await supabase.from('page_section').select('layout').eq('user_id', userId).single();
      setUserLayout(data?.layout || 'horizontal');
    } catch (e) { setUserLayout('horizontal'); }
  };

  const loadAllViews = async () => {
    try {
      const { data, error } = await supabase.from('anime_views').select('anime_id, view_count');
      if (!error && data) {
        const viewsObj = {};
        data.forEach(v => { viewsObj[v.anime_id] = (viewsObj[v.anime_id] || 0) + v.view_count; });
        setAllViews(viewsObj);
      }
    } catch (error) { console.error('Load all views error:', error); }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: carouselItems } = await supabase.from('anime_carousel').select('*, anime_cards(*)').order('position', { ascending: true });
      const { data: cards } = await supabase.from('anime_cards').select('*').order('created_at', { ascending: false });
      const { data: news } = await supabase.from('news_posts').select('*').order('created_at', { ascending: false }).limit(10);
      setCarouselData(carouselItems || []);
      setAnimeCards(cards || []);
      setNewsData(news || []);
      if (cards?.length > 0) distributeAnimeRows(cards);
      await loadAllViews();
    } catch (error) { console.error('Xato:', error); }
    setLoading(false);
  };

  const distributeAnimeRows = (allCards) => {
    const shuffled = dailyShuffle([...allCards]);
    const q = Math.ceil(shuffled.length / 4);
    setRow1(shuffled.slice(0, q));
    setRow2(shuffled.slice(q, q * 2));
    setRow3(shuffled.slice(q * 2, q * 3));
    setRow4(shuffled.slice(q * 3));
  };

  const handleTelegramStart = async () => {
    setTgAuthError(''); setTgAuthLoading(true);
    try {
      const res = await fetch('/api/auth/telegram/start', { method: 'POST' });
      const data = await res.json();
      if (data?.botUrl) window.open(data.botUrl, '_blank');
      else window.open('https://t.me/mochitv_bot', '_blank');
    } catch (e) { window.open('https://t.me/mochitv_bot', '_blank'); }
    setTgAuthLoading(false);
  };

  const handleTelegramVerify = async (code) => {
    setTgAuthError(''); setTgAuthLoading(true);
    try {
      const res = await fetch('/api/auth/telegram/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
      const data = await res.json();
      if (!res.ok || !data.ok || !data.user) throw new Error(data.message || "Kod noto'g'ri yoki eskirgan");
      const finalUser = data.user;
      localStorage.setItem('anime_user', JSON.stringify(finalUser));
      setCurrentUser(finalUser);
      await loadUserFavorites(finalUser.id);
      await loadNotifications(finalUser.id);
      closeTelegramModal(); hideAuthModal();
      showModal('success', `Xush kelibsiz, ${finalUser.username}!`);
    } catch (e) { setTgAuthError(e.message || 'Xato yuz berdi'); }
    setTgAuthLoading(false);
  };

  const handleLogin = async (username, password) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.from('users').select('*').eq('username', username).eq('password', password).single();
      if (error || !data) { showModal('error', 'Username yoki parol xato!'); setAuthLoading(false); return; }
      localStorage.setItem('anime_user', JSON.stringify(data));
      setCurrentUser(data);
      await loadUserFavorites(data.id);
      await loadNotifications(data.id);
      hideAuthModal();
      showModal('success', 'Xush kelibsiz, ' + data.username + '!');
    } catch (error) { showModal('error', 'Kirish jarayonida xato yuz berdi'); }
    setAuthLoading(false);
  };

  const handleRegister = async (username, password, confirmPassword) => {
    if (!username || !password || !confirmPassword) { showModal('error', "Barcha maydonlarni to'ldiring!"); return; }
    if (username.length < 3) { showModal('error', "Username kamida 3 ta belgidan iborat bo'lishi kerak!"); return; }
    if (password.length < 6) { showModal('error', "Parol kamida 6 ta belgidan iborat bo'lishi kerak!"); return; }
    if (password !== confirmPassword) { showModal('error', 'Parollar mos kelmadi!'); return; }
    setAuthLoading(true);
    try {
      const { data: existingUser, error: checkError } = await supabase.from('users').select('username').eq('username', username).maybeSingle();
      if (checkError) { showModal('error', "Tekshirishda xato yuz berdi."); setAuthLoading(false); return; }
      if (existingUser) { showModal('error', 'Bu username allaqachon band!'); setAuthLoading(false); return; }
      const { data, error } = await supabase.from('users').insert([{ username, password }]).select().single();
      if (error) {
        const msgs = { '23505': 'Bu username allaqachon band!', '23502': "Majburiy maydon to'ldirilmagan.", '42501': "Ruxsat yo'q." };
        showModal('error', msgs[error.code] || 'Xato: ' + error.message);
        setAuthLoading(false); return;
      }
      localStorage.setItem('anime_user', JSON.stringify(data));
      setCurrentUser(data); hideAuthModal();
      showModal('success', "Ro'yxatdan o'tdingiz! Xush kelibsiz, " + data.username + "!");
    } catch (error) { showModal('error', 'Xato: ' + (error.message || "Noma'lum xato")); }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('anime_user');
    setCurrentUser(null); setFavorites([]); setNotifications([]); setShowAvatarMenu(false);
    showModal('success', 'Tizimdan chiqdingiz!');
  };

  const goToProfile = () => { if (currentUser) window.location.href = `/profile/${currentUser.username}`; };

  const toggleFavorite = async (animeId) => {
    if (!currentUser) { showModal('error', 'Saralanganlarni saqlash uchun tizimga kiring!'); return; }
    try {
      const isFavorite = favorites.includes(animeId);
      if (isFavorite) {
        const { error } = await supabase.from('user_favorites').delete().eq('user_id', currentUser.id).eq('anime_id', animeId);
        if (!error) setFavorites(favorites.filter(id => id !== animeId));
      } else {
        const { error } = await supabase.from('user_favorites').insert([{ user_id: currentUser.id, anime_id: animeId }]);
        if (!error) setFavorites([...favorites, animeId]);
      }
    } catch (error) { showModal('error', 'Xatolik yuz berdi'); }
  };

  const addView = async (animeId) => {
    try {
      const userId = currentUser ? currentUser.id : 'guest_' + Date.now();
      const { data: existing } = await supabase.from('anime_views').select('*').eq('user_id', userId).eq('anime_id', animeId).maybeSingle();
      if (existing) {
        await supabase.from('anime_views').update({ view_count: existing.view_count + 1, last_viewed: new Date().toISOString() }).eq('user_id', userId).eq('anime_id', animeId);
      } else {
        await supabase.from('anime_views').insert([{ user_id: userId, anime_id: animeId, view_count: 1 }]);
      }
      await loadAllViews();
    } catch (error) { console.error('View error:', error); }
  };

  const goToAnime = (anime) => {
    addView(anime.id);
    window.location.href = `/anime/${encodeURIComponent(anime.title.trim().replace(/\s+/g, '-'))}`;
  };

  const handleOpenNotifModal = () => {
    setShowNotifModal(true);
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length > 0) {
      supabase.from('notifications').update({ is_read: true }).in('id', unreadIds).then();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  if (!mounted) return null;
  const isAdmin = currentUser?.username === 'Malika';

  const ROW_TITLES = ['Bugun Tavsiya Etamiz', 'Trenddagi Animelar', 'Yangi Qo\'shilganlar', 'Afsonaviy Animelar'];
  const ROWS = [row1, row2, row3, row4];

  return (
    <>
      <Head>
        <title>MochiTv.Uz — Anime ko'rish platformasi | Eng zo'r animelar Uzbek tilida</title>
        <meta name="description" content="MochiTv — Eng so'nggi va mashhur animelarni online tomosha qiling. Uzbek tilida tarjima animelar, HD sifat, bepul anime platforma." />
        <meta name="keywords" content="anime uzbek tilida, anime online, tarjima anime, anime ko'rish, uzbek anime sayt, mochi tv, anime uz" />
        <meta name="author" content="MochiTV" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content="MochiTv.Uz — Cheksiz Anime Dunyosi" />
        <meta property="og:description" content="Eng zo'r animelarni Uzbek tilida tomosha qiling." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mochitv.uz" />
        <link rel="icon" href="https://mochitv.uz/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
      </Head>

      <Script src="https://5gvci.com/act/files/tag.min.js?z=10639082" data-cfasync="false" strategy="afterInteractive" />
      <Script id="propeller-vignette" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(s){s.dataset.zone='10639095',s.src='https://gizokraijaw.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))` }} />

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow-x: hidden; }

        :root {
          --bg: #0d0d0f;
          --bg2: #141416;
          --bg3: #1a1a1e;
          --surface: rgba(255,255,255,0.04);
          --surface2: rgba(255,255,255,0.07);
          --border: rgba(255,255,255,0.08);
          --border2: rgba(255,255,255,0.14);
          --accent: #f47521;
          --accent2: #ff8c3a;
          --accent-glow: rgba(244,117,33,0.25);
          --text: #f0f0f2;
          --text2: rgba(240,240,242,0.65);
          --text3: rgba(240,240,242,0.35);
          --gold: #fbbf24;
          --teal: #2aabee;
          --danger: #ef4444;
          --success: #22c55e;
          --radius: 14px;
          --radius-sm: 8px;
          --radius-lg: 20px;
          --radius-xl: 28px;
          --shadow: 0 8px 32px rgba(0,0,0,0.5);
          --shadow-lg: 0 24px 60px rgba(0,0,0,0.6);
        }

        body {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          color: var(--text);
          -webkit-tap-highlight-color: transparent;
        }

       
       

        /* ── SCROLLBAR ─────────────────────────────────── */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(244,117,33,0.4); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--accent); }

        /* ── BACKGROUND ────────────────────────────────── */
        .bg-noise {
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 180px;
          pointer-events: none; z-index: 0; opacity: 0.6;
        }
        .bg-gradient-orb {
          position: fixed; top: -30vh; left: 50%; transform: translateX(-50%);
          width: 80vw; height: 60vh;
          background: radial-gradient(ellipse, rgba(244,117,33,0.07) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        /* ── SHIMMER ANIMATION ─────────────────────────── */
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skel-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          animation: shimmer 1.8s ease-in-out infinite;
        }
        .anime-card-skeleton { flex: 0 0 auto; width: 190px; display: flex; flex-direction: column; gap: 10px; }
        .skeleton-image-wrapper {
          width: 100%; aspect-ratio: 2/3;
          background: var(--bg3); border-radius: var(--radius-lg);
          position: relative; overflow: hidden;
        }
        .skeleton-image-overlay { position: absolute; inset: 0; background: var(--bg3); z-index: 1; overflow: hidden; border-radius: inherit; }
        .skeleton-text-line { height: 14px; background: var(--bg3); border-radius: 6px; position: relative; overflow: hidden; }
        .skeleton-text-line.title { width: 80%; }
        .skeleton-text-line.meta { width: 50%; height: 11px; }

        /* ── HEADER ────────────────────────────────────── */
        .site-header {
          position: sticky; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 60px;
          height: 78px;
             backdrop-filter: blur(12px);
         border-bottom: 1px solid rgba(255, 255, 255, .1);
        }
        .header-logo { height: 36px; cursor: pointer; transition: opacity 0.2s; }
        .header-logo:hover { opacity: 0.85; }
        .header-nav { display: flex; align-items: center; gap: 4px; }
        .nav-link {
          display: flex; align-items: center; gap: 6px;
          color: var(--text2); font-size: 14px; font-weight: 500;
          padding: 8px 14px; border-radius: var(--radius-sm);
          text-decoration: none; transition: all 0.2s; white-space: nowrap;
          font-family: 'Outfit', sans-serif;
        }
        .nav-link:hover { color: var(--text); background: var(--surface2); }
        .header-right { display: flex; align-items: center; gap: 6px; }
        .icon-btn {
          background: none; border: none;
          color: var(--text2); width: 40px; height: 40px;
          border-radius: var(--radius-sm); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .icon-btn:hover { color: var(--text); background: var(--surface2); }
        .notif-wrap { position: relative; }
        .notif-badge {
          position: absolute; top: 5px; right: 5px;
          background: var(--accent); color: #fff;
          font-size: 9px; font-weight: 700; border-radius: 99px;
          min-width: 15px; height: 15px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--bg); padding: 0 3px;
        }
        .login-btn {
          background: var(--accent); border: none; color: #fff;
          padding: 9px 22px; border-radius: var(--radius-sm);
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all 0.25s; font-family: 'Outfit', sans-serif;
          letter-spacing: 0.01em;
        }
        .login-btn:hover { background: var(--accent2); transform: translateY(-1px); box-shadow: 0 4px 16px var(--accent-glow); }

        /* ── AVATAR ─────────────────────────────────────── */
        .avatar-wrap { position: relative; }
        .avatar-btn {
          width: 38px; height: 38px; border-radius: 50%;
          overflow: hidden; cursor: pointer;
          border: 2px solid var(--border2); transition: border-color 0.2s;
        }
        .avatar-btn:hover { border-color: var(--accent); }
        .avatar-btn img { width: 100%; height: 100%; object-fit: cover; display: block; }

        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .avatar-menu {
          position: absolute; top: calc(100% + 10px); right: 0;
          min-width: 200px; background: var(--bg2);
          border: 1px solid var(--border2); border-radius: var(--radius);
          box-shadow: var(--shadow-lg); padding: 6px; z-index: 9999;
          animation: dropDown 0.18s ease;
        }
        .avatar-menu-user {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px 12px; border-bottom: 1px solid var(--border); margin-bottom: 4px;
        }
        .avatar-menu-user img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--border2); }
        .avatar-menu-name { font-size: 14px; font-weight: 700; color: var(--text); font-family: 'Outfit', sans-serif; }
        .avatar-menu-role { font-size: 11px; color: var(--text3); margin-top: 1px; }
        .avatar-menu-item {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 12px; border-radius: 8px; cursor: pointer;
          font-size: 14px; font-weight: 500; color: var(--text2);
          transition: all 0.15s; border: none; background: none; width: 100%; text-align: left;
        }
        .avatar-menu-item:hover { background: var(--surface2); color: var(--text); }
        .avatar-menu-item.danger { color: rgba(239,68,68,0.8); }
        .avatar-menu-item.danger:hover { background: rgba(239,68,68,0.1); color: var(--danger); }
        .avatar-menu-sep { height: 1px; background: var(--border); margin: 4px 0; }

        /* ── CAROUSEL ───────────────────────────────────── */
        .carousel-wrap {
          width: 100%; height: 620px;
          position: relative; overflow: hidden; margin-bottom: 52px;
        }
        .carousel-slide {
          position: absolute; inset: 0;
          opacity: 0; transition: opacity 0.9s cubic-bezier(0.4,0,0.2,1);
          display: flex;
        }
        .carousel-slide.active { opacity: 1; z-index: 2; }
        .slide-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center top;
          filter: blur(20px) brightness(0.3) saturate(0.8);
          transform: scale(1.08);
        }
        .slide-vignette {
          position: absolute; inset: 0; z-index: 1;
          background:
            linear-gradient(90deg, rgba(13,13,15,0.95) 0%, rgba(13,13,15,0.5) 55%, rgba(13,13,15,0.85) 100%),
            linear-gradient(0deg, rgba(13,13,15,0.9) 0%, transparent 50%);
        }
        .slide-content {
          position: relative; z-index: 3; width: 100%;
          max-width: 1320px; margin: 0 auto; padding: 0 60px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 48px; height: 100%;
        }
        .slide-text { flex: 1; max-width: 620px; display: flex; flex-direction: column; padding-bottom: 32px; }
        .slide-meta-row {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 18px;
        }
        .slide-rating {
          display: flex; align-items: center; gap: 5px;
          background: rgba(251,191,36,0.15); border: 1px solid rgba(251,191,36,0.3);
          color: var(--gold); font-size: 13px; font-weight: 700;
          padding: 4px 10px; border-radius: 99px; font-family: 'Outfit', sans-serif;
        }
        .slide-ep {
          color: var(--text2); font-size: 13px; font-weight: 500;
          background: var(--surface); border: 1px solid var(--border);
          padding: 4px 10px; border-radius: 99px;
        }
        .slide-title {
          font-family: 'Outfit', sans-serif;
          font-size: 52px; font-weight: 900; line-height: 1.05;
          color: var(--text); margin-bottom: 14px;
          text-shadow: 0 4px 24px rgba(0,0,0,0.5);
          letter-spacing: -0.02em;
        }
        .slide-genres { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
        .genre-chip {
          font-size: 12px; font-weight: 600;
          padding: 4px 12px; border-radius: 99px;
          background: rgba(244,117,33,0.12);
          border: 1px solid rgba(244,117,33,0.35);
          color: var(--accent2); font-family: 'Outfit', sans-serif;
          letter-spacing: 0.02em;
        }
        .slide-desc {
          font-size: 15px; line-height: 1.7; color: var(--text2);
          margin-bottom: 28px;
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
        }
        .slide-actions { display: flex; gap: 12px; align-items: center; }
        .watch-btn {
          display: inline-flex; align-items: center; gap: 10px;
          background: var(--accent); border: none; color: #fff;
          padding: 14px 30px; border-radius: var(--radius-sm);
          font-size: 15px; font-weight: 700; cursor: pointer;
          transition: all 0.25s; font-family: 'Outfit', sans-serif; letter-spacing: 0.01em;
        }
        .watch-btn:hover { background: var(--accent2); transform: translateY(-2px); box-shadow: 0 8px 24px var(--accent-glow); }
        .watch-btn .play-icon { width: 36px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .slide-poster-wrap {
          flex: 0 0 280px; display: flex; align-items: center; justify-content: flex-end;
        }
        @keyframes floatPoster { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .slide-poster {
          width: 260px; aspect-ratio: 2/3; object-fit: cover;
          border-radius: var(--radius-xl);
          box-shadow: 0 32px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08), 0 0 40px var(--accent-glow);
          animation: floatPoster 7s ease-in-out infinite;
        }
        .carousel-dots {
          position: absolute; bottom: 0px; left: 50%; transform: translateX(-50%);
          display: flex; gap: 8px; z-index: 10;
        }
        .c-dot {
          height: 4px; border-radius: 99px; cursor: pointer;
          background: rgba(255,255,255,0.25); transition: all 0.35s; width: 20px;
        }
        .c-dot.active { background: var(--accent); width: 36px; }

        /* Carousel Skeleton */
        .carousel-skel {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 60px; max-width: 1320px; margin: 0 auto;
        }
        .cskel-content { flex: 1; display: flex; flex-direction: column; gap: 16px; }
        .cskel-tag { width: 100px; height: 28px; background: var(--bg3); border-radius: 99px; position: relative; overflow: hidden; }
        .cskel-title { width: 70%; height: 56px; background: var(--bg3); border-radius: var(--radius-sm); position: relative; overflow: hidden; }
        .cskel-desc { width: 90%; height: 60px; background: var(--bg3); border-radius: var(--radius-sm); position: relative; overflow: hidden; }
        .cskel-btn { width: 160px; height: 48px; background: var(--bg3); border-radius: var(--radius-sm); position: relative; overflow: hidden; }
        .cskel-poster { width: 240px; aspect-ratio: 2/3; background: var(--bg3); border-radius: var(--radius-xl); position: relative; overflow: hidden; }

        /* ── SECTION TITLES ─────────────────────────────── */
        .section-wrap {
          max-width: 1320px; margin: 0 auto 48px;
          padding: 0 20px 0 60px;
        }
        .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-right: 40px; }
        .section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px; font-weight: 800; color: var(--text);
          display: flex; align-items: center; gap: 10px;
          letter-spacing: -0.01em;
        }
        .section-title::before {
          content: '';
          display: block; width: 4px; height: 22px;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
          border-radius: 99px;
        }
        .section-more {
          display: flex; align-items: center; gap: 4px;
          font-size: 13px; font-weight: 600; color: var(--accent);
          cursor: pointer; transition: gap 0.2s;
          background: none; border: none; font-family: 'Outfit', sans-serif;
        }
        .section-more:hover { gap: 8px; }

        /* ── HORIZONTAL SCROLL ──────────────────────────── */
        .h-scroll {
          display: flex; gap: 14px; overflow-x: auto;
          padding-bottom: 12px; padding-right: 40px;
          scroll-behavior: smooth; -webkit-overflow-scrolling: touch;
        }
        .h-scroll::-webkit-scrollbar { height: 0; }

        /* ── ANIME CARD ─────────────────────────────────── */
        .anime-card {
          cursor: pointer; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
          position: relative; border-radius: var(--radius-lg); flex: 0 0 auto;
        }
        .horizontal-card { width: 190px; }
        .card-image-wrapper {
          width: 100%; aspect-ratio: 2/3;
          position: relative; overflow: hidden;
          border-radius: var(--radius-lg);
          background: var(--bg3);
        }
        .card-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; opacity: 0; border-radius: var(--radius-lg); }
        .card-image.loaded { opacity: 1; }

        .card-top-row {
          position: absolute; top: 0; left: 0; right: 0;
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 10px;
          background: linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 100%);
          z-index: 4;
        }
        .card-rating-badge {
          display: flex; align-items: center; gap: 4px;
          background: rgba(251,191,36,0.18); border: 1px solid rgba(251,191,36,0.4);
          color: var(--gold); font-size: 11px; font-weight: 700;
          padding: 3px 8px; border-radius: 99px;
          font-family: 'Outfit', sans-serif;
        }
        .card-bookmark-btn {
          background: rgba(0,0,0,0.4); border: none;
          color: rgba(255,255,255,0.75); width: 30px; height: 30px;
          border-radius: 8px; cursor: pointer; display: flex;
          align-items: center; justify-content: center; transition: all 0.2s;
          backdrop-filter: blur(4px);
        }
        .card-bookmark-btn:hover { color: #fff; background: rgba(0,0,0,0.6); }
        .card-bookmark-btn.bookmarked { color: var(--gold); }

        .card-hover-overlay {
          position: absolute; inset: 0; z-index: 3;
          background: linear-gradient(0deg, rgba(13,13,15,0.92) 0%, rgba(13,13,15,0.3) 50%, transparent 100%);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.3s;
          border-radius: var(--radius-lg);
        }
        .anime-card:hover .card-hover-overlay { opacity: 1; }
        .card-play-circle {
          width: 52px; height: 52px; border-radius: 50%;
          background: var(--accent); display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 24px var(--accent-glow);
        }
        .card-ep-badge {
          position: absolute; bottom: 10px; left: 10px;
          font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.85);
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
          padding: 3px 10px; border-radius: 99px; border: 1px solid var(--border);
          font-family: 'Outfit', sans-serif;
        }
        .card-info { padding: 8px 4px 4px; }
        .card-title {
          font-size: 13px; font-weight: 600; color: var(--text);
          overflow: hidden; display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          line-height: 1.4; font-family: 'DM Sans', sans-serif;
        }

        /* ── GRID LAYOUT ────────────────────────────────── */
        .grid-section { max-width: 1320px; margin: 0 auto 48px; padding: 0 60px; }
        .grid-container { display: grid; grid-template-columns: repeat(5,1fr); gap: 20px; }
        @media (max-width: 1200px) { .grid-container { grid-template-columns: repeat(4,1fr); } }
        @media (max-width: 768px) { .grid-container { grid-template-columns: repeat(2,1fr); gap: 12px; } .grid-section { padding: 0 16px; } }

        .load-more-btn {
          display: flex; justify-content: center; margin: 8px 0 40px;
        }
        .load-more-btn button {
          padding: 13px 36px; background: transparent;
          border: 1.5px solid var(--accent); color: var(--accent);
          font-size: 14px; font-weight: 700; border-radius: var(--radius-sm);
          cursor: pointer; transition: all 0.25s; font-family: 'Outfit', sans-serif;
          letter-spacing: 0.02em;
        }
        .load-more-btn button:hover { background: var(--accent); color: #fff; box-shadow: 0 4px 20px var(--accent-glow); transform: translateY(-2px); }

        /* ── ADMIN ─────────────────────────────────────── */
        .admin-bar { max-width: 1320px; margin: 0 auto 32px; padding: 0 60px; display: flex; }
        .admin-btn {
          display: flex; align-items: center; gap: 8px;
          background: none; border: 1.5px solid var(--border2);
          color: var(--text2); padding: 9px 20px; border-radius: var(--radius-sm);
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all 0.2s; font-family: 'Outfit', sans-serif;
        }
        .admin-btn:hover { color: var(--text); border-color: var(--accent); background: rgba(244,117,33,0.06); }

        /* ── SEARCH ─────────────────────────────────────── */
        .search-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.92);
          backdrop-filter: blur(12px); z-index: 99999;
          display: flex; align-items: flex-end; justify-content: center;
          animation: fadeIn 0.25s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .search-panel {
          background: var(--bg2); border-radius: 20px 20px 0 0;
          border: 1px solid var(--border2); border-bottom: none;
          width: 100%; max-width: 860px; max-height: 88vh; min-height: 88vh;
          display: flex; flex-direction: column;
          animation: slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1);
        }
        .search-panel-header {
          display: flex; gap: 12px; align-items: center;
          padding: 18px 20px; border-bottom: 1px solid var(--border);
        }
        .search-field {
          flex: 1; display: flex; align-items: center; gap: 10px;
          background: var(--bg3); border: 1.5px solid var(--border2);
          border-radius: var(--radius-sm); padding: 10px 14px; transition: border-color 0.2s;
        }
        .search-field:focus-within { border-color: var(--accent); }
        .search-field-icon { color: var(--text3); flex-shrink: 0; }
        .search-field-input { flex: 1; background: none; border: none; color: var(--text); font-size: 15px; outline: none; font-family: 'DM Sans', sans-serif; }
        .search-field-input::placeholder { color: var(--text3); }
        .search-clear { background: var(--surface); border: none; color: var(--text3); width: 24px; height: 24px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .search-clear:hover { color: var(--text); background: var(--surface2); }
        .search-close { background: var(--surface); border: 1px solid var(--border); color: var(--text3); width: 40px; height: 40px; min-width: 40px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .search-close:hover { color: var(--text); background: var(--surface2); }
        .search-body { flex: 1; overflow-y: auto; padding: 16px 20px; }
        .search-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 60px 20px; color: var(--text3); font-size: 14px; }
        .search-list { display: flex; flex-direction: column; gap: 8px; }
        .search-item {
          display: flex; align-items: center; gap: 14px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 10px; cursor: pointer;
          transition: all 0.2s;
        }
        .search-item:hover { background: var(--surface2); border-color: var(--border2); transform: translateX(4px); }
        .search-item-thumb { width: 56px; height: 84px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
        .search-item-info { flex: 1; min-width: 0; }
        .search-item-title { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 6px; font-family: 'Outfit', sans-serif; }
        .search-item-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text2); }
        .search-item-arrow { color: var(--text3); flex-shrink: 0; }

        /* ── AUTH MODALS ─────────────────────────────────── */
        .auth-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.88);
          backdrop-filter: blur(12px); z-index: 99999;
          display: flex; align-items: center; justify-content: center; padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes authPop { from { opacity: 0; transform: scale(0.95) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .auth-box {
          background: var(--bg2); border: 1px solid var(--border2);
          border-radius: var(--radius-xl); padding: 36px 32px;
          max-width: 420px; width: 100%; position: relative;
          box-shadow: var(--shadow-lg);
          animation: authPop 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .auth-box-close {
          position: absolute; top: 16px; right: 16px;
          background: var(--surface); border: 1px solid var(--border);
          color: var(--text3); width: 32px; height: 32px;
          border-radius: 8px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all 0.2s;
        }
        .auth-box-close:hover { color: var(--text); background: var(--surface2); }
        .auth-box-head { text-align: center; margin-bottom: 24px; }
        .auth-brand-dot {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, var(--accent), #ff6b00);
          margin: 0 auto 14px; box-shadow: 0 8px 24px var(--accent-glow);
        }
        .auth-icon { width: 44px; height: 44px; border-radius: 14px; background: rgba(42,171,238,0.15); border: 1px solid rgba(42,171,238,0.3); color: var(--teal); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
        .auth-icon.tg { }
        .auth-box-title { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; color: var(--text); margin-bottom: 6px; }
        .auth-box-sub { font-size: 13px; color: var(--text2); line-height: 1.5; }
        .tg-start-btn {
          width: 100%; padding: 12px; display: flex; align-items: center;
          justify-content: center; gap: 10px; background: rgba(42,171,238,0.1);
          border: 1px solid rgba(42,171,238,0.35); color: #7dd3fc;
          border-radius: var(--radius-sm); font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; margin-bottom: 14px;
          font-family: 'Outfit', sans-serif;
        }
        .tg-start-btn:hover { background: rgba(42,171,238,0.18); border-color: rgba(42,171,238,0.6); }
        .tg-start-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .auth-sep { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; color: var(--text3); font-size: 12px; }
        .auth-sep::before, .auth-sep::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 12px; font-weight: 600; color: var(--text2); letter-spacing: 0.05em; text-transform: uppercase; font-family: 'Outfit', sans-serif; }
        .field-input {
          padding: 11px 14px; background: var(--bg3); border: 1.5px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text); font-size: 14px;
          outline: none; transition: border-color 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .field-input:focus { border-color: var(--accent); }
        .field-input::placeholder { color: var(--text3); }
        .auth-error { color: var(--danger); font-size: 12px; padding: 8px 12px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius-sm); }
        .auth-submit-btn {
          width: 100%; padding: 13px; background: var(--accent); border: none;
          color: #fff; border-radius: var(--radius-sm); font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 4px; font-family: 'Outfit', sans-serif; letter-spacing: 0.01em;
        }
        .auth-submit-btn:hover:not(:disabled) { background: var(--accent2); box-shadow: 0 6px 20px var(--accent-glow); }
        .auth-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .auth-hint { text-align: center; font-size: 12px; color: var(--text3); margin-top: 14px; line-height: 1.5; }
        .auth-switch { text-align: center; margin-top: 16px; font-size: 13px; color: var(--text2); }
        .auth-switch-link { color: var(--accent); cursor: pointer; font-weight: 600; }
        .auth-switch-link:hover { text-decoration: underline; }

        /* ── NOTIFICATION ──────────────────────────────── */
        .notif-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 99998; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s ease; }
        .notif-box { width: 100%; max-width: 400px; max-height: 78vh; background: var(--bg2); border: 1px solid var(--border2); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); display: flex; flex-direction: column; overflow: hidden; animation: authPop 0.22s ease; }
        .notif-head { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px 14px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
        .notif-head-title { font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 8px; }
        .notif-count-badge { background: rgba(244,117,33,0.15); border: 1px solid rgba(244,117,33,0.3); color: var(--accent); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 99px; font-family: 'Outfit', sans-serif; }
        .notif-close-btn { background: var(--surface); border: none; color: var(--text3); width: 30px; height: 30px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .notif-close-btn:hover { color: var(--text); background: var(--surface2); }
        .notif-list { overflow-y: auto; padding: 10px 12px; flex: 1; }
        .notif-item { display: flex; gap: 10px; align-items: flex-start; padding: 12px; border-radius: var(--radius); margin-bottom: 6px; background: var(--surface); border: 1px solid var(--border); transition: background 0.2s; }
        .notif-item.unread { background: rgba(244,117,33,0.05); border-color: rgba(244,117,33,0.2); }
        .notif-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); flex-shrink: 0; margin-top: 6px; }
        .notif-dot.read { background: transparent; }
        .notif-body { flex: 1; min-width: 0; }
        .notif-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 3px; font-family: 'Outfit', sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .notif-msg { font-size: 12px; color: var(--text2); line-height: 1.5; }
        .notif-time { font-size: 10px; color: var(--text3); margin-top: 4px; display: block; }
        .notif-empty { text-align: center; padding: 40px 20px; color: var(--text3); font-size: 14px; display: flex; flex-direction: column; align-items: center; gap: 10px; }

        /* ── GENERAL MODAL ──────────────────────────────── */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 99999; animation: fadeIn 0.15s ease; }
        .modal-box { background: var(--bg2); border: 1px solid var(--border2); border-radius: var(--radius-lg); padding: 28px 28px 24px; max-width: 380px; width: 90%; box-shadow: var(--shadow-lg); animation: authPop 0.2s ease; }
        .modal-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .modal-icon-wrap { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .modal-icon-wrap.success { background: rgba(34,197,94,0.15); color: var(--success); border: 1px solid rgba(34,197,94,0.3); }
        .modal-icon-wrap.error { background: rgba(239,68,68,0.12); color: var(--danger); border: 1px solid rgba(239,68,68,0.3); }
        .modal-title { font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 700; color: var(--text); }
        .modal-msg { font-size: 14px; color: var(--text2); line-height: 1.6; margin-bottom: 20px; }
        .modal-actions { display: flex; justify-content: flex-end; }
        .modal-ok { padding: 9px 24px; background: var(--accent); border: none; color: #fff; border-radius: var(--radius-sm); font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Outfit', sans-serif; transition: all 0.2s; }
        .modal-ok:hover { background: var(--accent2); }

        /* ── FOOTER ─────────────────────────────────────── */
        .footer {
          border-top: 1px solid var(--border); padding: 56px 60px 40px;
          background: var(--bg2); position: relative;
        }
        .footer-inner { max-width: 1320px; margin: 0 auto; }
        .footer-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 40px; margin-bottom: 40px; }
        .footer-col-title { font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 14px; letter-spacing: 0.04em; text-transform: uppercase; }
        .footer-link { display: block; color: var(--text2); text-decoration: none; font-size: 14px; margin-bottom: 10px; transition: color 0.2s; }
        .footer-link:hover { color: var(--accent); }
        .footer-socials { display: flex; gap: 10px; }
        .social-btn { width: 38px; height: 38px; border-radius: 10px; background: var(--surface); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text2); transition: all 0.2s; text-decoration: none; }
        .social-btn:hover { background: rgba(244,117,33,0.12); border-color: rgba(244,117,33,0.4); color: var(--accent); }
        .footer-bottom { border-top: 1px solid var(--border); padding-top: 24px; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-size: 13px; color: var(--text3); }
        .footer-brand { font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700; color: var(--accent); }

        /* ── SPIN ─────────────────────────────────────── */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        /* ── EMPTY ─────────────────────────────────────── */
        .empty-state { text-align: center; padding: 60px 20px; color: var(--text3); width: 100%; }
        .carousel-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text3); font-size: 18px; }

        /* ── RESPONSIVE ─────────────────────────────────── */
        @media (max-width: 1200px) {
          .site-header { padding: 0 30px; }
          .slide-content { padding: 0 30px; }
          .section-wrap { padding: 0 16px 0 30px; }
          .section-head { padding-right: 24px; }
          .h-scroll { padding-right: 24px; }
          .grid-section { padding: 0 30px; }
          .admin-bar { padding: 0 30px; }
          .footer { padding: 40px 30px; }
        }
        @media (max-width: 900px) {
          .carousel-wrap { height: 420px; }
          .slide-poster-wrap { display: none; }
          .slide-bg { filter: none; transform: scale(1); filter: brightness(0.45) saturate(0.6); }
          .slide-vignette { background: linear-gradient(0deg, rgba(13,13,15,0.98) 0%, rgba(13,13,15,0.4) 60%, transparent 100%); }
          .slide-content { display: block; padding: 0; height: 100%; position: relative; }
          .slide-text { position: absolute; bottom: 0; left: 0; right: 0; max-width: 100%; padding: 20px 24px 18px; justify-content: flex-end; }
          .slide-title { font-size: 28px; margin-bottom: 10px; }
          .slide-desc { -webkit-line-clamp: 2; font-size: 13px; margin-bottom: 14px; }
          .watch-btn { position: absolute; top: 16px; right: 16px; padding: 9px 16px; font-size: 13px; margin-top: -80px; }
          .footer-grid { grid-template-columns: repeat(2,1fr); }
          .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
        }
        @media (max-width: 768px) {
          .carousel-wrap { height: 300px; }
          .section-wrap { padding: 0 12px 0 16px; }
          .section-head { padding-right: 16px; }
          .h-scroll { padding-right: 16px; gap: 12px; }
          .horizontal-card { width: 150px; }
          .site-header { padding: 0 16px; }
          .footer { padding: 32px 16px; }
          .footer-grid { grid-template-columns: 1fr; gap: 24px; }
        }
        @media (max-width: 600px) {
          ::-webkit-scrollbar { display: none; }
          .slide-title { font-size: 22px; }
          .slide-meta-row { gap: 8px; margin-bottom: 10px; }
          .slide-genres { display: none; }
          .carousel-wrap { height: 270px; }
          .site-header { height: 70px; }
          .header-logo { height: 28px; }
        }
      `}</style>

      {/* Custom Cursor */}
      <CustomCursor />

      <div className="bg-noise" />
      <div className="bg-gradient-orb" />

      {/* HEADER */}
      <header className="site-header">
        <img src={LOGO_URL} alt="MochiTV" className="header-logo" onClick={() => window.location.href = '/'} />

        <nav className="header-nav" style={{ display: 'none' }}>
          {/* Desktop nav items if needed */}
        </nav>

        <div className="header-right">
          <a href="/wall" className="nav-link" style={{ display: isMobile ? 'none' : 'flex' }}>
            <AiFillFire style={{ color: 'var(--accent)' }} /> Lavhalar
          </a>

          <button className="icon-btn" onClick={showSearchModal} style={{ display: isMobile ? 'none' : 'flex' }}>
            <Search size={18} />
          </button>

          {currentUser ? (
            <>
              <div className="notif-wrap">
                <button className="icon-btn" onClick={handleOpenNotifModal}>
                  <Bell size={18} />
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>
              </div>

              <div className="avatar-wrap" ref={avatarMenuRef}>
                <div className="avatar-btn" onClick={() => setShowAvatarMenu(v => !v)}>
                  <img src={currentUser.avatar_url || DEFAULT_AVATAR} alt={currentUser.username} />
                </div>
                {showAvatarMenu && (
                  <div className="avatar-menu">
                    <div className="avatar-menu-user">
                      <img src={currentUser.avatar_url || DEFAULT_AVATAR} alt={currentUser.username} />
                      <div>
                        <div className="avatar-menu-name">{currentUser.username}</div>
                        <div className="avatar-menu-role">Foydalanuvchi</div>
                      </div>
                    </div>
                    <button className="avatar-menu-item" onClick={() => { setShowAvatarMenu(false); goToProfile(); }}>
                      <CgProfile size={16} /> Profil
                    </button>
                    <div className="avatar-menu-sep" />
                    <button className="avatar-menu-item danger" onClick={handleLogout}>
                      <LogOut size={15} /> Chiqish
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button className="login-btn" onClick={() => showAuthModal('login')}>Kirish</button>
          )}
        </div>
      </header>

      {/* CAROUSEL */}
      <div className="carousel-wrap">
        {loading ? (
          <div className="carousel-skel">
            <div className="cskel-content">
              <div className="cskel-tag"><div className="skel-shimmer" /></div>
              <div className="cskel-title"><div className="skel-shimmer" /></div>
              <div className="cskel-desc"><div className="skel-shimmer" /></div>
              <div className="cskel-btn"><div className="skel-shimmer" /></div>
            </div>
            <div className="cskel-poster"><div className="skel-shimmer" /></div>
          </div>
        ) : carouselData.length === 0 ? (
          <div className="carousel-empty">Carousel bo'sh</div>
        ) : (
          carouselData.map((item, index) => (
            <div key={item.id} className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}>
              <div className="slide-bg" style={{ backgroundImage: `url(${item.anime_cards.image_url})` }} />
              <div className="slide-vignette" />
              <div className="slide-content">
                <div className="slide-text">
                  <div className="slide-meta-row">
                    <div className="slide-rating">
                      <Star size={12} fill="currentColor" /> {item.anime_cards.rating}
                    </div>
                    <div className="slide-ep">📺 {item.anime_cards.episodes} qism</div>
                  </div>
                  <div className="slide-title">{item.anime_cards.title}</div>
                  {item.anime_cards.genres?.length > 0 && (
                    <div className="slide-genres">
                      {item.anime_cards.genres.slice(0, 4).map((g, i) => (
                        <span key={i} className="genre-chip">{g}</span>
                      ))}
                    </div>
                  )}
                  {item.anime_cards.description && (
                    <div className="slide-desc">{item.anime_cards.description}</div>
                  )}
                  <div className="slide-actions">
                    <button className="watch-btn" onClick={() => goToAnime(item.anime_cards)}>
                      <div className="play-icon"><Play size={16} fill="white" /></div>
                      Tomosha qilish
                    </button>
                  </div>
                </div>
                <div className="slide-poster-wrap">
                  <img src={item.anime_cards.image_url} alt={item.anime_cards.title} className="slide-poster" />
                </div>
              </div>
            </div>
          ))
        )}
        {carouselData.length > 0 && (
          <div className="carousel-dots">
            {carouselData.map((_, i) => (
              <div key={i} className={`c-dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)} />
            ))}
          </div>
        )}
      </div>

      {/* ADMIN */}
      {isAdmin && (
        <div className="admin-bar">
          <button className="admin-btn" onClick={() => window.location.href = '/admin/admin'}>
            <Lock size={15} /> Admin Panel
          </button>
        </div>
      )}

      {/* ANIME SECTIONS */}
      {loading ? (
        [1,2,3,4].map(row => (
          <div key={row} className="section-wrap">
            <div className="section-head">
              <div style={{ width: 200, height: 24, background: 'var(--bg3)', borderRadius: 8, position: 'relative', overflow: 'hidden' }}><div className="skel-shimmer" /></div>
            </div>
            <div className="h-scroll" style={{ overflow: 'hidden' }}>
              {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
            </div>
          </div>
        ))
      ) : animeCards.length === 0 ? (
        <div className="empty-state">Hali anime qo'shilmagan</div>
      ) : userLayout === 'grid' ? (
        (() => {
          const all = [...row1, ...row2, ...row3, ...row4];
          const shown = all.slice(0, displayedGridItems);
          const hasMore = all.length > displayedGridItems;
          return (
            <div className="grid-section">
              <div className="grid-container">
                {shown.map(anime => (
                  <AnimeCard key={anime.id} anime={anime} allViews={allViews} favorites={favorites} toggleFavorite={toggleFavorite} goToAnime={goToAnime} isHorizontal={false} />
                ))}
              </div>
              {hasMore && (
                <div className="load-more-btn">
                  <button onClick={() => setDisplayedGridItems(p => p + getResponsiveLoadCount())}>
                    Ko'proq ko'rish
                  </button>
                </div>
              )}
            </div>
          );
        })()
      ) : (
        ROWS.map((row, idx) => (
          <div key={idx} className="section-wrap">
            <div className="section-head">
              <h2 className="section-title">{ROW_TITLES[idx]}</h2>
            </div>
            <div className="h-scroll">
              {row.map(anime => (
                <AnimeCard key={anime.id} anime={anime} allViews={allViews} favorites={favorites} toggleFavorite={toggleFavorite} goToAnime={goToAnime} isHorizontal={true} />
              ))}
            </div>
          </div>
        ))
      )}

      {/* MODALS */}
      {searchModal && <SearchModal onClose={hideSearchModal} animeCards={animeCards} onAnimeClick={goToAnime} allViews={allViews} />}
      {authModal.show && <AuthModal mode={authModal.mode} onClose={hideAuthModal} onLogin={handleLogin} onRegister={handleRegister} onTelegramOpen={openTelegramModal} loading={authLoading} />}
      {tgModal && <TelegramCodeModal onClose={closeTelegramModal} onVerify={handleTelegramVerify} onStart={handleTelegramStart} loading={tgAuthLoading} errorText={tgAuthError} />}

      {modal.show && (
        <div className="modal-overlay" onClick={hideModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className={`modal-icon-wrap ${modal.type}`}>
                {modal.type === 'success' ? '✓' : '✕'}
              </div>
              <div className="modal-title">
                {modal.type === 'success' ? 'Muvaffaqiyatli' : 'Xato'}
              </div>
            </div>
            <div className="modal-msg">{modal.message}</div>
            <div className="modal-actions">
              <button className="modal-ok" onClick={hideModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {showNotifModal && (
        <div className="notif-overlay" onClick={() => setShowNotifModal(false)}>
          <div className="notif-box" onClick={e => e.stopPropagation()}>
            <div className="notif-head">
              <div className="notif-head-title">
                🔔 Bildirishnomalar
                {notifications.length > 0 && <span className="notif-count-badge">{notifications.length}</span>}
              </div>
              <button className="notif-close-btn" onClick={() => setShowNotifModal(false)}><X size={15} /></button>
            </div>
            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="notif-empty"><span style={{ fontSize: 32 }}>🔕</span><span>Bildirishnomalar yo'q</span></div>
              ) : notifications.map(n => (
                <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                  <div className={`notif-dot ${n.is_read ? 'read' : ''}`} />
                  <div className="notif-body">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-msg">{n.message}</div>
                    <span className="notif-time">{new Date(n.created_at).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <MobileNavbar currentUser={currentUser} onSearchClick={handleSearchClick} onProfileClick={handleProfileClick} onHomeClick={handleHomeClick} activeTab={activeTab} />

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div>
              <div className="footer-col-title">MochiTV Haqida</div>
              <a href="/info" className="footer-link">Biz haqimizda</a>
              <a href="/info" className="footer-link">Aloqa</a>
              <a href="/info" className="footer-link">Muammo Xabar Qilish</a>
            </div>
            <div>
              <div className="footer-col-title">Yordam</div>
              <a href="/info" className="footer-link">FAQ</a>
              <a href="/info" className="footer-link">Qo'llanma</a>
              <a href="/info" className="footer-link">Shartlar va Qoidalar</a>
            </div>
            <div>
              <div className="footer-col-title">Ijtimoiy Tarmoqlar</div>
              <div className="footer-socials">
                <a className="social-btn" href="https://youtube.com/@MochiTvUz" target="_blank" rel="noopener noreferrer" title="YouTube"><Youtube size={17} /></a>
                <a className="social-btn" href="https://t.me/MochitvUz" target="_blank" rel="noopener noreferrer" title="Telegram"><FaTelegramPlane size={17} /></a>
                <a className="social-btn" href="https://instagram.com/mochitv_uz" target="_blank" rel="noopener noreferrer" title="Instagram"><LuInstagram size={17} /></a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2026 MochiTv.Uz — Barcha huquqlar himoyalangan.</span>
            <span className="footer-brand">MochiTV</span>
          </div>
        </div>
      </footer>
      <div style={{ marginBottom: 24 }} />
    </>
  );
}

// Custom Cursor Component
function CustomCursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    const move = (e) => {
      if (dot.current) { dot.current.style.left = e.clientX + 'px'; dot.current.style.top = e.clientY + 'px'; }
      if (ring.current) { ring.current.style.left = e.clientX + 'px'; ring.current.style.top = e.clientY + 'px'; }
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  );
}