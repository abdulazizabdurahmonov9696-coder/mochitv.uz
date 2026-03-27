import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Head from 'next/head';
import { Search, Download, Share2, X, Check, Image as ImageIcon } from 'lucide-react';
import MobileNavbar from '../components/MobileNavbar';

function shuffleArray(arr) {
  const a =[...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getColCount() {
  if (typeof window === 'undefined') return 2;
  const w = window.innerWidth;
  if (w >= 1600) return 6;
  if (w >= 1200) return 5;
  if (w >= 900)  return 4;
  if (w >= 600)  return 3;
  return 2;
}

function buildColumns(items, colCount) {
  const cols = Array.from({ length: colCount }, () =>[]);
  items.forEach((item, i) => cols[i % colCount].push(item));
  return cols;
}

const LOGO_URL = '/assets/lego.png';

export default function Wallpapers() {
  const[allWallpapers, setAllWallpapers]           = useState([]);
  const [filteredWallpapers, setFilteredWallpapers] = useState([]);
  const [wallpapers, setWallpapers]                 = useState([]);
  const[colCount, setColCount]                     = useState(2);
  const [loading, setLoading]                       = useState(true);
  const [searchQuery, setSearchQuery]               = useState('');
  const[debouncedQuery, setDebouncedQuery]         = useState('');
  const [offset, setOffset]                         = useState(0);
  const [hasMore, setHasMore]                       = useState(true);
  const [selectedImage, setSelectedImage]           = useState(null);
  const [toast, setToast]                           = useState({ show: false, message: '', type: 'success' });
  const [currentUser, setCurrentUser]               = useState(null);
  const [downloading, setDownloading]               = useState(false);

  const shuffledRef = useRef([]);
  const observerTarget = useRef(null);

  // Client-side oynani o'lchash
  useEffect(() => {
    setColCount(getColCount());
    const onResize = () => setColCount(getColCount());
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  },[]);

  // Modal ochiq qolganda scroll bloklanishining oldini olish uchun tozalash
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  },[]);

  useEffect(() => {
    const user = localStorage.getItem('anime_user');
    if (user) setCurrentUser(JSON.parse(user));
  },[]);

  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/get-wall');
        if (!res.ok) throw new Error('Xatolik');
        const data = await res.json();
        const shuffled = shuffleArray(data ||[]);
        shuffledRef.current = shuffled;
        setAllWallpapers(shuffled);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallpapers();
  },[]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const filtered = debouncedQuery.trim()
      ? shuffledRef.current.filter(item => {
          const q = debouncedQuery.toLowerCase();
          return (
            (item.title && item.title.toLowerCase().includes(q)) ||
            (item.keywords && item.keywords.some(kw => kw.toLowerCase().includes(q)))
          );
        })
      : shuffledRef.current;

    setFilteredWallpapers(filtered);
    setWallpapers(filtered.slice(0, 30));
    setOffset(30);
    setHasMore(filtered.length > 30);
  }, [debouncedQuery, allWallpapers]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get('id');
    if (sharedId && allWallpapers.length > 0) {
      const target = allWallpapers.find(w => w.id.toString() === sharedId);
      if (target) openModal(target, false);
    }
  }, [allWallpapers]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const nextBatch = filteredWallpapers.slice(offset, offset + 30);
    setWallpapers(prev => [...prev, ...nextBatch]);
    setOffset(prev => prev + 30);
    if (offset + 30 >= filteredWallpapers.length) setHasMore(false);
  },[hasMore, offset, filteredWallpapers, loading]);

  // Infinite Scroll ulovchisi
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { rootMargin: '800px' } // Rasmlar ko'rinishidan biroz oldinroq yuklashni boshlaydi
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  },[loadMore, hasMore]);

  const openModal = (img, updateUrl = true) => {
    setSelectedImage(img);
    if (updateUrl) window.history.pushState({}, '', `/wall?id=${img.id}`);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedImage(null);
    window.history.pushState({}, '', '/wall');
    document.body.style.overflow = '';
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleShare = async (e, img) => {
    e?.stopPropagation();
    const link = `${window.location.origin}/wall?id=${img.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: img.title || 'Anime Wallpaper', url: link });
      } else {
        await navigator.clipboard.writeText(link);
        showToast('Link nusxalandi!');
      }
    } catch {}
  };

  const handleDownload = async (e, img) => {
    e?.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    showToast('Yuklanmoqda...', 'info');

    const tryFetch = async (url) => {
      const r = await fetch(url, { mode: 'cors' });
      if (!r.ok) throw new Error('failed');
      return r.blob();
    };

    const proxies =[
      `https://api.allorigins.win/raw?url=${encodeURIComponent(img.image_url)}`,
      `https://corsproxy.io/?${encodeURIComponent(img.image_url)}`,
    ];

    let blob = null;
    try { blob = await tryFetch(img.image_url); } catch {}
    if (!blob) {
      for (const proxy of proxies) {
        try { blob = await tryFetch(proxy); break; } catch {}
      }
    }

    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `mochitv-wallpaper-${img.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      showToast('Muvaffaqiyatli yuklandi!');
    } else {
      window.open(img.image_url, '_blank');
      showToast('Rasm yangi tabda ochildi, saqlang!', 'info');
    }
    setDownloading(false);
  };

  // React qotmasligi uchun columnlarni memoization qildik
  const columns = useMemo(() => buildColumns(wallpapers, colCount), [wallpapers, colCount]);

  return (
    <>
      <Head>
        <title>Wallpapers — MochiTv.Uz</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after {
          box-sizing: border-box; margin: 0; padding: 0;
          -webkit-tap-highlight-color: transparent; outline: none;
        }
        html, body {
          width: 100%; min-height: 100%;
          background: #090b10; color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          overflow-x: hidden;
          overscroll-behavior-y: auto; 
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.6); border-radius: 10px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }

        .bg-grid {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none; z-index: 0;
        }
        .bg-vignette {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(circle at 50% 0%, rgba(212,175,55,0.05), transparent 60%),
            linear-gradient(to top, #090b10 0%, transparent 100%);
        }

        .w-container { position: relative; z-index: 1; padding-bottom: 120px; }

        .w-header {
          position: sticky; top: 0; z-index: 100;
          padding: 11px 20px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(9,11,16,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .w-search-bar {
          width: 100%; max-width: 400px;
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 0 12px;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .w-search-bar:focus-within {
          border-color: rgba(234,179,8,0.5);
          box-shadow: 0 0 0 3px rgba(234,179,8,0.08);
        }
        .w-search-icon { color: rgba(255,255,255,0.3); flex-shrink: 0; }
        .w-search-input {
          flex: 1; background: transparent; border: none;
          color: #fff; font-size: 13px; padding: 9px 0; outline: none;
        }
        .w-search-input::placeholder { color: rgba(255,255,255,0.25); }
        .w-clear-btn {
          background: rgba(255,255,255,0.08); border: none;
          color: rgba(255,255,255,0.5);
          width: 20px; height: 20px; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0;
        }
        .w-clear-btn:hover { background: rgba(239,68,68,0.2); color: #ef4444; }

        .w-infobar {
          max-width: 1800px; margin: 0 auto;
          padding: 16px 20px 0;
          display: flex; align-items: center;
        }
        .w-count-label {
          font-size: 13px; color: rgba(255,255,255,0.35);
          border-left: 4px solid #ef4444; padding-left: 10px;
        }
        .w-count-label b { color: rgba(255,255,255,0.8); font-weight: 700; }

        .masonry-wrapper {
          display: flex; gap: 14px;
          padding: 16px 20px; max-width: 1800px;
          margin: 0 auto; align-items: flex-start;
        }
        @media (max-width: 900px) { .masonry-wrapper { gap: 10px; } }
        @media (max-width: 600px) { .masonry-wrapper { gap: 8px; padding: 10px 10px; } }

        .masonry-col { flex: 1; display: flex; flex-direction: column; gap: 14px; min-width: 0; }
        @media (max-width: 900px) { .masonry-col { gap: 10px; } }
        @media (max-width: 600px) { .masonry-col { gap: 8px; } }

        /* Rasm natural shaklda qolishi uchun optimizatsiya qilingan CSS */
        .masonry-item {
          position: relative; 
          border-radius: 16px; 
          overflow: hidden;
          cursor: pointer; 
          background: #0f1219;
          /* Telefonda GPU orqali tez ishlashi uchun */
          transform: translateZ(0); 
          will-change: transform;
          box-shadow: 0 4px 16px rgba(0,0,0,0.35);
          width: 100%;
          transition: transform 0.3s, box-shadow 0.3s;
          /* Rasm o'lchamini topgunicha nolga tushib ketmasligi uchun min balandlik */
          min-height: 150px; 
        }
        
        /* Telefonda qotmasligi uchun hoverni faqat kompyuterlarga yoqamiz */
        @media (hover: hover) and (pointer: fine) {
          .masonry-item:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 10px 32px rgba(0,0,0,0.65);
          }
          .masonry-item:hover .wall-img { transform: scale(1.04); }
          .masonry-item:hover .img-overlay { opacity: 1; }
        }

        @media (max-width: 600px) { .masonry-item { border-radius: 12px; min-height: 90px; } }

        /* Rasmni o'z holicha (natural width/height) ko'rsatuvchi qism */
        .wall-img {
          width: 100%; 
          height: auto; /* ASL PROPORSION SAQLANADI */
          display: block; 
          border-radius: 16px;
          opacity: 0;
          transition: opacity 0.45s ease, transform 0.4s ease;
          will-change: opacity, transform;
        }
        .wall-img.loaded { opacity: 1; }
        @media (max-width: 600px) { .wall-img { border-radius: 12px; min-height:90px; } }

        .img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 55%);
          opacity: 0; transition: opacity 0.3s ease;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 12px; pointer-events: none;
        }
        @media (max-width: 768px) { .img-overlay { display: none; } }

        .action-btns {
          display: flex; justify-content: space-between; align-items: center;
          pointer-events: auto;
        }
        .title-text {
          color: #fff; font-weight: 600; font-size: 12px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 55%;
        }
        .icon-group { display: flex; gap: 8px; }
        .icon-btn {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .icon-btn:active  { transform: scale(0.88); }
        .icon-btn:hover   { background: rgba(59,130,246,0.7);  border-color: rgba(59,130,246,0.5); }
        .icon-btn.dl:hover { background: rgba(16,185,129,0.7); border-color: rgba(16,185,129,0.5); }

        .skeleton-item {
          border-radius: 16px;
          background: #0f1219;
          animation: simplePulse 1.5s ease-in-out infinite;
          width: 100%;
        }
        @keyframes simplePulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }

        .w-empty {
          text-align: center; color: rgba(255,255,255,0.3);
          padding: 100px 20px;
        }
        .w-empty-icon {
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px; color: rgba(255,255,255,0.2);
        }
        .w-empty p { font-size: 15px; }

        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.9); z-index: 99999;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(14px);
          animation: fadeIn 0.2s ease-out; padding: 16px;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal-close {
          position: fixed; top: 16px; right: 16px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: white;
          transition: background 0.2s, transform 0.3s; z-index: 10;
        }
        .modal-close:hover { background: rgba(239,68,68,0.25); transform: rotate(90deg); }

        .modal-content {
          position: relative; display: flex; flex-direction: column; align-items: center;
          animation: popUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-width: 100%;
        }
        @keyframes popUp {
          from { transform: scale(0.88); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }

        .modal-img {
          max-width: min(90vw, 800px); max-height: 60vh;
          object-fit: contain; border-radius: 16px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.7); display: block;
        }
        @media (max-width: 600px) {
          .modal-img { max-width: 95vw; max-height: 55vh; border-radius: 12px; }
        }

        .modal-title {
          margin-top: 14px; color: rgba(255,255,255,0.6); font-size: 13px;
          font-weight: 500; text-align: center; max-width: 90%;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .modal-actions {
          display: flex; gap: 12px; margin-top: 20px;
          width: 100%; justify-content: center; flex-wrap: wrap;
        }

        .btn-share, .btn-download {
          border: none; padding: 13px 28px; border-radius: 12px;
          font-weight: 700; font-size: 14px; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          transition: all 0.2s; min-width: 140px; justify-content: center;
        }
        .btn-share {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.85);
        }
        .btn-share:hover {
          background: rgba(255,255,255,0.12); color: #fff;
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }
        .btn-download {
          background: #eab308; color: #000;
          box-shadow: 0 6px 20px rgba(234,179,8,0.3);
        }
        .btn-download:hover {
          background: #facc15;
          box-shadow: 0 8px 28px rgba(234,179,8,0.45);
          transform: translateY(-2px);
        }
        .btn-download:active { transform: scale(0.96); }
        .btn-download:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        @media (max-width: 400px) {
          .btn-share, .btn-download { padding: 12px 20px; font-size: 13px; min-width: 120px; }
        }

        .toast {
          position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
          padding: 12px 22px; border-radius: 30px;
          font-weight: 600; font-size: 14px;
          z-index: 100000; display: flex; align-items: center; gap: 10px;
          animation: toastUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          white-space: nowrap; max-width: 90vw;
        }
        .toast-success { background: #10b981; box-shadow: 0 10px 30px rgba(16,185,129,0.4); }
        .toast-info    { background: #eab308; color: #000; box-shadow: 0 10px 30px rgba(234,179,8,0.35); }
        @keyframes toastUp { from { bottom: 60px; opacity: 0; } to { bottom: 100px; opacity: 1; } }

        @media (max-width: 600px) {
          .w-header { padding: 12px 14px; gap: 10px; }
          .w-logo   { display: none; }
          .w-infobar { padding: 12px 14px 0; }
          ::-webkit-scrollbar { width: 0; }
        }
      `}</style>

      <div className="bg-grid" />
      <div className="bg-vignette" />

      <div className="w-container">
        <header className="w-header">
          <div className="w-search-bar">
            <Search size={16} className="w-search-icon" />
            <input
              type="text"
              className="w-search-input"
              placeholder="Wallpaper qidiring..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            {searchQuery && (
              <button className="w-clear-btn" onClick={() => setSearchQuery('')}>
                <X size={12} />
              </button>
            )}
          </div>
        </header>

        {!loading && (
          <div className="w-infobar">
            <span className="w-count-label">
              <b>{filteredWallpapers.length}</b> ta wallpaper
              {debouncedQuery.trim() && <> &nbsp;·&nbsp; "{debouncedQuery}" uchun</>}
            </span>
          </div>
        )}

        {wallpapers.length === 0 && !loading && (
          <div className="w-empty">
            <div className="w-empty-icon">
              <ImageIcon size={34} />
            </div>
            <p>Hozircha rasmlar topilmadi.</p>
          </div>
        )}

        {loading ? (
          <div className="masonry-wrapper">
            {Array.from({ length: colCount }).map((_, ci) => (
              <div key={ci} className="masonry-col">
                {Array.from({ length: 5 }).map((_, i) => {
                  const heights =['200px', '270px', '320px', '180px', '290px'];
                  return (
                    <div
                      key={i}
                      className="skeleton-item"
                      style={{ height: heights[(ci + i) % 5] }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="masonry-wrapper">
              {columns.map((col, ci) => (
                <div key={ci} className="masonry-col">
                  {col.map((item) => {
                    return (
                      <div
                        key={item.id}
                        className="masonry-item"
                        /* Agar backenddan width/height ma'lumoti kelsa sakramasligi uchun silliq aspect ratio, bo'lmasa auto ishlaydi */
                        style={{ aspectRatio: item.width && item.height ? `${item.width} / ${item.height}` : 'auto' }}
                        onClick={() => openModal(item)}
                      >
                        <img
                          src={item.image_url}
                          alt={item.title || 'Anime Wallpaper'}
                          className="wall-img"
                          loading="lazy"
                          decoding="async"
                          onLoad={e => e.target.classList.add('loaded')}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        <div className="img-overlay">
                          <div className="action-btns">
                            <span className="title-text">{item.title || 'Wallpaper'}</span>
                            <div className="icon-group">
                              <button
                                className="icon-btn"
                                title="Ulashish"
                                onClick={e => handleShare(e, item)}
                              >
                                <Share2 size={14} />
                              </button>
                              <button
                                className="icon-btn dl"
                                title="Yuklab olish"
                                onClick={e => handleDownload(e, item)}
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Pastki Trigger elementi: Infinite Scroll mukammal ishlashi uchun maxsus qism */}
            <div ref={observerTarget} style={{ height: '20px', width: '100%' }} />
          </>
        )}

        {selectedImage && (
          <div className="modal-overlay" onClick={closeModal}>
            <button className="modal-close" onClick={closeModal}>
              <X size={20} />
            </button>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title || 'Wallpaper'}
                className="modal-img"
              />
              {selectedImage.title && (
                <p className="modal-title">{selectedImage.title}</p>
              )}
              <div className="modal-actions">
                <button
                  className="btn-share"
                  onClick={e => handleShare(e, selectedImage)}
                >
                  <Share2 size={16} /> Ulashish
                </button>
                <button
                  className="btn-download"
                  onClick={e => handleDownload(e, selectedImage)}
                  disabled={downloading}
                >
                  <Download size={16} />
                  {downloading ? 'Yuklanmoqda...' : 'Yuklab olish'}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast.show && (
          <div className={`toast toast-${toast.type}`}>
            <Check size={15} /> {toast.message}
          </div>
        )}
      </div>

      <MobileNavbar currentUser={currentUser} activeTab="wall" />
    </>
  );
}
