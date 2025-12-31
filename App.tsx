
import React, { useState, useEffect } from 'react';
import { AppSection, Language, Theme, UserSettings, UserData } from './types';
import { Icons } from './constants';
import { UI_STRINGS } from './translations';
import StrategyPlanner from './components/StrategyPlanner';
import CampaignStrategist from './components/CampaignStrategist';
import WhatsAppMarketing from './components/WhatsAppMarketing';
import AssetImprovement from './components/AssetImprovement';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Auth from './components/Auth';

const DEFAULT_SETTINGS: UserSettings = {
  language: 'en',
  theme: 'classic-light'
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [activeSection, setActiveSection] = useState<AppSection | 'overview'>('overview');
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('ss_current_user');
    const savedSettings = localStorage.getItem('ss_settings');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      const themeKey = parsedSettings.theme === 'professional-dark' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', themeKey);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'professional-dark' : 'classic-light';
      setSettings(prev => ({ ...prev, theme: initialTheme }));
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('ss_settings', JSON.stringify(settings));
    }
    const themeKey = settings.theme === 'professional-dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeKey);
  }, [settings, user]);

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'professional-dark' ? 'classic-light' : 'professional-dark'
    }));
  };

  const handleLogin = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem('ss_current_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ss_current_user');
    setActiveSection('overview');
    setIsMobileMenuOpen(false);
  };

  const t = UI_STRINGS[settings.language];

  const menuItems = [
    { id: AppSection.STRATEGY_PLANNER, label: t.strategy, icon: <Icons.Strategy className="w-6 h-6" />, desc: "Synthesize high-conversion market narratives through deep semantic logic." },
    { id: AppSection.CAMPAIGN_STRATEGIST, label: t.campaigns, icon: <Icons.Campaign className="w-6 h-6" />, desc: "Architect ROI-driven campaigns with complex budgeting and channel splits." },
    { id: AppSection.WHATSAPP_MARKETING, label: t.whatsapp, icon: <Icons.WhatsApp className="w-6 h-6" />, desc: "Deploy high-energy direct response sequences with localized formatting." },
    { id: AppSection.ASSET_IMPROVEMENT, label: t.assets, icon: <Icons.Asset className="w-6 h-6" />, desc: "Fine-tune visual assets with algorithmic heatmaps and psychological hooks." },
    { id: AppSection.ANALYTICS, label: t.analytics, icon: <Icons.Analytics className="w-6 h-6" />, desc: "Global performance telemetry, funnel audit, and predictive ROI models." },
  ];

  const renderActiveContent = () => {
    switch (activeSection) {
      case AppSection.STRATEGY_PLANNER: return <StrategyPlanner language={settings.language} onBack={() => setActiveSection('overview')} />;
      case AppSection.CAMPAIGN_STRATEGIST: return <CampaignStrategist language={settings.language} onBack={() => setActiveSection('overview')} />;
      case AppSection.WHATSAPP_MARKETING: return <WhatsAppMarketing language={settings.language} onBack={() => setActiveSection('overview')} />;
      case AppSection.ASSET_IMPROVEMENT: return <AssetImprovement language={settings.language} onBack={() => setActiveSection('overview')} />;
      case AppSection.ANALYTICS: return <AnalyticsDashboard language={settings.language} onBack={() => setActiveSection('overview')} />;
      case 'overview': return renderOverview();
      default: return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="max-w-6xl mx-auto py-6 sm:py-12">
      <div className="mb-20 space-y-6 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[10px] font-black uppercase tracking-widest">
           Operational Intelligence Node 04
        </div>
        <h2 className="text-6xl sm:text-7xl font-black tracking-tightest leading-[1.05] text-[var(--text-heading)]">
          Executive <br/><span className="text-shimmer">Operations Hub</span>
        </h2>
        <p className="text-slate-500 font-semibold text-xl max-w-2xl leading-relaxed">
          Initialize a strategic protocol to begin Gemini-powered market synthesis and campaign architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 stagger-in">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as AppSection)}
            className="group relative flex flex-col items-start p-12 pro-card rounded-[3rem] text-left overflow-hidden h-full border-2 border-transparent hover:border-indigo-500/30"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 group-hover:bg-indigo-500/15 blur-3xl transition-all duration-1000"></div>
            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none text-slate-400 group-hover:text-indigo-600 group-hover:shadow-indigo-500/20 group-hover:-translate-y-1 transition-all duration-500 border border-slate-100 dark:border-slate-700 mb-12 premium-icon-box">
              {item.icon}
            </div>
            <h3 className="text-2xl font-black mb-4 tracking-tight group-hover:text-indigo-500 transition-colors leading-tight">{item.label}</h3>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed mb-12 opacity-80">{item.desc}</p>
            <div className="mt-auto flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 transition-all group-hover:gap-5">
              Initialize Protocol <Icons.Sparkles className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const SidebarContent = () => (
    <div className="p-10 h-full flex flex-col relative z-20">
      <div className="flex items-center gap-4 mb-20 cursor-pointer group" onClick={() => setActiveSection('overview')}>
        <div className="w-11 h-11 bg-indigo-600 rounded-[14px] flex items-center justify-center shadow-2xl shadow-indigo-600/40 group-hover:scale-110 transition-transform border border-indigo-400/30">
          <Icons.Sparkles className="text-white w-5 h-5" />
        </div>
        <h1 className="font-black text-sm tracking-tight text-white uppercase tracking-[0.1em]">Deploy Creation</h1>
      </div>

      <nav className="space-y-3 flex-1">
        <button
          onClick={() => setActiveSection('overview')}
          className={`w-full flex items-center gap-5 px-6 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeSection === 'overview' ? 'active-nav' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
        >
          <Icons.Strategy className="w-4 h-4" />
          Command Center
        </button>
        
        <div className="pt-12 pb-5 px-6">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">Strategy Units</p>
        </div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
               setActiveSection(item.id as AppSection);
               setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-5 px-6 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeSection === item.id ? 'active-nav' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
          >
            {item.icon && React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-12 pt-10 border-t border-white/5">
        <div className="flex items-center gap-4 mb-10 p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
          <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff&bold=true`} className="w-11 h-11 rounded-xl shadow-2xl border border-white/10" alt="User" />
          <div className="min-w-0">
            <p className="text-[10px] font-black text-white truncate uppercase tracking-tight">{user?.name}</p>
            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-1 opacity-60">{user?.isDev ? 'Core Developer' : 'Enterprise Ready'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="w-full text-[9px] font-black text-slate-500 hover:text-red-400 transition-colors uppercase tracking-[0.4em] py-4 border border-white/5 rounded-xl hover:bg-red-400/5"
        >
          End Session
        </button>
      </div>
    </div>
  );

  if (!user) return <Auth onAuthSuccess={handleLogin} onThemeChange={(t) => setSettings(s => ({ ...s, theme: t }))} />;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--brand-bg)]">
      <aside className="hidden lg:flex flex-col w-[300px] fixed inset-y-0 left-0 z-50 glass-sidebar shadow-2xl overflow-y-auto no-scrollbar">
        <SidebarContent />
      </aside>

      <main className="flex-1 lg:ml-[300px] min-h-screen flex flex-col">
        <header className="h-28 flex items-center justify-between px-10 border-b border-[var(--border-color)] sticky top-0 bg-[var(--header-bg)] backdrop-blur-[32px] z-40 transition-all duration-500">
          <div className="flex items-center gap-8">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <div className="flex flex-col">
              <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 opacity-80">Global Node</h1>
              <span className="text-sm font-black uppercase tracking-[0.2em] mt-1.5 text-[var(--text-heading)]">
                {activeSection === 'overview' ? 'Executive Overview' : menuItems.find(m => m.id === activeSection)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
             <button 
                onClick={toggleTheme}
                className="p-4 rounded-[18px] border border-[var(--border-color)] bg-[var(--card-bg)] hover:border-indigo-600 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none group"
                title={settings.theme === 'professional-dark' ? 'Luminous Day' : 'Professional Dark'}
              >
                {settings.theme === 'professional-dark' ? (
                  <Icons.Sun className="w-5 h-5 text-amber-500 group-hover:rotate-90 transition-transform duration-700" />
                ) : (
                  <Icons.Moon className="w-5 h-5 text-slate-500 group-hover:-rotate-12 transition-transform duration-700" />
                )}
             </button>
          </div>
        </header>

        <div className="flex-1 p-8 sm:p-14 overflow-y-auto no-scrollbar">
          <div className="max-w-[1500px] mx-auto min-h-full">
            {renderActiveContent()}
          </div>
        </div>
      </main>
      
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-[300px] h-full bg-slate-950 shadow-2xl animate-in slide-in-from-left duration-700 var(--ease-out-expo)">
            <div className="p-6 text-right">
               <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-white bg-white/10 rounded-xl"><Icons.Check className="rotate-45" /></button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
