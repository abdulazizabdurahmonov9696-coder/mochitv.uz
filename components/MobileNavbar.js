import { Home, Search, User, Sparkles } from 'lucide-react';
import { FaBahai } from "react-icons/fa";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function MobileNavbar({
  currentUser,
  activeTab = 'home'
}) {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsVisible(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ window.location.href o‘rniga Next.js router
  const handleNavigation = (path) => {
    router.push(path);
  };

  const username =
    currentUser?.username ||
    currentUser?.user_metadata?.username ||
    currentUser?.user_metadata?.full_name ||
    (currentUser?.email ? currentUser.email.split('@')[0] : '');

  if (!isVisible) return null;

  return (
    <>
      <style jsx>{`
        .mobile-navbar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 9999;
          padding-bottom: env(safe-area-inset-bottom);
          height: calc(70px + env(safe-area-inset-bottom));
          display: flex;
          align-items: center;
          justify-content: space-around;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
        }

        .nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.3s ease;
          gap: 4px;
          position: relative;
        }

        .nav-item:active {
          transform: scale(0.92);
        }

        .nav-item.active {
          color: #ef4444;
        }

        .nav-icon {
          transition: all 0.3s ease;
        }

        .nav-item.active .nav-icon {
          transform: translateY(-2px);
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
        }

        .nav-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .nav-item.active .nav-label {
          font-weight: 700;
        }

        .avatar-container {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          padding: 1px;
          border: 1px solid transparent;
          transition: all 0.3s;
        }

        .nav-item.active .avatar-container {
          border-color: #3b82f6;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
      `}</style>

      <nav className="mobile-navbar">
        <div
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => handleNavigation('/')}
        >
          <Home size={22} className="nav-icon" strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className="nav-label">Asosiy</span>
        </div>

        <div
          className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => handleNavigation('/search')}
        >
          <Search size={22} className="nav-icon" strokeWidth={activeTab === 'search' ? 2.5 : 2} />
          <span className="nav-label">Qidiruv</span>
        </div>

        <div
          className={`nav-item ${activeTab === 'wall' ? 'active' : ''}`}
          onClick={() => handleNavigation('/wall')}
        >
          <FaBahai size={22} className="nav-icon" strokeWidth={activeTab === 'wall' ? 2.5 : 2} />
          <span className="nav-label">Lavhalar</span>
        </div>

        <div
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => {
            // ✅ Login bo'lmasa / (index.js) ga qaytaradi
            if (!currentUser) return router.push('/');
            // ✅ Login bo'lsa profilga o'tadi
            return handleNavigation(`/profile/${encodeURIComponent(username)}`);
          }}
        >
          {currentUser && currentUser.avatar_url ? (
            <div className="avatar-container">
              <img src={currentUser.avatar_url} alt="Profile" className="avatar-img" />
            </div>
          ) : (
            <User size={22} className="nav-icon" strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          )}
          <span className="nav-label">Profil</span>
        </div>
      </nav>

      <div style={{ height: '70px', display: isVisible ? 'block' : 'none' }}></div>
    </>
  );
}
