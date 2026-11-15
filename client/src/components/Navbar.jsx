import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold text-emerald-600">SplitRx</Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
              <Link to="/scan" className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">Scan Prescription</Link>
              <Link to="/optimize" className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">Dose Optimizer</Link>
              <Link to="/vault" className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">Donation Vault</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Hello, {user.name}</span>
            <button 
              onClick={handleLogout}
              className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}