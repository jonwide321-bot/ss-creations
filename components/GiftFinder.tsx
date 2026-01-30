
import React, { useState } from 'react';
import { Sparkles, Send, Loader2, BrainCircuit } from 'lucide-react';
import { getGiftSuggestions } from '../services/gemini';
import { Recommendation } from '../types';

const GiftFinder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    try {
      const results = await getGiftSuggestions(query);
      setRecommendations(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-rose-50/50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Assistant
          </div>
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Find the Perfect Suggestion</h2>
          <p className="text-slate-600">Tell our AI who you're buying for, the occasion, and their interests.</p>
        </div>

        <form onSubmit={handleSearch} className="relative mb-12">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., A birthday gift for my 5 year old niece who loves space..."
            className="w-full pl-6 pr-16 py-5 rounded-2xl bg-white border border-stone-200 shadow-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all text-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-3 bottom-3 px-6 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>

        {recommendations.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
                <BrainCircuit className="w-8 h-8 text-rose-500 mb-4" />
                <h4 className="text-lg font-bold text-slate-800 mb-2">{rec.suggestion}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{rec.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GiftFinder;
