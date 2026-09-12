import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getTranslation } from '../../i18n/translations';
import { Language } from '../../types';
import { 
  Sprout, 
  Bell, 
  Globe, 
  Menu, 
  X, 
  Check, 
  LogOut, 
  User, 
  ChevronDown,
  Building2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    currentPath, 
    navigate, 
    notifications, 
    profile, 
    farmersAhead
  } = useApp();

  const { currentUser, userRole, logout } = useAuth();
  const t = getTranslation(language);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  ];

  // Navigation Links dynamically translated according to current language
  const publicLinks = [
    { name: t.nav.home, path: '/' },
    { name: t.nav.howItWorks, path: '/#how-it-works' },
    { name: t.nav.features, path: '/#features' },
    { name: t.nav.help, path: '/help' },
  ];

  const farmerLinks = [
    { name: t.nav.dashboard, path: '/dashboard' },
    { name: t.nav.myBookings, path: '/bookings' },
    { name: t.nav.queueStatus, path: '/queue', badge: farmersAhead > 0 ? `#${farmersAhead + 1}` : (language === 'te' ? 'ఇప్పుడే' : language === 'hi' ? 'अभी' : 'NOW') },
    { name: t.nav.procurement, path: '/procurement' },
    { name: t.nav.payments, path: '/payments' },
    { name: t.nav.notifications, path: '/notifications', badge: unreadCount > 0 ? String(unreadCount) : undefined },
    { name: t.nav.profile, path: '/profile' },
  ];

  const staffLinks = [
    { name: language === 'te' ? 'కేంద్రం డ్యాష్‌బోర్డ్' : language === 'hi' ? 'केंद्र डैशबोर्ड' : 'Centre Dashboard', path: '/centre/dashboard' },
    { name: language === 'te' ? 'బుకింగ్‌లు' : language === 'hi' ? 'बुकिंग' : 'Bookings', path: '/centre/bookings' },
    { name: language === 'te' ? 'లైవ్ క్యూ' : language === 'hi' ? 'लाइव कतार' : 'Live Queue', path: '/centre/queue' },
    { name: language === 'te' ? 'సేకరణ' : language === 'hi' ? 'खरीद' : 'Procurement', path: '/centre/procurement' },
    { name: language === 'te' ? 'నివేదికలు' : language === 'hi' ? 'रिपोर्ट' : 'Reports', path: '/centre/reports' },
  ];

  const adminLinks = [
    { name: language === 'te' ? 'అడ్మిన్ డ్యాష్‌బోర్డ్' : language === 'hi' ? 'एडमिन डैशबोर्ड' : 'Admin Dashboard', path: '/admin/dashboard' },
    { name: language === 'te' ? 'రైతులు' : language === 'hi' ? 'किसान' : 'Farmers', path: '/admin/farmers' },
    { name: language === 'te' ? 'కేంద్రాలు' : language === 'hi' ? 'केंद्र' : 'Centres', path: '/admin/centres' },
    { name: language === 'te' ? 'పర్యవేక్షణ' : language === 'hi' ? 'निगरानी' : 'Monitoring', path: '/admin/monitoring' },
    { name: language === 'te' ? 'విశ్లేషణ' : language === 'hi' ? 'एनालिटिक्स' : 'Analytics', path: '/admin/analytics' },
    { name: language === 'te' ? 'నివేదికలు' : language === 'hi' ? 'रिपोर्ट' : 'Reports', path: '/admin/reports' },
  ];

  let currentNavLinks = publicLinks;
  if (currentUser) {
    if (userRole === 'admin') currentNavLinks = adminLinks;
    else if (userRole === 'staff') currentNavLinks = staffLinks;
    else currentNavLinks = farmerLinks;
  }

  const handleNavClick = (path: string) => {
    if (path.startsWith('/#')) {
      if (currentPath !== '/') {
        navigate('/');
        setTimeout(() => {
          const id = path.replace('/#', '');
          const el = document.getElementById(id);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const id = path.replace('/#', '');
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    const role = userRole || 'farmer';
    await logout(role);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Government Official Strip */}
      <div className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[11px] py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>भारत सरकार | Government of India</span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">Ministry of Consumer Affairs, Food & Public Distribution</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-600">National Consumer Helpline: <strong>1915</strong></span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Brand */}
          <div 
            onClick={() => handleNavClick(currentUser ? (userRole === 'admin' ? '/admin/dashboard' : userRole === 'staff' ? '/centre/dashboard' : '/dashboard') : '/')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition">
              <Sprout className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
                  Procure<span className="text-emerald-700">Ease</span>
                </span>
                <span className="hidden sm:inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  GOV.IN
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 leading-none">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {currentNavLinks.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`relative px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive 
                      ? 'text-emerald-900 bg-emerald-50/90 font-semibold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.name}</span>
                  {'badge' in item && item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-700 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                aria-label="Select Language"
              >
                <Globe className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">
                  {languages.find(l => l.code === language)?.native}
                </span>
              </button>

              {languageMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-44 rounded-xl bg-white p-1.5 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setLanguageMenuOpen(false)}
                >
                  <p className="px-2 py-1 text-[11px] font-bold uppercase text-slate-400">
                    Select Language / భాష
                  </p>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLanguageMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                        language === l.code 
                          ? 'bg-emerald-50 text-emerald-800 font-bold' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{l.native}</span>
                      {language === l.code && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* If Authenticated: Notification Bell and Logout */}
            {currentUser ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs"
                    aria-label="View notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95"
                      onMouseLeave={() => setNotifDropdownOpen(false)}
                    >
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                          <p className="text-[11px] text-slate-500">{unreadCount} unread updates</p>
                        </div>
                        <button
                          onClick={() => {
                            navigate('/notifications');
                            setNotifDropdownOpen(false);
                          }}
                          className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                        >
                          View All
                        </button>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.slice(0, 4).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (n.actionUrl) navigate(n.actionUrl);
                              setNotifDropdownOpen(false);
                            }}
                            className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                              !n.read ? 'bg-emerald-50/40' : ''
                            }`}
                          >
                            <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${!n.read ? 'bg-emerald-600 ring-2 ring-emerald-200' : 'bg-slate-300'}`} />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{n.title}</p>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 inline-block">{n.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-2 bg-slate-50 text-center border-t border-slate-100">
                        <button
                          onClick={() => {
                            navigate('/notifications');
                            setNotifDropdownOpen(false);
                          }}
                          className="text-xs font-semibold text-emerald-800 hover:underline"
                        >
                          Open Notification Centre →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Badge */}
                <div 
                  onClick={() => handleNavClick(userRole === 'admin' ? '/admin/dashboard' : userRole === 'staff' ? '/centre/dashboard' : '/profile')}
                  className="hidden sm:flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-emerald-300 font-bold text-xs shadow-xs">
                    {userRole === 'admin' ? 'AD' : userRole === 'staff' ? 'ST' : 'FR'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                      {userRole === 'admin' ? 'Administrator' : userRole === 'staff' ? 'Staff Operator' : (profile?.name || 'Farmer')}
                    </p>
                    <p className="text-[10px] font-medium text-emerald-700 capitalize">
                      {userRole === 'admin' ? 'Govt Apex' : userRole === 'staff' ? 'Centre Staff' : 'Verified Farmer'}
                    </p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 rounded-xl transition border border-red-200 shadow-2xs"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.nav.logout}</span>
                </button>
              </>
            ) : (
              /* Before Login: Single Login and Sign Up options */
              <div className="flex items-center gap-2">
                <button
                  id="nav-login-btn"
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-xl transition border border-slate-200"
                >
                  {t.nav.login}
                </button>

                <button
                  id="nav-register-btn"
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  <span>{t.nav.register}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-150">
          <div className="divide-y divide-slate-100">
            {currentNavLinks.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex w-full items-center justify-between py-2.5 text-sm font-medium ${
                  currentPath === item.path ? 'text-emerald-800 font-bold' : 'text-slate-700'
                }`}
              >
                <span>{item.name}</span>
                {'badge' in item && item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            {currentUser ? (
              <div className="pt-3">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-red-50 text-red-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.nav.logout}</span>
                </button>
              </div>
            ) : (
              <div className="pt-3 space-y-2">
                <button
                  id="mobile-nav-login-btn"
                  onClick={() => handleNavClick('/login')}
                  className="w-full py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {t.nav.login}
                </button>
                <button
                  id="mobile-nav-register-btn"
                  onClick={() => handleNavClick('/register')}
                  className="w-full py-2.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
                >
                  {t.nav.register}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
