import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import OverviewSection from '../components/admin/OverviewSection';
import UsersSection from '../components/admin/UsersSection';
import BooksSection from '../components/admin/BooksSection';
import PaymentsSection from '../components/admin/PaymentsSection';
import TrashSection from '../components/admin/TrashSection';

function DashboardPage() {
  const { user, isLoading, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      navigate('/login')
    }
    else if (user?.role !== 'admin') {
      navigate('/pending');
    }
  }, [isLoading, navigate, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm">
                {user?.role.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-6">
          <div className="grid grid-cols-5 gap-4">
            <button 
              onClick={() => setActiveSection('overview')}
              className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                activeSection === 'overview' 
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30' 
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveSection('users')}
              className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                activeSection === 'users' 
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30' 
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              Users
            </button>
            <button 
              onClick={() => setActiveSection('books')}
              className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                activeSection === 'books' 
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30' 
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              Books
            </button>
            <button 
              onClick={() => setActiveSection('payments')}
              className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                activeSection === 'payments' 
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30' 
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              Payments
            </button>
            <button 
              onClick={() => setActiveSection('trash')}
              className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                activeSection === 'trash' 
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30' 
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              Trash
            </button>
          </div>
        </div>

        {/* Section Content */}
        {activeSection === 'overview' && <OverviewSection />}
        {activeSection === 'users' && <UsersSection />}
        {activeSection === 'books' && <BooksSection />}
        {activeSection === 'payments' && <PaymentsSection />}
        {activeSection === 'trash' && <TrashSection />}
      </main>
    </div>
  );
}

export default DashboardPage;