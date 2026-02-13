
import React, { useState, useEffect, useRef } from 'react';
import { MedicineInfo } from './types';
import { analyzeMedicineImage, searchMedicineByName, getMedicineSuggestions } from './services/geminiService';
import CameraScanner from './components/CameraScanner';
import MedicineCard from './components/MedicineCard';

const App: React.FC = () => {
  const [medicineData, setMedicineData] = useState<MedicineInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced suggestions fetch
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2 && !isAnalyzing) {
        try {
          const results = await getMedicineSuggestions(searchQuery);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch (err) {
          console.warn("Suggestions fetch failed", err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, isAnalyzing]);

  // Click outside listener for suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCapture = async (base64: string) => {
    setIsAnalyzing(true);
    setError(null);
    setShowSuggestions(false);
    try {
      const result = await analyzeMedicineImage(base64);
      setMedicineData(result);
      setShowCamera(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Identification failed. Ensure clear text visibility.");
      setMedicineData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const targetQuery = customQuery || searchQuery;
    if (!targetQuery.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setShowCamera(false);
    setMedicineData(null);
    setShowSuggestions(false);
    
    try {
      const result = await searchMedicineByName(targetQuery);
      setMedicineData(result);
      setSearchQuery('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Medicine not found in clinical database.");
      setMedicineData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearData = () => {
    setMedicineData(null);
    setError(null);
    setShowCamera(false);
    setSearchQuery('');
  };

  const toggleCamera = () => {
    setShowCamera(!showCamera);
    setError(null);
    setShowSuggestions(false);
    if (!showCamera) setMedicineData(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 md:p-12 relative overflow-hidden">
      {/* Header Section */}
      <header className="w-full max-w-lg mb-12 text-center relative z-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="float-animation">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl shadow-2xl shadow-cyan-500/30 mb-6 text-white transform hover:rotate-12 transition-transform cursor-pointer">
            <i className="fas fa-microscope text-3xl"></i>
          </div>
        </div>
        <h1 className="text-5xl font-[900] text-slate-900 tracking-tighter mb-3 leading-none">
          Medi<span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">cine?</span>
        </h1>
        <p className="text-slate-600 font-bold tracking-tight text-lg max-w-xs mx-auto opacity-90">
          Smart drug analysis  .
        </p>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-lg space-y-8 relative z-50">
        {isAnalyzing && !showCamera && !medicineData && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-cyan-600 font-bold tracking-widest uppercase text-xs">Accessing Clinical Database...</p>
          </div>
        )}

        {!medicineData && !isAnalyzing ? (
          <div className="space-y-6">
            {/* Unified Search & Camera Input Group */}
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              <div className="flex items-center gap-3 relative">
                <form onSubmit={handleSearch} className="relative flex-1 group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Enter Medicine"
                    className="w-full pl-14 pr-24 py-5 bg-white/80 backdrop-blur-md border border-white/60 rounded-[1.5rem] shadow-xl shadow-slate-300/20 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all text-slate-700 font-semibold placeholder:text-slate-400 placeholder:font-medium"
                    disabled={isAnalyzing}
                  />
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors">
                    <i className="fas fa-search text-lg"></i>
                  </div>
                  <button
                    type="submit"
                    disabled={isAnalyzing || !searchQuery.trim()}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all active:scale-95"
                  >
                    Search
                  </button>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && (
                    <div 
                      ref={suggestionsRef}
                      className="absolute top-full left-0 right-0 mt-3 bg-white/90 backdrop-blur-2xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300"
                    >
                      <div className="py-2">
                        <div className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100/50 mb-1">
                          Suggestions
                        </div>
                        {suggestions.map((name, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSearch(undefined, name)}
                            className="w-full px-5 py-4 text-left hover:bg-cyan-50 transition-colors flex items-center gap-4 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                              <i className="fas fa-pills text-sm"></i>
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-cyan-700">{name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
                
                <button
                  onClick={toggleCamera}
                  disabled={isAnalyzing}
                  className={`flex-shrink-0 w-[68px] h-[68px] rounded-[1.5rem] flex items-center justify-center transition-all shadow-xl active:scale-95 border backdrop-blur-md ${
                    showCamera 
                      ? 'bg-rose-500 border-rose-400 text-white shadow-rose-500/30' 
                      : `bg-white/90 border-white/80 text-slate-600 hover:text-cyan-600 hover:border-cyan-200 shadow-slate-300/20 ${!isAnalyzing ? 'pulse-camera' : ''}`
                  }`}
                  title={showCamera ? "Close Camera" : "Open Camera"}
                >
                  <i className={`fas ${showCamera ? 'fa-times' : 'fa-camera'} text-xl`}></i>
                </button>
              </div>
            </div>

            {/* Error Message with Animation */}
            {error && (
              <div className="p-5 bg-rose-50/90 backdrop-blur-sm border border-rose-200 rounded-2xl flex items-start gap-4 text-rose-700 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-8 h-8 rounded-full bg-rose-200/50 flex items-center justify-center shrink-0">
                   <i className="fas fa-exclamation-circle"></i>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-0.5">Analysis Failed</h4>
                  <p className="text-xs font-semibold opacity-80">{error}</p>
                </div>
              </div>
            )}

            {/* Camera View Area */}
            {showCamera && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <CameraScanner onCapture={handleCapture} isAnalyzing={isAnalyzing} />
              </div>
            )}
          </div>
        ) : (
          medicineData && <MedicineCard info={medicineData} onClear={clearData} onRelatedSearch={(name) => handleSearch(undefined, name)} />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="mt-auto pt-16 pb-8 text-center text-slate-500 animate-in fade-in duration-1000 delay-700 relative z-10">
        <p className="text-[10px] font-bold tracking-widest uppercase opacity-70">
          Powered by The Platform • &copy; {new Date().getFullYear()} MeMEDICINE?
        </p>
      </footer>
    </div>
  );
};

export default App;
