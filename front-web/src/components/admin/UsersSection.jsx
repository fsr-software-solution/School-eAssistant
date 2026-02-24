import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';

const UsersSection = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({
    chatInteractions: [],
    quizzes: [],
    progress: []
  });
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    type: null,
    title: ''
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'student'
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage (assuming it's stored there after login)
        const token = localStorage.getItem('accessToken');
        
        const response = await axios.get(`${API_BASE_URL}/api/v1/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          // Map API response to the expected format
          const mappedUsers = response.data.data.map((user) => ({
            id: user._id,
            username: user.username,
            role: user.role,
            createdAt: new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          }));
          setUsers(mappedUsers);
        } else {
          console.error('Failed to fetch users:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    await fetchUserDetails(user.id);
  };

  const fetchUserDetails = async (userId) => {
    try {
      setLoadingDetails(true);
      const token = localStorage.getItem('accessToken');
      
      // Fetch chat interactions
      const chatResponse = await axios.get(`${API_BASE_URL}/api/v1/users/${userId}/chat-interactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Fetch quizzes
      const quizResponse = await axios.get(`${API_BASE_URL}/api/v1/users/${userId}/quizzes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Fetch progress
      const progressResponse = await axios.get(`${API_BASE_URL}/api/v1/users/${userId}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUserDetails({
        chatInteractions: chatResponse.data.data || [],
        quizzes: quizResponse.data.data || [],
        progress: progressResponse.data.data || []
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUserDetails({
        chatInteractions: [],
        quizzes: [],
        progress: []
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const openDetailsModal = (type) => {
    const titles = {
      chatInteractions: 'Chat Interactions',
      quizzes: 'Quizzes',
      progress: 'Progress'
    };
    
    setDetailsModal({
      isOpen: true,
      type,
      title: titles[type] || 'Details'
    });
  };

  const closeDetailsModal = () => {
    setDetailsModal({
      isOpen: false,
      type: null,
      title: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState({
    username: '',
    password: '',
    role: 'student'
  });

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('accessToken');
        
        await axios.delete(`${API_BASE_URL}/api/v1/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Refetch users to ensure the list is up to date
        await fetchUsers();
        alert('User deleted successfully!')
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage (assuming it's stored there after login)
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get(`${API_BASE_URL}/api/v1/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Map API response to the expected format
        const mappedUsers = response.data.data.map((user) => ({
          id: user._id,
          username: user.username,
          role: user.role,
          createdAt: new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }));
        setUsers(mappedUsers);
      } else {
        console.error('Failed to fetch users:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUser({
      username: user.username,
      password: '', // Don't pre-fill password for security
      role: user.role
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      setCreateLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.put(`${API_BASE_URL}/api/v1/users/${editingUser.id}`, editUser, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // Update the user in the list
        setUsers(prevUsers => prevUsers.map(user => 
          user.id === editingUser.id 
            ? {
                ...user,
                username: response.data.data.username,
                role: response.data.data.role
              }
            : user
        ));
        
        // Reset form and close modal
        setEditUser({
          username: '',
          password: '',
          role: 'student'
        });
        setEditingUser(null);
        setIsEditModalOpen(false);
        
        // Show success message
        alert('User updated successfully!');
      } else {
        console.error('Failed to update user:', response.data.message);
        alert('Failed to update user: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      setCreateLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.post(`${API_BASE_URL}/api/v1/users`, newUser, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // Add the new user to the list
        const newUserObj = {
          id: response.data.data._id,
          username: response.data.data.username,
          role: response.data.data.role,
          createdAt: new Date(response.data.data.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        };
        
        setUsers(prevUsers => [...prevUsers, newUserObj]);
        
        // Reset form and close modal
        setNewUser({
          username: '',
          password: '',
          role: 'student'
        });
        setIsCreateModalOpen(false);
        
        // Show success message
        alert('User created successfully!');
      } else {
        console.error('Failed to create user:', response.data.message);
        alert('Failed to create user: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-center text-gray-400 mt-4">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Users Management</h2>
            <p className="text-gray-400">Manage all users in the system</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-full sm:w-64"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="student">Student</option>
            </select>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors font-medium"
            >
              Create User
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 font-medium">User</th>
                <th className="text-left py-3 px-4 font-medium">Role</th>
                <th className="text-left py-3 px-4 font-medium">Created</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">{user.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-400">#{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      user.role === 'teacher' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-400">{user.createdAt}</td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-sm hover:bg-green-500/30 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-sm hover:bg-blue-500/30 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No users found matching your criteria.
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">User Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold">{selectedUser.username.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h4 className="text-white font-medium text-lg">{selectedUser.username}</h4>
                  <p className="text-gray-400 text-sm">#{selectedUser.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Role</p>
                  <p className={`text-sm font-medium mt-1 ${
                    selectedUser.role === 'admin' ? 'text-red-400' :
                    selectedUser.role === 'teacher' ? 'text-blue-400' :
                    'text-green-400'
                  }`}>
                    {selectedUser.role.toUpperCase()}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
                  <p className="text-sm font-medium mt-1 text-green-400">Active</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Created At</p>
                  <p className="text-white mt-1">{selectedUser.createdAt}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">User ID</p>
                  <p className="text-white mt-1 font-mono text-sm">{selectedUser.id}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => openDetailsModal('chatInteractions')}
                  disabled={loadingDetails}
                  className="px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingDetails ? 'Loading...' : 'Chat Interactions'}
                </button>
                <button
                  onClick={() => openDetailsModal('quizzes')}
                  disabled={loadingDetails}
                  className="px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingDetails ? 'Loading...' : 'Quizzes'}
                </button>
                <button
                  onClick={() => openDetailsModal('progress')}
                  disabled={loadingDetails}
                  className="px-3 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingDetails ? 'Loading...' : 'Progress'}
                </button>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 mx-2 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">{detailsModal.title}</h3>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {loadingDetails ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-center text-gray-400 mt-4 ml-4">Loading {detailsModal.title.toLowerCase()}...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {detailsModal.type === 'chatInteractions' && (
                  userDetails.chatInteractions.length > 0 ? (
                    userDetails.chatInteractions.map((interaction) => (
                      <div key={interaction._id} className="bg-white/5 rounded-lg p-4 border border-white/20">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-white">{interaction.summary}</h4>
                          <span className="text-xs text-gray-400 bg-green-500/20 px-2 py-1 rounded border border-green-500/30">
                            {interaction.type}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Student ID: {interaction.studentId}</span>
                          <span>Created: {formatDate(interaction.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No chat interactions found for this user.
                    </div>
                  )
                )}

                {detailsModal.type === 'quizzes' && (
                  userDetails.quizzes.length > 0 ? (
                    userDetails.quizzes.map((quiz) => (
                      <div key={quiz._id} className="bg-white/5 rounded-lg p-4 border border-white/20">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-white">{quiz.summary}</h4>
                          <span className="text-xs text-gray-400 bg-blue-500/20 px-2 py-1 rounded border border-blue-500/30">
                            {quiz.type}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Student ID: {quiz.studentId}</span>
                          <span>Created: {formatDate(quiz.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No quizzes found for this user.
                    </div>
                  )
                )}

                {detailsModal.type === 'progress' && (
                  userDetails.progress.length > 0 ? (
                    userDetails.progress.map((progress) => (
                      <div key={progress._id} className="bg-white/5 rounded-lg p-4 border border-white/20">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-white">Section ID: {progress.sectionId}</h4>
                            <p className="text-sm text-gray-400">Status: {progress.status}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded border ${
                            progress.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            progress.status === 'in progress' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }`}>
                            {progress.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Student ID: {progress.studentId}</span>
                          <span>Updated: {formatDate(progress.updatedAt)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No progress data found for this user.
                    </div>
                  )
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Edit User</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={editUser.username}
                  onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Enter username"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={editUser.password}
                  onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Enter new password (optional)"
                  minLength="8"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded hover:bg-gray-500/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Create New User</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  placeholder="Enter username"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  placeholder="Enter password"
                  required
                  minLength="8"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded hover:bg-gray-500/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersSection;
