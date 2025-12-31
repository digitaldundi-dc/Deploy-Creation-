
import React, { useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  FunnelChart, Funnel, LabelList, Tooltip, Cell
} from 'recharts';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Icons } from '../constants';
import { UI_STRINGS } from '../translations';
import { Language } from '../types';
import { performAudit, generateAlertEmail, fileToBase64 } from '../services/gemini';

interface AuditResult {
  score: number;
  funnelHealth: {
    awareness: number;
    consideration: number;
    conversion: number;
  };
  platformViability: {
    meta: number;
    google: number;
    linkedin: number;
  };
  leakagePoints: { stage: string; issue: string; severity: 'High' | 'Medium' | 'Low' }[];
  strategicRefinements: string[];
  executiveSummary: string;
}

const STRATEGIC_OBJECTIVES = [
  { id: 'Grow My Brand', label: 'Grow My Brand', desc: 'Get more people to know you' },
  { id: 'Build More Trust', label: 'Build More Trust', desc: 'Make people believe in your quality' },
  { id: 'Make Quick Sales', label: 'Make Quick Sales', desc: 'Sell your products right now' },
  { id: 'Keep My Customers', label: 'Keep My Customers', desc: 'Make sure people come back to you' },
  { id: 'Go Viral', label: 'Go Viral', desc: 'Get everyone sharing your content' }
];

const SIMULATION_MESSAGES = [
  "Ingesting Funnel Telemetry...",
  "Cross-Referencing ROI Benchmarks...",
  "Detecting Multi-Stage Leakage...",
  "Running Monte Carlo Simulations...",
  "Predicting Operational Outcomes..."
];

