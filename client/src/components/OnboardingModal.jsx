import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, GraduationCap, Terminal as TerminalIcon, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OnboardingModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const steps = [
    {
      title: "Welcome to OptionQuest!",
      icon: <Rocket className="text-blue-500" size={48} />,
      content: "Learn how to trade options with real market data, zero risk, and virtual cash. We're here to turn complex jargon into simple trading skills."
    },
    {
      title: "How it Works",
      icon: <GraduationCap className="text-purple-500" size={48} />,
      content: "Complete lessons in the Academy to earn XP and level up. High levels unlock advanced strategies and tools in the Terminal."
    },
    {
      title: "Your Mission",
      icon: <TerminalIcon className="text-emerald-500" size={48} />,
      content: "Start with Module 1 in the Academy. Once you understand the basics, head to the Terminal to place your first paper trade!",
      cta: "Start Learning"
    }
  ];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      localStorage.setItem('hasOnboarded', 'true');
      onClose();
      navigate('/academy');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative"
        >
          <button 
            onClick={() => {
              localStorage.setItem('hasOnboarded', 'true');
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>

          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              {steps[step-1].icon}
            </div>
            
            <h2 className="text-2xl font-bold mb-4 dark:text-white">{steps[step-1].title}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              {steps[step-1].content}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleNext}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
              >
                {steps[step-1].cta || "Continue"} <ArrowRight size={18} />
              </button>
              
              <div className="flex justify-center gap-2 mt-4">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all ${i + 1 === step ? 'w-8 bg-blue-500' : 'w-2 bg-slate-200 dark:bg-slate-700'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OnboardingModal;
