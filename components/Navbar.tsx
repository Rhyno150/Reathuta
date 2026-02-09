
import React from 'react';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onHome: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onHome }) => {
  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={onHome}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            R
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">REATHUTA</span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-600">
              {user.role === UserRole.ADMIN ? 'Admin Panel' : 'My Learning'}
            </span>
          </div>

          <div className="flex items-center space-x-3 border-l pl-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-10 h-10 rounded-full border border-slate-200"
            />
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
