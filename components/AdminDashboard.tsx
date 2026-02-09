
import React, { useState } from 'react';
import { Course, Lesson } from '../types';

interface AdminDashboardProps {
  courses: Course[];
  onDeleteCourse: (id: string) => void;
  onAddCourse: (course: Course) => void;
  onViewCourse: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ courses, onDeleteCourse, onAddCourse, onViewCourse }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: '',
    description: '',
    category: 'Software Engineering',
    lessons: []
  });

  const handleAdd = () => {
    if (!newCourse.title) {
      setError('Please provide a course title.');
      return;
    }
    const course: Course = {
      id: Date.now().toString(),
      title: newCourse.title || 'Untitled',
      description: newCourse.description || '',
      instructor: 'Admin User',
      category: newCourse.category || 'General',
      thumbnail: `https://picsum.photos/seed/${Date.now()}/600/400`,
      enrolledCount: 0,
      lessons: []
    };
    onAddCourse(course);
    setShowAddModal(false);
    setError('');
    setNewCourse({ title: '', description: '', category: 'Software Engineering', lessons: [] });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Course Management</h1>
          <p className="text-slate-500">Manage your catalog and track student interest.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-md shadow-blue-100 flex items-center space-x-2 transition-all"
        >
          <i className="fa-solid fa-plus"></i>
          <span>Create Course</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
            <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
                  {course.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center">
                  <i className="fa-solid fa-users mr-1"></i> {course.enrolledCount}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 mb-2 line-clamp-1">{course.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-4">{course.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <button 
                  onClick={() => onViewCourse(course.id)}
                  className="text-blue-600 text-sm font-semibold hover:underline"
                >
                  Edit Content
                </button>
                <button 
                  onClick={() => onDeleteCourse(course.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-100 animate-slideDown">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Create New Course</h2>
            {error && <p className="mb-4 text-xs text-red-500 bg-red-50 p-2 rounded">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
                <input 
                  type="text" 
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="e.g. Advanced Networking"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                   value={newCourse.description}
                   onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24" 
                  placeholder="Briefly describe what students will learn..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                   value={newCourse.category}
                   onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>Software Engineering</option>
                  <option>IT & Infrastructure</option>
                  <option>Data Science</option>
                  <option>Business</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-8">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleAdd}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
