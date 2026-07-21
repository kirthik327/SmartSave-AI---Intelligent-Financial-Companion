import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Common/Sidebar';
import { Navbar } from './components/Common/Navbar';
import { CommandPalette } from './components/Common/CommandPalette';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { 
  LayoutDashboard, 
  Target, 
  Sparkles, 
  ShieldCheck, 
  Trophy, 
  Image as ImageIcon, 
  BarChart3, 
  Settings as SettingsIcon 
} from 'lucide-react';

// Page Imports
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Goals } from './pages/Goals';
import { AICoach } from './pages/AICoach';
import { Gamification } from './pages/Gamification';
import { DreamBoard } from './pages/DreamBoard';
import { Reports } from './pages/Reports';
import { SecurityCenter } from './pages/SecurityCenter';
import { Settings } from './pages/Settings';
import { AdminPanel } from './pages/AdminPanel';
import { NotFound } from './pages/NotFound';

const AppLayout = ({ children }) => {
  const { user, loading, updateProfileSettings } = useAuth();
  const [isOpenCP, setIsOpenCP] = useState(false);
  const location = useLocation();

  const [debugErrors, setDebugErrors] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('smartsave_debug_errors') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleError = (event) => {
      const errStr = `Error: ${event.message}`;
      setDebugErrors(prev => {
        if (prev.includes(errStr)) return prev;
        const next = [...prev.slice(-3), errStr];
        sessionStorage.setItem('smartsave_debug_errors', JSON.stringify(next));
        return next;
      });
    };

    const handleRejection = (event) => {
      const reason = event.reason;
      const errStr = `API Failure: ${reason?.message || reason || 'Network rejection'}`;
      setDebugErrors(prev => {
        if (prev.includes(errStr)) return prev;
        const next = [...prev.slice(-3), errStr];
        sessionStorage.setItem('smartsave_debug_errors', JSON.stringify(next));
        return next;
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const handleTogglePrivacyMode = async () => {
    if (!user) return;
    try {
      await updateProfileSettings({ privacyMode: !user.privacyMode });
    } catch (e) {
      console.error(e);
    }
  };

  const actions = {
    toggleCommandPalette: () => setIsOpenCP(prev => !prev),
    togglePrivacyMode: handleTogglePrivacyMode
  };

  useKeyboardShortcuts(actions);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bgDark text-zinc-50 flex items-center justify-center font-bold">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wider text-zinc-400">LOADING SMARTSAVE AI...</p>
        </div>
      </div>
    );
  }

  const standalonePages = ['/', '/login', '/signup', '/forgot-password', '/onboarding'];
  const isStandalone = standalonePages.includes(location.pathname);

  if (!user && !isStandalone) {
    return <Navigate to="/login" replace />;
  }

  if (isStandalone) {
    return (
      <div className="relative min-h-screen">
        {debugErrors.length > 0 && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md p-4 rounded-2xl bg-rose-950/90 border border-rose-500/30 text-rose-200 text-xs font-semibold backdrop-blur-xl shadow-2xl flex flex-col gap-2">
            <div className="flex justify-between items-center border-b border-rose-500/20 pb-1.5 font-bold uppercase tracking-wider text-[10px] text-rose-400">
              <span>⚠️ Console Telemetry Debugger</span>
              <button 
                onClick={() => { setDebugErrors([]); sessionStorage.removeItem('smartsave_debug_errors'); }}
                className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/40 text-[9px] uppercase cursor-pointer"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
              {debugErrors.map((err, idx) => (
                <div key={idx} className="font-mono text-[10px] break-all leading-normal">
                  • {err}
                </div>
              ))}
            </div>
          </div>
        )}
        {children}
        <CommandPalette 
          isOpen={isOpenCP} 
          onClose={() => setIsOpenCP(false)} 
          onTogglePrivacyMode={handleTogglePrivacyMode}
        />
      </div>
    );
  }

  // Mobile Drawer State
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mobileNavItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Coach', path: '/ai-coach', icon: Sparkles },
    { name: 'Security', path: '/security', icon: ShieldCheck },
  ];

  const drawerItems = [
    { name: 'Challenges', path: '/challenges', icon: Trophy },
    { name: 'Dream Board', path: '/dream-board', icon: ImageIcon },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-zinc-50 dark:bg-brand-bgDark text-zinc-950 dark:text-zinc-50 radial-bg">
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <Sidebar />
      
      {/* Main page content area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Navbar onOpenCommandPalette={() => setIsOpenCP(true)} />
        <main className="flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (hidden on desktop) */}
        {user && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800/80 px-4 py-2.5 flex items-center justify-around shadow-2xl">
            {mobileNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
                    isActive ? 'text-brand-emerald' : 'text-zinc-500 hover:text-zinc-300'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            ))}
            
            {/* More Menu Trigger */}
            <button
              onClick={() => setShowMoreMenu(true)}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors cursor-pointer ${
                showMoreMenu ? 'text-brand-emerald' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <span>More</span>
            </button>
          </nav>
        )}
      </div>

      {/* Slide-Up Drawer Menu for Remaining Items */}
      <AnimatePresence>
        {showMoreMenu && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoreMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 shadow-2xl md:hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-extrabold text-sm text-zinc-400 uppercase tracking-wider">More Navigation</h4>
                <button 
                  onClick={() => setShowMoreMenu(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {drawerItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setShowMoreMenu(false)}
                    className={({ isActive }) => 
                      `flex items-center gap-3.5 p-4 rounded-2xl border text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald' 
                          : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                      }`
                    }
                  >
                    <item.icon size={16} />
                    <span>{item.name}</span>
                  </NavLink>
                ))}

                {user?.isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={() => setShowMoreMenu(false)}
                    className={({ isActive }) => 
                      `flex items-center gap-3.5 p-4 rounded-2xl border text-xs font-bold transition-all col-span-2 ${
                        isActive 
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                          : 'bg-zinc-950/60 border-zinc-800/80 text-rose-400/80 hover:text-rose-400'
                      }`
                    }
                  >
                    <ShieldAlert size={16} />
                    <span>Admin Console</span>
                  </NavLink>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CommandPalette 
        isOpen={isOpenCP} 
        onClose={() => setIsOpenCP(false)} 
        onTogglePrivacyMode={handleTogglePrivacyMode}
      />
    </div>
  );
};

const ProtectedAdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/ai-coach" element={<AICoach />} />
            <Route path="/challenges" element={<Gamification />} />
            <Route path="/dream-board" element={<DreamBoard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/security" element={<SecurityCenter />} />
            <Route path="/settings" element={<Settings />} />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedAdminRoute>
                  <AdminPanel />
                </ProtectedAdminRoute>
              } 
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}