const AnalyticsDashboard: React.FC<{ language: Language; onBack?: () => void }> = ({ language: initialLanguage, onBack }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(initialLanguage);
  const t = UI_STRINGS[selectedLanguage];
  const [loading, setLoading] = useState(false);
  const [simMessage, setSimMessage] = useState(SIMULATION_MESSAGES[0]);
  const [broadcasting, setBroadcasting] = useState(false);
  const [brief, setBrief] = useState('');
  const [budget, setBudget] = useState('');
  const [funnelGoal, setFunnelGoal] = useState(STRATEGIC_OBJECTIVES[0].id);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [recipientEmail, setRecipientEmail] = useState('');
  const [autoAlerts, setAutoAlerts] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (f) {
      setPreviewUrl(URL.createObjectURL(f));
    } else {
      setPreviewUrl(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAudit = async () => {
    if (!brief.trim()) return;
    setLoading(true);
    
    let simIndex = 0;
    const interval = setInterval(() => {
      simIndex = (simIndex + 1) % SIMULATION_MESSAGES.length;
      setSimMessage(SIMULATION_MESSAGES[simIndex]);
    }, 1200);

    try {
      let fileData;
      if (file) {
        fileData = await fileToBase64(file);
      }
      const resData = await performAudit(brief, budget, funnelGoal, selectedLanguage, fileData, file?.type);
      setAudit(resData);
      if (autoAlerts && resData.score < 70 && recipientEmail) handleBroadcastAlert(resData);
    } catch (e) {
      console.error(e);
      showToast("Audit protocol failed.", "error");
    } finally {
      setLoading(false);
      clearInterval(interval);
    }
  };

  const handleBroadcastAlert = async (targetAudit = audit) => {
    if (!targetAudit || !recipientEmail) {
      showToast("Recipient identifier required.", "error");
      return;
    }
    setBroadcasting(true);
    try {
      await generateAlertEmail(targetAudit, recipientEmail, selectedLanguage);
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast(t.alertDispatched || "Alert dispatched.");
    } catch (e) {
      showToast("Broadcast relay failed.", "error");
    } finally {
      setBroadcasting(false);
    }
  };

  const funnelData = audit ? [
    { value: audit.funnelHealth.awareness, name: 'Awareness', fill: '#6366F1' },
    { value: audit.funnelHealth.consideration, name: 'Consideration', fill: '#8B5CF6' },
    { value: audit.funnelHealth.conversion, name: 'Conversion', fill: '#10B981' }
  ] : [];

  const platformData = audit ? [
    { subject: 'Meta Ads', value: audit.platformViability.meta, fullMark: 100 },
    { subject: 'Google Ads', value: audit.platformViability.google, fullMark: 100 },
    { subject: 'LinkedIn', value: audit.platformViability.linkedin, fullMark: 100 },
    { subject: 'Audience Fit', value: 85, fullMark: 100 },
    { subject: 'Objective Alignment', value: audit.score, fullMark: 100 }
  ] : [];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 relative pb-20">
      {toast && (
        <div className={`fixed top-20 right-8 z-[100] px-6 py-4 rounded-2xl ${toast.type === 'success' ? 'bg-indigo-600' : 'bg-red-600'} text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-4`}>
          <Icons.Check className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <button onClick={onBack} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-400">
            <Icons.Strategy className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Control Hub
          </button>
          <h2 className="text-3xl font-black tracking-tighter text-shimmer">Strategic Forecasting</h2>
        </div>
        <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Real-time Telemetry Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <Card title="Input Console" subtitle="Algorithm training parameters" icon={<Icons.Campaign />} className="rounded-[2.5rem]">
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
                <label className="data-label">Creative Asset (Optional)</label>
                <input type="file" id="audit-asset" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                <label htmlFor="audit-asset" className={`flex flex-col items-center justify-center min-h-[140px] border-2 border-dashed rounded-[2rem] cursor-pointer transition-all overflow-hidden relative group ${file ? 'border-indigo-600 bg-indigo-50/5' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400'}`}>
                  {previewUrl ? (
                    <div className="absolute inset-0 w-full h-full">
                      {file?.type.startsWith('video/') ? (
                        <video src={previewUrl} className="w-full h-full object-cover opacity-50" muted />
                      ) : (
                        <img src={previewUrl} className="w-full h-full object-cover opacity-50" />
                      )}
                    </div>
                  ) : null}
                  <div className="relative z-10 text-center p-4">
                    <Icons.Upload className={`w-6 h-6 mx-auto mb-2 ${file ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {file ? file.name : 'Audit Visual Asset'}
                    </p>
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="data-label">Deployment Narrative</label>
                <textarea 
                  className="w-full h-32 premium-input italic text-xs leading-relaxed" 
                  placeholder="Describe your vision and specific operational goals..."
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                />
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="data-label">Deployment Budget (₹)</label>
                  <input type="number" className="w-full premium-input h-12" placeholder="e.g. 1000000" value={budget} onChange={(e) => setBudget(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="data-label">Strategic Focus</label>
                  <select 
                    className="w-full premium-input h-12 cursor-pointer font-bold" 
                    value={funnelGoal} 
                    onChange={(e) => setFunnelGoal(e.target.value)}
                  >
                    {STRATEGIC_OBJECTIVES.map(obj => (
                      <option key={obj.id} value={obj.id}>{obj.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button onClick={handleAudit} isLoading={loading} variant="shimmer" className="w-full py-4 text-[10px] uppercase tracking-widest">
                Initialize Audit Protocol
              </Button>
            </div>
          </Card>

          <Card title="Broadcast Hub" icon={<Icons.Asset />} className="rounded-[2.5rem]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="data-label">Stakeholder Node</label>
                <input type="email" className="w-full premium-input h-12" placeholder="stakeholder@enterprise.com" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
              </div>
              <label className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-400">Auto-Alert Protocol</span>
                  <span className="text-[8px] font-bold text-slate-600 uppercase">Trigger on score &lt; 70%</span>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-indigo-600 rounded-lg" checked={autoAlerts} onChange={() => setAutoAlerts(!autoAlerts)} />
              </label>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {loading ? (
            <div className="h-full min-h-[600px] pro-card rounded-[3rem] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden bg-slate-900/50">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
               <div className="relative w-32 h-32 flex items-center justify-center mb-10">
                  <div className="absolute inset-0 border-[6px] border-indigo-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-[6px] border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(99,102,241,0.3)]"></div>
                  <Icons.Analytics className="w-10 h-10 text-indigo-500" />
               </div>
               <h3 className="text-xl font-black uppercase tracking-[0.2em] mb-4 text-white">{simMessage}</h3>
            </div>
          ) : audit ? (
            <div className="space-y-10 animate-in zoom-in-95 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 pro-card bg-slate-900/80 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center border-indigo-500/30 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl -mr-16 -mt-16"></div>
                  <h4 className="data-label mb-8">Readiness Score</h4>
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="80" cy="80" r="72" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                      <circle 
                        cx="80" cy="80" r="72" fill="transparent" stroke="#6366F1" strokeWidth="12" 
                        strokeDasharray={452} strokeDashoffset={452 - (452 * audit.score / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1500 ease-out shadow-[0_0_25px_rgba(99,102,241,0.6)]"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-6xl font-black text-white tracking-tighter">{audit.score}</span>
                      <span className="text-[10px] font-black text-indigo-400 mt-1 uppercase tracking-widest">% Optimal</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 pro-card rounded-[3rem] p-12 flex flex-col justify-center border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent backdrop-blur-3xl">
                   {previewUrl && (
                      <div className="flex items-center gap-6 mb-6 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                          {file?.type.startsWith('video/') ? <video src={previewUrl} className="w-full h-full object-cover" /> : <img src={previewUrl} className="w-full h-full object-cover" />}
                        </div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Asset integrated into audit protocol</p>
                      </div>
                   )}
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Objective Synthesis</h4>
                  <p className="text-xl font-medium text-[var(--text-heading)] leading-relaxed italic border-l-4 border-indigo-600/30 pl-8 mb-10">
                    "{audit.executiveSummary}"
                  </p>
                  <Button variant="glass" size="sm" className="w-fit" onClick={() => handleBroadcastAlert()} isLoading={broadcasting}>
                    Dispatch Protocol Alert
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Card title="Funnel Stability" subtitle="Projected conversion health metrics" icon={<Icons.Analytics />} className="rounded-[3rem]">
                  <div className="h-[320px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <FunnelChart>
                        <Tooltip contentStyle={{ borderRadius: '20px', backgroundColor: '#0F172A', color: '#fff' }} />
                        <Funnel dataKey="value" data={funnelData} isAnimationActive>
                          {funnelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
                          ))}
                          <LabelList position="right" fill="#64748B" dataKey="name" style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} />
                        </Funnel>
                      </FunnelChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card title="Viability Index" subtitle="Objective alignment across channels" icon={<Icons.Strategy />} className="rounded-[3rem]">
                  <div className="h-[320px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={platformData}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="subject" tick={{fontSize: 9, fontWeight: 900, fill: '#64748B'}} />
                        <Radar name="Viability" dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} strokeWidth={4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center pro-card rounded-[4rem] border-dashed border-2 p-20 text-center group bg-white/5 border-slate-700/50">
               <Icons.Analytics className="w-10 h-10 text-slate-600 mb-8" />
               <h3 className="text-3xl font-black uppercase tracking-[0.2em] mb-4 text-slate-600">Forecasting Node Idle</h3>
               <p className="text-sm font-medium text-slate-500 max-w-sm">Enter parameters and upload creative to begin audit.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
