import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Maximize2, 
  Smartphone, 
  Layers, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AndroidShellProps {
  children: React.ReactNode;
  activeTab: 'catalog' | 'saved' | 'guide' | 'admin';
  setActiveTab: (tab: 'catalog' | 'saved' | 'guide' | 'admin') => void;
  savedCount: number;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdminPortal: () => void;
}

export const AndroidShell: React.FC<AndroidShellProps> = ({
  children,
  activeTab,
  setActiveTab,
  savedCount,
  cartCount,
  onOpenCart,
  onOpenAdminPortal
}) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('9:41');
  const { isAdmin, user, setShowLoginModal } = useAuth();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-0 md:p-4 selection:bg-emerald-500 selection:text-white">
      {/* Top Device Bar Switcher (for desktop reviewers) */}
      <header className="w-full max-w-5xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 mb-2 hidden md:flex">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-300">Botanica Android Ecosystem</span>
          <span className="text-slate-500">•</span>
          <span>Material You Design System</span>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin: {user?.email}</span>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 px-2 py-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          )}

          <div className="h-4 w-px bg-slate-800"></div>

          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700/80 transition-all text-xs font-medium"
            title={isPhoneFrame ? 'Switch to Full Screen View' : 'Switch to Android Phone View'}
          >
            {isPhoneFrame ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Expand Fullscreen</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pixel 9 Frame</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container - Phone Mockup or Responsive Container */}
      <main
        className={`w-full transition-all duration-300 flex flex-col ${
          isPhoneFrame
            ? 'max-w-[420px] h-[92vh] max-h-[890px] rounded-[44px] ring-[12px] ring-slate-800/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(16,185,129,0.15)] border border-slate-700/60 overflow-hidden relative bg-slate-900'
            : 'max-w-6xl min-h-[92vh] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative bg-slate-900'
        }`}
      >
        {/* Android Status Bar */}
        <div className="h-11 bg-slate-900/95 backdrop-blur-md px-6 flex items-center justify-between text-xs font-medium text-slate-300 select-none z-30 shrink-0 border-b border-slate-800/40">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold tracking-tight">{currentTime}</span>
            <span className="text-[10px] text-emerald-400 font-bold ml-1">5G</span>
          </div>

          {/* Front Camera Hole (visible in phone frame) */}
          {isPhoneFrame && (
            <div className="w-4 h-4 rounded-full bg-slate-950 ring-2 ring-slate-800/80 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900/90"></div>
            </div>
          )}

          <div className="flex items-center gap-2 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">92%</span>
              <Battery className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Scrollable App Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col no-scrollbar">
          {children}
        </div>

        {/* Android Material 3 Bottom Navigation Bar */}
        <nav className="h-16 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-4 flex items-center justify-around z-30 shrink-0">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'catalog'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`px-4 py-1 rounded-full transition-all ${
                activeTab === 'catalog' ? 'bg-emerald-950/70 border border-emerald-500/30' : ''
              }`}
            >
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[11px]">Plants</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'guide'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`px-4 py-1 rounded-full transition-all ${
                activeTab === 'guide' ? 'bg-emerald-950/70 border border-emerald-500/30' : ''
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[11px]">Care Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
              activeTab === 'saved'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`px-4 py-1 rounded-full transition-all relative ${
                activeTab === 'saved' ? 'bg-emerald-950/70 border border-emerald-500/30' : ''
              }`}
            >
              <Heart className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </div>
            <span className="text-[11px]">Wishlist</span>
          </button>

          <button
            onClick={() => {
              if (isAdmin) {
                setActiveTab('admin');
              } else {
                onOpenAdminPortal();
              }
            }}
            className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
              activeTab === 'admin'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`px-4 py-1 rounded-full transition-all relative ${
                activeTab === 'admin' ? 'bg-emerald-950/70 border border-emerald-500/30' : ''
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              {isAdmin && (
                <span className="absolute -top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>
              )}
            </div>
            <span className="text-[11px]">{isAdmin ? 'Admin' : 'Admin Login'}</span>
          </button>
        </nav>

        {/* Android Gesture Navigation Bar Indicator */}
        <div className="h-3 bg-slate-900 flex items-center justify-center shrink-0">
          <div className="w-32 h-1 bg-slate-700/70 rounded-full"></div>
        </div>
      </main>
    </div>
  );
};
