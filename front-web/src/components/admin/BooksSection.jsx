import React, { useState, useEffect } from 'react';

const BooksSection = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for demonstration
  const mockBooks = [
    { id: 1, title: 'Mathematics Grade 9', author: 'John Math', category: 'Mathematics', status: 'available', stock: 25, price: 150, isbn: '978-1234567890', createdAt: '2024-01-15' },
    { id: 2, title: 'English Literature', author: 'Jane Smith', category: 'Literature', status: 'available', stock: 15, price: 120, isbn: '978-0987654321', createdAt: '2024-01-20' },
    { id: 3, title: 'Physics Fundamentals', author: 'Dr. Science', category: 'Science', status: 'low-stock', stock: 3, price: 180, isbn: '978-1122334455', createdAt: '2024-01-10' },
    { id: 4, title: 'History of Ethiopia', author: 'Prof. Historian', category: 'History', status: 'out-of-stock', stock: 0, price: 100, isbn: '978-9988776655', createdAt: '2024-02-01' },
    { id: 5, title: 'Chemistry Basics', author: 'Chem Master', category: 'Science', status: 'available', stock: 18, price: 160, isbn: '978-5566778899', createdAt: '2024-01-25' },
    { id: 6, title: 'Geography World', author: 'Geo Expert', category: 'Geography', status: 'available', stock: 12, price: 140, isbn: '978-4433221100', createdAt: '2024-01-18' },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBooks(mockBooks);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleStockUpdate = (bookId, newStock) => {
    setBooks(prevBooks =>
      prevBooks.map(book =>
        book.id === bookId ? { ...book, stock: parseInt(newStock), status: parseInt(newStock) === 0 ? 'out-of-stock' : parseInt(newStock) <= 5 ? 'low-stock' : 'available' } : book
      )
    );
  };

  const handleDeleteBook = (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'low-stock': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'out-of-stock': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const categories = [...new Set(mockBooks.map(book => book.category))];

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-center text-gray-400 mt-4">Loading books...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Books Management</h2>
            <p className="text-gray-400">Manage all books in the library</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-full sm:w-64"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 font-medium">Book</th>
                <th className="text-left py-3 px-4 font-medium">Author</th>
                <th className="text-left py-3 px-4 font-medium">Category</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Stock</th>
                <th className="text-left py-3 px-4 font-medium">Price</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium">{book.title}</p>
                      <p className="text-sm text-gray-400">ISBN: {book.isbn}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">{book.author}</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium">
                      {book.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                      {book.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={book.stock}
                        onChange={(e) => handleStockUpdate(book.id, e.target.value)}
                        className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-500 text-sm"
                        min="0"
                      />
                    </div>
                  </td>
                  <td className="py-4 px-4">ETB {book.price}</td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-sm hover:bg-blue-500/30 transition-colors">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
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

        {filteredBooks.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No books found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default BooksSection;