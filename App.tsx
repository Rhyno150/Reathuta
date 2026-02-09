
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, Course, Enrollment, Lesson } from './types';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import CourseDetails from './components/CourseDetails';
import { courseService } from './api';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'course'>('dashboard');

  useEffect(() => {
    const savedUser = localStorage.getItem('reathuta_user');
    const savedEnrollments = localStorage.getItem('reathuta_enrollments');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const fetchCourses = async () => {
      const data = await courseService.getCourses();
      setCourses(data);
      setIsAuthenticating(false);
    };
    fetchCourses();

    if (savedEnrollments) {
      setEnrollments(JSON.parse(savedEnrollments));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('reathuta_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('reathuta_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('reathuta_enrollments', JSON.stringify(enrollments));
  }, [enrollments]);

  const handleLogout = () => {
    setUser(null);
    setSelectedCourseId(null);
    setView('dashboard');
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    if (enrollments.some(e => e.userId === user.id && e.courseId === courseId)) return;
    
    const newEnrollment: Enrollment = {
      userId: user.id,
      courseId,
      progress: 0,
      completedLessons: [],
      quizScores: {}
    };
    
    const target = courses.find(c => c.id === courseId);
    if (target) {
      await courseService.updateCourse(courseId, { enrolledCount: target.enrolledCount + 1 });
      setEnrollments([...enrollments, newEnrollment]);
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, enrolledCount: c.enrolledCount + 1 } : c
      ));
    }
  };

  const handleViewCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setView('course');
  };

  const handleAddCourse = async (newCourse: Course) => {
    const saved = await courseService.createCourse(newCourse);
    if (saved) {
      setCourses([...courses, saved]);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    const success = await courseService.deleteCourse(id);
    if (success) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const handleAddLesson = async (courseId: string, lesson: Lesson) => {
    const target = courses.find(c => c.id === courseId);
    if (!target) return;

    const updatedLessons = [...target.lessons, lesson];
    const success = await courseService.updateCourse(courseId, { lessons: updatedLessons });
    
    if (success) {
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, lessons: updatedLessons } : c
      ));
    }
  };

  const handleDeleteLesson = async (courseId: string, lessonId: string) => {
    const target = courses.find(c => c.id === courseId);
    if (!target) return;

    const updatedLessons = target.lessons.filter(l => l.id !== lessonId);
    const success = await courseService.updateCourse(courseId, { lessons: updatedLessons });
    
    if (success) {
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, lessons: updatedLessons } : c
      ));
    }
  };

  const currentCourse = useMemo(() => 
    courses.find(c => c.id === selectedCourseId), 
    [courses, selectedCourseId]
  );

  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-slate-400 font-medium animate-pulse">Syncing with REATHUTA System...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isVerified) {
    return <Auth onAuthSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} onHome={() => setView('dashboard')} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {view === 'dashboard' ? (
          user.role === UserRole.ADMIN ? (
            <AdminDashboard 
              courses={courses} 
              onDeleteCourse={handleDeleteCourse}
              onAddCourse={handleAddCourse}
              onViewCourse={handleViewCourse}
            />
          ) : (
            <StudentDashboard 
              courses={courses} 
              enrollments={enrollments.filter(e => e.userId === user.id)}
              onEnroll={handleEnroll}
              onViewCourse={handleViewCourse}
            />
          )
        ) : (
          currentCourse && (
            <CourseDetails 
              user={user}
              course={currentCourse} 
              enrollment={enrollments.find(e => e.userId === user.id && e.courseId === currentCourse.id)}
              onBack={() => setView('dashboard')}
              onEnroll={() => handleEnroll(currentCourse.id)}
              onCompleteLesson={(lessonId, score) => {
                setEnrollments(prev => prev.map(e => {
                  if (e.userId === user.id && e.courseId === currentCourse.id) {
                    const updatedLessons = e.completedLessons.includes(lessonId) 
                      ? e.completedLessons 
                      : [...e.completedLessons, lessonId];
                    const updatedQuizScores = { ...e.quizScores };
                    if (score !== undefined) {
                       updatedQuizScores[lessonId] = Math.max(updatedQuizScores[lessonId] || 0, score);
                    }
                    const progress = currentCourse.lessons.length > 0 
                      ? Math.round((updatedLessons.length / currentCourse.lessons.length) * 100)
                      : 0;
                    return { ...e, completedLessons: updatedLessons, progress, quizScores: updatedQuizScores };
                  }
                  return e;
                }));
              }}
              onAddLesson={(lesson) => handleAddLesson(currentCourse.id, lesson)}
              onDeleteLesson={(lessonId) => handleDeleteLesson(currentCourse.id, lessonId)}
            />
          )
        )}
      </main>

      <footer className="bg-white border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-slate-500">
          <p className="font-bold text-blue-600 mb-2">REATHUTA Learning Platform</p>
          <p>© 2024 REATHUTA. Enterprise-grade Security Architecture.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
