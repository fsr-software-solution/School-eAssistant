import React from 'react';
import { useAuth } from '../hooks/useAuth';

function PendingPage() {
  const { user, isLoading, handleLogout } = useAuth();

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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Pending Access
              </h1>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-sm">
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user?.role === 'admin' ? (
          /* Admin View - Pending Requests */
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-2">Pending User Approvals</h2>
              <p className="text-gray-400 mb-6">Review and approve pending user requests</p>
              
              <div className="space-y-4">
                {/* Pending User Card Example */}
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-semibold">John Doe</h3>
                      <p className="text-gray-400 text-sm">johndoe@example.com</p>
                      <p className="text-gray-500 text-xs mt-1">Requested: 2 hours ago</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors">
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>

                {/* Empty State */}
                <div className="text-center py-8 text-gray-400">
                  No pending requests at this time.
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Student View - Pending Status */
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 text-center">
              <div className="w-16 h-16 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Access Pending</h2>
              <p className="text-gray-400 mb-6 text-lg">
                Your account is currently pending approval by an administrator.
              </p>
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <p className="text-gray-300 mb-2">What happens next:</p>
                <ul className="text-gray-400 text-left space-y-1">
                  <li>• An administrator will review your request</li>
                  <li>• Administrator will approved your account</li>
                  <li>• You can then access the full dashboard</li>
                </ul>
              </div>
              <div className="mt-6 text-sm text-gray-500">
                If you believe this is an error, please contact your administrator.
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div>
                  <span className="text-gray-500">Username:</span>
                  <span className="ml-2">{user?.username}</span>
                </div>
                <div>
                  <span className="text-gray-500">Role:</span>
                  <span className="ml-2">{user?.role}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-sm">
                    Pending Approval
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Joined:</span>
                  <span className="ml-2">{new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PendingPage;