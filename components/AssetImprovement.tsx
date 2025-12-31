
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { INDUSTRIES, Icons } from '../constants';
import { analyzeAsset, fileToBase64 } from '../services/gemini';
import { UI_STRINGS } from '../translations';
import { AssetAnalysis, Language, SavedItem } from '../types';

interface Props {
  language: Language;
  onBack?: () => void;
}

const SIMULATION_MESSAGES = [
  "Mapping Neural Cognitive Response...",
  "Calibrating Visual Focal Tunnels...",
  "Detecting Aesthetic Friction Points...",
  "Synthesizing Attention Heatmaps...",
  "Optimizing Visual-Semantic Weighting...",
  "Encoding Refinement Parameters..."
];

const AssetImprovement: React.FC<Props> = ({ language: initialLanguage, onBack }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(initialLanguage);
  const t = UI_STRINGS[selectedLanguage];

  const [loading, setLoading] = useState(false);
  const [simMessage, setSimMessage] = useState(SIMULATION_MESSAGES[0]);
  const [isManual, setIsManual] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [formData, setFormData] = useState({
    industry: INDUSTRIES[0],
    product: '',
    offer: '',
    targetAudience: '',
    brandVoice: '',
    channel: 'Instagram',
    strategicContext: '',
    file: null as File | null
  });
  
  const [results, setResults] = useState<AssetAnalysis[]>([]);
  const [activeVariation, setActiveVariation] = useState(0);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [showVault, setShowVault] = useState(false);
  const [vaultItems, setVaultItems] = useState<SavedItem<AssetAnalysis[]>[]>([]);
  const [archiveLabel, setArchiveLabel] = useState('');
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [vaultSearch, setVaultSearch] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const savedVault = localStorage.getItem('ss_asset_vault');
    if (savedVault) setVaultItems(JSON.parse(savedVault));
  }, []);

  useEffect(() => {
    localStorage.setItem('ss_asset_vault', JSON.stringify(vaultItems));
  }, [vaultItems]);

  const handleAnalyze = async () => {
    const finalIndustry = isManual ? manualValue : formData.industry;
    if (!formData.product || !finalIndustry) return;

    setLoading(true);
    let simIndex = 0;
    const interval = setInterval(() => {
      simIndex = (simIndex + 1) % SIMULATION_MESSAGES.length;
      setSimMessage(SIMULATION_MESSAGES[simIndex]);
    }, 1100);

    try {
      let fileData;
      if (formData.file) {
        fileData = await fileToBase64(formData.file);
      }
      const data = await analyzeAsset(
        finalIndustry, 
        formData.product, 
        formData.offer, 
        formData.channel, 
        formData.targetAudience,
        formData.brandVoice,
        selectedLanguage, 
        formData.strategicContext,
        fileData
      );
      setResults(data);
      setActiveVariation(0);
      setShowSavePrompt(false);
    } catch (e) { 
      console.error(e); 
      showToast('Analysis protocol failed.', 'error');
    } finally { 
      setLoading(false); 
      clearInterval(interval);
    }
  };

  const handleFileChange = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFormData({ ...formData, file });
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleArchive = () => {
    if (!archiveLabel.trim() || results.length === 0) return;
    const newItem: SavedItem<AssetAnalysis[]> = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      label: archiveLabel,
      data: results
    };
    setVaultItems(prev => [newItem, ...prev]);
    setArchiveLabel('');
    setShowSavePrompt(false);
    showToast(t.saveSuccess || 'Asset optimization archived in vault');
  };

  const loadFromVault = (item: SavedItem<AssetAnalysis[]>) => {
    setResults(item.data);
    setActiveVariation(0);
    setShowVault(false);
    showToast(t.loadSuccess || 'Refinement data retrieved from vault');
  };

  const filteredVault = useMemo(() => {
    return vaultItems.filter(item => item.label.toLowerCase().includes(vaultSearch.toLowerCase()));
  }, [vaultItems, vaultSearch]);

  const handleCopy = () => {
    if (!currentResult) return;
    const text = `
REFINEMENT PATH: Variation ${activeVariation + 1}
TITLE: ${currentResult.improvedTitle}
DESCRIPTION: ${currentResult.improvedDescription}
HOOKS: ${currentResult.improvedHooks.join('\n - ')}
ANALYSIS: ${currentResult.engagementAnalysis}
HASHTAGS: ${currentResult.optimizedHashtags.map(t => '#' + t).join(' ')}
TIME TO POST: ${currentResult.bestTimeToPost}
BEST PLATFORM: ${currentResult.bestPlatform}
    `.trim();
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Full optimization copied');
    });
  };

  const currentResult = results[activeVariation];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch min-h-[calc(100vh-160px)] pb-10 relative">
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
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Assign a label to this audit record</p>
            <input 
              autoFocus
              className="premium-input mb-8" 
              placeholder="e.g., Logo Redesign Audit" 
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

      {/* Sidebar - Controls */}
      <div className="lg:col-span-4 space-y-6 flex flex-col">
        {showVault ? (
          <Card title={t.vault || "Asset Vault"} subtitle="Operational Archives" icon={<Icons.Analytics />} className="h-full">
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
              <Button variant="ghost" className="w-full text-[10px] mt-4" onClick={() => setShowVault(false)}>Back to Optimizer</Button>
            </div>
          </Card>
        ) : (
          <>
            <Card title="Asset Optimizer" icon={<Icons.Asset />}>
              <div className="space-y-4">
                <div className="space-y-4">
                  <div>
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
                  <div>
                    <label className="data-label">Market Sector</label>
                    <select className="premium-input" value={isManual ? "manual" : formData.industry} onChange={e => {
                      if (e.target.value === "manual") setIsManual(true);
                      else { setIsManual(false); setFormData({...formData, industry: e.target.value}); }
                    }}>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                      <option value="manual">Other / Custom Sector</option>
                    </select>
                    {isManual && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <input className="premium-input mt-2" placeholder="Type your custom sector..." value={manualValue} onChange={e => setManualValue(e.target.value)} />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="data-label">Product</label>
                      <input className="premium-input" placeholder="Acme Pro" value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} />
                    </div>
                    <div>
                      <label className="data-label">Primary Channel</label>
                      <select className="premium-input" value={formData.channel} onChange={e => setFormData({...formData, channel: e.target.value})}>
                        <option>Instagram</option><option>LinkedIn</option><option>TikTok</option><option>X (Twitter)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="data-label">Strategic Message</label>
                    <textarea className="premium-input min-h-[80px] resize-none" placeholder="Core goal..." value={formData.strategicContext} onChange={e => setFormData({...formData, strategicContext: e.target.value})} />
                  </div>
                  <div>
                    <label className="data-label">Visual Asset</label>
                    <input type="file" id="asset-file" className="hidden" accept="image/*" onChange={e => handleFileChange(e.target.files?.[0] || null)} />
                    <label htmlFor="asset-file" className={`flex flex-col items-center justify-center min-h-[120px] border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden relative ${formData.file ? 'border-indigo-600' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                      {previewUrl ? <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" /> : <div className="text-center p-4"><Icons.Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" /><p className="text-[10px] font-bold text-slate-500 uppercase">Attach Image</p></div>}
                    </label>
                  </div>
                </div>
                <Button variant="shimmer" className="w-full py-4 text-[11px]" isLoading={loading} onClick={handleAnalyze}>Initiate Audit</Button>
              </div>
            </Card>
            <button onClick={() => setShowVault(true)} className="w-full p-5 pro-card rounded-2xl flex items-center justify-between group hover:border-indigo-600 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Icons.Analytics className="w-5 h-5" /></div>
                <div><h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-heading)]">{t.vault || "Asset Vault"}</h4><p className="text-[9px] font-medium text-slate-500 uppercase">{vaultItems.length} Records</p></div>
              </div>
              <Icons.Asset className="w-4 h-4 text-slate-300" />
            </button>
          </>
        )}
      </div>

      {/* Main Content - Results */}
      <div className="lg:col-span-8 flex flex-col h-full">
        {loading ? (
          <div className="flex-1 min-h-[500px] flex flex-col items-center justify-center text-center pro-card rounded-[2.5rem] p-10 relative overflow-hidden bg-white/5 border-dashed border-2">
             <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>
             <div className="relative z-10 text-center">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-8 mx-auto shadow-[0_0_20px_rgba(99,102,241,0.4)]"></div>
              <h3 className="text-2xl font-black text-[var(--text-heading)] uppercase tracking-widest mb-4">{simMessage}</h3>
              <p className="text-sm font-medium text-slate-500 max-w-sm leading-relaxed mx-auto">Performing high-fidelity neural heatmapping and reach simulation across target sectors.</p>
             </div>
          </div>
        ) : currentResult ? (
          <div className="space-y-6 flex flex-col animate-in fade-in duration-500">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  {results.map((_, i) => (
                    <button key={i} onClick={() => setActiveVariation(i)} className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeVariation === i ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}>Protocol 0{i + 1}</button>
                  ))}
               </div>
               <div className="flex items-center gap-3 w-full sm:w-auto">
                 <Button variant="outline" onClick={handleCopy} className="flex-1 sm:flex-none text-[10px]">{copied ? 'Copied' : 'Copy Protocol'}</Button>
                 <Button variant="glass" onClick={() => setShowSavePrompt(true)} className="flex-1 sm:flex-none text-[10px]">Archive Result</Button>
               </div>
             </div>

             <div className="pro-card rounded-[2rem] overflow-hidden flex flex-col border-none bg-white dark:bg-slate-900 shadow-xl">
                <div className="grid grid-cols-1 xl:grid-cols-12">
                   <div className="xl:col-span-7 bg-slate-950 flex flex-col items-center justify-center relative p-6 sm:p-10 min-h-[400px]">
                      <div className="absolute top-6 left-6 z-10"><span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">Attention Map</span></div>
                      <div className="relative max-w-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 group">
                        {previewUrl ? <img src={previewUrl} className="max-h-[350px] w-auto object-contain transition-all group-hover:brightness-50" /> : <div className="w-[250px] h-[250px] bg-slate-900 flex flex-col items-center justify-center rounded-2xl"><Icons.Asset className="w-12 h-12 text-slate-800 mb-4" /><p className="text-[10px] text-slate-600 font-bold uppercase">No visual input</p></div>}
                        {currentResult.visualHeatmapPoints?.map((p, i) => (
                           <div key={i} className="absolute pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity duration-500" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}>
                              <div className="relative flex flex-col items-center">
                                 <div className="w-16 h-16 bg-red-500/40 rounded-full blur-xl animate-pulse"></div>
                                 <div className="w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                                 <div className="mt-2 px-2 py-1 bg-black/80 rounded border border-white/20"><span className="text-[8px] font-bold text-white uppercase">{p.label}</span></div>
                              </div>
                           </div>
                        ))}
                      </div>
                   </div>

                   <div className="xl:col-span-5 p-8 sm:p-10 flex flex-col justify-center space-y-8 bg-slate-50 dark:bg-slate-800/20">
                      <div className="space-y-4">
                        <h5 className="data-label text-indigo-600">Refined Title</h5>
                        <p className="text-xl font-black text-[var(--text-heading)] leading-tight tracking-tight">{currentResult.improvedTitle}</p>
                        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[13px] font-medium text-slate-500 italic leading-relaxed">
                          {currentResult.improvedDescription}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h5 className="data-label text-indigo-600">Viral Hooks</h5>
                        <div className="space-y-2">
                           {currentResult.improvedHooks.map((hook, i) => (
                             <div key={i} className="flex gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all group">
                                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">0{i+1}</span>
                                <p className="text-[12px] font-bold text-[var(--text-heading)] pt-1">"{hook}"</p>
                             </div>
                           ))}
                        </div>
                      </div>
                   </div>
                </div>

                <div className="p-8 sm:p-10 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10">
                   <h5 className="data-label mb-4">Strategic Hashtag Stack</h5>
                   <div className="flex flex-wrap gap-2">
                      {currentResult.optimizedHashtags.map((tag, i) => (
                        <span key={i} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest cursor-default shadow-md">#{tag}</span>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-[4rem] p-20 text-center group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
             <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-500/50 mb-8 group-hover:scale-110 transition-transform"><Icons.Asset className="w-10 h-10" /></div>
             <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest mb-4">Neural Scanner Passive</h3>
             <p className="text-sm font-medium text-slate-500 max-w-sm">Attach visual asset to generate heatmap and strategic markers.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetImprovement;
