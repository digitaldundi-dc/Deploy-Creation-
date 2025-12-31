
import React, { useState, useEffect } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Icons } from '../constants';
import { generateWhatsAppMsg, fileToBase64 } from '../services/gemini';
import { UI_STRINGS } from '../translations';
import { WhatsAppTemplate, Language } from '../types';

interface Props {
  language: Language;
  onBack?: () => void;
}

const SIMULATION_MESSAGES = [
  "Mapping Direct-Response Flows...",
  "Refining Conversational Tone...",
  "Localized Sentiment Analysis...",
  "Optimizing CTA Friction...",
  "Synthesizing High-Velocity Sequences..."
];

const WhatsAppMarketing: React.FC<Props> = ({ language: initialLanguage, onBack }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(initialLanguage);
  const t = UI_STRINGS[selectedLanguage];
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [simMessage, setSimMessage] = useState(SIMULATION_MESSAGES[0]);
  const [results, setResults] = useState<WhatsAppTemplate[]>([]);
  const [activeVariation, setActiveVariation] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const handleGenerate = async () => {
    if (!prompt) return;
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
      const data = await generateWhatsAppMsg(prompt, '', '', '', '', selectedLanguage, fileData, file?.type);
      setResults(data);
      setActiveVariation(0);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
      clearInterval(interval);
    }
  };

  const currentResult = results[activeVariation];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-5 space-y-6">
        <Card title="WhatsApp Dispatch Hub" icon={<Icons.WhatsApp />}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="data-label">Output Language</label>
              <select 
                className="premium-input text-sm" 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as Language)}
              >
                <option value="en">English</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="hi">Hindi (हिन्दी)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="data-label">Visual Asset (Optional)</label>
              <input type="file" id="whatsapp-asset" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
              <label htmlFor="whatsapp-asset" className={`flex flex-col items-center justify-center min-h-[140px] border-2 border-dashed rounded-[2rem] cursor-pointer transition-all overflow-hidden relative group ${file ? 'border-indigo-600 bg-indigo-50/5' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400'}`}>
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
                    {file ? file.name : 'Upload Offer Visual'}
                  </p>
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="data-label">Broadcast Offer Details</label>
              <textarea className="w-full premium-input h-48 text-sm leading-relaxed" placeholder="Define product offer or event detail for direct broadcast..." value={prompt} onChange={e => setPrompt(e.target.value)} />
            </div>
            <Button className="w-full" isLoading={loading} onClick={handleGenerate} variant="shimmer">Synthesize Protocol</Button>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-7">
        {loading ? (
          <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-20 pro-card rounded-[3rem] bg-white/5 border-dashed border-2">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6" />
            <p className="text-xl font-black uppercase tracking-widest text-[var(--text-heading)] mb-4">{simMessage}</p>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Recalibrating Conversational Logic...</p>
          </div>
        ) : currentResult ? (
          <div className="space-y-8 animate-in zoom-in-95 duration-700">
             <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-fit mx-auto">
                {results.map((_, i) => (
                  <button key={i} onClick={() => setActiveVariation(i)} className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeVariation === i ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-indigo-400'}`}>Protocol 0{i+1}</button>
                ))}
             </div>

             {previewUrl && (
               <div className="flex items-center gap-8 p-6 pro-card rounded-[2rem] bg-indigo-600/5 border-none">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-xl shrink-0">
                     {file?.type.startsWith('video/') ? <video src={previewUrl} className="w-full h-full object-cover" /> : <img src={previewUrl} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                     <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-1">Visual Context Sync</h4>
                     <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">Analysis of visual asset integrated into messaging flow.</p>
                  </div>
               </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="pro-card p-8 rounded-[2rem] border-indigo-500/10 bg-indigo-50/10 flex flex-col items-center justify-center text-center">
                   <p className="data-label text-indigo-400 mb-2">Broadcast window</p>
                   <p className="text-lg font-black text-indigo-600 uppercase tracking-widest">{currentResult.bestTimeToPost}</p>
                </div>
                <div className="pro-card p-8 rounded-[2rem] border-emerald-500/10 bg-emerald-50/10 flex flex-col items-center justify-center text-center">
                   <p className="data-label text-emerald-400 mb-2">Platform Synergy</p>
                   <p className="text-lg font-black text-emerald-600 uppercase tracking-widest">{currentResult.synergyPlatform}</p>
                </div>
             </div>

             {/* Phone Preview */}
             <div className="bg-[#E5DDD5] rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden border-[12px] border-white max-w-sm mx-auto min-h-[500px] flex flex-col">
                <div className="bg-[#075E54] text-white p-6 absolute top-0 left-0 w-full flex items-center gap-4 shadow-xl">
                   <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black">AI</div>
                   <div className="flex flex-col">
                      <h5 className="font-black text-xs uppercase tracking-widest">Enterprise Strategist</h5>
                      <span className="text-[9px] font-bold opacity-60">Online</span>
                   </div>
                </div>
                <div className="mt-20 bg-[#DCF8C6] p-6 rounded-2xl rounded-tl-none shadow-sm text-sm italic font-medium relative self-start max-w-[90%] border border-black/5 leading-relaxed">
                   {currentResult.message}
                   <div className="mt-6 border-t border-slate-200/50 pt-6">
                      <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg active:scale-95 transition-all">{currentResult.cta}</button>
                   </div>
                </div>
             </div>

             {currentResult.hashtags && (
                <div className="p-10 pro-card rounded-[2.5rem] bg-slate-900 border-none text-center">
                   <p className="data-label text-white/40 mb-4 tracking-[0.3em]">Discovery Synergy</p>
                   <div className="flex flex-wrap justify-center gap-3">
                      {currentResult.hashtags.map(tag => <span key={tag} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">#{tag}</span>)}
                   </div>
                </div>
             )}
          </div>
        ) : (
          <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-[4rem] p-20 text-center group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
             <div className="w-24 h-24 bg-indigo-500/5 rounded-[2.5rem] border border-indigo-500/20 flex items-center justify-center text-indigo-500/50 mb-10 group-hover:scale-110 transition-all duration-700 shadow-2xl">
                <Icons.WhatsApp className="w-10 h-10" />
             </div>
             <h3 className="text-3xl font-black uppercase tracking-[0.2em] mb-4 text-slate-400">Direct Node Idle</h3>
             <p className="text-sm font-medium text-slate-500 max-w-sm">Define broadcast narrative to begin direct response simulation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppMarketing;
