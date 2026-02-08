import React from 'react';
import { useLocation } from 'react-router-dom';
import { Zap, X, Info } from 'lucide-react';
import useStore from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const QuestOverlay = () => {
  const { activeQuest, clearActiveQuest, theme } = useStore();
  const location = useLocation();

  // Only show on Terminal or Portfolio
  const shouldShow = activeQuest && (location.pathname === '/terminal' || location.pathname === '/portfolio');

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-4 rounded-2xl border-2 shadow-2xl flex items-center gap-4 min-w-[320px] max-w-md ${
          theme === 'classroom' 
            ? 'bg-amber-50 border-amber-200 text-amber-900' 
            : 'bg-slate-900 border-amber-500/50 text-amber-200'
        }`}
      >
        <div className="bg-amber-500 p-2 rounded-lg text-white shrink-0">
          <Zap size={20} fill="currentColor" />
        </div>
        
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1">
            Active Quest <Info size={10} />
          </p>
          <h4 className="font-bold text-sm leading-tight mb-0.5">{activeQuest.title}</h4>
          <p className="text-xs opacity-80 leading-tight">{activeQuest.instruction}</p>
        </div>

        <button 
          onClick={clearActiveQuest}
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 opacity-40 hover:opacity-100 transition-all"
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuestOverlay;
