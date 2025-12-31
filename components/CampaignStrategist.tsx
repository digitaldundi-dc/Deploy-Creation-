
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { INDUSTRIES, Icons } from '../constants';
import { planFullCampaign, fileToBase64 } from '../services/gemini';
import { UI_STRINGS } from '../translations';
import { FullCampaignPlan, Language, SavedItem } from '../types';

interface Props {
  language: Language;
  onBack?: () => void;
}

const SIMULATION_MESSAGES = [
  "Mapping Cross-Channel ROI Projection...",
  "Calibrating Budgetary Efficiency...",
  "Simulating Multi-Platform Conversion Paths...",
  "Architecting Viral Content Triggers...",
  "Synthesizing Strategic Deployment Roadmap...",
  "Validation Complete. Rendering Dossier..."
];

const CampaignStrategist: React.FC<Props> = ({ language: initialLanguage, onBack }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(initialLanguage);
  const t = UI_STRINGS[selectedLanguage];
  const [loading, setLoading] = useState(false);
  const [simMessage, setSimMessage] = useState(SIMULATION_MESSAGES[0]);
  const [isManual, setIsManual] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [form, setForm] = useState({
    brief: '', industry: INDUSTRIES[0], budget: '', campaignType: 'Brand Awareness', days: '30', targetUsers: '', selectedPlatforms: ['Meta', 'Google Ads'],
    file: null as File | null
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dossiers, setDossiers] = useState<FullCampaignPlan[]>([]);
  const [activeVariation, setActiveVariation] = useState(0);

  // Vault States
  const [showVault, setShowVault] = useState(false);
  const [vaultItems, setVaultItems] = useState<SavedItem<FullCampaignPlan[]>[]>([]);
  const [archiveLabel, setArchiveLabel] = useState('');
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [vaultSearch, setVaultSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const savedVault = localStorage.getItem('ss_campaign_vault');
    if (savedVault) setVaultItems(JSON.parse(savedVault));
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    localStorage.setItem('ss_campaign_vault', JSON.stringify(vaultItems));
  }, [vaultItems]);

  const handleFileChange = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setForm({ ...form, file });
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const clearAsset = (e: React.MouseEvent) => {
    e.preventDefault();
    handleFileChange(null);
  };

  const handlePlanDossier = async () => {
    const finalIndustry = isManual ? manualValue : form.industry;
    if (!form.brief || !finalIndustry) return;

    setLoading(true);
    let simIndex = 0;
    const interval = setInterval(() => {
      simIndex = (simIndex + 1) % SIMULATION_MESSAGES.length;
      setSimMessage(SIMULATION_MESSAGES[simIndex]);
    }, 1100);

    try {
      let fileData;
      if (form.file) {
        fileData = await fileToBase64(form.file);
      }
      
      const res = await planFullCampaign(
        form.brief, 
        finalIndustry, 
        form.budget, 
        form.selectedPlatforms, 
        form.campaignType, 
        form.days, 
        form.targetUsers, 
        selectedLanguage,
        fileData,
        form.file?.type
      );
      setDossiers(res);
      setActiveVariation(0);
    } catch (e) { 
      console.error(e); 
      showToast('Campaign architecture failed.', 'error');
    } finally { 
      setLoading(false); 
      clearInterval(interval);
    }
  };

  const handleArchive = () => {
    if (!archiveLabel.trim() || dossiers.length === 0) return;
    const newItem: SavedItem<FullCampaignPlan[]> = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      label: archiveLabel,
      data: dossiers
    };
    setVaultItems(prev => [newItem, ...prev]);
    setArchiveLabel('');
    setShowSavePrompt(false);
    showToast(t.saveSuccess || 'Campaign dossier archived');
  };

  const loadFromVault = (item: SavedItem<FullCampaignPlan[]>) => {
    setDossiers(item.data);
    setActiveVariation(0);
    setShowVault(false);
    showToast(t.loadSuccess || 'Dossier retrieved');
  };

  const filteredVault = useMemo(() => {
    return vaultItems.filter(item => item.label.toLowerCase().includes(vaultSearch.toLowerCase()));
  }, [vaultItems, vaultSearch]);

  const currentDossier = dossiers[activeVariation];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 min-h-[calc(100vh-160px)] relative">
      {toast && (
        <div className={`fixed top-24 right-4 sm:right-10 z-[100] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right-4 duration-300 ${toast.type === 'success' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-red-600 border-red-500 text-white'}`}>
          <Icons.Check className="w-5 h-5 text-white" />
          <span className="text-[11px] font-bold uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      {showSavePrompt && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowSavePrompt(false)}></div>
          <div className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-[var(--text-heading)] uppercase tracking-tight mb-2">Archive Protocol</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Assign a label to this campaign dossier</p>
            <input 
              autoFocus
              className="premium-input mb-8" 
              placeholder="e.g., Seasonal Promo 2025" 
              value={archiveLabel} 
              onChange={e => setArchiveLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleArchive()}
            />
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowSavePrompt(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1" onClick={handleArchive}>Save to Vault</Button>
            </div>
          </div>
        </div>
      )}

      <div className="xl:col-span-4 space-y-8 flex flex-col">
        {showVault ? (
          <Card title={t.vault || "Campaign Vault"} subtitle="Operational Archives" icon={<Icons.Analytics />} className="h-full">
             <div className="space-y-4 flex flex-col h-full">
              <div className="relative">
                 <input type="text" placeholder="Search Vault..." className="premium-input pl-10" value={vaultSearch} onChange={(e) => setVaultSearch(e.target.value)} />
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pr-1">
                {filteredVault.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 py-10 text-center uppercase tracking-widest">{t.noSavedItems}</p>
                ) : (
                  filteredVault.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-indigo-600 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</span>
                        <button onClick={() => setVaultItems(prev => prev.filter(v => v.id !== item.id))} className="text-slate-300 hover:text-red-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <h4 className="text-[12px] font-bold text-[var(--text-heading)] mb-4 truncate">{item.label}</h4>
                      <Button variant="outline" size="sm" className="w-full text-[10px] py-2" onClick={() => loadFromVault(item)}>Retrieve</Button>
                    </div>
                  ))
                )}
              </div>
              <Button variant="ghost" className="w-full text-[10px] mt-4" onClick={() => setShowVault(false)}>Back to Architect</Button>
            </div>
          </Card>
        ) : (
          <>
            <Card title="Campaign Architect" icon={<Icons.Campaign />}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="data-label">Output Language</label>
                  <select 
                    className="premium-input text-xs" 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                  >
                    <option value="en">English</option>
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="data-label">Deployment Narrative</label>
                  <textarea className="w-full premium-input h-32 text-xs leading-relaxed" placeholder="Describe vision and objectives..." value={form.brief} onChange={e => setForm({...form, brief: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <label className="data-label">Market Sector</label>
                  <select 
                    className="premium-input text-xs" 
                    value={isManual ? "manual" : form.industry} 
                    onChange={e => {
                      if (e.target.value === "manual") {
                        setIsManual(true);
                      } else {
                        setIsManual(false);
                        setForm({...form, industry: e.target.value});
                      }
                    }}
                  >
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    <option value="manual">Other / Custom Sector</option>
                  </select>
                  {isManual && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      <input 
                        className="premium-input mt-2" 
                        placeholder="Type your custom sector..." 
                        value={manualValue} 
                        onChange={e => setManualValue(e.target.value)} 
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="data-label">Campaign Creative (Optional)</label>
                    {form.file && (
                      <button onClick={clearAsset} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline">Remove</button>
                    )}
                  </div>
                  <input type="file" id="campaign-asset" className="hidden" accept="image/*,video/*" onChange={e => handleFileChange(e.target.files?.[0] || null)} />
                  <label htmlFor="campaign-asset" className={`flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed rounded-[2.5rem] cursor-pointer transition-all overflow-hidden relative group ${form.file ? 'border-indigo-600 bg-indigo-50/5' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400'}`}>
                    {previewUrl ? (
                      <div className="absolute inset-0 w-full h-full">
                        {form.file?.type.startsWith('video/') ? (
                          <video src={previewUrl} className="w-full h-full object-cover opacity-60" muted />
                        ) : (
                          <img src={previewUrl} className="w-full h-full object-cover opacity-60" />
                        )}
                        <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-all"></div>
                      </div>
                    ) : null}
                    <div className="relative z-10 text-center p-6">
                      <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-3 transition-all ${form.file ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white dark:bg-slate-800 text-slate-400'}`}>
                        <Icons.Upload className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {form.file ? form.file.name : 'Attach Visual Logic'}
                      </p>
                    </div>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="data-label">Budget (₹)</label>
                  <input type="number" className="premium-input text-xs" placeholder="Budget" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} />
                </div>

                <Button onClick={handlePlanDossier} isLoading={loading} variant="shimmer" className="w-full">Initialize Strategy Dossier</Button>
              </div>
            </Card>
            <button onClick={() => setShowVault(true)} className="w-full p-5 pro-card rounded-2xl flex items-center justify-between group hover:border-indigo-600 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Icons.Analytics className="w-5 h-5" /></div>
                <div><h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-heading)]">{t.vault || "Campaign Vault"}</h4><p className="text-[9px] font-medium text-slate-500 uppercase">{vaultItems.length} Records</p></div>
              </div>
              <Icons.Campaign className="w-4 h-4 text-slate-300" />
            </button>
          </>
        )}
      </div>

      <div className="xl:col-span-8">
        {loading ? (
          <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-20 pro-card rounded-[3rem] bg-white/5 border-dashed border-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-8 mx-auto shadow-[0_0_20px_rgba(99,102,241,0.4)]" />
              <p className="text-2xl font-black uppercase tracking-widest text-[var(--text-heading)] mb-4">{simMessage}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 opacity-60">Architecting ROI-Driven Protocols</p>
            </div>
          </div>
        ) : currentDossier ? (
          <div className="space-y-8 animate-in fade-in duration-700">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
                  {dossiers.map((_, i) => (
                    <button key={i} onClick={() => setActiveVariation(i)} className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeVariation === i ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-indigo-400'}`}>Protocol 0{i+1}</button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="glass" size="sm" onClick={() => setShowSavePrompt(true)} className="text-[10px]">Archive Dossier</Button>
                </div>
             </div>

             <div className="pro-card rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900 shadow-2xl border-none">
                <div className="p-10 bg-slate-900 text-white">
                   <h2 className="text-2xl font-black mb-8 leading-tight tracking-tight uppercase tracking-wider">{currentDossier.variationName}</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
                         <p className="data-label text-indigo-400 mb-2">Primary Platform</p>
                         <p className="text-sm font-black uppercase tracking-widest">{currentDossier.bestPlatform}</p>
                      </div>
                      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
                         <p className="data-label text-indigo-400 mb-2">Optimal Window</p>
                         <p className="text-sm font-black uppercase tracking-widest">{currentDossier.bestTimeToPost}</p>
                      </div>
                      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
                         <p className="data-label text-indigo-400 mb-2">Deployment Format</p>
                         <p className="text-sm font-black uppercase tracking-widest">{currentDossier.adType}</p>
                      </div>
                   </div>
                </div>

                <div className="p-10 space-y-12">
                   {previewUrl && (
                     <div className="pro-card p-8 bg-slate-950 rounded-[2.5rem] border-none overflow-hidden relative group">
                        <div className="absolute top-6 left-6 z-10">
                          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 flex items-center gap-2">
                            <Icons.Sparkles className="w-3 h-3" /> Visual Synergy Active
                          </span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-10 items-center">
                          <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-[1.5rem] overflow-hidden shadow-2xl border border-white/10 bg-black">
                            {form.file?.type.startsWith('video/') ? (
                              <video src={previewUrl} className="w-full h-full object-contain" controls />
                            ) : (
                              <img src={previewUrl} className="w-full h-full object-contain" />
                            )}
                          </div>
                          <div className="flex-1 space-y-5">
                             <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Creative Alignment Log</h4>
                             <p className="text-[14px] font-medium text-slate-400 leading-relaxed italic border-l-2 border-indigo-600/40 pl-6 py-2">
                               {currentDossier.summary.split('.')[0]}. AI analysis active.
                             </p>
                          </div>
                        </div>
                     </div>
                   )}

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <h4 className="data-label text-indigo-600 flex items-center gap-3"><span className="w-8 h-px bg-indigo-600"></span> Strategy Dossier</h4>
                        <div className="space-y-4">
                          <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                             <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                               {currentDossier.summary}
                             </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <h4 className="data-label text-indigo-600 flex items-center gap-3"><span className="w-8 h-px bg-indigo-600"></span> Creative Blueprint</h4>
                        <div className="p-10 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] relative group hover:border-indigo-600 transition-all shadow-xl">
                           <div className="absolute top-6 right-8 opacity-20 group-hover:opacity-100 transition-opacity"><Icons.Sparkles className="text-indigo-600 w-8 h-8" /></div>
                           <p className="data-label text-indigo-400 mb-4">Viral High-Reach Hook</p>
                           <p className="text-xl font-black italic text-indigo-600 leading-tight mb-8">"{currentDossier.creativePlan.hook}"</p>
                           <hr className="border-slate-100 dark:border-slate-700 mb-8" />
                           <p className="text-[12px] font-bold text-slate-500 mt-6 leading-relaxed">Concept: {currentDossier.creativePlan.concept}</p>
                        </div>
                        <div className="space-y-4">
                           <h4 className="data-label text-indigo-600">Optimized Hashtag Stack</h4>
                           <div className="flex flex-wrap gap-2">
                             {currentDossier.hashtags.map((tag, i) => (
                               <span key={i} className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-indigo-600 transition-colors shadow-lg cursor-default">#{tag}</span>
                             ))}
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="h-full min-h-[600px] flex flex-col items-center justify-center pro-card rounded-[4rem] border-dashed border-2 p-20 text-center group bg-white/5 border-slate-700/50">
             <div className="w-24 h-24 bg-indigo-500/5 rounded-[2.5rem] border border-indigo-500/20 flex items-center justify-center text-indigo-500/50 mb-10 group-hover:scale-110 transition-all duration-700 shadow-2xl">
                <Icons.Campaign className="w-10 h-10" />
             </div>
             <h3 className="text-3xl font-black uppercase tracking-[0.2em] mb-4 text-slate-400 group-hover:text-indigo-600 transition-colors">Campaign Node Idle</h3>
             <p className="text-sm font-medium text-slate-500 max-w-sm leading-relaxed uppercase tracking-tighter opacity-60">Define deployment narrative and upload creative assets to begin architectural simulation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignStrategist;
