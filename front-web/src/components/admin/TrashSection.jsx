import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';

const TrashSection = () => {
  const [selectedModel, setSelectedModel] = useState('users');
  const [deletedData, setDeletedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const models = [
    'users',
    'books',
    'units',
    'sections',
    'interactions',
    'chats',
    'quizzes',
    'references',
    'resources',
    'progress',
    'accounts',
    'plans',
    'transactions',
  ];

  // Get soft deleted data
  const fetchDeletedData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/admin/delete/${selectedModel}`);
      setDeletedData(response.data.data || response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch deleted data');
    } finally {
      setLoading(false);
    }
  };

  // Restore specific item
  const restoreItem = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/v1/admin/delete/${selectedModel}/${id}`);
      fetchDeletedData(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore item');
    }
  };

  // Restore all items
  const restoreAll = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/v1/admin/delete/${selectedModel}`);
      fetchDeletedData(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore all items');
    }
  };

  // Permanently delete specific item
  const permanentlyDeleteItem = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/admin/delete/${selectedModel}/${id}`);
      fetchDeletedData(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to permanently delete item');
    }
  };

  // Permanently delete all items
  const permanentlyDeleteAll = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/admin/delete/${selectedModel}`);
      fetchDeletedData(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to permanently delete all items');
    }
  };

  useEffect(() => {
    fetchDeletedData();
  }, [selectedModel]);

  const formatDataDisplay = (item) => {
    if (!item) return 'N/A';
    
    switch (selectedModel) {
      case 'users':
        return `User: ${item.username} (${item.role})`
      case 'books':
        return `Book: ${item.subject} (${item.gradeLevel})`
      case 'units':
        return `Unit ${item.unitNumber}: ${item.title}`
      case 'sections':
        return `Section ${item.sectionNumber}: ${item.title}`
      case 'interactions':
        return `Interaction: ${item.studentQuestion}`
      case 'chats':
        return `Chat (type ${item.type}): ${item.summary}`
      case 'quizzes':
        return `Quiz: ${item.question?.text || item.question}`
      case 'references':
        return `Reference: ${item.quotedText}`
      case 'resources':
        return `Resource: (type ${item.type}): ${item.title}`
      case 'progress':
        return `Progress: ${item.status}`
      case 'accounts':
        return `Account: ${item.accountHolderFullName} (${item.bankName})`
      case 'plans':
        return `Plan: ${item.planName} (${item.amount} ETB)`
      case 'transactions':
        return `Transaction: ${item.senderName} (${item.paidAmount} ETB) ${item.verificationStatus}`
      default:
        return JSON.stringify(item, null, 2);
    }
  };

  const getItemId = (item) => {
    return item.id || item._id || item.transactionId || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Main Controls */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Trash Management</h2>
            <p className="text-gray-400">Manage soft deleted data across all models</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {models.map(model => (
                <option key={model} value={model}>
                  {model.charAt(0).toUpperCase() + model.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={fetchDeletedData}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={restoreAll}
            className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors font-medium"
          >
            Restore All
          </button>
          <button
            onClick={permanentlyDeleteAll}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
          >
            Delete All Permanently
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Data Display */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            Deleted {selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)}
          </h3>
          <span className="text-gray-400 text-sm">
            {deletedData.length} item{deletedData.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-center text-gray-400 mt-4 ml-4">Loading {selectedModel}...</p>
          </div>
        ) : deletedData.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No deleted items found for {selectedModel}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-left py-3 px-4 font-medium">Data</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deletedData.map((item, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <span className="px-5 py-4 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-full text-xs font-mono">
                        {getItemId(item)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-md">
                        <p className="text-white font-medium mb-1">{formatDataDisplay(item)}</p>
                        <button
                          onClick={() => setSelectedItem(selectedItem === item ? null : item)}
                          className="text-xs text-blue-400 hover:text-blue-300 underline"
                        >
                          {selectedItem === item ? 'Hide Details' : 'Show Details'}
                        </button>
                        {selectedItem === item && (
                          <div className="mt-2 bg-white/5 p-3 rounded-lg border border-white/20 max-h-64 overflow-y-auto">
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                              {JSON.stringify(item, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => restoreItem(getItemId(item))}
                          className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-sm hover:bg-green-500/30 transition-colors"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => permanentlyDeleteItem(getItemId(item))}
                          className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-sm hover:bg-red-500/30 transition-colors"
                        >
                          Delete Permanently
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashSection;