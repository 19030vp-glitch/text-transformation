
import React, { useState, useEffect, useCallback } from 'react';
import { refineText } from './services/geminiService';
import { ToneType, RefinementHistory } from './types';
import ToneSelector from './components/ToneSelector';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<{ text: string; explanation?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tone, setTone] = useState<ToneType>(ToneType.PROFESSIONAL);
  const [history, setHistory] = useState<RefinementHistory[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('linguist_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const handleRefine = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await refineText(inputText, tone);
      setResult({ text: response.refinedText, explanation: response.explanation });
      
      // Update history
      const newItem: RefinementHistory = {
        id: Date.now().toString(),
        original: inputText,
        refined: response.refinedText,
        timestamp: Date.now()
      };
      
      const updatedHistory = [newItem, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('linguist_history', JSON.stringify(updatedHistory));
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleHistoryClick = (item: RefinementHistory) => {
    setInputText(item.original);
    setResult({ text: item.refined });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('linguist_history');
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-5xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Linguist<span className="text-indigo-600">Pro</span>
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Polish your thoughts into professional, grammatically perfect English.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-6">
                <ToneSelector selectedTone={tone} onSelect={setTone} />
                
                <textarea
                  className="w-full h-48 p-4 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-lg"
                  placeholder="Paste your text in any language here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-slate-500">
                    {inputText.length} characters
                  </span>
                  <button
                    onClick={handleRefine}
                    disabled={isLoading || !inputText.trim()}
                    className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${
                      isLoading || !inputText.trim()
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Refining...</span>
                      </span>
                    ) : 'Transform to Professional English'}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Result Area */}
            {result && (
              <div className="bg-indigo-50 rounded-2xl shadow-lg border border-indigo-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-indigo-900">Refined Result</h3>
                    <button
                      onClick={copyToClipboard}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        copySuccess 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white text-indigo-600 hover:bg-indigo-100'
                      }`}
                    >
                      {copySuccess ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                          <span>Copy text</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl border border-indigo-200 text-slate-800 text-lg leading-relaxed shadow-inner">
                    {result.text}
                  </div>

                  {result.explanation && (
                    <div className="mt-4 p-4 bg-indigo-100/50 rounded-xl">
                      <p className="text-sm text-indigo-800 italic">
                        <span className="font-bold">Summary of improvements:</span> {result.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / History */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Recent History</h3>
                  {history.length > 0 && (
                    <button 
                      onClick={clearHistory}
                      className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {history.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <p className="text-sm text-slate-400">No recent refinements.</p>
                    </div>
                  ) : (
                    history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleHistoryClick(item)}
                        className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
                      >
                        <p className="text-sm font-medium text-slate-700 line-clamp-2 group-hover:text-indigo-600">
                          {item.original}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 rounded-2xl shadow-xl p-6 text-white">
              <h4 className="font-bold text-lg mb-2">Why LinguistPro?</h4>
              <ul className="space-y-3 text-sm text-indigo-100">
                <li className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-indigo-300 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Native-level fluency for non-native speakers.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-indigo-300 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Context-aware translation from any language.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-indigo-300 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Tone preservation for professional emails, papers, or chats.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-auto pt-12 pb-6 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} LinguistPro AI. All rights reserved. Powered by Gemini.
      </footer>
    </div>
  );
};

export default App;
