import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { lessons } from '../utils/lessons';
import useStore from '../store/useStore';
import { CheckCircle, Lock, PlayCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Academy = () => {
  const { user, completedLessons, completeLesson, theme, plainEnglishEnabled, setActiveQuest } = useStore();
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();

  const handleComplete = () => {
    if (quizAnswer === selectedLesson.quiz.answer) {
      completeLesson(selectedLesson.id, selectedLesson.xp);
      setShowFeedback(true);
      toast.success(`Lesson Complete! +${selectedLesson.xp} XP`);
      // Don't auto-close, let user see feedback and practical action
    } else {
      toast.error("That's not quite right. Review the lesson and try again!");
    }
  };

  const startPracticalAction = () => {
    if (selectedLesson.practicalAction) {
      setActiveQuest(selectedLesson.quest || { title: selectedLesson.title, instruction: selectedLesson.practicalAction.label });
      navigate(selectedLesson.practicalAction.path + (selectedLesson.practicalAction.search || ''));
      setSelectedLesson(null);
    }
  };

  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson);
    if (lesson.quest) {
      setActiveQuest(lesson.quest);
    }
  };

  const completionPercentage = Math.round((completedLessons.length / lessons.length) * 100);

  return (
    <div className="max-w-4xl mx-auto w-full min-w-0">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Academy</h2>
          <p className="text-slate-500">Master the art of options, one level at a time.</p>
        </div>
        <div className={`p-4 rounded-xl border flex items-center gap-4 ${theme === 'classroom' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
           <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Your Progress</p>
              <p className="text-lg font-bold">{completionPercentage}% Complete</p>
           </div>
           <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
           </div>
        </div>
      </header>

      {selectedLesson ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 rounded-2xl shadow-xl ${
            theme === 'classroom' ? 'bg-white' : 'bg-slate-800 border border-slate-700'
          }`}
        >
          <button 
            onClick={() => setSelectedLesson(null)}
            className="mb-4 text-sm font-semibold text-blue-500 hover:underline"
          >
            &larr; Back to Map
          </button>
          
          <h3 className="text-2xl font-bold mb-4">{selectedLesson.title}</h3>
          <div className={`p-6 rounded-xl mb-8 border break-words prose max-w-none [&_h3]:text-lg [&_h3]:font-bold [&_p]:mb-3 [&_strong]:font-semibold ${
            theme === 'classroom'
              ? 'bg-slate-50 border-slate-200 [&_h3]:text-slate-800 [&_p]:text-slate-600 [&_strong]:text-slate-800'
              : 'bg-slate-900 border-slate-700 [&_h3]:text-slate-200 [&_p]:text-slate-300 [&_strong]:text-slate-200'
          }`}>
            <ReactMarkdown>
              {selectedLesson.content
                .trim()
                .split('\n')
                .map((line) => line.replace(/^\s+/, ''))
                .join('\n')}
            </ReactMarkdown>
          </div>

          <div className={`p-6 rounded-xl border break-words ${
            theme === 'classroom' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700'
          }`}>
            <h4 className="font-bold mb-4">
              Quiz: {plainEnglishEnabled && selectedLesson.quiz.friendlyQuestion ? selectedLesson.quiz.friendlyQuestion : selectedLesson.quiz.question}
            </h4>
            <div className="space-y-2">
              {selectedLesson.quiz.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuizAnswer(idx)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    quizAnswer === idx 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  {opt.split(' ').map(word => {
                    const cleanWord = word.replace(/[?.,]/g, '');
                    const translated = translate(cleanWord, plainEnglishEnabled);
                    return translated !== cleanWord ? translated : word;
                  }).join(' ')}
                </button>
              ))}
            </div>
            <button
              onClick={handleComplete}
              disabled={quizAnswer === null || showFeedback}
              className={`mt-6 w-full py-3 rounded-xl font-bold text-white transition-all ${
                quizAnswer !== null && !showFeedback ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-400'
              }`}
            >
              {showFeedback ? 'COMPLETED' : 'Submit Answer'}
            </button>
          </div>

          <AnimatePresence>
            {showFeedback && selectedLesson.practicalAction && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6"
              >
                <div className={`p-6 rounded-2xl flex items-center justify-between gap-4 ${
                  theme === 'classroom' ? 'bg-emerald-50 text-emerald-900' : 'bg-emerald-900/10 text-emerald-200'
                }`}>
                  <div>
                    <h4 className="font-bold">Next Step: Practice</h4>
                    <p className="text-sm opacity-80">{selectedLesson.practicalAction.label}</p>
                  </div>
                  <button
                    onClick={startPracticalAction}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all whitespace-nowrap shadow-lg shadow-emerald-500/20"
                  >
                    Go to {selectedLesson.practicalAction.path.replace('/', '').toUpperCase()}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedLesson.quest && !showFeedback && (
            <div className={`mt-6 p-6 rounded-xl border border-dashed ${
              theme === 'classroom' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-900/10 border-amber-500/30 text-amber-200'
            }`}>
              <h4 className="font-bold flex items-center gap-2 mb-2">
                <Zap size={18} className="text-amber-500" /> Active Quest: {selectedLesson.quest.title}
              </h4>
              <p className="text-sm opacity-80">{selectedLesson.quest.instruction}</p>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isLocked = index > 0 && !completedLessons.includes(lessons[index-1].id);

            return (
              <div
                key={lesson.id}
                onClick={() => !isLocked && handleSelectLesson(lesson)}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  isCompleted 
                    ? 'border-emerald-500 bg-emerald-50/10' 
                    : isLocked 
                      ? 'border-slate-200 opacity-50 cursor-not-allowed' 
                      : 'border-blue-500 hover:shadow-lg'
                } ${theme === 'classroom' ? 'bg-white' : 'bg-slate-800'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    lesson.difficulty === 'Novice' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {lesson.difficulty}
                  </span>
                  {isCompleted ? <CheckCircle className="text-emerald-500" /> : isLocked ? <Lock /> : <PlayCircle className="text-blue-500" />}
                </div>
                <h3 className="text-xl font-bold mb-1">{lesson.title}</h3>
                <p className="text-sm text-slate-500">{lesson.xp} XP • {isCompleted ? 'Completed' : 'Ready'}</p>
                
                {isCompleted && (
                  <div className="absolute top-0 right-0 p-2">
                    <div className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">DONE</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl text-center">
              <h2 className="text-3xl font-bold">LEVEL UP!</h2>
              <p>Lesson Complete +XP</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Academy;
