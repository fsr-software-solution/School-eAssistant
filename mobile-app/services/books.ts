import api from './api';

/**
 * Book Types
 */
export interface Book {
  _id: string;
  gradeLevel: string;
  subject: string;
  totalPages: number;
  toc?: any[];
  summary?: string;
  filePath: string;
  yearOfPublish: string;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  _id: string;
  bookId: string;
  unitNumber: number;
  title: string;
  startingPage: number;
  endingPage: number;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  _id: string;
  unitId: string;
  sectionNumber: string;
  parentSectionId?: string;
  headingLevel: number;
  title: string;
  startingPage: number;
  endingPage: number;
  content: string;
  aiClarification?: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Books Service
 */
export const booksService = {
  /**
   * Get all books
   */
  async getAllBooks(): Promise<Book[]> {
    const response = await api.get<{ data: Book[] }>('/books');
    return response.data.data;
  },

  /**
   * Get book by ID
   */
  async getBookById(id: string): Promise<Book> {
    const response = await api.get<{ data: Book }>(`/books/${id}`);
    return response.data.data;
  },

  /**
   * Get all units for a book
   */
  async getBookUnits(bookId: string): Promise<Unit[]> {
    const response = await api.get<{ data: Unit[] }>(`/books/${bookId}/units`);
    return response.data.data;
  },

  /**
   * Get unit by ID
   */
  async getUnitById(id: string): Promise<Unit> {
    const response = await api.get<{ data: Unit }>(`/units/${id}`);
    return response.data.data;
  },

  /**
   * Get all sections for a unit
   */
  async getUnitSections(unitId: string): Promise<Section[]> {
    const response = await api.get<{ data: Section[] }>(`/units/${unitId}/sections`);
    return response.data.data;
  },

  /**
   * Get section by ID
   */
  async getSectionById(id: string): Promise<Section> {
    const response = await api.get<{ data: Section }>(`/sections/${id}`);
    return response.data.data;
  },

  /**
   * Get subsections for a section
   */
  async getSectionSubsections(sectionId: string): Promise<Section[]> {
    const response = await api.get<{ data: Section[] }>(`/sections/${sectionId}/subsections`);
    return response.data.data;
  },
};

/**
 * Progress Types
 */
export interface StudentProgress {
  _id: string;
  studentId: string;
  sectionId: string;
  status: 'not started' | 'in progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

/**
 * Progress Service
 */
export const progressService = {
  /**
   * Get progress by ID
   */
  async getProgressById(id: string): Promise<StudentProgress> {
    const response = await api.get<{ data: StudentProgress }>(`/progress/${id}`);
    return response.data.data;
  },

  /**
   * Create or update progress for a section
   */
  async updateSectionProgress(sectionId: string, status: 'not started' | 'in progress' | 'completed'): Promise<StudentProgress> {
    try {
      // Try to create first
      const response = await api.post<{ data: StudentProgress }>('/progress', {
        sectionId,
        status,
      });
      return response.data.data;
    } catch (error: any) {
      // If already exists, we need to find and update it
      // For now, we'll handle this on the backend or create a separate endpoint
      // This is a simplified version - you may need to adjust based on your backend
      throw error;
    }
  },
};

