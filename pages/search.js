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

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase     = createClient(supabaseUrl, supabaseAnonKey);
const LOGO_URL     = '/assets/lego.png';

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Eng Yangi',     icon: Clock  },
  { value: 'rating',  label: 'Reyting',        icon: Star   },
  { value: 'views',   label: "Ko'p Ko'rilgan", icon: Eye    },
  { value: 'popular', label: 'Mashhur',        icon: Flame  },
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
      style={{ animationDelay: Math.min(index * 0.04, 0.35) + 's' }}
    >
      <div className="a-card-img-wrap">
        {!imgLoaded && <div className="a-card-img-skeleton" />}
        <img
          src={anime.image_url}
          alt={anime.title}
          className={'a-card-img' + (imgLoaded ? ' visible' : '')}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />

        <div className="a-card-top-row">
          <span className="a-card-rating-badge">
            <Star size={10} fill="currentColor" style={{ marginRight: 3 }} />
            {anime.rating}
          </span>
          <button
            className={'a-card-fav' + (isFav ? ' active' : '')}
            onClick={e => { e.stopPropagation(); toggleFavorite(anime.id); }}
          >
            {isFav ? <IoBookmark size={18} /> : <IoBookmarkOutline size={18} />}
          </button>
        </div>

        <div className="a-card-overlay">
          <div className="a-card-eps">{anime.episodes} qism</div>
       
        </div>
      </div>
      <div className="a-card-title">{anime.title}</div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function SearchPage() {
  const router    = useRouter();
  const inputRef  = useRef(null);
  const sortRef   = useRef(null);

  const [mounted,      setMounted]      = useState(false);
  const [currentUser,  setCurrentUser]  = useState(null);
  const [allAnime,     setAllAnime]     = useState([]);
  const [allViews,     setAllViews]     = useState({});
  const [favorites,    setFavorites]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('search');

  const [query,         setQuery]         = useState('');
  const [sortBy,        setSortBy]        = useState('newest');
  const [showSortDrop,  setShowSortDrop]  = useState(false);
  const [showFilters,   setShowFilters]   = useState(false);
  const [minRating,     setMinRating]     = useState(0);

  const dq = useDebounce(query, 300);

  /* close sort dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSortDrop(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    loadUser();
    loadData();
    const urlQ = new URLSearchParams(window.location.search).get('q');
    if (urlQ) setQuery(urlQ);
    /* delay focus so keyboard doesn't pop on page load on mobile */
    const isMobile = window.innerWidth < 768;
    if (!isMobile) setTimeout(() => inputRef.current?.focus(), 200);
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
  const hasActiveFilters   = minRating > 0 || sortBy !== 'newest';
  const activeSortLabel    = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Saralash';
  const ActiveSortIcon     = SORT_OPTIONS.find(o => o.value === sortBy)?.icon || ArrowUpDown;

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Qidiruv — MochiTv.Uz</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100%; overflow-x: hidden; }

        :root {
          --bg:          #0d0d0f;
          --bg2:         #141416;
          --bg3:         #1a1a1e;
          --surface:     rgba(255,255,255,0.04);
          --surface2:    rgba(255,255,255,0.07);
          --border:      rgba(255,255,255,0.08);
          --border2:     rgba(255,255,255,0.14);
          --accent:      #ef4444;
          --accent2:     #f87171;
          --accent-glow: rgba(239,68,68,0.25);
          --text:        #f0f0f2;
          --text2:       rgba(240,240,242,0.65);
          --text3:       rgba(240,240,242,0.35);
          --gold:        #fbbf24;
          --radius:      14px;
          --radius-sm:   8px;
          --radius-lg:   20px;
        }

        body {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          color: var(--text);
          -webkit-tap-highlight-color: transparent;
          -webkit-font-smoothing: antialiased;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(239,68,68,0.4); border-radius: 99px; }

        /* ── BG ── */
        .bg-noise {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.5;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 180px;
        }
        .bg-orb {
          position: fixed; top: -25vh; left: 50%; transform: translateX(-50%);
          width: 70vw; height: 50vh;
          background: radial-gradient(ellipse, rgba(239,68,68,0.06) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        /* ── HEADER ── */
        .s-header {
          position: sticky; top: 0; z-index: 200;
          display: flex; align-items: center; gap: 14px;
          padding: 0 60px; height: 78px;
          background: rgba(13,13,15,0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border2);
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        .s-logo { height: 34px; cursor: pointer; flex-shrink: 0; }

        /* ── SEARCH BAR ── */
        .s-search-bar {
          flex: 1; display: flex; align-items: center; gap: 10px;
          background: var(--bg3); border: 1.5px solid var(--border2);
          border-radius: var(--radius-sm); padding: 0 14px;
          transition: border-color 0.2s;
          max-width: 640px;
        }
        .s-search-bar:focus-within { border-color: rgba(239,68,68,0.5); }
        .s-search-icon { color: var(--text3); flex-shrink: 0; }
        .s-input {
          flex: 1; background: transparent; border: none;
          color: var(--text); font-size: 15px; padding: 13px 0; outline: none;
          font-family: 'DM Sans', sans-serif;
        }
        .s-input::placeholder { color: var(--text3); }
        .s-clear-btn {
          background: var(--surface); border: none;
          color: var(--text3); width: 26px; height: 26px; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0;
        }
        .s-clear-btn:hover { background: rgba(239,68,68,0.15); color: var(--accent); }

        /* ── MAIN WRAPPER ── */
        .s-wrapper {
          position: relative; z-index: 1;
          max-width: 1320px; margin: 0 auto;
          padding: 28px 60px 110px;
        }

        /* ── TOOLBAR ── */
        .s-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; margin-bottom: 20px;
        }
        .s-result-count {
          font-size: 13px; color: var(--text3);
          border-left: 3px solid var(--accent); padding-left: 10px; line-height: 1.4;
          font-family: 'Outfit', sans-serif;
        }
        .s-result-count b { color: var(--text2); font-weight: 700; }
        .s-toolbar-right { display: flex; align-items: center; gap: 8px; }

        /* ── SORT ── */
        .s-sort-wrap { position: relative; }
        .s-sort-btn {
          display: flex; align-items: center; gap: 7px;
          background: var(--surface); border: 1px solid var(--border);
          color: var(--text2); padding: 9px 14px; border-radius: var(--radius-sm);
          cursor: pointer; font-size: 13px; font-weight: 600;
          transition: all 0.2s; white-space: nowrap;
          font-family: 'Outfit', sans-serif;
        }
        .s-sort-btn:hover, .s-sort-btn.open {
          border-color: var(--border2); background: var(--surface2); color: var(--text);
        }
        .s-chevron { transition: transform 0.2s; display: flex; align-items: center; }
        .s-sort-btn.open .s-chevron { transform: rotate(180deg); }

        .s-dropdown {
          position: absolute; top: calc(100% + 7px); right: 0;
          background: var(--bg2); border: 1px solid var(--border2);
          border-radius: var(--radius); overflow: hidden; z-index: 300;
          min-width: 185px; box-shadow: 0 12px 40px rgba(0,0,0,0.7);
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: none; }
        }
        .s-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; cursor: pointer;
          font-size: 13px; color: var(--text2); transition: all 0.15s;
          border-bottom: 1px solid var(--border);
          font-family: 'DM Sans', sans-serif;
        }
        .s-dropdown-item:last-child { border-bottom: none; }
        .s-dropdown-item:hover { background: var(--surface2); color: var(--text); }
        .s-dropdown-item.active { color: var(--accent2); background: rgba(239,68,68,0.06); }

        /* ── FILTER BTN ── */
        .s-filter-btn {
          display: flex; align-items: center; gap: 7px;
          background: var(--surface); border: 1px solid var(--border);
          color: var(--text2); padding: 9px 14px; border-radius: var(--radius-sm);
          cursor: pointer; font-size: 13px; font-weight: 600;
          transition: all 0.2s; position: relative;
          font-family: 'Outfit', sans-serif;
        }
        .s-filter-btn:hover, .s-filter-btn.open {
          border-color: var(--border2); background: var(--surface2); color: var(--text);
        }
        .s-filter-dot {
          position: absolute; top: 7px; right: 7px;
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--accent); box-shadow: 0 0 6px var(--accent-glow);
        }

        /* ── FILTER PANEL ── */
        .s-filter-panel {
          background: var(--bg2); border: 1px solid var(--border2);
          border-radius: var(--radius); padding: 20px;
          margin-bottom: 20px;
          animation: fadeSlide 0.2s ease;
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: none; }
        }
        .s-filter-label {
          font-size: 11px; font-weight: 700; letter-spacing: 1.8px;
          color: var(--text3); text-transform: uppercase;
          margin-bottom: 14px;
          border-left: 3px solid var(--accent); padding-left: 10px;
          font-family: 'Outfit', sans-serif;
        }
        .s-rating-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .s-rating-chip {
          padding: 7px 16px; border-radius: 99px;
          background: var(--surface); border: 1px solid var(--border);
          color: var(--text2); cursor: pointer; font-size: 13px; font-weight: 600;
          transition: all 0.2s; font-family: 'Outfit', sans-serif;
        }
        .s-rating-chip:hover { border-color: var(--border2); color: var(--text); background: var(--surface2); }
        .s-rating-chip.active {
          background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.4);
          color: var(--accent2);
        }
        .s-reset-btn {
          margin-top: 16px; background: none;
          border: 1px dashed var(--border); color: var(--text3);
          padding: 8px 18px; border-radius: var(--radius-sm);
          cursor: pointer; font-size: 12px; transition: all 0.2s;
          font-family: 'Outfit', sans-serif;
        }
        .s-reset-btn:hover { border-color: var(--accent); color: var(--accent); }

        /* ── SECTION TITLE ── */
        .s-section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px; font-weight: 800; color: var(--text);
          display: flex; align-items: center; gap: 10px;
          letter-spacing: -0.01em; margin-bottom: 20px;
        }
        .s-section-title::before {
          content: ''; display: block; width: 4px; height: 22px;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
          border-radius: 99px;
        }

        /* ── GRID ── */
        .s-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 18px;
          /* critical: prevent layout recalc on scroll */
          contain: layout style;
        }
        @media (max-width: 1200px) { .s-grid { grid-template-columns: repeat(4,1fr); } }
        @media (max-width: 900px)  { .s-grid { grid-template-columns: repeat(3,1fr); gap: 14px; } }
        @media (max-width: 600px)  { .s-grid { grid-template-columns: repeat(2,1fr); gap: 12px; } }

        /* ── ANIME CARD ── */
        .a-card {
          cursor: pointer; border-radius: var(--radius-lg);
          opacity: 0; animation: cardIn 0.3s ease forwards;
          /* GPU layer for each card */
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          will-change: transform;
          contain: layout style paint;
        }
        /* Disable hover transform on touch devices to prevent freeze */
        @media (hover: hover) {
          .a-card:hover { transform: translateY(-4px); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .a-card-img-wrap {
          position: relative; width: 100%; aspect-ratio: 2/3;
          border-radius: var(--radius-lg); overflow: hidden;
          background: var(--bg3);
        }
        .a-card-img-skeleton {
          position: absolute; inset: 0; background: var(--bg3); z-index: 1;
        }
        .a-card-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          opacity: 0; transition: opacity 0.35s;
          border-radius: var(--radius-lg);
        }
        .a-card-img.visible { opacity: 1; }
        /* Scale only on hover-capable devices */
        @media (hover: hover) {
          .a-card:hover .a-card-img { transform: scale(1.04); transition: opacity 0.35s, transform 0.4s; }
        }

        /* top row */
        .a-card-top-row {
          position: absolute; top: 0; left: 0; right: 0;
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 10px;
          background: linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 100%);
          z-index: 4;
        }
        .a-card-rating-badge {
          display: flex; align-items: center;
          font-size: 11px; font-weight: 700; color: var(--gold);
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          padding: 3px 8px; border-radius: 99px;
          font-family: 'Outfit', sans-serif;
        }
        .a-card-fav {
          background: rgba(0,0,0,0.4); border: none; cursor: pointer;
          color: rgba(255,255,255,0.75); width: 30px; height: 30px;
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        .a-card-fav:hover  { color: #fff; background: rgba(0,0,0,0.6); }
        .a-card-fav.active { color: var(--gold); }

        /* hover overlay — hidden on touch */
        .a-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(0deg, rgba(13,13,15,0.92) 0%, transparent 55%);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 12px; z-index: 2;
          opacity: 0; transition: opacity 0.3s;
        }
        @media (hover: hover) {
          .a-card:hover .a-card-overlay { opacity: 1; }
        }
        @media (hover: none) {
          /* always show bottom info on touch */
          .a-card-overlay { opacity: 1; background: linear-gradient(0deg, rgba(13,13,15,0.75) 0%, transparent 60%); }
        }
        .a-card-eps {
          font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.85);
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          padding: 3px 9px; border-radius: 99px; border: 1px solid var(--border);
          display: inline-block; width: fit-content; margin-bottom: 7px;
          font-family: 'Outfit', sans-serif;
        }
        .a-card-genres { display: flex; gap: 5px; flex-wrap: wrap; }
        .a-card-genre-tag {
          background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.35);
          color: var(--accent2); font-size: 10px; font-weight: 600;
          padding: 3px 8px; border-radius: 5px; font-family: 'Outfit', sans-serif;
        }

        /* card title */
        .a-card-title {
          font-size: 13px; font-weight: 600; color: var(--text2);
          margin-top: 8px; padding: 0 2px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden; line-height: 1.45;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── SKELETON ── */
        .sk-card { display: flex; flex-direction: column; gap: 10px; }
        .sk-img {
          width: 100%; aspect-ratio: 2/3; background: var(--bg3);
          border-radius: var(--radius-lg); position: relative; overflow: hidden;
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .sk-shine {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          animation: shimmer 1.6s ease-in-out infinite;
          will-change: transform;
        }
        .sk-body { display: flex; flex-direction: column; gap: 7px; padding: 0 2px; }
        .sk-line {
          height: 12px; border-radius: 4px; background: var(--bg3);
        }
        .w70 { width: 72%; } .w45 { width: 46%; }

        /* ── EMPTY STATE ── */
        .s-empty {
          grid-column: 1 / -1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 80px 20px; text-align: center;
        }
        .s-empty-icon {
          width: 72px; height: 72px; border-radius: 50%;
          background: var(--surface); border: 1px solid var(--border2);
          display: flex; align-items: center; justify-content: center;
          color: var(--text3); margin-bottom: 20px;
        }
        .s-empty h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 20px; font-weight: 800; margin-bottom: 8px;
        }
        .s-empty p { color: var(--text3); font-size: 14px; line-height: 1.6; }
        .s-empty-reset {
          margin-top: 20px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3);
          color: var(--accent2); padding: 11px 24px;
          border-radius: var(--radius-sm); cursor: pointer;
          font-size: 14px; font-weight: 700; transition: all 0.2s;
          font-family: 'Outfit', sans-serif;
        }
        .s-empty-reset:hover { background: rgba(239,68,68,0.16); color: #fff; border-color: var(--accent); }

        /* ── RESPONSIVE ── */
        @media (max-width: 1200px) {
          .s-header  { padding: 0 24px; }
          .s-wrapper { padding: 24px 24px 110px; }
        }
        @media (max-width: 768px) {
          .s-header  { padding: 0 14px; height: 70px; }
          .s-wrapper { padding: 18px 14px 100px; }
          .s-logo    { display: none; }
          .hide-sm   { display: none !important; }
          /* Reduce animation count on mobile */
          .a-card    { animation-delay: 0s !important; }
        }
        @media (max-width: 600px) {
          ::-webkit-scrollbar { display: none; }
        }

        /* ── REDUCE MOTION ── */
        @media (prefers-reduced-motion: reduce) {
          .a-card { animation: none; opacity: 1; }
          .sk-shine { animation: none; }
        }
      `}</style>

      <div className="bg-noise" />
      <div className="bg-orb" />

      {/* ─── Header ─── */}
      <header className="s-header">
        <img src={LOGO_URL} alt="MochiTV" className="s-logo" onClick={() => router.push('/')} />
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
      <main className="s-wrapper">

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
              onClick={() => setShowFilters(v => !v)}
            >
              <Filter size={14} />
              <span className="hide-sm">Filter</span>
              {hasActiveFilters && <span className="s-filter-dot" />}
            </button>

            {/* Sort */}
            <div className="s-sort-wrap" ref={sortRef}>
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
                        <Icon size={14} /> {o.label}
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

        {/* Section title */}
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
                  <div className="s-empty-icon"><SearchX size={34} /></div>
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