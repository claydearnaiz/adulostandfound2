import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, AlertTriangle, ShieldOff, RefreshCw, UserX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

const MAX_LOGIN_ATTEMPTS = 3;
const ADMIN_EMAIL = 'claydenhicosarnaiz@gmail.com';

export const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAccountDeactivated, setIsAccountDeactivated] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(MAX_LOGIN_ATTEMPTS);

  const { login, register } = useAuth();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setShowPassword(false);
    setIsAccountDeactivated(false);
    setRemainingAttempts(MAX_LOGIN_ATTEMPTS);
  };

  // Check if the email is already deactivated when email changes
  useEffect(() => {
    const checkDeactivation = async () => {
      if (email && mode === 'login') {
        const deactivated = await userService.isDeactivated(email);
        if (deactivated) {
          setIsAccountDeactivated(true);
          setError(`This account has been deactivated due to multiple failed login attempts.`);
        } else {
          setIsAccountDeactivated(false);
          if (error.includes('deactivated')) {
            setError('');
          }
        }
      }
    };

    const debounce = setTimeout(checkDeactivation, 500);
    return () => clearTimeout(debounce);
  }, [email, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check if account is deactivated
    if (mode === 'login') {
      const deactivated = await userService.isDeactivated(email);
      if (deactivated) {
        setIsAccountDeactivated(true);
        setError(`This account has been deactivated due to multiple failed login attempts.`);
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        // Reset login attempts on successful login
        await userService.resetLoginAttempts(email);
        setRemainingAttempts(MAX_LOGIN_ATTEMPTS);
      } else {
        if (!displayName.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        await register(email, password, displayName);
      }
      resetForm();
      onClose();
    } catch (err) {
      console.error('Auth error:', err);

      // Handle login attempt tracking
      if (mode === 'login') {
        const result = await userService.incrementLoginAttempts(email);

        if (result.isDeactivated) {
          setIsAccountDeactivated(true);
          setError(`This account has been deactivated due to multiple failed login attempts.`);
          setLoading(false);
          return;
        }

        const remaining = MAX_LOGIN_ATTEMPTS - result.attempts;
        setRemainingAttempts(remaining);
        const attemptWarning = remaining > 0 ? ` (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)` : '';

        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError(`Invalid email or password.${attemptWarning}`);
        } else if (err.code === 'auth/invalid-email') {
          setError(`Please enter a valid email address.${attemptWarning}`);
        } else {
          setError(`Something went wrong. Please try again.${attemptWarning}`);
        }
      } else {
        // Registration errors don't count toward login attempts
        if (err.code === 'auth/email-already-in-use') {
          setError('This email is already registered.');
        } else if (err.code === 'auth/weak-password') {
          setError('Password should be at least 6 characters.');
        } else if (err.code === 'auth/invalid-email') {
          setError('Please enter a valid email address.');
        } else {
          setError('Something went wrong. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose(); }}
      title=""
      size="small"
    >
      <div className="text-center mb-6">
        <div className={`inline-flex p-4 rounded-2xl mb-3 ${isAccountDeactivated ? 'bg-red-50' : 'bg-blue-50'}`}>
          {isAccountDeactivated ? (
            <ShieldOff className="text-red-500" size={28} />
          ) : (
            <User className="text-blue-600" size={28} />
          )}
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {isAccountDeactivated ? 'Account Deactivated' : mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {isAccountDeactivated
            ? 'Your account access has been restricted'
            : mode === 'login' ? 'Sign in to access your account' : 'Join the Lost & Found community'}
        </p>
      </div>

      {/* Deactivated Account Message */}
      {isAccountDeactivated ? (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <UserX className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-red-800 mb-2">
                  This account has been deactivated due to multiple failed login attempts.
                </p>
                <p className="text-sm text-red-600">
                  To reactivate your account, please contact an administrator:
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Contact Admin via Email</p>
            <a
              href={`mailto:${ADMIN_EMAIL}?subject=Account Reactivation Request&body=Hi, I would like to request reactivation of my account: ${email}`}
              className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-2"
            >
              <Mail size={16} />
              {ADMIN_EMAIL}
            </a>
          </div>

          <button
            onClick={() => {
              setIsAccountDeactivated(false);
              setEmail('');
              setError('');
            }}
            className="w-full btn-secondary py-3 flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Try Different Email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === 'login'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === 'register'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className={`text-sm p-4 rounded-xl border flex items-start gap-2 ${remainingAttempts <= 1
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-red-50 text-red-600 border-red-100'
              }`}>
              {remainingAttempts <= 1 && <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  className="input !pl-12"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@adamson.edu.ph"
                required
                className="input !pl-12"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="input !pl-12 !pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      )}
    </Modal>
  );
};
