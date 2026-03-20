import { useEffect, useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import {
  Search, X, Star, Eye,
  ChevronDown, Flame, Clock,
  Filter, ArrowUpDown, SearchX
} from 'lucide-react';
import { IoBookmarkOutline, IoBookmark } from 'react-icons/io5';
import MobileNavbar from '../components/MobileNavbar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOGO_URL = '/assets/lego.png';

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Eng Yangi',      icon: Clock  },
  { value: 'rating',  label: 'Reyting',         icon: Star   },
  { value: 'views',   label: "Ko'p Ko'rilgan",  icon: Eye    },
  { value: 'popular', label: 'Mashhur',         icon: Flame  },
];

function useDebounce(value, delay) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

/* ─── Skeleton Card ─── */
const SkeletonCard = () => (
  <div className="sk-card">
    <div className="sk-img"><div className="sk-shine" /></div>
    <div className="sk-body">
      <div className="sk-line w70" />
      <div className="sk-line w45" />
    </div>
  </div>
);

/* ─── Anime Card ─── */
function AnimeCard({ anime, favorites, toggleFavorite, goToAnime, index }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const isFav = favorites.includes(anime.id);

  return (
    <div
      className="a-card"
      onClick={() => goToAnime(anime)}
      style={{ animationDelay: Math.min(index * 0.045, 0.4) + 's' }}
    >
      <div className="a-card-img-wrap">
        {!imgLoaded && <div className="a-card-img-skeleton" />}
        <img
          src={anime.image_url}
          alt={anime.title}
          className={'a-card-img' + (imgLoaded ? ' visible' : '')}
          onLoad={() => setImgLoaded(true)}
        />

        <div className="a-card-top-row">
          <span className="a-card-rating-badge">
            <Star size={11} fill="currentColor" style={{ marginRight: 3 }} />
            {anime.rating}
          </span>
          <button
            className={'a-card-fav' + (isFav ? ' active' : '')}
            onClick={e => { e.stopPropagation(); toggleFavorite(anime.id); }}
          >
            {isFav ? <IoBookmark size={20} /> : <IoBookmarkOutline size={20} />}
          </button>
        </div>

        <div className="a-card-overlay">
          <div className="a-card-overlay-meta">
            <span className="a-card-overlay-rating">
              <Star size={12} fill="currentColor" style={{ marginRight: 3 }} />
              {anime.rating}
            </span>
            <span className="a-card-eps">{anime.episodes} qism</span>
          </div>
          {anime.genres?.length > 0 && (
            <div className="a-card-genres">
              {anime.genres.slice(0, 2).map((g, i) => (
                <span key={i} className="a-card-genre-tag">{g}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="a-card-title">{anime.title}</div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef(null);

  const [mounted, setMounted]         = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [allAnime, setAllAnime]       = useState([]);
  const [allViews, setAllViews]       = useState({});
  const [favorites, setFavorites]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('search');

  const [query, setQuery]               = useState('');
  const [sortBy, setSortBy]             = useState('newest');
  const [showSortDrop, setShowSortDrop] = useState(false);
  const [showFilters, setShowFilters]   = useState(false);
  const [minRating, setMinRating]       = useState(0);

  const dq = useDebounce(query, 250);

  useEffect(() => {
    setMounted(true);
    loadUser();
    loadData();
    const urlQ = new URLSearchParams(window.location.search).get('q');
    if (urlQ) setQuery(urlQ);
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  const loadUser = async () => {
    try {
      const raw = localStorage.getItem('anime_user');
      if (!raw) return;
      const u = JSON.parse(raw);
      setCurrentUser(u);
      const { data } = await supabase.from('user_favorites').select('anime_id').eq('user_id', u.id);
      if (data) setFavorites(data.map(f => f.anime_id));
    } catch (_) {}
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        supabase.from('anime_cards').select('*').order('created_at', { ascending: false }),
        supabase.from('anime_views').select('anime_id, view_count'),
      ]);
      setAllAnime(r1.data || []);
      const vObj = {};
      (r2.data || []).forEach(v => { vObj[v.anime_id] = (vObj[v.anime_id] || 0) + v.view_count; });
      setAllViews(vObj);
    } catch (_) {}
    setLoading(false);
  };

  const results = (() => {
    let arr = [...allAnime];
    if (dq.trim()) {
      const q = dq.toLowerCase();
      arr = arr.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q) ||
        (a.genres || []).some(g => g.toLowerCase().includes(q))
      );
    }
    if (minRating > 0) arr = arr.filter(a => parseFloat(a.rating || 0) >= minRating);
    if (sortBy === 'rating')
      arr.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
    else if (sortBy === 'views' || sortBy === 'popular')
      arr.sort((a, b) => (allViews[b.id] || 0) - (allViews[a.id] || 0));
    else
      arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (!dq.trim() && minRating === 0) return arr.slice(0, 20);
    return arr;
  })();

  const toggleFavorite = useCallback(async (animeId) => {
    if (!currentUser) return;
    const isFav = favorites.includes(animeId);
    if (isFav) {
      await supabase.from('user_favorites').delete().eq('user_id', currentUser.id).eq('anime_id', animeId);
      setFavorites(prev => prev.filter(id => id !== animeId));
    } else {
      await supabase.from('user_favorites').insert([{ user_id: currentUser.id, anime_id: animeId }]);
      setFavorites(prev => [...prev, animeId]);
    }
  }, [currentUser, favorites]);

  const goToAnime = (anime) => {
    const slug = anime.title.trim().replace(/\s+/g, '-');
    router.push('/anime/' + encodeURIComponent(slug));
  };

  const clearSearch = () => { setQuery(''); inputRef.current?.focus(); };
  const hasActiveFilters = minRating > 0 || sortBy !== 'newest';
  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Saralash';
  const ActiveSortIcon  = SORT_OPTIONS.find(o => o.value === sortBy)?.icon || ArrowUpDown;

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Qidiruv — MochiTv.Uz</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100%; overflow-x: hidden; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif;
          background: #090b10;
          color: #ffffff;
          -webkit-tap-highlight-color: transparent;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.6); border-radius: 10px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }

        /* ─── background (index.js ile aynı) ─── */
        .bg-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .bg-vignette {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(circle at 50% 0%, rgba(212,175,55,0.05), transparent 60%),
            linear-gradient(to top, #090b10 0%, transparent 100%);
        }

        /* ─── header ─── */
        .s-header {
          position: sticky; top: 0; left: 0; right: 0; z-index: 100;
          padding: 14px 20px;
          display: flex; align-items: center; gap: 14px;
          background: rgba(9,11,16,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .s-logo {
          height: 36px; width: auto; cursor: pointer; flex-shrink: 0;
        }
        .s-search-bar {
          flex: 1;
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 0 14px;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .s-search-bar:focus-within {
          border-color: rgba(234,179,8,0.5);
          box-shadow: 0 0 0 3px rgba(234,179,8,0.08);
        }
        .s-search-icon { color: rgba(255,255,255,0.3); flex-shrink: 0; }
        .s-input {
          flex: 1; background: transparent; border: none;
          color: #fff; font-size: 16px; padding: 13px 0; outline: none;
        }
        .s-input::placeholder { color: rgba(255,255,255,0.25); }
        .s-clear-btn {
          background: rgba(255,255,255,0.08); border: none;
          color: rgba(255,255,255,0.5);
          width: 26px; height: 26px; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0;
        }
        .s-clear-btn:hover { background: rgba(239,68,68,0.2); color: #ef4444; }

        /* ─── main wrapper ─── */
        .s-wrapper {
          position: relative; z-index: 1;
          max-width: 1400px; margin: 0 auto;
          padding: 24px 20px 110px;
        }

        /* ─── toolbar ─── */
        .s-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; margin-bottom: 20px;
        }
        .s-result-count {
          font-size: 13px; color: rgba(255,255,255,0.35);
          border-left: 4px solid #ef4444;
          padding-left: 10px; line-height: 1.4;
        }
        .s-result-count b { color: rgba(255,255,255,0.8); font-weight: 700; }
        .s-toolbar-right { display: flex; align-items: center; gap: 8px; }

        /* ─── sort ─── */
        .s-sort-wrap { position: relative; }
        .s-sort-btn {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.75);
          padding: 9px 14px; border-radius: 10px;
          cursor: pointer; font-size: 13px; font-weight: 600;
          transition: all 0.2s; white-space: nowrap;
        }
        .s-sort-btn:hover, .s-sort-btn.open {
          border-color: rgba(234,179,8,0.5);
          background: rgba(234,179,8,0.07);
          color: #fbbf24;
        }
        .s-chevron { transition: transform 0.2s; display: flex; align-items: center; }
        .s-sort-btn.open .s-chevron { transform: rotate(180deg); }
        .s-dropdown {
          position: absolute; top: calc(100% + 7px); right: 0;
          background: #13161e;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; overflow: hidden; z-index: 200;
          min-width: 185px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.8);
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: none; }
        }
        .s-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; cursor: pointer;
          font-size: 13px; color: rgba(255,255,255,0.6);
          transition: all 0.15s;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .s-dropdown-item:last-child { border-bottom: none; }
        .s-dropdown-item:hover { background: rgba(234,179,8,0.08); color: #fbbf24; }
        .s-dropdown-item.active { color: #fbbf24; background: rgba(234,179,8,0.07); }

        /* ─── filter btn ─── */
        .s-filter-btn {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.65);
          padding: 9px 14px; border-radius: 10px;
          cursor: pointer; font-size: 13px; font-weight: 600;
          transition: all 0.2s; position: relative;
        }
        .s-filter-btn:hover, .s-filter-btn.open {
          border-color: rgba(139,92,246,0.5);
          background: rgba(139,92,246,0.08);
          color: #a78bfa;
        }
        .s-filter-dot {
          position: absolute; top: 7px; right: 7px;
          width: 7px; height: 7px; border-radius: 50%;
          background: #3b82f6;
          box-shadow: 0 0 6px rgba(59,130,246,0.8);
        }

        /* ─── filter panel ─── */
        .s-filter-panel {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 20px;
          margin-bottom: 20px;
          animation: fadeSlide 0.2s ease;
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: none; }
        }
        .s-filter-label {
          font-size: 11px; font-weight: 700; letter-spacing: 1.8px;
          color: rgba(255,255,255,0.25); text-transform: uppercase;
          margin-bottom: 14px;
          border-left: 4px solid #8b5cf6; padding-left: 10px;
        }
        .s-rating-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .s-rating-chip {
          padding: 7px 16px; border-radius: 50px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
          cursor: pointer; font-size: 13px; font-weight: 600;
          transition: all 0.2s;
        }
        .s-rating-chip:hover {
          border-color: rgba(251,191,36,0.4); color: #fbbf24;
          background: rgba(251,191,36,0.06);
        }
        .s-rating-chip.active {
          background: rgba(251,191,36,0.1);
          border-color: rgba(251,191,36,0.5);
          color: #fbbf24;
          box-shadow: 0 0 12px rgba(251,191,36,0.15);
        }
        .s-reset-btn {
          margin-top: 16px; background: none;
          border: 1px dashed rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.3); padding: 8px 18px;
          border-radius: 8px; cursor: pointer; font-size: 12px; transition: all 0.2s;
        }
        .s-reset-btn:hover { border-color: #ef4444; color: #ef4444; }

        /* ─── section title (index.js ile aynı stil) ─── */
        .s-section-title {
          font-size: 24px; font-weight: 700; color: #fff;
          border-left: 4px solid #ef4444;
          padding-left: 12px; margin-bottom: 20px;
          text-shadow: 0 0 10px rgba(239,68,68,0.25);
        }

        /* ─── grid ─── */
        .s-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
          gap: 16px;
        }
        @media (min-width: 600px) {
          .s-grid { grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 18px; }
        }
        @media (min-width: 1024px) {
          .s-grid { grid-template-columns: repeat(auto-fill, minmax(195px, 1fr)); gap: 20px; }
        }

        /* ─── anime card ─── */
        .a-card {
          cursor: pointer;
          opacity: 0;
          animation: cardIn 0.35s ease forwards;
          border-radius: 20px;
          transition: transform 0.3s;
        }
        .a-card:hover { transform: translateY(-4px); }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .a-card-img-wrap {
          position: relative; width: 100%; aspect-ratio: 2/3;
          border-radius: 20px; overflow: hidden;
          background: #0f1219;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          transition: box-shadow 0.3s;
        }
        .a-card:hover .a-card-img-wrap {
          box-shadow: 0 8px 32px rgba(0,0,0,0.7);
        }
        .a-card-img-skeleton {
          position: absolute; inset: 0;
          background: #0f1219; z-index: 1;
          animation: simplePulse 1.5s ease-in-out infinite;
        }
        @keyframes simplePulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        .a-card-img {
          width: 100%; height: 100%; object-fit: cover;
          opacity: 0; transition: opacity 0.4s, transform 0.4s;
          border-radius: 20px;
        }
        .a-card-img.visible { opacity: 1; }
        .a-card:hover .a-card-img { transform: scale(1.05); }

        /* top row */
        .a-card-top-row {
          position: absolute; top: 0; left: 0; right: 0;
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent);
          z-index: 3;
        }
        .a-card-rating-badge {
          display: flex; align-items: center;
          font-size: 12px; font-weight: 700; color: #ffd700;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(6px);
          padding: 5px 9px; border-radius: 10px;
        }
        .a-card-fav {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.75);
          transition: all 0.25s; display: flex; align-items: center;
        }
        .a-card-fav:hover  { color: #fff; transform: scale(1.2); }
        .a-card-fav.active { color: #ffd700; }

        /* hover overlay */
        .a-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 55%);
          opacity: 0; transition: opacity 0.3s;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 14px; z-index: 2;
        }
        .a-card:hover .a-card-overlay { opacity: 1; }
        .a-card-overlay-meta {
          display: flex; gap: 8px; align-items: center;
          font-size: 12px; margin-bottom: 8px;
        }
        .a-card-overlay-rating {
          display: flex; align-items: center; color: #fbbf24; font-weight: 700;
        }
        .a-card-eps { color: rgba(255,255,255,0.7); }
        .a-card-genres { display: flex; gap: 5px; flex-wrap: wrap; }
        .a-card-genre-tag {
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.35);
          color: #fca5a5;
          font-size: 10px; font-weight: 600;
          padding: 3px 8px; border-radius: 5px;
        }

        /* card title */
        .a-card-title {
          font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.85);
          margin-top: 9px; padding: 0 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
          transition: color 0.2s;
        }
        .a-card:hover .a-card-title { color: #fff; }

        /* ─── skeleton ─── */
        .sk-card { display: flex; flex-direction: column; gap: 10px; }
        .sk-img {
          width: 100%; aspect-ratio: 2/3; background: #0f1219;
          border-radius: 20px; position: relative; overflow: hidden;
          animation: simplePulse 1.5s ease-in-out infinite;
        }
        .sk-shine {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
          background-size: 200% 100%;
          animation: shimmer 1.8s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .sk-body { display: flex; flex-direction: column; gap: 7px; padding: 0 4px; }
        .sk-line {
          height: 12px; border-radius: 4px; background: #0f1219;
          animation: simplePulse 1.5s ease-in-out infinite;
        }
        .w70 { width: 70%; } .w45 { width: 45%; }

        /* ─── empty state ─── */
        .s-empty {
          grid-column: 1 / -1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 90px 20px; text-align: center;
        }
        .s-empty-icon {
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.2); margin-bottom: 20px;
        }
        .s-empty h3 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
        .s-empty p { color: rgba(255,255,255,0.35); font-size: 14px; line-height: 1.6; }
        .s-empty-reset {
          margin-top: 20px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.35);
          color: #fca5a5; padding: 11px 24px;
          border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600;
          transition: all 0.2s;
        }
        .s-empty-reset:hover { background: rgba(239,68,68,0.2); color: #fff; border-color: #ef4444; }

        /* ─── responsive ─── */
        @media (max-width: 600px) {
          .s-wrapper { padding: 18px 14px 100px; }
          .s-header { padding: 12px 14px; gap: 10px; }
          .s-logo { display: none; }
          .hide-sm { display: none !important; }
          ::-webkit-scrollbar { width: 0; }
        }
      `}</style>

      <div className="bg-grid" />
      <div className="bg-vignette" />

      {/* ─── Header ─── */}
      <header className="s-header">
        <img
          src={LOGO_URL}
          alt="MochiTV"
          className="s-logo"
          onClick={() => router.push('/')}
        />
        <div className="s-search-bar">
          <Search size={18} className="s-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="s-input"
            placeholder="Anime nomini yozing..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button className="s-clear-btn" onClick={clearSearch}>
              <X size={13} />
            </button>
          )}
        </div>
      </header>

      {/* ─── Main ─── */}
      <main className="s-wrapper" onClick={() => setShowSortDrop(false)}>

        {/* Toolbar */}
        <div className="s-toolbar">
          <span className="s-result-count">
            {loading
              ? 'Yuklanmoqda...'
              : <><b>{results.length}</b> ta natija &nbsp;·&nbsp; {allAnime.length} ta jami</>
            }
          </span>

          <div className="s-toolbar-right">
            {/* Filter */}
            <button
              className={'s-filter-btn' + (showFilters ? ' open' : '')}
              onClick={e => { e.stopPropagation(); setShowFilters(v => !v); }}
            >
              <Filter size={14} />
              <span className="hide-sm">Filter</span>
              {hasActiveFilters && <span className="s-filter-dot" />}
            </button>

            {/* Sort */}
            <div className="s-sort-wrap" onClick={e => e.stopPropagation()}>
              <button
                className={'s-sort-btn' + (showSortDrop ? ' open' : '')}
                onClick={() => setShowSortDrop(v => !v)}
              >
                <ActiveSortIcon size={14} />
                <span className="hide-sm">{activeSortLabel}</span>
                <span className="s-chevron"><ChevronDown size={13} /></span>
              </button>

              {showSortDrop && (
                <div className="s-dropdown">
                  {SORT_OPTIONS.map(o => {
                    const Icon = o.icon;
                    return (
                      <div
                        key={o.value}
                        className={'s-dropdown-item' + (sortBy === o.value ? ' active' : '')}
                        onClick={() => { setSortBy(o.value); setShowSortDrop(false); }}
                      >
                        <Icon size={14} />
                        {o.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="s-filter-panel">
            <div className="s-filter-label">Minimal Reyting</div>
            <div className="s-rating-row">
              {[0, 6, 7, 8, 9].map(r => (
                <button
                  key={r}
                  className={'s-rating-chip' + (minRating === r ? ' active' : '')}
                  onClick={() => setMinRating(r)}
                >
                  {r === 0 ? 'Barchasi' : `${r}+ ⭐`}
                </button>
              ))}
            </div>
            {hasActiveFilters && (
              <button
                className="s-reset-btn"
                onClick={() => { setMinRating(0); setSortBy('newest'); setQuery(''); }}
              >
                Filterni tozalash
              </button>
            )}
          </div>
        )}

        {/* Section title — only when no search/filter active */}
        {!dq.trim() && !hasActiveFilters && !loading && (
          <h2 className="s-section-title">Eng Yangi Animelar</h2>
        )}

        {/* Grid */}
        <div className="s-grid">
          {loading
            ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
            : results.length === 0
              ? (
                <div className="s-empty">
                  <div className="s-empty-icon"><SearchX size={36} /></div>
                  <h3>Natija topilmadi</h3>
                  <p>
                    {dq
                      ? `"${dq}" bo'yicha hech narsa topilmadi`
                      : "Tanlangan filtrlarga mos anime yo'q"}
                  </p>
                  <button
                    className="s-empty-reset"
                    onClick={() => { setQuery(''); setMinRating(0); setSortBy('newest'); }}
                  >
                    Qaytadan boshlash
                  </button>
                </div>
              )
              : results.map((anime, i) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  allViews={allViews}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  goToAnime={goToAnime}
                  index={i}
                />
              ))
          }
        </div>
      </main>

      <MobileNavbar
        currentUser={currentUser}
        onSearchClick={() => setActiveTab('search')}
        onProfileClick={() => currentUser && router.push('/profile/' + currentUser.username)}
        onHomeClick={() => router.push('/')}
        activeTab={activeTab}
      />
    </>
  );
}
