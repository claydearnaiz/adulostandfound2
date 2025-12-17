import React from 'react';
import { User, Shield, LogOut, Search, Menu, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Header = ({ isAdminView, setIsAdminView, onLoginClick, onOpenDashboard }) => {
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setIsAdminView(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-[95%] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Search size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Adamson University</p>
              <h1 className="text-lg font-bold text-slate-900 -mt-0.5">Lost & Found</h1>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setIsAdminView(false)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${!isAdminView
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <User size={14} />
                <span>Browse</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => setIsAdminView(true)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isAdminView
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <Shield size={14} />
                  <span>Manage</span>
                </button>
              )}
            </div>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* My Claims button (for regular users) */}
                {!isAdmin && onOpenDashboard && (
                  <button
                    onClick={onOpenDashboard}
                    className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="My Claims"
                  >
                    <FileText size={16} />
                    <span className="hidden sm:inline text-sm font-medium">My Claims</span>
                  </button>
                )}

                <div className="hidden md:block text-right mr-1">
                  <p className="text-sm font-semibold text-slate-900 truncate max-w-[100px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </p>
                  {isAdmin && (
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Admin</p>
                  )}
                </div>
                <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="btn-primary flex items-center gap-2"
              >
                <User size={16} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
