import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';

const OverviewSection = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/v1/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data) {
          setDashboardData(response.data.data || response.data);
        } else {
          setError(response.data.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-blue-400/30 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-white rounded w-16"></div>
                </div>
                <div className="p-3 bg-blue-500/30 rounded-full">
                  <div className="w-6 h-6 bg-blue-400/30 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-yellow-400/30 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-white rounded w-16"></div>
                </div>
                <div className="p-3 bg-yellow-500/30 rounded-full">
                  <div className="w-6 h-6 bg-yellow-400/30 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-green-400/30 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-white rounded w-16"></div>
                </div>
                <div className="p-3 bg-green-500/30 rounded-full">
                  <div className="w-6 h-6 bg-green-400/30 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
          <div className="text-red-400 text-center py-8">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
          <div className="text-gray-400 text-center py-8">
            No dashboard data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Overview Cards */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Users */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{dashboardData.users?.total || 0}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Students: {dashboardData.users?.byRole?.student || 0} • Admins: {dashboardData.users?.byRole?.admin || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-500/30 rounded-full">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm">Pending Payments</p>
                <p className="text-2xl font-bold text-white">{dashboardData.paymentTransactions?.byStatus?.pending || 0}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Total: {dashboardData.paymentTransactions?.total || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-500/30 rounded-full">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm">System Status</p>
                <p className="text-2xl font-bold text-white">Active</p>
                <p className="text-xs text-gray-400 mt-1">
                  Books: {dashboardData.books?.total || 0} • Units: {dashboardData.units?.total || 0}
                </p>
              </div>
              <div className="p-3 bg-green-500/30 rounded-full">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Grid */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Detailed Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Books by Grade Level */}
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 text-sm font-medium mb-3">Books by Grade</h4>
            <div className="space-y-2">
              {Object.entries(dashboardData.books?.byGradeLevel || {}).map(([grade, count]) => (
                <div key={grade} className="flex justify-between text-white text-sm">
                  <span>{grade}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Total Books</span>
                <span>{dashboardData.books?.total || 0}</span>
              </div>
            </div>
          </div>

          {/* Content Statistics */}
          <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-lg p-4">
            <h4 className="text-indigo-400 text-sm font-medium mb-3">Content Overview</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-white text-sm">
                <span>Units</span>
                <span className="font-bold">{dashboardData.units?.total || 0}</span>
              </div>
              <div className="flex justify-between text-white text-sm">
                <span>Sections</span>
                <span className="font-bold">{dashboardData.sections?.total || 0}</span>
              </div>
              <div className="flex justify-between text-white text-sm">
                <span>Quizzes</span>
                <span className="font-bold">{dashboardData.quizzes?.total || 0}</span>
              </div>
              <div className="flex justify-between text-white text-sm">
                <span>References</span>
                <span className="font-bold">{dashboardData.references?.total || 0}</span>
              </div>
            </div>
          </div>

          {/* Student Progress */}
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 text-sm font-medium mb-3">Student Progress</h4>
            <div className="space-y-2">
              {Object.entries(dashboardData.studentProgress?.byStatus || {}).map(([status, count]) => (
                <div key={status} className="flex justify-between text-white text-sm">
                  <span className="capitalize">{status.replace('_', ' ')}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Total Progress</span>
                <span>{dashboardData.studentProgress?.total || 0}</span>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-teal-500/20 border border-teal-500/30 rounded-lg p-4">
            <h4 className="text-teal-400 text-sm font-medium mb-3">Resources</h4>
            <div className="space-y-2">
              {Object.entries(dashboardData.resources?.byType || {}).map(([type, count]) => (
                <div key={type} className="flex justify-between text-white text-sm">
                  <span className="capitalize">{type}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Total Resources</span>
                <span>{dashboardData.resources?.total || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Enhanced Sections */}
      
      {/* Payment Transactions Section */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Transactions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Transaction Status Breakdown */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-lg p-4">
            <h4 className="text-emerald-400 text-sm font-medium mb-3">Transaction Status</h4>
            <div className="space-y-2">
              {Object.entries(dashboardData.paymentTransactions?.byStatus || {}).map(([status, count]) => (
                <div key={status} className="flex justify-between text-white text-sm">
                  <span className="capitalize">{status}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Account Info */}
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 text-sm font-medium mb-3">Payment Account</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Account Number:</span>
                <span className="text-white font-mono">{dashboardData.paymentAccounts?.accountNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Account Holder:</span>
                <span className="text-white">{dashboardData.paymentAccounts?.accountHolder || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Bank:</span>
                <span className="text-white">{dashboardData.paymentAccounts?.bankName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  dashboardData.paymentAccounts?.isActive 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {dashboardData.paymentAccounts?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Pending Transaction */}
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-4">
            <h4 className="text-amber-400 text-sm font-medium mb-3">Recent Pending Transaction</h4>
            {dashboardData.paymentTransactions?.recentPending ? (
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="text-white font-mono">{dashboardData.paymentTransactions.recentPending.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Student:</span>
                  <span className="text-white">{dashboardData.paymentTransactions.recentPending.studentId?.username || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="text-white">{dashboardData.paymentTransactions.recentPending.planId?.planName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="text-white font-bold">ETB {dashboardData.paymentTransactions.recentPending.paidAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="text-white text-xs">
                    {new Date(dashboardData.paymentTransactions.recentPending.paymentDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">No recent pending transactions</div>
            )}
          </div>
        </div>
      </div>

      {/* Premium Plans Section */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Premium Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardData.premiumPlans?.plans?.map((plan) => (
            <div key={plan._id} className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-purple-400 text-sm font-medium">{plan.planName}</h4>
                  <p className="text-white text-sm mt-1">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">ETB {plan.amount}</div>
                  <div className="text-xs text-gray-400">{plan.durationDays} days</div>
                </div>
              </div>
              <div className="border-t border-white/20 pt-3">
                <h5 className="text-purple-400 text-xs font-medium mb-2">Features:</h5>
                <ul className="space-y-1 text-xs text-gray-300">
                  {plan.features?.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-3 h-3 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Metrics Section */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Additional Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Chat Sessions */}
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 text-sm font-medium mb-3">Chat Sessions</h4>
            <div className="text-2xl font-bold text-white mb-2">{dashboardData.chatSessions?.total || 0}</div>
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Interaction:</span>
                <span>{dashboardData.chatSessions?.byType?.interaction || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Quiz:</span>
                <span>{dashboardData.chatSessions?.byType?.quiz || 0}</span>
              </div>
            </div>
          </div>

          {/* Interactions */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 text-sm font-medium mb-3">Total Interactions</h4>
            <div className="text-2xl font-bold text-white">{dashboardData.interactions?.total || 0}</div>
            <div className="text-xs text-gray-400 mt-2">AI-powered learning interactions</div>
          </div>

          {/* Content Breakdown */}
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 text-sm font-medium mb-3">Content Breakdown</h4>
            <div className="space-y-1 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Books:</span>
                <span className="text-white font-bold">{dashboardData.books?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Units:</span>
                <span className="text-white font-bold">{dashboardData.units?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Sections:</span>
                <span className="text-white font-bold">{dashboardData.sections?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Quizzes:</span>
                <span className="text-white font-bold">{dashboardData.quizzes?.total || 0}</span>
              </div>
            </div>
          </div>

          {/* Resources Breakdown */}
          <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 rounded-lg p-4">
            <h4 className="text-teal-400 text-sm font-medium mb-3">Resources Breakdown</h4>
            <div className="space-y-1 text-sm text-gray-300">
              {Object.entries(dashboardData.resources?.byType || {}).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="capitalize">{type}:</span>
                  <span className="text-white font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;