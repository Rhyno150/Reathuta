
import React, { useState, useEffect, useCallback } from 'react';
import { Quiz, Question } from '../types';

interface QuizPlayerProps {
  quiz: Quiz;
  lessonTitle: string;
  onComplete: (score: number, passed: boolean) => void;
  onCancel: () => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, lessonTitle, onComplete, onCancel }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // Anti-Cheat: Focus Monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setWarnings(prev => prev + 1);
        setShowWarning(true);
      }
    };

    const handleBlur = () => {
      if (!isSubmitted) {
        setWarnings(prev => prev + 1);
        setShowWarning(true);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isSubmitted]);

  // Anti-Cheat: Interaction Blocking
  // Fix: Changed React.UIEvent to React.SyntheticEvent to resolve type incompatibility with ClipboardEvent and MouseEvent handlers
  const blockInteraction = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
  }, []);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleSelect = (optionIndex: number) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [currentQuestion.id]: optionIndex });
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctOptionIndex) {
        correct++;
      }
    });
    return (correct / quiz.questions.length);
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setIsSubmitted(true);
  };

  const finalize = () => {
    const score = calculateScore();
    const passed = score >= quiz.passMark;
    onComplete(Math.round(score * 100), passed);
  };

  if (isSubmitted) {
    const scorePercentage = Math.round(calculateScore() * 100);
    const passed = scorePercentage >= (quiz.passMark * 100);

    return (
      <div className="bg-white rounded-3xl p-10 max-w-2xl mx-auto shadow-2xl border border-slate-100 animate-fadeIn">
        <div className="text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            <i className={`fa-solid ${passed ? 'fa-check-double' : 'fa-circle-xmark'} text-4xl`}></i>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {passed ? 'Assessment Passed!' : 'Try Again'}
          </h2>
          <p className="text-slate-500 mb-8">
            {passed 
              ? `Congratulations! You've mastered this module with an outstanding performance.` 
              : `You scored ${scorePercentage}%. A minimum of ${quiz.passMark * 100}% is required to pass.`}
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Your Grade</span>
              <span className={`text-2xl font-black ${passed ? 'text-green-600' : 'text-red-600'}`}>{scorePercentage}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${passed ? 'bg-green-500' : 'bg-red-500'}`} 
                style={{ width: `${scorePercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex gap-4">
            {!passed && (
              <button 
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                }}
                className="flex-1 py-4 border-2 border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
              >
                Retake Assessment
              </button>
            )}
            <button 
              onClick={finalize}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100"
            >
              {passed ? 'Continue to Next Lesson' : 'Review Curriculum'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="max-w-4xl mx-auto select-none"
      onContextMenu={blockInteraction}
      onCopy={blockInteraction}
      onCut={blockInteraction}
      onPaste={blockInteraction}
    >
      {/* SHIELD NOTIFICATION */}
      {showWarning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md animate-slideDown">
          <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center space-x-4">
            <i className="fa-solid fa-triangle-exclamation text-2xl animate-pulse"></i>
            <div>
              <p className="font-bold">Security Violation Detected</p>
              <p className="text-xs opacity-90">Leaving the assessment window is forbidden. Violations: {warnings}</p>
            </div>
            <button onClick={() => setShowWarning(false)} className="ml-auto opacity-70 hover:opacity-100"><i className="fa-solid fa-xmark"></i></button>
          </div>
        </div>
      )}

      {/* QUIZ CONTENT */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* SIDEBAR STATUS */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-6">
          <div className="mb-8">
             <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Current Task</span>
             <h3 className="font-bold text-slate-800 leading-tight">{lessonTitle}</h3>
          </div>
          
          <div className="space-y-3">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
             <div className="flex flex-wrap gap-2">
               {quiz.questions.map((_, i) => (
                 <div 
                   key={i} 
                   className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${
                     currentQuestionIndex === i ? 'border-blue-600 bg-blue-50 text-blue-600' :
                     answers[quiz.questions[i].id] !== undefined ? 'border-slate-300 bg-slate-100 text-slate-500' :
                     'border-slate-100 text-slate-300'
                   }`}
                 >
                   {i + 1}
                 </div>
               ))}
             </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-200">
             <div className="flex items-center space-x-2 text-slate-400 text-xs mb-4">
               <i className="fa-solid fa-shield-halved"></i>
               <span>Secure Mode Active</span>
             </div>
             <button onClick={onCancel} className="text-slate-400 hover:text-red-500 text-xs font-bold transition-colors">Quit Assessment</button>
          </div>
        </div>

        {/* MAIN QUESTION AREA */}
        <div className="flex-1 p-8 md:p-12">
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">
              {currentQuestion.text}
            </h2>
            
            <div className="space-y-4">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center group ${
                    answers[currentQuestion.id] === idx 
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-50' 
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 mr-4 flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                    answers[currentQuestion.id] === idx ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-300 group-hover:border-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={`font-medium ${answers[currentQuestion.id] === idx ? 'text-blue-900' : 'text-slate-600'}`}>
                    {option}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-slate-100">
             <button
               onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
               disabled={currentQuestionIndex === 0}
               className="px-6 py-2 rounded-xl text-slate-400 font-bold hover:text-slate-600 disabled:opacity-0 transition-all"
             >
               <i className="fa-solid fa-chevron-left mr-2"></i> Previous
             </button>

             {isLastQuestion ? (
               <button
                 onClick={handleSubmit}
                 className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all scale-105"
               >
                 Submit Assessment
               </button>
             ) : (
               <button
                 onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                 className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all flex items-center"
               >
                 Next Question <i className="fa-solid fa-chevron-right ml-2"></i>
               </button>
             )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center text-slate-400 text-[10px] uppercase font-bold tracking-[0.3em]">
         <i className="fa-solid fa-lock mr-2"></i>
         End-to-End Encrypted Session
      </div>
    </div>
  );
};

export default QuizPlayer;
