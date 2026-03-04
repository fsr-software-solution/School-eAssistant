import React, { useState, useEffect } from 'react';
import api from '../../constants';

const PaymentsSection = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Account state
  const [account, setAccount] = useState(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountForm, setAccountForm] = useState({
    accountNumber: '',
    accountHolderFullName: '',
    bankName: ''
  });
  
  // Plans state
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [planForm, setPlanForm] = useState({
    planName: '',
    description: '',
    amount: '',
    durationDays: '',
    features: ''
  });
  const [editingPlan, setEditingPlan] = useState(null);
  const [viewingPlan, setViewingPlan] = useState(null);
  const [viewingAccount, setViewingAccount] = useState(null);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Payment status update state
  const [updatingStatus, setUpdatingStatus] = useState({});

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/admin/payments');
      if (response.data.success) {
        setPayments(response.data.data);
      } else {
        console.error('Failed to fetch payments');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch account
  const fetchAccount = async () => {
    try {
      setAccountLoading(true);
      const response = await api.get('/api/v1/admin/account');
      if (response.data.data) {
        setAccount(response.data.data);
        setAccountForm({
          accountNumber: response.data.data.accountNumber,
          accountHolderFullName: response.data.data.accountHolderFullName,
          bankName: response.data.data.bankName
        });
      }
    } catch (err) {
      console.error('Error fetching account:', err);
    } finally {
      setAccountLoading(false);
    }
  };

  // Update account
  const updateAccount = async () => {
    try {
      setAccountLoading(true);
      const response = await api.put('/api/v1/admin/account', accountForm);
      if (response.data.data) {
        setAccount(response.data.data);
        alert('Account updated successfully');
      }
    } catch (err) {
      console.error('Error updating account:', err);
      alert('Failed to update account');
    } finally {
      setAccountLoading(false);
    }
  };

  // Fetch plans
  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const response = await api.get('/api/v1/admin/plans');
      if (response.data.success) {
        setPlans(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setPlansLoading(false);
    }
  };

  // Create plan
  const createPlan = async () => {
    try {
      setPlansLoading(true);
      const features = planForm.features.split(',').map(f => f.trim());
      const response = await api.post('/api/v1/admin/plans', {
        planName: planForm.planName,
        description: planForm.description,
        amount: parseFloat(planForm.amount),
        durationDays: parseInt(planForm.durationDays),
        features
      });
      if (response.data.data) {
        setPlans(prev => [...prev, response.data.data]);
        setPlanForm({
          planName: '',
          description: '',
          amount: '',
          durationDays: '',
          features: ''
        });
        alert('Plan created successfully');
        setShowCreateModal(false)
      }
    } catch (err) {
      console.error('Error creating plan:', err);
      alert('Failed to create plan');
    } finally {
      setPlansLoading(false);
    }
  };

  // Update plan
  const updatePlan = async (planId) => {
    try {
      setPlansLoading(true);
      const features = planForm.features.split(',').map(f => f.trim());
      const response = await api.put(`/api/v1/admin/plans/${planId}`, {
        planName: planForm.planName,
        description: planForm.description,
        amount: parseFloat(planForm.amount),
        durationDays: parseInt(planForm.durationDays),
        features
      });
      if (response.data.data) {
        setPlans(prev => prev.map(plan => 
          plan._id === planId ? response.data.data : plan
        ));
        setEditingPlan(null);
        setPlanForm({
          planName: '',
          description: '',
          amount: '',
          durationDays: '',
          features: ''
        });
        alert('Plan updated successfully');
      }
    } catch (err) {
      console.error('Error updating plan:', err);
      alert('Failed to update plan');
    } finally {
      setPlansLoading(false);
    }
  };

  // Delete plan
  const deletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      setPlansLoading(true);
      await api.delete(`/api/v1/admin/plans/${planId}`);

      setPlans(prev => prev.filter(plan => plan._id !== planId));
      alert('Plan deleted successfully');
    } catch (err) {
      console.error('Error deleting plan:', err);
      alert('Failed to delete plan');
    } finally {
      setPlansLoading(false);
    }
  };

  // Update payment status
  const updatePaymentStatus = async (transactionId, status, rejectionReason = '') => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [transactionId]: true }));
      const response = await api.put(`/api/v1/admin/payments/${transactionId}/status`, {
        status,
        rejectionReason
      });
      if (response.data.data) {
        setPayments(prev => prev.map(payment => 
          payment._id === transactionId ? response.data.data : payment
        ));
        alert('Payment status updated successfully')
      }
    } catch (err) {
      alert('Error updating payment status', err.status);
      
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchAccount();
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment?.studentId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment?.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment?.planId?.planName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.verificationStatus === statusFilter;
    const matchesType = typeFilter === 'all' || payment.planId?.planName === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // const handleDeletePayment = (paymentId) => {
  //   if (window.confirm('Are you sure you want to delete this payment record?')) {
  //     setPayments(prevPayments => prevPayments.filter(payment => payment._id !== paymentId));
  //   }
  // };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const totalRevenue = filteredPayments.reduce((sum, payment) => sum + payment.paidAmount, 0);
  const approvedPayments = filteredPayments.filter(p => p.verificationStatus === 'approved').length;
  const pendingPayments = filteredPayments.filter(p => p.verificationStatus === 'pending').length;
  const allPlans = [...new Set(payments.map(payment => payment.planId?.planName))]

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-center text-gray-400 mt-4">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Management */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Account Management</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewingAccount(account)}
              disabled={!account}
              className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-sm hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              View Details
            </button>
            <button
              onClick={updateAccount}
              disabled={accountLoading}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
            >
              {accountLoading ? 'Updating...' : 'Update Account'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Account Number</label>
            <input
              type="text"
              value={accountForm.accountNumber}
              onChange={(e) => setAccountForm(prev => ({ ...prev, accountNumber: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Account Holder Name</label>
            <input
              type="text"
              value={accountForm.accountHolderFullName}
              onChange={(e) => setAccountForm(prev => ({ ...prev, accountHolderFullName: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Bank Name</label>
            <input
              type="text"
              value={accountForm.bankName}
              onChange={(e) => setAccountForm(prev => ({ ...prev, bankName: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Plans Management */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Premium Plans</h2>
          <button
            onClick={() => {
              setEditingPlan(null);
              setPlanForm({
                planName: '',
                description: '',
                amount: '',
                durationDays: '',
                features: ''
              });
              setShowCreateModal(true);
            }}
            className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
          >
            Create Plan
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 font-medium">Plan Name</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Duration</th>
                <th className="text-left py-3 px-4 font-medium">Features</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 font-medium">{plan.planName}</td>
                  <td className="py-4 px-4">ETB {plan.amount}</td>
                  <td className="py-4 px-4">{plan.durationDays} days</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {plan.features.map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewingPlan(plan)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-sm hover:bg-blue-500/30 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setEditingPlan(plan);
                          setPlanForm({
                            planName: plan.planName,
                            description: plan.description,
                            amount: plan.amount.toString(),
                            durationDays: plan.durationDays.toString(),
                            features: plan.features.join(', ')
                          });
                        }}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-sm hover:bg-yellow-500/30 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deletePlan(plan._id)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-sm hover:bg-red-500/30 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Account Modal */}
      {viewingAccount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Account Details</h3>
              <button
                onClick={() => setViewingAccount(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Account ID</label>
                  <p className="text-gray-300 text-sm">{viewingAccount._id}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${viewingAccount.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {viewingAccount.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">Account Number</label>
                <p className="text-white font-mono">{viewingAccount.accountNumber}</p>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">Account Holder Name</label>
                <p className="text-white">{viewingAccount.accountHolderFullName}</p>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">Bank Name</label>
                <p className="text-white">{viewingAccount.bankName}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Created At</label>
                  <p className="text-gray-300 text-sm">{new Date(viewingAccount.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Updated At</label>
                  <p className="text-gray-300 text-sm">{new Date(viewingAccount.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingAccount(null)}
                className="px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Plan Modal */}
      {viewingPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Plan Details</h3>
              <button
                onClick={() => setViewingPlan(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Plan ID</label>
                  <p className="text-gray-300 text-sm">{viewingPlan._id}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${viewingPlan.isDeleted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                    {viewingPlan.isDeleted ? 'Deleted' : 'Active'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">Plan Name</label>
                <p className="text-white text-lg">{viewingPlan.planName}</p>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">Description</label>
                <p className="text-gray-300">{viewingPlan.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Amount</label>
                  <p className="text-white">ETB {viewingPlan.amount}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Duration</label>
                  <p className="text-white">{viewingPlan.durationDays} days</p>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">Features</label>
                <div className="flex flex-wrap gap-2">
                  {viewingPlan.features.map((feature, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-sm">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Created At</label>
                  <p className="text-gray-300 text-sm">{new Date(viewingPlan.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Updated At</label>
                  <p className="text-gray-300 text-sm">{new Date(viewingPlan.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingPlan(null)}
                className="px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Create Plan</h3>
              <button
                onClick={() => {
                  setPlanForm({
                    planName: '',
                    description: '',
                    amount: '',
                    durationDays: '',
                    features: ''
                  });
                  setShowCreateModal(false);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-sm mb-2">Plan Name</label>
                <input
                  type="text"
                  value={planForm.planName}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, planName: e.target.value }))}
                  placeholder="Enter plan name (e.g., Basic, Premium, Enterprise)"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-sm mb-2">Description</label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter a detailed description of this plan and what it includes..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Amount (ETB)</label>
                <input
                  type="number"
                  value={planForm.amount}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount in ETB (e.g., 500)"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Duration (Days)</label>
                <input
                  type="number"
                  value={planForm.durationDays}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, durationDays: e.target.value }))}
                  placeholder="Enter duration in days (e.g., 30, 90, 365)"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-sm mb-2">Features (comma-separated)</label>
                <textarea
                  value={planForm.features}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, features: e.target.value }))}
                  placeholder="e.g., AI Chat, Free Quizzes, Ask any time, Priority Support"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  rows="3"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setPlanForm({
                    planName: '',
                    description: '',
                    amount: '',
                    durationDays: '',
                    features: ''
                  });
                  setShowCreateModal(false)
                }}
                className="px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createPlan}
                disabled={plansLoading}
                className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                {plansLoading ? 'Processing...' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Payment Modal */}
      {viewingPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Payment Details</h3>
                <button
                  onClick={() => setViewingPayment(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Information */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-white border-b border-white/20 pb-2">Payment Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Transaction ID</label>
                    <p className="text-white font-mono">{viewingPayment.transactionId}</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Payment Date</label>
                    <p className="text-white">{new Date(viewingPayment.paymentDate).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Paid Amount</label>
                    <p className="text-white text-lg font-semibold">ETB {viewingPayment.paidAmount}</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Status</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewingPayment.verificationStatus)}`}>
                      {viewingPayment.verificationStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {viewingPayment.rejectionReason && viewingPayment.verificationStatus === 'rejected' && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Rejection Reason</label>
                    <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">{viewingPayment.rejectionReason}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Expiration Date</label>
                  <p className="text-white">{new Date(viewingPayment.expiresAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Student Information */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-white border-b border-white/20 pb-2">Student Information</h4>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Student Name</label>
                  <p className="text-white text-lg">{viewingPayment.studentId?.username || 'Unknown'}</p>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Student ID</label>
                  <p className="text-gray-300 text-sm">{viewingPayment.studentId?._id || 'N/A'}</p>
                </div>
              </div>

              {/* Plan Information */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-white border-b border-white/20 pb-2">Plan Information</h4>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Plan Name</label>
                  <p className="text-white text-lg">{viewingPayment.planId?.planName || 'Unknown'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Plan Amount</label>
                    <p className="text-white">ETB {viewingPayment.planId?.amount || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Duration</label>
                    <p className="text-white">{viewingPayment.planId?.durationDays || 'N/A'} days</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Features</label>
                  <div className="flex flex-wrap gap-2">
                    {viewingPayment.planId?.features?.map((feature, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-sm">
                        {feature}
                      </span>
                    )) || <span className="text-gray-400">No features listed</span>}
                  </div>
                </div>
              </div>

              {/* Sender Information */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-white border-b border-white/20 pb-2">Sender Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Sender Name</label>
                    <p className="text-white">{viewingPayment.senderName}</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Phone Number</label>
                    <p className="text-white">{viewingPayment.senderPhoneNumber}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Account Number</label>
                  <p className="text-white font-mono">{viewingPayment.senderAccountNumber}</p>
                </div>
              </div>

              {/* Recipient Information */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-white border-b border-white/20 pb-2">Recipient Information</h4>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Recipient Name</label>
                  <p className="text-white">{viewingPayment.recipientName}</p>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Account Number</label>
                  <p className="text-white font-mono">{viewingPayment.recipientAccountNumber}</p>
                </div>
              </div>

              {/* Screenshot */}
              {viewingPayment.screenshotPath && (
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="text-md font-semibold text-white border-b border-white/20 pb-2">Payment Screenshot</h4>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <img 
                      src={viewingPayment.screenshotPath} 
                      alt="Payment Screenshot"
                      className="w-full max-h-96 object-contain rounded border border-white/20"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKAmCBOb869wq8gSW1hZ2UgQXZhaWxhYmxlIOKAmTwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-md font-semibold text-white border-b border-white/20 pb-2">Metadata</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Payment ID</label>
                    <p className="text-gray-300 text-sm">{viewingPayment._id}</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Created At</label>
                    <p className="text-gray-300 text-sm">{new Date(viewingPayment.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium">Updated At</label>
                    <p className="text-gray-300 text-sm">{new Date(viewingPayment.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingPayment(null)}
                className="px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                Close
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan !== null ? (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Edit Plan</h3>
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setPlanForm({
                    planName: '',
                    description: '',
                    amount: '',
                    durationDays: '',
                    features: ''
                  });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-sm mb-2">Plan Name</label>
                <input
                  type="text"
                  value={planForm.planName}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, planName: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-sm mb-2">Description</label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Amount</label>
                <input
                  type="number"
                  value={planForm.amount}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Duration (Days)</label>
                <input
                  type="number"
                  value={planForm.durationDays}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, durationDays: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-sm mb-2">Features (comma-separated)</label>
                <textarea
                  value={planForm.features}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, features: e.target.value }))}
                  placeholder="e.g., AI Chat, Free Quizzes, Ask any time"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  rows="3"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setPlanForm({
                    planName: '',
                    description: '',
                    amount: '',
                    durationDays: '',
                    features: ''
                  });
                }}
                className="px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updatePlan(editingPlan._id)}
                disabled={plansLoading}
                className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                {plansLoading ? 'Processing...' : 'Update Plan'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">ETB {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-full">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Approved Payments</p>
              <p className="text-2xl font-bold text-white">{approvedPayments}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-full">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Payments</p>
              <p className="text-2xl font-bold text-white">{pendingPayments}</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-full">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Payments Management</h2>
            <p className="text-gray-400">Manage all payment transactions</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-full sm:w-64"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Plans</option>
              {allPlans.map(plan => 
                <option key={plan} value={plan}>{plan}</option>
              )}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 font-medium">Student</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Plan</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Reference</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 font-medium">{payment.studentId?.username || 'Unknown'}</td>
                  <td className="py-4 px-4">ETB {payment.paidAmount}</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-medium">
                      {payment.planId?.planName || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={payment.verificationStatus}
                      onChange={(e) => {
                        if (e.target.value === 'rejected') {
                          const reason = prompt('Enter rejection reason (optional):', payment.rejectionReason || '');
                          updatePaymentStatus(payment._id, e.target.value, reason || '');
                        } else {
                          updatePaymentStatus(payment._id, e.target.value);
                        }
                      }}
                      disabled={updatingStatus[payment._id]}
                      className={`px-2 py-1 rounded text-xs font-medium border focus:outline-none ${getStatusColor(payment.verificationStatus)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="py-4 px-4 text-gray-400">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  <td className="py-4 px-4 text-gray-400">{payment.transactionId}</td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewingPayment(payment)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-sm hover:bg-blue-500/30 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No payments found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsSection;