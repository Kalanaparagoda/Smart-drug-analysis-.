
import React, { useState } from 'react';
import { MedicineInfo } from '../types';

interface MedicineCardProps {
  info: MedicineInfo;
  onClear: () => void;
  onRelatedSearch: (name: string) => void;
}

const MedicineCard: React.FC<MedicineCardProps> = ({ info, onClear, onRelatedSearch }) => {
  const [showAllEffects, setShowAllEffects] = useState(false);

  const hasMoreEffects = info.sideEffects.length > 3;
  const visibleEffects = showAllEffects ? info.sideEffects : info.sideEffects.slice(0, 3);

  return (
    <div className="w-full max-w-lg mx-auto bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-white/60 animate-in fade-in slide-in-from-bottom-12 duration-1000 transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_48px_96px_-24px_rgba(0,0,0,0.15)]">
      
      {/* Dynamic Image Header */}
      <div className="relative h-64 overflow-hidden group">
        {info.imageUrl ? (
          <img 
            src={info.imageUrl} 
            alt={info.brandName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <i className="fas fa-pills text-blue-300 text-6xl"></i>
          </div>
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Close Button */}
        <button 
          onClick={onClear}
          className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all active:scale-90 z-20"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        {/* Floating Tag */}
        <div className="absolute bottom-6 left-8 z-10">
          <div className="flex items-center gap-2 mb-2 animate-in fade-in slide-in-from-left-4 duration-500 delay-300">
            <div className="px-3 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
              Verified Analysis
            </div>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight tracking-tighter drop-shadow-lg">
            {info.brandName}
          </h2>
          <p className="text-white/90 font-bold text-lg drop-shadow-md">
            {info.genericName}
          </p>
        </div>
      </div>

      <div className="p-8 md:p-10 space-y-10">
        {/* Purpose Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
          <div className="flex items-center gap-4 mb-3">
             <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                <i className="fas fa-stethoscope text-xl"></i>
             </div>
             <div>
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Medical Purpose</h3>
                <p className="text-slate-900 font-bold text-xl leading-snug">{info.purpose}</p>
             </div>
          </div>
        </section>

        {/* Reasons for Use Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-550">
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fas fa-clipboard-list text-blue-500"></i>
            Common Reasons for Use
          </h3>
          <ul className="space-y-3">
            {info.reasonsForUse.map((reason, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700 text-sm font-semibold leading-relaxed group">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center text-blue-400 border border-blue-100 group-hover:bg-blue-100 transition-colors">
                  <i className="fas fa-check text-[10px]"></i>
                </div>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Ingredients Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fas fa-atom text-blue-500"></i>
            Active Ingredients
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {info.ingredients.map((ing, i) => (
              <span key={i} className="px-5 py-2.5 bg-white shadow-sm text-slate-700 text-sm font-bold rounded-2xl border border-slate-100 hover:border-blue-200 hover:text-blue-600 transition-all cursor-default">
                {ing}
              </span>
            ))}
          </div>
        </section>

        {/* Relevant Medicines Suggestions */}
        <section className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-650">
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fas fa-exchange-alt text-cyan-600"></i>
              Relevant Medicines
            </div>
            <span className="text-[9px] font-bold text-slate-400 tracking-normal opacity-60">Tap to search</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {info.relatedMedicines.map((med, i) => (
              <button
                key={i}
                onClick={() => onRelatedSearch(med)}
                className="group flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 transition-all active:scale-95 shadow-sm"
              >
                <i className="fas fa-search text-[10px] opacity-40 group-hover:opacity-100"></i>
                {med}
              </button>
            ))}
          </div>
        </section>

        {/* Side Effects Section (Accordion Style) */}
        <section className="bg-gradient-to-br from-rose-50/50 to-amber-50/50 rounded-[2rem] p-8 border border-rose-100/50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                <i className="fas fa-biohazard text-sm"></i>
              </div>
              <h3 className="text-rose-900 text-xs font-black uppercase tracking-widest">Critical Side Effects</h3>
            </div>
            {hasMoreEffects && (
              <button 
                onClick={() => setShowAllEffects(!showAllEffects)}
                className="text-[10px] font-black uppercase tracking-wider text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1.5 px-3 py-1.5 bg-white/50 rounded-full border border-rose-100"
              >
                {showAllEffects ? 'Show Less' : `View All (${info.sideEffects.length})`}
                <i className={`fas fa-chevron-${showAllEffects ? 'up' : 'down'} transition-transform duration-300`}></i>
              </button>
            )}
          </div>
          
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-500 overflow-hidden">
            {visibleEffects.map((effect, i) => (
              <li 
                key={i} 
                className="flex items-center gap-3 text-rose-950 text-sm font-bold leading-tight bg-white/40 p-3 rounded-xl border border-rose-100/50 animate-in fade-in zoom-in-95 duration-300"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)] flex-shrink-0"></div>
                <span>{effect}</span>
              </li>
            ))}
          </ul>
          
          {!showAllEffects && hasMoreEffects && (
            <div className="mt-4 pt-4 border-t border-rose-100/30 flex justify-center">
               <button 
                onClick={() => setShowAllEffects(true)}
                className="text-xs font-bold text-rose-500/60 hover:text-rose-600 transition-colors"
               >
                 + {info.sideEffects.length - 3} more side effects
               </button>
            </div>
          )}
        </section>

        <footer className="text-center pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200">
            <i className="fas fa-info-circle text-slate-400 text-[10px]"></i>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Disclaimer Applied</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MedicineCard;
