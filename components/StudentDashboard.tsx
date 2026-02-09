
import React, { useState } from 'react';
import { Course, Enrollment } from '../types';

interface StudentDashboardProps {
  courses: Course[];
  enrollments: Enrollment[];
  onEnroll: (courseId: string) => void;
  onViewCourse: (courseId: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ courses, enrollments, onEnroll, onViewCourse }) => {
  const [filter, setFilter] = useState<'all' | 'enrolled'>('all');

  const enrolledCourseIds = enrollments.map(e => e.courseId);
  const displayedCourses = filter === 'all' 
    ? courses 
    : courses.filter(c => enrolledCourseIds.includes(c.id));

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-100">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Scholar!</h1>
          <p className="text-blue-100 opacity-90">Continue your learning journey where you left off or explore new technologies.</p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12">
          <i className="fa-solid fa-graduation-cap text-[200px]"></i>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-fit">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-600 hover:text-blue-600'}`}
          >
            All Courses
          </button>
          <button 
            onClick={() => setFilter('enrolled')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'enrolled' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-600 hover:text-blue-600'}`}
          >
            My Learning
          </button>
        </div>
        <div className="relative">
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Search courses..."
            className="pl-11 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64 transition-all"
          />
        </div>
      </div>

      {displayedCourses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <i className="fa-solid fa-book-open text-3xl"></i>
          </div>
          <p className="text-slate-500 font-medium">No courses found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedCourses.map(course => {
            const enrollment = enrollments.find(e => e.courseId === course.id);
            const isEnrolled = !!enrollment;

            return (
              <div key={course.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col">
                <div className="relative overflow-hidden h-48">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-1 rounded uppercase tracking-widest">
                      {course.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-1">{course.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="mt-auto pt-6 border-t flex flex-col gap-4">
                    {isEnrolled ? (
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                          <span>Progress</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all duration-1000"
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                        <button 
                          onClick={() => onViewCourse(course.id)}
                          className="w-full mt-4 bg-slate-800 text-white py-2 rounded-lg font-semibold hover:bg-slate-900 transition-colors"
                        >
                          Continue Learning
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-slate-400 space-x-3">
                          <span className="flex items-center"><i className="fa-solid fa-clock mr-1"></i> 12h</span>
                          <span className="flex items-center"><i className="fa-solid fa-list mr-1"></i> {course.lessons.length} Lessons</span>
                        </div>
                        <button 
                          onClick={() => onEnroll(course.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-50 transition-all"
                        >
                          Enroll Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
