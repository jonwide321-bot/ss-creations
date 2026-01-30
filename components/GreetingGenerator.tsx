
import React, { useState } from 'react';
import { Sparkles, Wand2, X, Copy, Check, Loader2, Heart } from 'lucide-react';
import { generateGreetingMessage } from '../services/gemini';

interface GreetingGeneratorProps {
  productName: string;
  onClose: () => void;
}

const GreetingGenerator: React.FC<GreetingGeneratorProps> = ({ productName, onClose }) => {
  const [occasion, setOccasion] = useState('');
  const [recipient, setRecipient] = useState('');
  const [tone, setTone] = useState('Heartfelt');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{message: string, style: string}[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!occasion || !recipient) return;
    setLoading(true);
    try {
      const results = await generateGreetingMessage(productName, occasion, recipient, tone);
      setMessages(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-stone-100 bg-rose-50/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-rose-500">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">AI Greeting Assistant</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors border border-stone-100 shadow-sm">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 serif">Personalize Your Gift</h2>
          <p className="text-sm text-slate-500">Let AI write the perfect message for your {productName}.</p>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {!messages.length ? (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">What's the occasion?</label>
                <input 
                  type="text" 
                  placeholder="e.g. Birthday, Wedding, Graduation..."
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-100 focus:border-rose-500 outline-none text-sm mt-1"
                  value={occasion}
                  onChange={e => setOccasion(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Who is it for?</label>
                <input 
                  type="text" 
                  placeholder="e.g. My best friend Sarah, My Mom..."
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-100 focus:border-rose-500 outline-none text-sm mt-1"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Desired Tone</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['Heartfelt', 'Funny', 'Poetic', 'Formal'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tone === t ? 'bg-slate-900 text-white' : 'bg-stone-50 text-slate-400 border border-stone-100'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={handleGenerate}
                disabled={loading || !occasion || !recipient}
                className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                Generate Magic Message
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, idx) => (
                <div key={idx} className="group relative bg-stone-50 p-5 rounded-2xl border border-stone-100 hover:border-rose-200 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-bold text-rose-400 uppercase tracking-tighter bg-white px-2 py-0.5 rounded-md shadow-sm border border-rose-50">
                      {m.style}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(m.message, idx)}
                      className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-rose-500"
                    >
                      {copiedIdx === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic pr-8 whitespace-pre-line">
                    "{m.message}"
                  </p>
                </div>
              ))}
              <button 
                onClick={() => setMessages([])}
                className="w-full py-3 text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors uppercase tracking-widest"
              >
                Start Over
              </button>
            </div>
          )}
        </div>

        <div className="p-6 bg-stone-50/50 border-t border-stone-100 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <Heart className="w-3 h-3 fill-rose-300 text-rose-300" />
            <span>Make it special with SS Creations AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreetingGenerator;
