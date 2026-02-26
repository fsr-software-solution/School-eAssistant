import React, { useState, useEffect } from 'react';

const TrashSection = () => {
  const [deletedItems, setDeletedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data for demonstration
  const mockDeletedItems = [
    { id: 1, name: 'John Doe', type: 'user', deletedAt: '2024-02-15 10:30:00', reason: 'Violation of terms', restored: false },
    { id: 2, name: 'Mathematics Grade 9', type: 'book', deletedAt: '2024-02-14 14:20:00', reason: 'Out of print', restored: false },
    { id: 3, name: 'Payment Record #001', type: 'payment', deletedAt: '2024-02-13 09:15:00', reason: 'Duplicate entry', restored: false },
    { id: 4, name: 'Jane Smith', type: 'user', deletedAt: '2024-02-12 16:45:00', reason: 'Account inactivity', restored: true },
    { id: 5, name: 'English Literature', type: 'book', deletedAt: '2024-02-11 11:30:00', reason: 'Damaged copy', restored: false },
    { id: 6, name: 'Payment Record #002', type: 'payment', deletedAt: '2024-02-10 13:20:00', reason: 'System error', restored: true },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDeletedItems(mockDeletedItems);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredItems = deletedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleRestoreItem = (itemId) => {
    setDeletedItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, restored: true } : item
      )
    );
  };

  const handlePermanentDelete = (itemId) => {
    if (window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) {
      setDeletedItems(prevItems => prevItems.filter(item => item.id !== itemId));
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'user': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'book': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'payment': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getRestoreStatus = (restored) => {
    return restored ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30';
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-center text-gray-400 mt-4">Loading trash...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Trash Management</h2>
            <p className="text-gray-400">Manage deleted items and restore if needed</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search deleted items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-full sm:w-64"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="user">Users</option>
              <option value="book">Books</option>
              <option value="payment">Payments</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 font-medium">Item</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">Deleted At</th>
                <th className="text-left py-3 px-4 font-medium">Reason</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 font-medium">{item.name}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                      {item.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-400">{item.deletedAt}</td>
                  <td className="py-4 px-4">{item.reason}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRestoreStatus(item.restored)}`}>
                      {item.restored ? 'RESTORED' : 'DELETED'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      {!item.restored && (
                        <button
                          onClick={() => handleRestoreItem(item.id)}
                          className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-sm hover:bg-green-500/30 transition-colors"
                        >
                          Restore
                        </button>
                      )}
                      <button
                        onClick={() => handlePermanentDelete(item.id)}
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

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No deleted items found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashSection;