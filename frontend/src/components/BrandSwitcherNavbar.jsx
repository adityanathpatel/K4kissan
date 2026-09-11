import React, { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, LogOut, Bell, Search, Home, Wheat } from 'lucide-react';
import { normalizeRole } from './ProtectedRoute';

export default function BrandSwitcherNavbar({
  user,
  userRole,
  onLogout,
  onOpenNotifications,
  unreadCount = 0,
  activeCategory = 'for-you',
  onSelectCategory
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Active section detection
  const isHome = location.pathname === '/' || location.pathname === '';
  const isFarmer = location.pathname.startsWith('/farmer') && !location.pathname.includes('orders');
  const isBuyer = location.pathname.startsWith('/products') || location.pathname.startsWith('/buyer');
  const isTransport = location.pathname.startsWith('/map') || location.pathname.startsWith('/transport');

  const activeTab = isBuyer ? 'buyer' : isTransport ? 'transport' : isFarmer ? 'farmer' : isHome ? 'home' : '';

  // Auth pages check: never show category bar on login or signup
  const isAuthPage = location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/auth');

  const handleTabClick = (tabId) => {
    if (tabId === 'home') navigate('/');
    else if (tabId === 'farmer') navigate('/farmer-dashboard');
    else if (tabId === 'buyer') navigate('/products');
    else if (tabId === 'transport') navigate('/map');
  };

  // The 4 Reference Pills (Home, Farmer, Buyer, Transporter)
  const navPills = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home size={15} className="text-black" />
    },
    {
      id: 'farmer',
      label: 'Farmer',
      icon: <Wheat size={16} strokeWidth={2.4} className="text-black fill-black/10 shrink-0" />
    },
    {
      id: 'buyer',
      label: 'Buyer',
      icon: (
        <span className="text-[#ff6161]">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
          </svg>
        </span>
      )
    },
    {
      id: 'transport',
      label: 'Transporter',
      icon: (
        <span className="text-[#059669]">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-2 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        </span>
      )
    }
  ];

  const role = normalizeRole(userRole);
  const visiblePills = navPills.filter((pill) => {
    if (pill.id === 'home') return true;
    if (!user || isAuthPage) return false;
    if (pill.id === 'farmer') return role === 'farmer';
    if (pill.id === 'buyer') return role === 'buyer';
    if (pill.id === 'transport') return role === 'transporter';
    return false;
  });

  // Grain Categories for Home page ONLY
  const categories = [
    {
      id: 'for-you',
      name: 'For You',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#2874f0]">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
          <path d="M3 6h18"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      )
    },
    {
      id: 'rice',
      name: 'Rice',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-amber-600">
          <path d="M12 2C9.5 5 8 8 8 12a4 4 0 0 0 8 0c0-4-1.5-7-4-10Z"/>
          <path d="M12 12v9"/>
          <path d="M7 16c2 1 3 2 5 2"/>
        </svg>
      )
    },
    {
      id: 'wheat',
      name: 'Wheat',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-amber-500">
          <path d="M12 22V2"/>
          <path d="M12 18c3-2 5-3 7-3-2-2-4-3-7-3"/>
          <path d="M12 18c-3-2-5-3-7-3 2-2 4-3 7-3"/>
          <path d="M12 12c3-2 5-3 7-3-2-2-4-3-7-3"/>
          <path d="M12 12c-3-2-5-3-7-3 2-2 4-3 7-3"/>
          <path d="M12 6c3-2 5-3 7-3-2-2-4-2-7-2"/>
          <path d="M12 6c-3-2-5-3-7-3 2-2 4-2 7-2"/>
        </svg>
      )
    },
    {
      id: 'maize',
      name: 'Maize',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-yellow-600">
          <path d="M12 2c3.5 0 6 3 6 8s-2.5 10-6 12c-3.5-2-6-7-6-12s2.5-8 6-8Z"/>
          <path d="M9 7h6"/>
          <path d="M8 11h8"/>
          <path d="M9 15h6"/>
        </svg>
      )
    },
    {
      id: 'sorghum',
      name: 'Sorghum',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-yellow-700">
          <circle cx="12" cy="5" r="2.5"/>
          <circle cx="8" cy="8" r="2"/>
          <circle cx="16" cy="8" r="2"/>
          <circle cx="12" cy="11" r="2"/>
          <path d="M12 13v9"/>
        </svg>
      )
    },
    {
      id: 'pearl-millet',
      name: 'Pearl Millet',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-emerald-600">
          <path d="M12 3v18"/>
          <circle cx="12" cy="6" r="1.5"/>
          <circle cx="12" cy="10" r="1.5"/>
          <circle cx="12" cy="14" r="1.5"/>
          <circle cx="12" cy="18" r="1.5"/>
          <path d="M8 8a3 3 0 0 0 4 3"/>
          <path d="M16 12a3 3 0 0 0-4 3"/>
        </svg>
      )
    },
    {
      id: 'finger-millet',
      name: 'Finger Millet',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-orange-600">
          <path d="M12 21v-7"/>
          <path d="M12 14c-2-3-3-6-2-9 2 2 3 5 2 9Z"/>
          <path d="M12 14c2-3 4-5 6-6-1 3-3 5-6 6Z"/>
          <path d="M12 14c-3-2-5-4-6-6 3 1 5 3 6 6Z"/>
        </svg>
      )
    },
    {
      id: 'barley',
      name: 'Barley',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-amber-700">
          <path d="M12 22V3"/>
          <path d="M12 5c2-2 4-2 6 0-2 2-4 2-6 0Z"/>
          <path d="M12 9c-2-2-4-2-6 0 2 2 4 2 6 0Z"/>
          <path d="M12 13c2-2 4-2 6 0-2 2-4 2-6 0Z"/>
          <path d="M12 17c-2-2-4-2-6 0 2 2 4 2 6 0Z"/>
        </svg>
      )
    }
  ];

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-xs sticky top-0 z-50">

      {/* ── Top Bar Container ── */}
      <div className="bg-[#f8f9fa] border-b border-gray-200 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">

          {/* ── Row 1 Left: Brand Logo + The 4 Reference Pills (Home, Farmer, Buyer, Transporter) ── */}
          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-start">
            <Link to="/" className="shrink-0 flex items-center gap-1.5" title="K4kissan Home">
              <img src="/images/k4kissan-logo.svg" alt="K4kissan" className="h-7 sm:h-8 w-auto object-contain" />
            </Link>

            {/* ── The 4 Navigation Pills (As provided in reference image) ── */}
            <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-0.5">
              {visiblePills.map((pill) => {
                const isActive = activeTab === pill.id;

                // Active section: #CEFF00 bright green shade styling
                const isPillActive = isActive || (pill.id === 'home' && isHome);

                return (
                  <button
                    key={pill.id}
                    onClick={() => handleTabClick(pill.id)}
                    title={pill.label}
                    className={`
                      inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl
                      text-xs sm:text-[13px] font-bold italic tracking-tight whitespace-nowrap
                      transition-all duration-200 cursor-pointer select-none shadow-2xs
                      ${isPillActive
                        ? 'bg-[#CEFF00] hover:bg-[#bcf000] text-black border border-[#b5e600] shadow-xs scale-[1.02]'
                        : 'bg-[#f0f2f5] hover:bg-[#e4e6eb] text-gray-700 border border-gray-200/80 hover:scale-[1.01]'
                      }
                    `}
                  >
                    {pill.icon && (
                      <span className="shrink-0 flex items-center justify-center">
                        {pill.icon}
                      </span>
                    )}
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile login shortcut */}
            <div className="flex md:hidden items-center gap-2">
              <button
                className="text-gray-600 p-1"
                onClick={() => setMobileSearchOpen(v => !v)}
                aria-label="Toggle search"
              >
                <Search size={18} />
              </button>
              {user ? (
                <Link to="/profile" className="p-1 text-gray-700">
                  <User size={18} />
                </Link>
              ) : (
                <Link to="/login" className="bg-[#0a5220] hover:bg-[#073d17] text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* ── Center: Search Bar (as shown in reference image with sky-blue rounded border) ── */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-4">
            <div className="flex items-center gap-2.5 w-full px-4 py-2 border-2 border-[#2874f0] rounded-full bg-white shadow-xs focus-within:ring-2 focus-within:ring-[#2874f0]/20 focus-within:border-[#2874f0] transition-all">
              <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-sm text-gray-800 outline-none placeholder-gray-500 bg-transparent font-medium"
                placeholder="Search for Products, Farmers, and More"
                aria-label="Search for Products, Farmers, and More"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 transition shrink-0 cursor-pointer"
                  aria-label="Clear search"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* ── Right: Utilities (Notifications, Login/User) ── */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Notifications */}
            {user && (
              <button
                onClick={onOpenNotifications}
                className="relative text-gray-600 hover:text-[#0a5220] transition p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-3.5 flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Login / Profile */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="text-xs font-bold bg-white text-gray-800 px-3 py-1.5 rounded-full hover:bg-gray-100 transition border border-gray-200 shadow-2xs flex items-center gap-1.5"
                  title={user.email}
                >
                  <User size={14} className="text-emerald-700" />
                  <span className="max-w-[120px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
                </Link>
                <button
                  onClick={onLogout}
                  className="text-red-500 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition cursor-pointer"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 bg-[#0a5220] hover:bg-[#073d17] text-white px-4 py-1.5 rounded-xl active:scale-95 transition font-bold text-xs shadow-sm"
              >
                <User size={14} />
                <span>Login</span>
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* ── Mobile Search Bar (collapsible) ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 bg-white border-b border-gray-200 ${
          mobileSearchOpen ? 'max-h-16 py-2 px-4' : 'max-h-0'
        }`}
      >
        <div className="flex items-center gap-2.5 w-full px-3.5 py-2 border-2 border-[#2874f0] rounded-full bg-white">
          <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-sm text-gray-800 outline-none placeholder-gray-500 bg-transparent font-medium"
            placeholder="Search for Products, Farmers, and More"
            aria-label="Search for Products, Farmers, and More"
          />
        </div>
      </div>

      {/* ── Category Strip: Strictly on Home Page only, NEVER on Login / Signup / Portal pages ── */}
      {isHome && !isAuthPage && (
        <nav className="bg-white px-4 py-2 border-b border-gray-100" aria-label="Product categories">
          <div className="flex items-center justify-start md:justify-center gap-5 sm:gap-7 overflow-x-auto no-scrollbar scroll-smooth max-w-7xl mx-auto">
            {categories.map((cat) => {
              const isCatActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { if (onSelectCategory) onSelectCategory(cat.id); }}
                  aria-pressed={isCatActive}
                  className={`flex flex-col items-center gap-1 group cursor-pointer shrink-0 pb-1.5 relative transition-colors active:scale-95 ${
                    isCatActive ? 'text-[#2874f0] font-bold' : 'text-gray-600 hover:text-[#2874f0]'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 ${
                      isCatActive
                        ? 'bg-blue-50 border border-blue-200 shadow-sm scale-105'
                        : 'bg-gray-50 group-hover:bg-blue-50 group-hover:border group-hover:border-blue-100'
                    }`}
                  >
                    {cat.icon}
                  </div>

                  <span className="text-[11px] tracking-tight font-medium whitespace-nowrap group-hover:font-semibold">
                    {cat.name}
                  </span>

                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200 ${
                      isCatActive ? 'bg-[#2874f0] opacity-100' : 'bg-transparent opacity-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
