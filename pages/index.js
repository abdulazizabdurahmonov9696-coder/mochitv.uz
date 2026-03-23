import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import { Heart, LogOut, Lock, Loader, Eye, Play, Youtube, X, Search, Calendar, ExternalLink, ThumbsUp, Share2, CheckCircle , Star, Bell} from 'lucide-react';
import { FaTelegramPlane } from "react-icons/fa";
import { IoBookmarkOutline, IoBookmark } from "react-icons/io5";
import { LuInstagram } from "react-icons/lu";
import Head from "next/head";
import { createClient } from '@supabase/supabase-js';
import MobileNavbar from '../components/MobileNavbar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOGO_URL = '/assets/lego.png';
const DEFAULT_AVATAR = "https://i.pinimg.com/736x/ce/21/07/ce21071acfd1e9deb34850f70285a5f0.jpg";

// --- MANTIQ: 24 Soatlik Random (Seeded Shuffle) ---
const getDailySeed = () => {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
};

const dailyShuffle = (array) => {
  const seed = getDailySeed();
  const shuffled = [...array];
  
  const random = (seedValue) => {
    var x = Math.sin(seedValue) * 10000;
    return x - Math.floor(x);
  };

  let currentSeed = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    const r = random(currentSeed++);
    const j = Math.floor(r * (i + 1));[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
// --------------------------------------------------

// Skeleton Card Component
const SkeletonCard = () => (
  <div className="anime-card-skeleton">
    <div className="skeleton-image-wrapper"></div>
    <div className="skeleton-text-line title"></div>
    <div className="skeleton-text-line meta"></div>
  </div>
);

// Individual Anime Card
function AnimeCard({ anime, allViews, favorites, toggleFavorite, goToAnime, isHorizontal = false }) {
  const[imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={`anime-card ${isHorizontal ? 'horizontal-card' : ''}`} onClick={() => goToAnime(anime)}>
      <div className="card-image-wrapper">
        {!imageLoaded && <div className="skeleton-image-overlay" />}
        <img 
          className={`card-image ${imageLoaded ? 'loaded' : 'loading'}`} 
          src={anime.image_url} 
          alt={anime.title} 
          onLoad={() => setImageLoaded(true)}
        />
        
        <div className="card-header">
          <div style={{color:"#ffd700"}} className="card-views">
            <Star size={12} />
            <span>{anime.rating}</span>
          </div>
          <button 
            className={`card-like-btn ${favorites.includes(anime.id) ? 'liked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(anime.id);
            }}
          >
            {favorites.includes(anime.id) 
              ? <IoBookmark size={23} /> 
              : <IoBookmarkOutline size={23} />
            }
          </button>
        </div>
        
        <div className="card-overlay">
          <div className="card-overlay-info">
            <div className="card-overlay-meta">
              <div className="card-episodes">{anime.episodes} qism</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-content">
        <div className="card-title">{anime.title}</div>
      </div>
    </div>
  );
}

// Search Modal Component
function SearchModal({ onClose, animeCards, onAnimeClick, allViews }) {
  const [searchQuery, setSearchQuery] = useState('');
  const[searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = animeCards.filter(anime =>
      anime.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  }, [searchQuery, animeCards]);

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Anime qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <button className="search-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="search-results">
          {searchQuery.trim() === '' ? (
            <div className="search-empty">
              <Search size={48} />
              <p>Anime nomini kiriting</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="search-empty">
              <p>Natija topilmadi</p>
            </div>
          ) : (
            <div className="search-results-grid">
              {searchResults.map((anime) => (
                <div
                  key={anime.id}
                  className="search-result-card"
                  onClick={() => {
                    onAnimeClick(anime);
                    onClose();
                  }}
                >
                  <img src={anime.image_url} alt={anime.title} className="search-result-image" />
                  <div className="search-result-info">
                    <div className="search-result-title">{anime.title}</div>
                    <div className="search-result-meta">
                      <span>⭐ {anime.rating}</span>
                      <span>📺 {anime.episodes} qism</span>
                      <span className="search-result-views">
                        <Eye size={14} />
                        {allViews[anime.id] || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===================================================
// ✅ TELEGRAM CODE MODAL
// ===================================================
function TelegramCodeModal({ onClose, onVerify, onStart, loading, errorText }) {
  const [code, setCode] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (String(code).trim().length !== 5) return;
    onVerify(code);
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="auth-modal-header">
          <h2 className="auth-modal-title">Telegram orqali kirish</h2>
          <p className="auth-modal-subtitle">
            Botga <b>Start</b> bosing — 5 xonali kod keladi. Kodni shu yerga kiriting.
          </p>
        </div>

        <button
          className="google-auth-btn"
          style={{ background: 'none', color: '#fff' }}
          onClick={onStart}
          disabled={loading}
        >
          <FaTelegramPlane size={20} />
          <span>Botga o'tish / Start</span>
        </button>

        <form className="auth-form" onSubmit={submit}>
          <div className="auth-input-group">
            <label className="auth-label">5 xonali kod</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              className="auth-input"
              placeholder="XXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
              required
            />
          </div>

          {errorText ? (
            <div style={{ color: '#ef4444', fontSize: 13, marginTop: -8 }}>
              {errorText}
            </div>
          ) : null}

          <button type="submit" className="auth-submit-btn" disabled={loading || String(code).trim().length !== 5}>
            {loading ? (
              <>
                <Loader className="animate-spin" size={18} />
                Tekshirilmoqda...
              </>
            ) : (
              "Kodni tasdiqlash"
            )}
          </button>
        </form>

        <div className="auth-switch" style={{ marginTop: 14 }}>
          Kod kelmadimi? Botda <b>/start</b> ni qayta bosing va yana urinib ko'ring.
        </div>
      </div>
    </div>
  );
}

// Auth Modal
function AuthModal({ mode, onClose, onLogin, onRegister, onTelegramOpen, loading }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const[currentMode, setCurrentMode] = useState(mode);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentMode === 'login') {
      onLogin(username, password);
    } else {
      onRegister(username, password, confirmPassword);
    }
  };

  const switchMode = () => {
    setCurrentMode(currentMode === 'login' ? 'register' : 'login');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
        
        <div className="auth-modal-header">
          <h2 className="auth-modal-title">
            {currentMode === 'login' ? 'Tizimga kirish' : "Ro'yxatdan o'tish"}
          </h2>
          <p className="auth-modal-subtitle">
            {currentMode === 'login' 
              ? 'Akkauntingizga kiring' 
              : "Yangi akkount yarating"}
          </p>
        </div>

        <button 
          className="google-auth-btn"
          onClick={onTelegramOpen}
          disabled={loading}
          style={{
            background: 'none',
            border: '1px solid rgba(42, 171, 238, 0.5)',
            color: '#9fdcff'
          }}
        >
          <FaTelegramPlane size={22} />
          <span>Telegram orqali {currentMode === 'login' ? 'kirish' : "ro'yxatdan o'tish"}</span>
        </button>

        <div className="auth-divider">
          <span>Yoki login/parol orqali</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label className="auth-label">Username (max 10 harf)</label>
            <input
              type="text"
              maxLength={10}
              className="auth-input"
              placeholder="Username kiriting"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Parol</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Parol kiriting"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {currentMode === 'register' && (
            <div className="auth-input-group">
              <label className="auth-label">Parolni tasdiqlang</label>
              <input
                type="password"
                className="auth-input"
                placeholder="Parolni qayta kiriting"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={18} />
                Kuting...
              </>
            ) : (
              currentMode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"
            )}
          </button>
        </form>

        <div className="auth-switch">
          {currentMode === 'login' 
            ? "Akkauntingiz yo'qmi? " 
            : "Akkauntingiz bormi? "}
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
  const[authModal, setAuthModal] = useState({ show: false, mode: 'login' });
  const [searchModal, setSearchModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const[activeTab, setActiveTab] = useState('home');

  const [tgModal, setTgModal] = useState(false);
  const [tgAuthLoading, setTgAuthLoading] = useState(false);
  const[tgAuthError, setTgAuthError] = useState('');

  const [carouselData, setCarouselData] = useState([]);
  const [animeCards, setAnimeCards] = useState([]);
  const[newsData, setNewsData] = useState([]); 
  
  const [row1, setRow1] = useState([]); 
  const [row2, setRow2] = useState([]); 
  const[row3, setRow3] = useState([]); 
  const [row4, setRow4] = useState([]); 

  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const[authLoading, setAuthLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const[allViews, setAllViews] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // ✅ YANGI: Avatar dropdown va Notification modal statelari
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const avatarMenuRef = useRef(null);

  const showModal = (type, message, onConfirm = null) => {
    setModal({ show: true, type, message, onConfirm });
  };

  const hideModal = () => {
    setModal({ show: false, type: '', message: '', onConfirm: null });
  };

  const showAuthModal = (mode = 'login') => {
    setAuthModal({ show: true, mode });
  };

  const hideAuthModal = () => {
    setAuthModal({ show: false, mode: 'login' });
  };

  const showSearchModal = () => {
    setSearchModal(true);
    setActiveTab('search');
  };

  const hideSearchModal = () => {
    setSearchModal(false);
    setActiveTab('home');
  };

  const openTelegramModal = () => {
    setTgAuthError('');
    setTgModal(true);
  };
  const closeTelegramModal = () => {
    setTgAuthError('');
    setTgModal(false);
  };

  const handleHomeClick = () => {
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchClick = () => {
    setActiveTab('search');
    showSearchModal();
  };

  const handleProfileClick = () => {
    setActiveTab('profile');
    if (currentUser) {
      goToProfile();
    } else {
      showAuthModal('login');
    }
  };

  // ✅ Tashqarida click qilganda avatar menuni yopish
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setShowAvatarMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMounted(true);
    checkCurrentUser();
    loadData();
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => {
        window.removeEventListener('resize', checkIsMobile);
    };
  },[]);

  useEffect(() => {
    if (carouselData.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselData.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [carouselData]);

  const checkIsMobile = () => {
    setIsMobile(window.innerWidth < 1200);
  };

  const checkCurrentUser = async () => {
    try {
      const user = localStorage.getItem('anime_user');
      if (user) {
        const userData = JSON.parse(user);
        setCurrentUser(userData);
        await loadUserFavorites(userData.id);
        await loadNotifications(userData.id);
      }
    } catch (error) {
      console.error('User check error:', error);
    }
  };

  const loadUserFavorites = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('anime_id')
        .eq('user_id', userId);

      if (!error && data) {
        setFavorites(data.map(f => f.anime_id));
      }
    } catch (error) {
      console.error('Load favorites error:', error);
    }
  };

  // ✅ YANGI: Bildirishnomalarni yuklash
  const loadNotifications = async (userId) => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (data) setNotifications(data);
    } catch (e) {
      console.warn('Notifications load error:', e.message);
    }
  };

  const loadAllViews = async () => {
    try {
      const { data, error } = await supabase
        .from('anime_views')
        .select('anime_id, view_count');

      if (!error && data) {
        const viewsObj = {};
        data.forEach(v => {
          if (!viewsObj[v.anime_id]) {
            viewsObj[v.anime_id] = 0;
          }
          viewsObj[v.anime_id] += v.view_count;
        });
        setAllViews(viewsObj);
      }
    } catch (error) {
      console.error('Load all views error:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: carouselItems } = await supabase
        .from('anime_carousel')
        .select('*, anime_cards(*)')
        .order('position', { ascending: true });
      
      const { data: cards } = await supabase
        .from('anime_cards')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: news } = await supabase
        .from('news_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10); 

      setCarouselData(carouselItems || []);
      setAnimeCards(cards || []);
      setNewsData(news ||[]);
      
      if (cards && cards.length > 0) {
        distributeAnimeRows(cards);
      }

      await loadAllViews();
    } catch (error) {
      console.error('Xato:', error);
    }
    setLoading(false);
  };

  const distributeAnimeRows = (allCards) => {
    const cardsCopy = [...allCards];
    const shuffled = dailyShuffle(cardsCopy);

    const quarter = Math.ceil(shuffled.length / 4);
    const part1 = shuffled.slice(0, quarter);
    const part2 = shuffled.slice(quarter, quarter * 2);
    const part3 = shuffled.slice(quarter * 2, quarter * 3);
    const part4 = shuffled.slice(quarter * 3);

    setRow1(part1);
    setRow2(part2);
    setRow3(part3);
    setRow4(part4);
  };

  const handleTelegramStart = async () => {
    setTgAuthError('');
    setTgAuthLoading(true);
    try {
      const res = await fetch('/api/auth/telegram/start', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Xatolik yuz berdi');
      }

      if (data?.botUrl) {
        window.open(data.botUrl, '_blank');
      }
    } catch (e) {
      console.error(e);
      window.open('https://t.me/mochitv_bot', '_blank');
    }
    setTgAuthLoading(false);
  };

const handleTelegramVerify = async (code) => {
  setTgAuthError('');
  setTgAuthLoading(true);

  try {
    const res = await fetch('/api/auth/telegram/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok || !data.user) {
      throw new Error(data.message || 'Kod noto\'g\'ri yoki eskirgan');
    }

    const finalUser = data.user;
    localStorage.setItem('anime_user', JSON.stringify(finalUser));
    setCurrentUser(finalUser);
    await loadUserFavorites(finalUser.id);
    await loadNotifications(finalUser.id);
    closeTelegramModal();
    hideAuthModal();
    showModal('success', `Xush kelibsiz, ${finalUser.username}!`);

  } catch (e) {
    setTgAuthError(e.message || 'Xato yuz berdi');
  }

  setTgAuthLoading(false);
};

  const handleLogin = async (username, password) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        showModal('error', 'Username yoki parol xato!');
        setAuthLoading(false);
        return;
      }

      localStorage.setItem('anime_user', JSON.stringify(data));
      setCurrentUser(data);
      await loadUserFavorites(data.id);
      await loadNotifications(data.id);
      hideAuthModal();
      showModal('success', 'Xush kelibsiz, ' + data.username + '!');
    } catch (error) {
      showModal('error', 'Kirish jarayonida xato yuz berdi');
    }
    setAuthLoading(false);
  };

  const handleRegister = async (username, password, confirmPassword) => {
    if (!username || !password || !confirmPassword) {
      showModal('error', "Barcha maydonlarni to'ldiring!");
      return;
    }
    if (username.length < 3) {
      showModal('error', "Username kamida 3 ta belgidan iborat bo'lishi kerak!");
      return;
    }
    if (password.length < 6) {
      showModal('error', "Parol kamida 6 ta belgidan iborat bo'lishi kerak!");
      return;
    }
    if (password !== confirmPassword) {
      showModal('error', 'Parollar mos kelmadi!');
      return;
    }

    setAuthLoading(true);
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (checkError) {
        showModal('error', "Tekshirishda xato yuz berdi. Qayta urinib ko'ring.");
        setAuthLoading(false);
        return;
      }

      if (existingUser) {
        showModal('error', 'Bu username allaqachon band!');
        setAuthLoading(false);
        return;
      }

      const insertData = { username, password };
      const { data, error } = await supabase
        .from('users')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Insert error code:', error.code, 'message:', error.message);
        if (error.code === '23505') {
          showModal('error', 'Bu username allaqachon band! Boshqa username tanlang.');
        } else if (error.code === '23502') {
          showModal('error', "Majburiy maydon to'ldirilmagan.");
        } else if (error.code === '42501') {
          showModal('error', "Ruxsat yo'q. Admin bilan bog'laning.");
        } else {
          showModal('error', 'Xato: ' + (error.message || "Noma'lum xato"));
        }
        setAuthLoading(false);
        return;
      }

      localStorage.setItem('anime_user', JSON.stringify(data));
      setCurrentUser(data);
      hideAuthModal();
      showModal('success', "Ro'yxatdan o'tdingiz! Xush kelibsiz, " + data.username + "!");
    } catch (error) {
      console.error('Register catch error:', error);
      showModal('error', 'Xato: ' + (error.message || "Noma'lum xato yuz berdi"));
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('anime_user');
    setCurrentUser(null);
    setFavorites([]);
    setNotifications([]);
    setShowAvatarMenu(false);
    showModal('success', 'Tizimdan chiqdingiz!');
  };

  const goToProfile = () => {
    if (currentUser) {
      window.location.href = `/profile/${currentUser.username}`;
    }
  };

  const toggleFavorite = async (animeId) => {
    if (!currentUser) {
      showModal('error', 'Saralanganlarni saqlash uchun tizimga kiring!');
      return;
    }

    try {
      const isFavorite = favorites.includes(animeId);
      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('anime_id', animeId);
        if (!error) setFavorites(favorites.filter(id => id !== animeId));
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert([{ user_id: currentUser.id, anime_id: animeId }]);
        if (!error) setFavorites([...favorites, animeId]);
      }
    } catch (error) {
      console.error('Favorite error:', error);
      showModal('error', 'Xatolik yuz berdi');
    }
  };

  const addView = async (animeId) => {
    try {
      const userId = currentUser ? currentUser.id : 'guest_' + Date.now();
      const { data: existing } = await supabase
        .from('anime_views')
        .select('*')
        .eq('user_id', userId)
        .eq('anime_id', animeId)
        .maybeSingle();

      if (existing) {
        const newCount = existing.view_count + 1;
        await supabase
          .from('anime_views')
          .update({ view_count: newCount, last_viewed: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('anime_id', animeId);
      } else {
        await supabase
          .from('anime_views')
          .insert([{ user_id: userId, anime_id: animeId, view_count: 1 }]);
      }
      await loadAllViews();
    } catch (error) {
      console.error('View error:', error);
    }
  };

const goToAnime = (anime) => {
    addView(anime.id);
    const slugTitle = anime.title.trim().replace(/\s+/g, '-');
    window.location.href = `/anime/${encodeURIComponent(slugTitle)}`;
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToAdmin = () => {
    window.location.href = '/admin/admin';
  };

  // ✅ Notification modal ochish va o'qilgan deb belgilash
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
      </Head>

      {/* ✅ Propeller Ads — Asosiy Tag Script */}
      <Script
        src="https://5gvci.com/act/files/tag.min.js?z=10639082"
        data-cfasync="false"
        strategy="afterInteractive"
      />

      {/* ✅ Propeller Ads — Vignette Banner Script */}
      <Script
        id="propeller-vignette"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='10639095',s.src='https://gizokraijaw.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
        }}
      />

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow-x: hidden; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background: #090b10;
          color: #ffffff;
          -webkit-tap-highlight-color: transparent;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background-color: rgba(59, 130, 246, 0.6); border-radius: 10px; }
        ::-webkit-scrollbar-track { background-color: rgba(255, 255, 255, 0.05); }

        /* ✅ SKELETON LOR UCHUN UMUMIY OPTIMAL ANIMASIYA */
        @keyframes simplePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* --- CAROUSEL SKELETON --- */
        .carousel-skeleton {
          width: 100%; height: 100%;
          background: #090b10; 
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px;
          max-width: 1400px;
          margin: 0 auto;
          animation: simplePulse 1.5s ease-in-out infinite;
        }
        .carousel-skel-content { flex: 1; max-width: 700px; display: flex; flex-direction: column; gap: 20px; }
        .skel-title { width: 80%; height: 48px; background: #1a1f2b; border-radius: 8px; }
        .skel-meta { width: 40%; height: 24px; background: #1a1f2b; border-radius: 8px; }
        .skel-desc { width: 100%; height: 80px; background: #1a1f2b; border-radius: 8px; }
        .skel-btn { width: 180px; height: 48px; background: #1a1f2b; border-radius: 12px; }
        .carousel-skel-poster { width: 320px; aspect-ratio: 2/3; background: #1a1f2b; border-radius: 20px; }
        
        @media (max-width: 900px) {
           .carousel-skeleton { padding: 40px 20px 20px; align-items: flex-end; justify-content: flex-start; height: 400px; }
           .carousel-skel-poster { display: none; }
           .carousel-skel-content { width: 100%; max-width: 100%; }
           .skel-title { width: 100%; height: 32px; }
           .skel-desc { height: 60px; }
        }
        @media (max-width: 600px) {
           .carousel-skeleton { height: 300px; }
        }

        /* --- ANIME CARD SKELETON --- */
        .anime-card-skeleton {
          width: 200px;
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: simplePulse 1.5s ease-in-out infinite;
        }
        .skeleton-image-wrapper {
          width: 100%;
          aspect-ratio: 2/3;
          background: #0f1219;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
        }
        .skeleton-text-line {
          height: 16px;
          background: #0f1219;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }
        .skeleton-text-line.title { width: 80%; }
        .skeleton-text-line.meta { width: 50%; height: 12px; }
        @media (max-width: 900px) {
           .anime-card-skeleton { width: 150px; }
        }

        .skeleton-image-overlay {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: #0f1219;
          z-index: 1;
        }

        /* ✅ ORQA FON EFFEKTLARI */
        .bg-grid {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }
        .bg-vignette {
          position: fixed; inset: 0;
          background:
            radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.05), transparent 60%),
            linear-gradient(to top, #090b10 0%, transparent 100%);
          pointer-events: none;
          z-index: 0;
        }

        /* --- MAIN STYLES --- */
        .horizontal-section {
          margin-bottom: 40px;
          padding: 0 0 0 20px;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
        }
        .row-title-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          padding-right: 20px;
        }
        .row-title {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          border-left: 4px solid #ef4444;
          padding-left: 12px;
        }
        .horizontal-scroll-container {
          display: flex;
          gap: 15px;
          overflow-x: auto;
          padding-bottom: 15px;
          padding-right: 20px;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        .horizontal-scroll-container::-webkit-scrollbar { height: 0px; background: transparent; }
        .horizontal-card { flex: 0 0 auto; width: 200px; }

        .card-image { opacity: 0; transition: opacity 0.5s ease; }
        .card-image.loaded { opacity: 1; }

        .container { width: 100%; min-height: 100vh; position: relative; z-index: 1; }

        /* ✅ HEADER */
        .site-header {
          position: sticky;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 18px 100px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        .header-logo { height: 40px; width: auto; cursor: pointer; }
        .header-right { display: flex; align-items: center; gap: 8px; }

        /* ✅ Lavhalar link */
        .lavhalar-link {
          display: none;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.75);
          font-size: 14px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          cursor: pointer;
          text-decoration: none;
          transition: all 0.25s;
          white-space: nowrap;
        }
        .lavhalar-link:hover {
          color: #fff;
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.25);
        }
        @media (min-width: 1200px) {
          .lavhalar-link { display: flex; }
        }

        .search-btn {
          background: none;
          border: none;
          color: steelblue;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        .login-btn {
          background: none;
          border: 1px solid #ef4444;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .login-btn:hover { background: rgba(59, 130, 246, 0.3); transform: translateY(-2px); }

        /* ✅ NOTIFICATION BELL */
        .notif-bell-btn {
          position: relative;
          background: none;
          border: none;
          color: rgba(255,255,255,0.75);
          width: 40px;
          height: 40px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s;
        }
        .notif-bell-btn:hover { color: #fff; background: rgba(255,255,255,0.08); }
        .notif-badge {
          position: absolute;
          top: 4px; right: 4px;
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          border-radius: 50%;
          width: 16px; height: 16px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid #090b10;
        }

        /* ✅ AVATAR WRAPPER */
        .avatar-header-wrap {
          position: relative;
        }
        .avatar-header-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.15);
          transition: border-color 0.25s, transform 0.2s;
          background: #111;
          flex-shrink: 0;
        }
        .avatar-header-btn:hover {
          border-color: #d946ef;
          transform: scale(1.07);
        }
        .avatar-header-btn img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }

        /* ✅ AVATAR DROPDOWN MENU */
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .avatar-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          min-width: 200px;
          background: rgba(18, 18, 24, 0.97);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
          padding: 8px;
          z-index: 9999;
          animation: dropIn 0.2s ease;
        }
        .avatar-dropdown-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 6px;
        }
        .avatar-dropdown-user img {
          width: 36px; height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid rgba(255,255,255,0.15);
        }
        .avatar-dropdown-username {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }
        .avatar-dropdown-role {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          margin-top: 1px;
        }
        .avatar-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: rgba(255,255,255,0.8);
          transition: background 0.2s, color 0.2s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .avatar-dropdown-item:hover {
          background: rgba(255,255,255,0.07);
          color: #fff;
        }
        .avatar-dropdown-item.danger {
          color: rgba(239,68,68,0.85);
        }
        .avatar-dropdown-item.danger:hover {
          background: rgba(239,68,68,0.1);
          color: #ef4444;
        }
        .avatar-dropdown-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 4px 0;
        }

        /* ✅ NOTIFICATION MODAL */
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .notif-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(6px);
          z-index: 99998;
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          padding: 72px 20px 20px;
        }
        .notif-modal-box {
          width: 100%;
          max-width: 380px;
          max-height: 70vh;
          background: rgba(14,16,22,0.98);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.7);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: notifSlideIn 0.25s ease;
        }
        .notif-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          flex-shrink: 0;
        }
        .notif-modal-title {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .notif-modal-count {
          background: rgba(217,70,239,0.2);
          color: #d946ef;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          border: 1px solid rgba(217,70,239,0.3);
        }
        .notif-modal-close {
          background: rgba(255,255,255,0.06);
          border: none;
          color: rgba(255,255,255,0.5);
          width: 30px; height: 30px;
          border-radius: 8px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .notif-modal-close:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .notif-modal-list {
          overflow-y: auto;
          padding: 10px 12px 12px;
          flex: 1;
        }
        .notif-modal-list::-webkit-scrollbar { width: 3px; }
        .notif-modal-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
        .notif-item-card {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 6px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          transition: background 0.2s;
          position: relative;
        }
        .notif-item-card.unread {
          background: rgba(217,70,239,0.06);
          border-color: rgba(217,70,239,0.15);
        }
        .notif-item-card:hover { background: rgba(255,255,255,0.06); }
        .notif-item-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #d946ef;
          flex-shrink: 0;
          margin-top: 5px;
        }
        .notif-item-dot.read { background: transparent; }
        .notif-item-body { flex: 1; min-width: 0; }
        .notif-item-title {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .notif-item-msg {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          line-height: 1.5;
        }
        .notif-item-time {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          margin-top: 5px;
          display: block;
        }
        .notif-empty {
          text-align: center;
          padding: 40px 20px;
          color: rgba(255,255,255,0.3);
          font-size: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255, 255, 255, 0.05);
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .user-name {
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .user-name:hover { color: #3b82f6; }
        .logout-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-size: 14px;
          padding: 0;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .logout-btn:hover { color: #ef4444; }

        /* CAROUSEL */
        .carousel-wrapper {
          width: 100%;
          height: 600px;
          position: relative;
          overflow: hidden;
          margin-bottom: 40px;
          background: #000;
        }
        .carousel-container { width: 100%; height: 100%; position: relative; }
        .carousel-slide {
          width: 100%;
          height: 100%;
          position: absolute;
          opacity: 0;
          transition: opacity 0.8s ease-in-out;
          display: flex;
          overflow: hidden;
        }
        .carousel-slide.active { opacity: 1; z-index: 2; }
        .carousel-backdrop {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background-size: cover;
          background-position: center;
          filter: blur(16px) brightness(0.4);
          transform: scale(1.1);
          z-index: 1;
        }
        .carousel-gradient-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%);
          z-index: 2;
        }
        .carousel-inner-content {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          gap: 40px;
        }
        .carousel-text-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 700px;
          padding-bottom: 20px;
        }
        .carousel-title {
          font-size: 48px;
          font-weight: 800;
          margin-bottom: 15px;
          line-height: 1.1;
          background: linear-gradient(90deg, #fff, #ccc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 2px 2px 10px rgba(0,0,0,0.5);
        }
        .carousel-meta {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
          font-size: 16px;
          color: rgba(255,255, 255, 0.9);
          font-weight: 500;
        }
        .carousel-genres {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 25px;
        }
        .genre-badge {
          background: rgba(59, 130, 246, 0.2);
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid #ef4444;
          backdrop-filter: blur(5px);
        }
        .carousel-description {
          font-size: 16px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 30px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .carousel-watch-btn {
          align-self: flex-start;
          background: #eab308;
          border: none;
          color: #fff;
          padding: 12px 28px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .carousel-watch-btn:hover {
          background: #eab308;
          transform: translateY(-2px);
        }
        .carousel-poster-section {
          flex: 0 0 320px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: floatPoster 6s ease-in-out infinite;
        }
        @keyframes floatPoster {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .carousel-poster-img {
          width: 320px;
          aspect-ratio: 2/3;
          object-fit: cover;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1);
        }
        .carousel-dots {
          position: absolute;
          bottom: 25px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 10;
        }
        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: all 0.3s;
        }
        .carousel-dot.active {
          background: #ef4444;
          width: 30px;
          border-radius: 5px;
        }

        /* Search Modal Styles */
        .search-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 99999;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .search-modal {
          background: #1a1a1a;
          border-radius: 20px 20px 0 0;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          min-height: 90vh;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease-out;
        }
        .search-modal-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 15px;
          align-items: center;
        }
        .search-input-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 12px;
        }
        .search-icon { color: rgba(255, 255, 255, 0.5); }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 16px;
          outline: none;
        }
        .search-input::placeholder { color: rgba(255, 255, 255, 0.4); }
        .search-close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          min-width: 40px;
          height: 40px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        .search-close-btn:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        .search-results { flex: 1; overflow-y: auto; padding: 20px; }
        .search-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.5);
        }
        .search-results-grid { display: grid; grid-template-columns: 1fr; gap: 15px; }
        .search-result-card {
          display: flex;
          gap: 15px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .search-result-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(59, 130, 246, 0.5);
          transform: translateX(5px);
        }
        .search-result-image { width: 80px; height: 120px; object-fit: cover; border-radius: 8px; }
        .search-result-info { flex: 1; display: flex; flex-direction: column; gap: 8px; justify-content: center; }
        .search-result-title { font-size: 16px; font-weight: 600; color: #fff; }
        .search-result-meta { display: flex; gap: 15px; font-size: 13px; color: rgba(255, 255, 255, 0.6); }
        .search-result-views { display: flex; align-items: center; gap: 5px; }

        .carousel-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: rgba(255, 255, 255, 0.5);
          font-size: 18px;
        }

        .admin-section {
          max-width: 1400px;
          margin: 0 auto 40px;
          padding: 0 20px;
          display: flex;
          justify-content: center;
        }
        .admin-button {
          background: none;
          border: 2px solid;
          color: #fff;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          transition: all .3s;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cards-section { max-width: 1400px; margin: 0 auto; }
        .anime-card {
          cursor: pointer;
          transition: transform 0.3s;
          position: relative;
          border-radius: 20px;
          overflow: hidden;
        }
        .card-image-wrapper {
          width: 100%;
          aspect-ratio: 2/3;
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          background: #1a1a1a;
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
          border-radius: 20px;
        }
        .anime-card:hover .card-image { transform: scale(1.05); }
        .card-header {
          position: absolute;
          top: 0; left: 0; right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
          z-index: 3;
        }
        .card-views {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 0, 0, 0.6);
          padding: 6px 10px;
          border-radius: 10px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
        }
        .card-like-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        .card-like-btn:hover { color: #fff; }
        .card-like-btn.liked { color: #FFD700; }
        .card-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 15px;
          z-index: 2;
        }
        .anime-card:hover .card-overlay { opacity: 1; }
        .card-overlay-info { display: flex; flex-direction: column; gap: 8px; }
        .card-overlay-meta { display: flex; align-items: center; gap: 10px; font-size: 12px; }
        .card-rating { display: flex; align-items: center; gap: 4px; color: #fbbf24; }
        .card-episodes { color: rgba(255, 255, 255, 0.8); }
        .card-content { padding: 5px 10px; }
        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          white-space: wrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .footer {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 40px 20px;
          position: relative;
          border-radius:30px;
        }
        .footer-content { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 30px; }
        .footer-section { display: grid; grid-template-columns: repeat(3, 1fr); justify-content: center; }
        .footer-col { display: flex; flex-direction: column; gap: 15px; margin: 0 auto; }
        .footer-title { font-size: 16px; font-weight: 700; color: #fff; }
        .footer-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
          cursor: pointer;
        }
        .footer-link:hover { color: #3b82f6; }
        .footer-socials { display: flex; gap: 15px; align-items: center; }
        .social-icon {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          color: #eab308;
        }
        .footer-bottom { text-align: center; padding-top: 20px; color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-bottom: 40px; }

        .auth-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          backdrop-filter: blur(8px);
        }
        .auth-modal {
          background: #1a1a1a;
          border-radius: 16px;
          padding: 40px;
          max-width: 400px;
          width: 90%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
        }
        .auth-modal-header { text-align: center; margin-bottom: 20px; }
        .auth-modal-title { font-size: 24px; font-weight: 700; margin-bottom: 10px; }
        .auth-modal-subtitle { font-size: 14px; color: rgba(255, 255, 255, 0.6); }

        .google-auth-btn {
          width: 100%;
          padding: 12px;
          background: #fff;
          color: #111;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 14px;
          transition: all 0.3s;
        }
        .google-auth-btn:hover { background: #f0f0f0; }

        .auth-divider {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
        }
        .auth-divider::before, .auth-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }
        .auth-divider span { padding: 0 10px; }

        .auth-form { display: flex; flex-direction: column; gap: 20px; }
        .auth-input-group { display: flex; flex-direction: column; gap: 8px; }
        .auth-label { font-size: 14px; font-weight: 600; color: rgba(255, 255, 255, 0.8); }
        .auth-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          transition: all 0.3s;
        }
        .auth-input:focus {
          outline: none;
          border-color: #eab308;
          background: rgba(255, 255, 255, 0.08);
        }

        .auth-submit-btn {
          width: 100%;
          padding: 14px;
          background: #eab308;
          border: none;
          color: #fff;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .auth-submit-btn:hover { transform: translateY(-2px);  }
        .auth-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .auth-switch {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }
        .auth-switch-link { color: #fff; cursor: pointer; font-weight: 600; transition: color 0.3s; }
        .auth-switch-link:hover { color: #2563eb; }

        .auth-close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: all 0.3s;
        }
        .auth-close-btn:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
        }
        .modal {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 30px;
          max-width: 400px;
          width: 90%;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .modal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .modal-icon {
          width: 40px; height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .modal-icon.success { background: #10b981; }
        .modal-icon.error { background: #ef4444; }
        .modal-title { font-size: 18px; font-weight: 600; }
        .modal-message { color: rgba(255, 255, 255, 0.8); line-height: 1.5; margin-bottom: 20px; }
        .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
        .modal-btn { padding: 10px 20px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; font-size: 14px; }
        .modal-btn.primary { background: #3b82f6; color: #fff; }
        .modal-btn.secondary { background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.8); }

        .empty-state { text-align: center; padding: 60px 20px; color: rgba(255, 255, 255, 0.5); width: 100%; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }

        /* --- MEDIA QUERIES --- */
        @media (max-width: 1200px) {
          .footer-section { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .carousel-wrapper { height: 400px; }
          .carousel-inner-content { display: block; padding: 0 20px; }
          .carousel-poster-section { display: none; }
          .carousel-backdrop { filter: none; transform: scale(1); opacity: 1; filter: brightness(0.7); }
          .carousel-gradient-overlay { background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, transparent 100%); }
          .carousel-text-section {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            max-width: 100%;
            padding: 40px 20px 20px;
            z-index: 4;
            justify-content: flex-end;
            height: auto;
          }
          .carousel-title {
            font-size: 29px;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            background: none;
            -webkit-text-fill-color: #fff;
            color: #fff;
          }
          .carousel-description {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            font-size: 14px;
            margin-bottom: 15px;
          }
          .carousel-watch-btn {
            position: absolute;
            top: 0px;
            right: 20px;
            background: none;
            border: 2px solid #fff;
            padding: 7px 10px;
            font-size: 12px;
            backdrop-filter: blur(1rem);
            box-shadow: none;
            align-self: auto;
            margin-top: -60px !important;
          }
          .carousel-dots { bottom: 15px; }
          .footer-section { display: flex; justify-content: center; }
          .horizontal-card { width: 150px; }
          .row-title { font-size: 20px; }
          .site-header { padding: 18px 20px; }
          .notif-modal-box { max-width: 100%; border-radius: 20px 20px 0 0; }
          .notif-modal-overlay { padding: 0; align-items: flex-end; }
        }
        @media (max-width: 768px) {
          .search-btn { display: none !important; }
          .card-title {
            font-size: 14px;
            font-weight: 600;
            color: #fff;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
        @media (max-width: 600px) {
          ::-webkit-scrollbar { width: 0px; }
          .carousel-wrapper { height: 300px; }
          .mobile-hide { display: none; }
          .carousel-title { font-size: 23px; }
          .carousel-meta { font-size: 12px; gap: 12px; margin-bottom: 12px; }
          .carousel-genres { gap: 6px; margin-bottom: 12px; }
          .genre-badge { padding: 4px 10px; font-size: 11px; }
          .carousel-description { font-size: 12px; }
          .site-header { flex-wrap: wrap; padding: 17px 10px; }
          .mobile-hide { display: none !important; }
          .header-logo { height: 32px; }
          .footer-content { gap: 20px; }
          .footer-col { gap: 10px; display: flex; flex-direction: default; }
          .footer-title { font-size: 14px; }
          .footer-link { font-size: 12px; }
          .social-icon { width: 36px; height: 36px; }
          .search-modal { max-height: 90vh; border-radius: 15px 15px 0 0; }
          .search-result-image { width: 60px; height: 90px; }
          .search-result-title { font-size: 14px; }
          .search-result-meta { font-size: 12px; gap: 10px; }
        }
      `}</style>

      {/* ✅ ORQA FON DIVLARI */}
      <div className="bg-grid"></div>
      <div className="bg-vignette"></div>

      <div className="container">
        {/* ✅ Header */}
        <div className="site-header">
          <img src={LOGO_URL} alt="Mochi" className="header-logo" onClick={() => window.location.href = '/'} />
          
          <div className="header-right">
            {/* ✅ Lavhalar link — faqat desktop (≥1200px) da ko'rinadi */}
            <a href="/wall" className="lavhalar-link">
              🎨 Lavhalar
            </a>

            <button className="search-btn" onClick={showSearchModal}>
              <Search size={20} />
            </button>
            
            {currentUser ? (
              <>
                {/* ✅ Notification Bell */}
                <button className="notif-bell-btn" onClick={handleOpenNotifModal}>
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>

                {/* ✅ Avatar + Dropdown */}
                <div className="avatar-header-wrap" ref={avatarMenuRef}>
                  <div
                    className="avatar-header-btn"
                    onClick={() => setShowAvatarMenu(v => !v)}
                  >
                    <img
                      src={currentUser.avatar_url || DEFAULT_AVATAR}
                      alt={currentUser.username}
                    />
                  </div>

                  {showAvatarMenu && (
                    <div className="avatar-dropdown">
                      <div className="avatar-dropdown-user">
                        <img src={currentUser.avatar_url || DEFAULT_AVATAR} alt={currentUser.username} />
                        <div>
                          <div className="avatar-dropdown-username">{currentUser.username}</div>
                          <div className="avatar-dropdown-role">Foydalanuvchi</div>
                        </div>
                      </div>

                      <button
                        className="avatar-dropdown-item"
                        onClick={() => { setShowAvatarMenu(false); goToProfile(); }}
                      >
                        👤 &nbsp; Profil
                      </button>

                      <div className="avatar-dropdown-divider" />

                      <button
                        className="avatar-dropdown-item danger"
                        onClick={handleLogout}
                      >
                        <LogOut size={15} /> Chiqish
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button className="login-btn" onClick={() => showAuthModal('login')}>
                Kirish
              </button>
            )}
          </div>
        </div>

        {/* Carousel */}
        <div className="carousel-wrapper">
          <div className="carousel-container">
            {!loading && carouselData.length === 0 ? (
              <div className="carousel-empty">
                <div>Carousel bo'sh</div>
              </div>
            ) : loading ? (
              <div className="carousel-skeleton">
                <div className="carousel-skel-content">
                  <div className="skel-title"></div>
                  <div className="skel-meta"></div>
                  <div className="skel-desc"></div>
                  <div className="skel-btn"></div>
                </div>
                <div className="carousel-skel-poster"></div>
              </div>
            ) : (
              carouselData.map((item, index) => (
                <div
                  key={item.id}
                  className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                >
                  <div
                    className="carousel-backdrop"
                    style={{ backgroundImage: `url(${item.anime_cards.image_url})` }}
                  ></div>
                  <div className="carousel-gradient-overlay"></div>

                  <div className="carousel-inner-content">
                    <div className="carousel-text-section">
                      <div className="carousel-title">{item.anime_cards.title}</div>
                      <div className="carousel-meta">
                        <div className="carousel-meta-item">
                          <span>⭐ {item.anime_cards.rating}</span>
                        </div>
                        <div className="carousel-meta-item">
                          <span>📺 {item.anime_cards.episodes} qism</span>
                        </div>
                      </div>

                      {item.anime_cards.genres && item.anime_cards.genres.length > 0 && (
                        <div className="carousel-genres">
                          {item.anime_cards.genres.slice(0, 3).map((genre, idx) => (
                            <span key={idx} className="genre-badge">{genre}</span>
                          ))}
                        </div>
                      )}

                      {item.anime_cards.description && (
                        <div className="carousel-description">
                          {item.anime_cards.description}
                        </div>
                      )}

                      <button 
                        className="carousel-watch-btn"
                        onClick={() => goToAnime(item.anime_cards)}
                      >
                        <Play size={20} fill="currentColor" />
                        Tomosha qilish
                      </button>
                    </div>

                    <div className="carousel-poster-section">
                       <img 
                         src={item.anime_cards.image_url} 
                         alt={item.anime_cards.title} 
                         className="carousel-poster-img"
                       />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {carouselData.length > 0 && (
            <div className="carousel-dots">
              {carouselData.map((_, index) => (
                <div
                  key={index}
                  className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Admin Panel Button */}
        {isAdmin && (
          <div className="admin-section">
            <button className="admin-button" onClick={goToAdmin}>
              <Lock size={18} />
              Admin Panel
            </button>
          </div>
        )}

        {/* ANIME SECTIONS */}
        <div className="cards-section">
          {loading ? (
             <div className="cards-section-loading">
               {[1, 2, 3, 4].map((rowId) => (
                 <div key={rowId} className="horizontal-section">
                   <div className="row-title-header">
                      <div style={{width: 200, height: 28, background: '#1a1a1a', borderRadius: 8}}></div>
                   </div>
                   <div className="horizontal-scroll-container" style={{overflow: 'hidden'}}>
                     {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
                   </div>
                 </div>
               ))}
             </div>
          ) : animeCards.length === 0 ? (
            <div className="empty-state">Hali anime qo'shilmagan</div>
          ) : (
            <>
              {/* ROW 1 */}
              <div className="horizontal-section">
                <div className="row-title-header">
                  <h2 className="row-title">Bugun Tavsiya Etamiz</h2>
                </div>
                <div className="horizontal-scroll-container">
                  {row1.map((anime) => (
                    <AnimeCard 
                      key={anime.id} 
                      anime={anime}
                      allViews={allViews}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                      goToAnime={goToAnime}
                      isHorizontal={true}
                    />
                  ))}
                </div>
              </div>

              {/* ROW 2 */}
              <div className="horizontal-section">
                <div className="row-title-header">
                  <h2 className="row-title">Trenddagi Animelar</h2>
                </div>
                <div className="horizontal-scroll-container">
                  {row2.map((anime) => (
                    <AnimeCard 
                      key={anime.id} 
                      anime={anime}
                      allViews={allViews}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                      goToAnime={goToAnime}
                      isHorizontal={true}
                    />
                  ))}
                </div>
              </div>

              {/* ROW 3 */}
              <div className="horizontal-section">
                <div className="row-title-header">
                  <h2 className="row-title">Yangi Qo'shilganlar</h2>
                </div>
                <div className="horizontal-scroll-container">
                  {row3.map((anime) => (
                    <AnimeCard 
                      key={anime.id} 
                      anime={anime}
                      allViews={allViews}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                      goToAnime={goToAnime}
                      isHorizontal={true}
                    />
                  ))}
                </div>
              </div>

              {/* ROW 4 */}
              <div className="horizontal-section">
                <div className="row-title-header">
                  <h2 className="row-title">Afsonaviy Animelar</h2>
                </div>
                <div className="horizontal-scroll-container">
                  {row4.map((anime) => (
                    <AnimeCard 
                      key={anime.id} 
                      anime={anime}
                      allViews={allViews}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                      goToAnime={goToAnime}
                      isHorizontal={true}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search Modal */}
        {searchModal && (
          <SearchModal 
            onClose={hideSearchModal}
            animeCards={animeCards}
            onAnimeClick={goToAnime}
            allViews={allViews}
          />
        )}

        {/* Auth Modal */}
        {authModal.show && (
          <AuthModal 
            mode={authModal.mode}
            onClose={hideAuthModal}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onTelegramOpen={openTelegramModal}
            loading={authLoading}
          />
        )}

        {/* Telegram Code Modal */}
        {tgModal && (
          <TelegramCodeModal
            onClose={closeTelegramModal}
            onVerify={handleTelegramVerify}
            onStart={handleTelegramStart}
            loading={tgAuthLoading}
            errorText={tgAuthError}
          />
        )}

        {/* General Modal */}
        {modal.show && (
          <div className="modal-overlay" onClick={hideModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className={`modal-icon ${modal.type}`}>
                  {modal.type === 'success' && '✓'}
                  {modal.type === 'error' && '✕'}
                </div>
                <div className="modal-title">
                  {modal.type === 'success' && 'Muvaffaqiyatli'}
                  {modal.type === 'error' && 'Xato'}
                </div>
              </div>
              <div className="modal-message">{modal.message}</div>
              <div className="modal-actions">
                <button className="modal-btn primary" onClick={hideModal}>OK</button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ NOTIFICATION MODAL */}
        {showNotifModal && (
          <div className="notif-modal-overlay" onClick={() => setShowNotifModal(false)}>
            <div className="notif-modal-box" onClick={e => e.stopPropagation()}>
              <div className="notif-modal-header">
                <div className="notif-modal-title">
                  🔔 Bildirishnomalar
                  {notifications.length > 0 && (
                    <span className="notif-modal-count">{notifications.length}</span>
                  )}
                </div>
                <button className="notif-modal-close" onClick={() => setShowNotifModal(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="notif-modal-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <span style={{ fontSize: 36 }}>🔕</span>
                    <span>Bildirishnomalar yo'q</span>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`notif-item-card ${!n.is_read ? 'unread' : ''}`}>
                      <div className={`notif-item-dot ${n.is_read ? 'read' : ''}`} />
                      <div className="notif-item-body">
                        <div className="notif-item-title">{n.title}</div>
                        <div className="notif-item-msg">{n.message}</div>
                        <span className="notif-item-time">
                          {new Date(n.created_at).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navbar */}
        <MobileNavbar
          currentUser={currentUser}
          onSearchClick={handleSearchClick}
          onProfileClick={handleProfileClick}
          onHomeClick={handleHomeClick}
          activeTab={activeTab}
        />
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-col">
              <div className="footer-title">MochiTV Haqida</div>
              <a href="/info" className="footer-link">Biz haqimizda</a>
              <a href="/info" className="footer-link">Aloqa</a>
              <a href="/info" className="footer-link">Muammo Xabar Qilish</a>
            </div>
            <div className="footer-col">
              <div className="footer-title">Yordam</div>
              <a href="/info" className="footer-link">FAQ</a>
              <a href="/info" className="footer-link">Qo'llanma</a>
              <a href="/info" className="footer-link">Shartlar va Shartlar</a>
            </div>
            <div className="footer-col mobile-hide">
              <div className="footer-title">Ijtimoiy Tarmoqlar</div>
              <div className="footer-socials">
                <a className="social-icon" href="https://youtube.com/@MochiTvUz" target="_blank" rel="noopener noreferrer" title="YouTube">
                  <Youtube size={20} />
                </a>
                <a className="social-icon" href="https://t.me/MochitvUz" target="_blank" rel="noopener noreferrer" title="Telegram">
                  <FaTelegramPlane size={20} />
                </a>
                <a className="social-icon" href="https://instagram.com/mochitv_uz" target="_blank" rel="noopener noreferrer" title="Instagram">
                  <LuInstagram size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 MochiTv.Uz Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
   <div style={{ marginBottom: "20px" }}></div>
  </>
  );
}