
import React, { useState, useEffect } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Icons } from '../constants';
import { Theme, UserData } from '../types';
import { devAuth } from '../services/auth';

interface AuthProps {
  onAuthSuccess: (userData: UserData) => void;
  onThemeChange?: (theme: Theme) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, onThemeChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTheme, setCurrentTheme] = useState<Theme>('classic-light');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = prefersDark ? 'professional-dark' : 'classic-light';
    setCurrentTheme(initial);
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }, []);

  const handleThemeToggle = (theme: Theme) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme === 'professional-dark' ? 'dark' : 'light');
    if (onThemeChange) onThemeChange(theme);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate high-end biometric/identity verification delay
    setTimeout(() => {
      try {
        const user = devAuth(email);
        if (user) {
          onAuthSuccess(user);
        } else {
          setError("Access Denied: Unrecognized Identity Protocol.");
        }
      } catch (e) {
        setError("System error during identity verification.");
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--brand-bg)] relative overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.3)] mx-auto mb-8 group hover:scale-110 hover:rotate-3 transition-all duration-1000 border border-indigo-400/30">
            <Icons.Sparkles className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl font-black text-[var(--text-heading)] tracking-tighter uppercase leading-none">Deploy Creation</h1>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.6em] mt-6 opacity-60">Enterprise Strategic Command</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[4rem] p-10 sm:p-14 shadow-[0_50px_150px_-30px_rgba(0,0,0,0.15)] backdrop-blur-3xl relative overflow-hidden">
          {/* Internal Shimmer */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full"></div>
          
          <div className="mb-12 text-center">
            <h2 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em]">Identity Verification</h2>
            <div className="w-12 h-1 bg-indigo-500 mx-auto mt-4 rounded-full opacity-20"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-5 bg-red-50 dark:bg-red-950/20 text-red-600 text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl border border-red-100 dark:border-red-900/30 animate-in shake duration-500 flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                 {error}
              </div>
            )}
            
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-500 group-focus-within:text-indigo-500 z-10">
                <Icons.User className="w-5 h-5" />
              </div>
              <input 
                type="email" 
                required 
                className="w-full premium-input pl-16 h-16 text-sm font-bold tracking-tight" 
                placeholder="identity@deploycreation.ai" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            
            <div className="pt-10 border-t border-[var(--border-color)]">
              <label className="text-[9px] font-black text-slate-400 uppercase mb-6 block tracking-[0.4em] text-center opacity-60">Interface Preference</label>
              <div className="flex gap-5">
                 <button 
                  type="button"
                  onClick={() => handleThemeToggle('classic-light')}
                  className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all duration-700 ${currentTheme === 'classic-light' ? 'border-indigo-500 bg-indigo-500/5 shadow-xl' : 'border-[var(--border-color)] hover:border-indigo-300 opacity-60'}`}
                 >
                    <Icons.Sun className={`w-5 h-5 ${currentTheme === 'classic-light' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${currentTheme === 'classic-light' ? 'text-indigo-600' : 'text-slate-400'}`}>Luminous</span>
                 </button>
                 <button 
                  type="button"
                  onClick={() => handleThemeToggle('professional-dark')}
                  className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all duration-700 ${currentTheme === 'professional-dark' ? 'border-indigo-500 bg-indigo-500/5 shadow-xl' : 'border-[var(--border-color)] hover:border-indigo-300 opacity-60'}`}
                 >
                    <Icons.Moon className={`w-5 h-5 ${currentTheme === 'professional-dark' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${currentTheme === 'professional-dark' ? 'text-indigo-600' : 'text-slate-400'}`}>Nocturnal</span>
                 </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="shimmer" 
              className="w-full py-6 text-[12px] uppercase tracking-[0.4em] mt-8 shadow-2xl" 
              isLoading={loading}
              icon={<Icons.Strategy className="w-4 h-4" />}
            >
              Verify Identity
            </Button>
          </form>
          
          <p className="mt-12 text-center text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em] opacity-40">
            Authorized Personnel Only • Dynamic Encryption Active
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
