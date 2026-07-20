import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Common/Sidebar';
import { Navbar } from './components/Common/Navbar';
import { CommandPalette } from './components/Common/CommandPalette';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

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
      <>
        {children}
        <CommandPalette 
          isOpen={isOpenCP} 
          onClose={() => setIsOpenCP(false)} 
          onTogglePrivacyMode={handleTogglePrivacyMode}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-brand-bgDark text-zinc-950 dark:text-zinc-50 radial-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenCommandPalette={() => setIsOpenCP(true)} />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

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
