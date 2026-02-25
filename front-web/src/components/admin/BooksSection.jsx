import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';

const BooksSection = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedBookUnits, setSelectedBookUnits] = useState(null);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [sectionsStack, setSectionsStack] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSectionResources, setSelectedSectionResources] = useState(null);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [isSectionEditModalOpen, setIsSectionEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  // Helper function to get the current sections/subsections from the stack
  const getCurrentSections = () => {
    return sectionsStack.length > 0 ? sectionsStack[sectionsStack.length - 1] : null;
  };

  // Helper function to add sections/subsections to the stack
  const pushToSectionsStack = (sections) => {
    setSectionsStack(prev => [...prev, sections]);
  };

  // Helper function to go back in the stack
  const popFromSectionsStack = () => {
    setSectionsStack(prev => prev.slice(0, -1));
  };
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newBook, setNewBook] = useState({
    gradeLevel: '',
    subject: '',
    yearOfPublish: '',
    tocStartingPage: '',
    tocEndingPage: '',
    book: null
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (!newBook.book) {
      alert('Please select a PDF file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('book', newBook.book);
    formData.append('gradeLevel', newBook.gradeLevel);
    formData.append('subject', newBook.subject);
    formData.append('yearOfPublish', newBook.yearOfPublish);
    formData.append('tocStartingPage', newBook.tocStartingPage);
    formData.append('tocEndingPage', newBook.tocEndingPage);

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await axios.post(`${API_BASE_URL}/api/v1/books`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      // Add the new book to the list
      setBooks(prevBooks => [response.data.data, ...prevBooks]);
      alert('Book uploaded successfully!');
      
      // Reset form and close modal
      setNewBook({
        gradeLevel: '',
        subject: '',
        yearOfPublish: '',
        tocStartingPage: '',
        tocEndingPage: '',
        book: null
      });
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Error uploading book:', error);
      alert('Error uploading book. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewBook(prev => ({ ...prev, book: file }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook(prev => ({ ...prev, [name]: value }));
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/v1/books`);
      setBooks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatToc = (toc) => {
    if (!toc || !toc.units) return JSON.stringify(toc || '');
    
    return toc.units.map(unit => {
      const unitTitle = `${unit.unitNumber}. ${unit.title} (p. ${unit.startingPage})`;
      const sections = unit.sections.map(section => {
        const sectionTitle = `  ${section.sectionNumber}. ${section.title} (p. ${section.startingPage})`;
        if (section.subsections && section.subsections.length > 0) {
          const subsections = section.subsections.map(sub => 
            `    ${sub.sectionNumber}. ${sub.title} (p. ${sub.startingPage})`
          ).join('\n');
          return `${sectionTitle}\n${subsections}`;
        }
        return sectionTitle;
      }).join('\n');
      return `${unitTitle}\n${sections}`;
    }).join('\n\n');
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || book.subject === categoryFilter;
    const matchesGradeLevel = statusFilter === 'all' || book.gradeLevel === statusFilter;
    return matchesSearch && matchesCategory && matchesGradeLevel;
  });

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/v1/books/${bookId}`);
        
        setBooks(prevBooks => prevBooks.filter(book => book._id !== bookId));
        alert('Book deleted successfully!');
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Error deleting book. Please try again.');
      }
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setIsEditModalOpen(true);
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/books/${editingBook._id}`, {
        gradeLevel: editingBook.gradeLevel,
        subject: editingBook.subject,
        yearOfPublish: editingBook.yearOfPublish
      });

      // Update the book in the list
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book._id === editingBook._id ? response.data.data : book
        )
      );
      
      alert('Book updated successfully!');
      setIsEditModalOpen(false);
      setEditingBook(null);
    } catch (error) {
      console.error('Error updating book:', error);
      alert('Error updating book. Please try again.');
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingBook(prev => ({ ...prev, [name]: value }));
  };

  const fetchBookUnits = async (book) => {
    try {
      setUnitsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/v1/books/${book._id}/units`);
      setSelectedBookUnits(response.data.data);
    } catch (error) {
      console.error('Error fetching book units:', error);
      alert('Error fetching book units. Please try again.');
    } finally {
      setUnitsLoading(false);
    }
  };

  const handleUnitsClick = (book) => {
    setSelectedBookUnits(book);
    fetchBookUnits(book);
  };

  const fetchUnitSections = async (unit) => {
    try {
      setSectionsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/v1/units/${unit._id}/sections`);
      pushToSectionsStack(response.data.data);
    } catch (error) {
      console.error('Error fetching unit sections:', error);
      alert('Error fetching unit sections. Please try again.');
    } finally {
      setSectionsLoading(false);
    }
  };

  const handleViewUnit = (unit) => {
    setSelectedUnit(unit);
  };

  const handleSectionsClick = (unit) => {
    fetchUnitSections(unit);
  };

  const fetchSectionSubsections = async (section) => {
    try {
      setSectionsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/v1/sections/${section._id}/subsections`);
      pushToSectionsStack(response.data.data);
    } catch (error) {
      console.error('Error fetching section subsections:', error);
      alert('Error fetching section subsections. Please try again.');
    } finally {
      setSectionsLoading(false);
    }
  };

  const handleViewSection = (section) => {
    setSelectedSection(section);
  };

  const handleSubsectionsClick = (section) => {
    fetchSectionSubsections(section);
  };

  const fetchSectionResources = async (section) => {
    try {
      setResourcesLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/v1/sections/${section._id}/resources`);
      setSelectedSectionResources(response.data.data);
    } catch (error) {
      console.error('Error fetching section resources:', error);
      alert('Error fetching section resources. Please try again.');
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleResourcesClick = (section) => {
    setSelectedSectionResources(section);
    fetchSectionResources(section);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setIsSectionEditModalOpen(true);
  };

  const handleUpdateSection = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/sections/${editingSection._id}`, {
        aiClarification: editingSection.aiClarification
      });

      // Update the section in the current stack
      setSectionsStack(prevStack => {
        return prevStack.map(sections => 
          sections.map(section => 
            section._id === editingSection._id ? response.data.data : section
          )
        );
      });
      
      alert('Section updated successfully!');
      setIsSectionEditModalOpen(false);
      setEditingSection(null);
    } catch (error) {
      console.error('Error updating section:', error);
      alert('Error updating section. Please try again.');
    }
  };

  const handleSectionEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingSection(prev => ({ ...prev, [name]: value }));
  };

  const categories = [...new Set(books.map(book => book.subject))];
  const gradeLevels = [...new Set(books.map(book => book.gradeLevel))];

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
              <option value="all">All Subjects</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Grade Levels</option>
              {gradeLevels.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors font-medium"
            >
              Upload Book
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 font-medium">Subject</th>
                <th className="text-left py-3 px-4 font-medium">Grade Level</th>
                <th className="text-left py-3 px-4 font-medium">Total Pages</th>
                <th className="text-left py-3 px-4 font-medium">File Path</th>
                <th className="text-left py-3 px-4 font-medium">Year</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium">{book.subject}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">{book.gradeLevel}</td>
                  <td className="py-4 px-4">{book.totalPages}</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium">
                      {book.filePath}
                    </span>
                  </td>
                  <td className="py-4 px-4">{book.yearOfPublish}</td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedBook(book)}
                        className="px-3 py-1 bg-green-500/20 text-green-400 border border-blue-500/30 rounded text-sm hover:bg-blue-500/30 transition-colors"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleEditBook(book)}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-sm hover:bg-yellow-500/30 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleUnitsClick(book)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-sm hover:bg-blue-500/30 transition-colors"
                      >
                        Units
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book._id)}
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

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Table of Contents</h3>
              <div className="flex space-x-2">
              <button
                onClick={() => setSelectedBook(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Subject:</span>
                  <p className="text-white font-medium">{selectedBook.subject}</p>
                </div>
                <div>
                  <span className="text-gray-400">Grade Level:</span>
                  <p className="text-white font-medium">{selectedBook.gradeLevel}</p>
                </div>
                <div>
                  <span className="text-gray-400">Total Pages:</span>
                  <p className="text-white font-medium">{selectedBook.totalPages}</p>
                </div>
                <div>
                  <span className="text-gray-400">Year:</span>
                  <p className="text-white font-medium">{selectedBook.yearOfPublish}</p>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Table of Contents:</h4>
                <pre className="bg-white/5 p-4 rounded-lg text-sm text-gray-300 whitespace-pre-wrap border border-white/20">
                  {formatToc(selectedBook.toc)}
                </pre>
              </div>
              
              {selectedBook.summary && (
                <div>
                  <h4 className="text-white font-medium mb-2">Summary:</h4>
                  <p className="bg-white/5 p-4 rounded-lg text-sm text-gray-300 border border-white/20">
                    {selectedBook.summary}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Units Modal */}
      {selectedBookUnits && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Units</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedBookUnits(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {unitsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-center text-gray-400 mt-4 ml-4">Loading units...</p>
              </div>
            ) : (
              <div className="space-y-4">

                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 font-medium">#Unit</th>
                        <th className="text-left py-3 px-4 font-medium">Title</th>
                        <th className="text-left py-3 px-4 font-medium">Starting Page</th>
                        <th className="text-left py-3 px-4 font-medium">Ending Page</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBookUnits && Array.isArray(selectedBookUnits) ? (
                        selectedBookUnits.map((unit) => (
                          <tr key={unit._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4">
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium">
                                {unit.unitNumber}
                              </span>
                            </td>
                            <td className="py-4 px-4">{unit.title}</td>
                            <td className="py-4 px-4">{unit.startingPage}</td>
                            <td className="py-4 px-4">{unit.endingPage}</td>
                            <td className="py-4 px-4">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleViewUnit(unit)}
                                  className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-sm hover:bg-green-500/30 transition-colors"
                                >
                                  View
                                </button>
                                <button 
                                  onClick={() => handleSectionsClick(unit)}
                                  className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-sm hover:bg-blue-500/30 transition-colors"
                                >
                                  Sections
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-4 px-4 text-center text-gray-400">
                            No units found for this book.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unit Details Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Unit Details</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Unit Number:</span>
                  <p className="text-white font-medium">{selectedUnit.unitNumber}</p>
                </div>
                <div>
                  <span className="text-gray-400">Title:</span>
                  <p className="text-white font-medium">{selectedUnit.title}</p>
                </div>
                <div>
                  <span className="text-gray-400">Starting Page:</span>
                  <p className="text-white font-medium">{selectedUnit.startingPage}</p>
                </div>
                <div>
                  <span className="text-gray-400">Ending Page:</span>
                  <p className="text-white font-medium">{selectedUnit.endingPage}</p>
                </div>
                <div>
                  <span className="text-gray-400">Book ID:</span>
                  <p className="text-white font-medium">{selectedUnit.bookId}</p>
                </div>
                <div>
                  <span className="text-gray-400">Unit ID:</span>
                  <p className="text-white font-medium">{selectedUnit._id}</p>
                </div>
                <div>
                  <span className="text-gray-400">Created At:</span>
                  <p className="text-white font-medium">{new Date(selectedUnit.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-400">Updated At:</span>
                  <p className="text-white font-medium">{new Date(selectedUnit.updatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-400">Is Deleted:</span>
                  <p className="text-white font-medium">{selectedUnit.isDeleted ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Version:</span>
                  <p className="text-white font-medium">{selectedUnit.__v}</p>
                </div>
              </div>

              {selectedUnit.summary && (
                <div>
                  <h4 className="text-white font-medium mb-2">Summary:</h4>
                  <p className="bg-white/5 p-4 rounded-lg text-sm text-gray-300 border border-white/20">
                    {selectedUnit.summary}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sections Modal */}
      {sectionsStack.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {sectionsStack.length === 1 
                  ? `Sections for Unit ${sectionsStack[0][0]?.unitNumber || 'Unknown'}`
                  : `Subsections for Section ${sectionsStack[sectionsStack.length - 1][0]?.sectionNumber || 'Unknown'}`
                }
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => popFromSectionsStack()}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {sectionsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-center text-gray-400 mt-4 ml-4">Loading sections...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 font-medium">#{sectionsStack.length === 1 ? 'Section' : 'Subsection'}</th>
                        <th className="text-left py-3 px-4 font-medium">Title</th>
                        <th className="text-left py-3 px-4 font-medium">Starting Page</th>
                        <th className="text-left py-3 px-4 font-medium">Ending Page</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCurrentSections() && Array.isArray(getCurrentSections()) ? (
                        getCurrentSections().map((section) => (
                          <tr key={section._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4">
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium">
                                {section.sectionNumber}
                              </span>
                            </td>
                            <td className="py-4 px-4">{section.title}</td>
                            <td className="py-4 px-4">{section.startingPage}</td>
                            <td className="py-4 px-4">{section.endingPage}</td>
                            <td className="py-4 px-4">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleViewSection(section)}
                                  className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-sm hover:bg-green-500/30 transition-colors"
                                >
                                  View
                                </button>
                                <button 
                                  onClick={() => handleEditSection(section)}
                                  className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-sm hover:bg-yellow-500/30 transition-colors"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleSubsectionsClick(section)}
                                  className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-sm hover:bg-blue-500/30 transition-colors"
                                >
                                  Subsections
                                </button>
                                <button 
                                  onClick={() => handleResourcesClick(section)}
                                  className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-sm hover:bg-purple-500/30 transition-colors"
                                >
                                  Resources
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-4 px-4 text-center text-gray-400">
                            No {sectionsStack.length === 1 ? 'sections' : 'subsections'} found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Details Modal */}
      {selectedSection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Section Details</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedSection(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Section Number:</span>
                  <p className="text-white font-medium">{selectedSection.sectionNumber}</p>
                </div>
                <div>
                  <span className="text-gray-400">Title:</span>
                  <p className="text-white font-medium">{selectedSection.title}</p>
                </div>
                <div>
                  <span className="text-gray-400">Starting Page:</span>
                  <p className="text-white font-medium">{selectedSection.startingPage}</p>
                </div>
                <div>
                  <span className="text-gray-400">Ending Page:</span>
                  <p className="text-white font-medium">{selectedSection.endingPage}</p>
                </div>
                <div>
                  <span className="text-gray-400">Unit ID:</span>
                  <p className="text-white font-medium">{selectedSection.unitId}</p>
                </div>
                <div>
                  <span className="text-gray-400">Section ID:</span>
                  <p className="text-white font-medium">{selectedSection._id}</p>
                </div>
                <div>
                  <span className="text-gray-400">Parent Section ID:</span>
                  <p className="text-white font-medium">{selectedSection.parentSectionId || 'None'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Heading Level:</span>
                  <p className="text-white font-medium">{selectedSection.headingLevel}</p>
                </div>
                <div>
                  <span className="text-gray-400">Created At:</span>
                  <p className="text-white font-medium">{new Date(selectedSection.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-400">Updated At:</span>
                  <p className="text-white font-medium">{new Date(selectedSection.updatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-400">Is Deleted:</span>
                  <p className="text-white font-medium">{selectedSection.isDeleted ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Version:</span>
                  <p className="text-white font-medium">{selectedSection.__v}</p>
                </div>
              </div>

              {selectedSection.content && (
                <div>
                  <h4 className="text-white font-medium mb-2">Content:</h4>
                  <div className="bg-white/5 p-4 rounded-lg text-sm text-gray-300 border border-white/20 max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{selectedSection.content}</pre>
                  </div>
                </div>
              )}

              {selectedSection.aiClarification && (
                <div>
                  <h4 className="text-white font-medium mb-2">AI Clarification:</h4>
                  <div className="bg-white/5 p-4 rounded-lg text-sm text-gray-300 border border-white/20 max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{selectedSection.aiClarification}</pre>
                  </div>
                </div>
              )}

              {selectedSection.summary && (
                <div>
                  <h4 className="text-white font-medium mb-2">Summary:</h4>
                  <p className="bg-white/5 p-4 rounded-lg text-sm text-gray-300 border border-white/20">
                    {selectedSection.summary}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resources Modal */}
      {selectedSectionResources && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Resources for Section {selectedSectionResources.sectionNumber}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedSectionResources(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {resourcesLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-center text-gray-400 mt-4 ml-4">Loading resources...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 font-medium">#Resource</th>
                        <th className="text-left py-3 px-4 font-medium">Title</th>
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-left py-3 px-4 font-medium">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSectionResources && Array.isArray(selectedSectionResources) ? (
                        selectedSectionResources.map((resource, index) => (
                          <tr key={resource._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4">
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-medium">
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium">{resource.title}</p>
                                <p className="text-sm text-gray-400 mt-1">{resource.description}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                resource.type === 'article' 
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : resource.type === 'image'
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : resource.type === 'youtube'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              }`}>
                                {resource.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <a
                                href={resource.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-3 rounded-full text-xs font-medium bg-black-500/20 text-gray-400 border border-white-500/30"
                              >
                                Open
                              </a>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-4 px-4 text-center text-gray-400">
                            No resources found for this section.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {isEditModalOpen && editingBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Edit Book</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingBook(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Grade Level</label>
                <select
                  name="gradeLevel"
                  value={editingBook.gradeLevel}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  required
                >
                  <option value="">Select Grade Level</option>
                  <option value="G-7">G-7</option>
                  <option value="G-8">G-8</option>
                  <option value="G-9">G-9</option>
                  <option value="G-10">G-10</option>
                  <option value="G-11">G-11</option>
                  <option value="G-12">G-12</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={editingBook.subject}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                  placeholder="e.g., Biology"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Year of Publish</label>
                <input
                  type="text"
                  name="yearOfPublish"
                  value={editingBook.yearOfPublish}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                  placeholder="e.g., 2027"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingBook(null);
                  }}
                  className="px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded hover:bg-gray-500/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded hover:bg-yellow-500/30 transition-colors"
                >
                  Update Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Book Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Upload New Book</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleFileUpload} className="space-y-4">              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Grade Level</label>
                <select
                  name="gradeLevel"
                  value={newBook.gradeLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                  required
                >
                  <option value="">Select Grade Level</option>
                  <option value="G-7">G-7</option>
                  <option value="G-8">G-8</option>
                  <option value="G-9">G-9</option>
                  <option value="G-10">G-10</option>
                  <option value="G-11">G-11</option>
                  <option value="G-12">G-12</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={newBook.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  placeholder="e.g., Biology"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Year of Publish</label>
                <input
                  type="text"
                  name="yearOfPublish"
                  value={newBook.yearOfPublish}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  placeholder="e.g., 2027"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">TOC Starting Page</label>
                <input
                  type="number"
                  name="tocStartingPage"
                  value={newBook.tocStartingPage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  placeholder="e.g., 1"
                  required
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">TOC Ending Page</label>
                <input
                  type="number"
                  name="tocEndingPage"
                  value={newBook.tocEndingPage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  placeholder="e.g., 171"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">PDF File</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                  required
                />
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded hover:bg-gray-500/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {isSectionEditModalOpen && editingSection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Edit Section</h3>
              <button
                onClick={() => {
                  setIsSectionEditModalOpen(false);
                  setEditingSection(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateSection} className="space-y-4">              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">AI Clarification</label>
                <textarea
                  name="aiClarification"
                  value={editingSection.aiClarification || ''}
                  onChange={handleSectionEditInputChange}
                  rows="15"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 resize-none"
                  placeholder="Enter AI clarification for this section..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsSectionEditModalOpen(false);
                    setEditingSection(null);
                  }}
                  className="px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded hover:bg-gray-500/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded hover:bg-yellow-500/30 transition-colors"
                >
                  Update Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksSection;