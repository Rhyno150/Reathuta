
import React, { useState, useEffect, useMemo } from 'react';
import { Course, Enrollment, Lesson, User, UserRole, Quiz, Question } from '../types';
import QuizPlayer from './QuizPlayer';

interface CourseDetailsProps {
  user: User;
  course: Course;
  enrollment?: Enrollment;
  onBack: () => void;
  onEnroll: () => void;
  onCompleteLesson: (lessonId: string, score?: number) => void;
  onAddLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ 
  user, 
  course, 
  enrollment, 
  onBack, 
  onEnroll, 
  onCompleteLesson,
  onAddLesson,
  onDeleteLesson
}) => {
  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    course.lessons.length > 0 ? course.lessons[0].id : null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({
    title: '',
    type: 'text',
    content: '',
    url: '',
  });
  
  // Quiz Editor State
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizConfig, setQuizConfig] = useState<Partial<Quiz>>({
    isGraded: true,
    passMark: 0.8,
    questions: []
  });

  // Sync active lesson if one is deleted
  useEffect(() => {
    if (activeLessonId && !course.lessons.find(l => l.id === activeLessonId)) {
        setActiveLessonId(course.lessons.length > 0 ? course.lessons[0].id : null);
    }
  }, [course.lessons, activeLessonId]);

  const activeLesson = course.lessons.find(l => l.id === activeLessonId);
  const isAdmin = user.role === UserRole.ADMIN;

  // NAVIGATION LOGIC
  const currentIndex = useMemo(() => 
    course.lessons.findIndex(l => l.id === activeLessonId), 
    [course.lessons, activeLessonId]
  );
  
  const nextLesson = useMemo(() => 
    (currentIndex !== -1 && currentIndex < course.lessons.length - 1) 
      ? course.lessons[currentIndex + 1] 
      : null,
    [course.lessons, currentIndex]
  );

  const isCurrentLessonCompleted = useMemo(() => 
    activeLessonId ? enrollment?.completedLessons.includes(activeLessonId) : false,
    [enrollment?.completedLessons, activeLessonId]
  );

  const handleNextNavigation = () => {
    if (nextLesson) {
      setActiveLessonId(nextLesson.id);
      setIsQuizMode(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveLesson = () => {
    if (!newLesson.title) {
        setError('Please enter a lesson title.');
        return;
    }
    
    let lesson: Lesson = {
      id: Date.now().toString(),
      title: newLesson.title,
      type: newLesson.type as any,
      content: newLesson.content || '',
      url: newLesson.url
    };

    if (newLesson.type === 'quiz') {
      if (!quizConfig.questions || quizConfig.questions.length === 0) {
        setError('A quiz must have at least one question.');
        return;
      }
      lesson.quiz = {
        id: Date.now().toString(),
        isGraded: !!quizConfig.isGraded,
        passMark: quizConfig.passMark || 0.8,
        questions: quizConfig.questions as Question[]
      };
    }
    
    onAddLesson(lesson);
    setShowAddModal(false);
    setError('');
    setNewLesson({ title: '', type: 'text', content: '', url: '' });
    setQuizConfig({ isGraded: true, passMark: 0.8, questions: [] });
    if (!activeLessonId) setActiveLessonId(lesson.id);
  };

  const addQuestion = () => {
    const q: Question = {
      id: Date.now().toString(),
      text: '',
      options: ['', ''],
      correctOptionIndex: 0
    };
    setQuizConfig({ ...quizConfig, questions: [...(quizConfig.questions || []), q] });
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...(quizConfig.questions || [])];
    updated[index] = { ...updated[index], ...updates };
    setQuizConfig({ ...quizConfig, questions: updated });
  };

  if (activeLesson?.type === 'quiz' && enrollment && !isAdmin && !isQuizMode) {
     return (
       <div className="animate-fadeIn">
         <QuizPlayer 
            quiz={activeLesson.quiz!} 
            lessonTitle={activeLesson.title}
            onComplete={(score, passed) => {
               if (passed) onCompleteLesson(activeLesson.id, score);
               setIsQuizMode(false);
            }}
            onCancel={() => setIsQuizMode(false)}
         />
       </div>
     );
  }

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      {/* HEADER CONTROLS */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 transition-colors group"
        >
          <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          <span className="font-medium">Back to Dashboard</span>
        </button>
        {isAdmin && (
          <div className="flex items-center space-x-3">
             <div className="hidden sm:flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full text-blue-600 text-xs font-bold uppercase tracking-wider border border-blue-100">
                <i className="fa-solid fa-screwdriver-wrench"></i>
                <span>Instructor Editor</span>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center space-x-2"
              >
                <i className="fa-solid fa-plus"></i>
                <span>Add Lesson</span>
              </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: CONTENT PLAYER */}
        <div className="lg:col-span-2 space-y-6">
          {activeLesson ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {activeLesson.type === 'video' ? (
                <div className="aspect-video bg-slate-900 flex items-center justify-center text-white relative group">
                  <div className="text-center group-hover:scale-110 transition-transform duration-500">
                    <i className="fa-solid fa-play text-6xl mb-4 text-blue-500 shadow-xl"></i>
                    <p className="text-sm font-bold text-slate-400">Video Resource Ready</p>
                    <p className="text-[10px] text-slate-500 mt-2 font-mono bg-black/30 px-3 py-1 rounded-full">{activeLesson.url}</p>
                  </div>
                </div>
              ) : activeLesson.type === 'quiz' ? (
                <div className="aspect-video bg-blue-600 flex items-center justify-center border-b border-slate-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-500 opacity-50"></div>
                  <div className="text-center p-8 relative z-10 text-white">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6 shadow-2xl">
                       <i className="fa-solid fa-file-signature text-4xl"></i>
                    </div>
                    <h2 className="text-3xl font-black">{activeLesson.quiz?.isGraded ? 'Graded Assessment' : 'Practice Quiz'}</h2>
                    <p className="text-blue-100 mt-2 text-sm font-medium">Test your knowledge of "{activeLesson.title}"</p>
                    
                    {!isAdmin && (
                      <button 
                        onClick={() => setIsQuizMode(true)}
                        className="mt-8 bg-white text-blue-600 px-10 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-2xl scale-105 active:scale-95"
                      >
                        Start Assessment
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-slate-50 flex items-center justify-center border-b border-slate-100">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                       <i className={`fa-solid ${activeLesson.type === 'pdf' ? 'fa-file-pdf' : 'fa-file-lines'} text-4xl`}></i>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">
                      {activeLesson.type === 'pdf' ? 'Interactive PDF Document' : 'Knowledge Module'}
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm">Review the provided content and resources below.</p>
                  </div>
                </div>
              )}
              
              <div className="p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded mb-2 inline-block">Lesson {currentIndex + 1}</span>
                    <h1 className="text-2xl font-bold text-slate-800 leading-tight">{activeLesson.title}</h1>
                  </div>
                  {enrollment && activeLesson.type !== 'quiz' && (
                    <button 
                      onClick={() => onCompleteLesson(activeLesson.id)}
                      disabled={isCurrentLessonCompleted}
                      className={`px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                        isCurrentLessonCompleted
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                      }`}
                    >
                      <i className={`fa-solid ${isCurrentLessonCompleted ? 'fa-check-circle' : 'fa-circle-check'}`}></i>
                      <span>{isCurrentLessonCompleted ? 'Completed' : 'Complete Lesson'}</span>
                    </button>
                  )}
                </div>
                
                <div className="prose prose-slate max-w-none">
                  <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-base">
                    {activeLesson.content}
                  </div>
                  {activeLesson.url && (
                    <div className="mt-8 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-500">
                           <i className="fa-solid fa-link"></i>
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-800">External Resource Attached</p>
                           <p className="text-xs text-slate-400 truncate max-w-[200px]">{activeLesson.url}</p>
                        </div>
                      </div>
                      <a href={activeLesson.url} target="_blank" rel="noreferrer" className="w-full sm:w-auto text-center text-xs bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all">
                        Launch Resource
                      </a>
                    </div>
                  )}
                </div>

                {/* DYNAMIC NEXT ITEM BUTTON */}
                {isCurrentLessonCompleted && !isAdmin && (
                  <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end animate-fadeIn">
                    {nextLesson ? (
                      <button 
                        onClick={handleNextNavigation}
                        className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black flex items-center space-x-3 hover:bg-slate-900 shadow-2xl shadow-slate-200 transition-all hover:translate-x-1 active:scale-95 group"
                      >
                        <span>Continue to {nextLesson.type === 'quiz' ? 'Assessment' : 'Next Module'}</span>
                        <i className="fa-solid fa-arrow-right text-blue-400 group-hover:translate-x-1 transition-transform"></i>
                      </button>
                    ) : (
                      <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center justify-between w-full">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <i className="fa-solid fa-trophy"></i>
                          </div>
                          <div>
                            <p className="font-bold text-green-800">Curriculum Completed!</p>
                            <p className="text-xs text-green-600 font-medium">You have mastered all modules in this course.</p>
                          </div>
                        </div>
                        <button onClick={onBack} className="text-sm font-black text-green-700 uppercase tracking-widest hover:underline">Exit Course</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-book-open text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Empty Knowledge Base</h3>
              <p className="text-slate-500 mt-2 max-w-sm">
                {isAdmin ? 'Your course is ready for content. Add your first lesson to begin teaching your students.' : 'The instructor is currently preparing materials for this course. Please check back soon.'}
              </p>
              {isAdmin && (
                <button 
                   onClick={() => setShowAddModal(true)}
                   className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center space-x-2"
                >
                    <i className="fa-solid fa-plus-circle"></i>
                    <span>Add First Lesson</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: CURRICULUM SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-fit">
            <div className="p-6 border-b bg-slate-50/50">
               <h2 className="text-lg font-bold text-slate-800 flex items-center">
                 <i className="fa-solid fa-list-ul mr-2 text-blue-600"></i>
                 Course Curriculum
               </h2>
               {enrollment && (
                 <div className="mt-3">
                   <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                     <span>Your Progress</span>
                     <span>{enrollment.progress}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${enrollment.progress}%` }}></div>
                   </div>
                 </div>
               )}
            </div>

            <div className="p-2 space-y-1 max-h-[600px] overflow-y-auto custom-scrollbar">
              {course.lessons.map((lesson, idx) => {
                const isCompleted = enrollment?.completedLessons.includes(lesson.id);
                const isActive = activeLessonId === lesson.id;
                const canAccess = isAdmin || enrollment || idx === 0;
                const bestScore = enrollment?.quizScores?.[lesson.id];

                return (
                  <div key={lesson.id} className="group relative">
                    <button 
                      onClick={() => {
                        setActiveLessonId(lesson.id);
                        setIsQuizMode(false);
                      }}
                      disabled={!canAccess}
                      className={`w-full text-left p-4 rounded-xl flex items-center space-x-3 transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02] z-10' 
                          : 'hover:bg-slate-50 text-slate-600'
                      } ${!canAccess ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                        isActive ? 'bg-blue-500 border-blue-400 text-white' : 
                        isCompleted ? 'bg-green-100 border-green-200 text-green-600' : 
                        'bg-white border-slate-200 text-slate-400'
                      }`}>
                        {isCompleted ? <i className="fa-solid fa-check text-xs"></i> : <span className="text-xs font-bold">{idx + 1}</span>}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-700'}`}>{lesson.title}</p>
                        <div className={`flex items-center space-x-2 text-[9px] uppercase font-bold tracking-widest opacity-60`}>
                          <i className={`fa-solid ${lesson.type === 'video' ? 'fa-play' : lesson.type === 'quiz' ? 'fa-file-signature' : 'fa-file-lines'}`}></i>
                          <span>{lesson.type}</span>
                          {bestScore !== undefined && <span>• {bestScore}% Score</span>}
                        </div>
                      </div>
                      {!canAccess && <i className="fa-solid fa-lock text-slate-300"></i>}
                    </button>
                    
                    {isAdmin && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this lesson?')) {
                            onDeleteLesson(lesson.id);
                          }
                        }}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-all ${isActive ? 'text-blue-200 hover:text-white' : 'text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100'}`}
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ADD LESSON MODAL */}
      {isAdmin && showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-modalOverlay" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-slideDown flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
               <div>
                 <h2 className="text-xl font-bold text-slate-800">Compose New Lesson</h2>
                 <p className="text-xs text-slate-500 font-medium">Add structured lessons or secure assessments.</p>
               </div>
               <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><i className="fa-solid fa-xmark text-lg"></i></button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lesson Title</label>
                  <input 
                    type="text" 
                    value={newLesson.title}
                    onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Security Principles"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Content Type</label>
                  <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                    {['text', 'video', 'pdf', 'quiz'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewLesson({...newLesson, type: type as any})}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all uppercase ${newLesson.type === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {newLesson.type === 'quiz' ? (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div>
                       <p className="text-sm font-bold text-blue-800">Secure Assessment Config</p>
                       <p className="text-[10px] text-blue-500 font-medium">80% Pass Mark required for Graded Quiz</p>
                    </div>
                    <div className="flex items-center space-x-3">
                       <label className="flex items-center space-x-2 cursor-pointer">
                         <input 
                           type="checkbox" 
                           checked={quizConfig.isGraded} 
                           onChange={e => setQuizConfig({...quizConfig, isGraded: e.target.checked})}
                           className="w-4 h-4 rounded text-blue-600"
                         />
                         <span className="text-xs font-bold text-slate-600 uppercase">Graded</span>
                       </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {quizConfig.questions?.map((q, idx) => (
                      <div key={q.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative group">
                        <button 
                          onClick={() => setQuizConfig({...quizConfig, questions: quizConfig.questions?.filter((_, i) => i !== idx)})}
                          className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <i className="fa-solid fa-trash-can text-sm"></i>
                        </button>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question {idx + 1}</label>
                           <input 
                             type="text" 
                             value={q.text} 
                             onChange={e => updateQuestion(idx, { text: e.target.value })}
                             className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                             placeholder="Write your question here..."
                           />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center space-x-2">
                               <input 
                                 type="radio" 
                                 name={`correct-${q.id}`} 
                                 checked={q.correctOptionIndex === oIdx}
                                 onChange={() => updateQuestion(idx, { correctOptionIndex: oIdx })}
                               />
                               <input 
                                 type="text" 
                                 value={opt} 
                                 onChange={e => {
                                   const newOpts = [...q.options];
                                   newOpts[oIdx] = e.target.value;
                                   updateQuestion(idx, { options: newOpts });
                                 }}
                                 className="flex-1 px-3 py-1 text-sm border border-slate-200 rounded-lg outline-none"
                                 placeholder={`Option ${oIdx + 1}`}
                               />
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={() => {
                            const newOpts = [...q.options, ''];
                            updateQuestion(idx, { options: newOpts });
                          }}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          + Add Option
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={addQuestion}
                      className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold hover:border-blue-400 hover:text-blue-500 transition-all"
                    >
                      + Add Question
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {newLesson.type !== 'text' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resource URL</label>
                      <input 
                        type="url" 
                        value={newLesson.url}
                        onChange={e => setNewLesson({...newLesson, url: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lesson Content</label>
                    <textarea 
                      value={newLesson.content}
                      onChange={e => setNewLesson({...newLesson, content: e.target.value})}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[250px] resize-none"
                      placeholder="Enter detailed content or transcript..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t flex gap-4">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 border-2 border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-white transition-all">Cancel</button>
              <button onClick={handleSaveLesson} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center space-x-2">
                <i className="fa-solid fa-save"></i>
                <span>Publish Lesson</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
