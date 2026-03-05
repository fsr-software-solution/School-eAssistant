import api from './api';

export type ProgressStatus = 'not started' | 'in progress' | 'completed';

export interface StudentProgress {
    _id: string;
    studentId: string;
    sectionId: string;
    status: ProgressStatus;
    createdAt: string;
    updatedAt: string;
}

export const progressService = {
    /**
     * Get progress record by ID
     */
    getProgressById: async (id: string) => {
        const response = await api.get<{ data: StudentProgress }>(`/progress/${id}`);
        return response.data.data;
    },

    /**
     * Create progress record
     */
    createProgress: async (studentId: string, sectionId: string, status: ProgressStatus = 'not started') => {
        const response = await api.post<{ data: StudentProgress }>('/progress', {
            studentId,
            sectionId,
            status,
        });
        return response.data.data;
    },

    /**
     * Update progress status
     */
    updateProgress: async (id: string, status: ProgressStatus) => {
        const response = await api.put<{ data: StudentProgress }>(`/progress/${id}`, {
            status,
        });
        return response.data.data;
    },

    /**
     * Delete progress record
     */
    deleteProgress: async (id: string) => {
        const response = await api.delete<{ data: boolean }>(`/progress/${id}`);
        return response.data.data;
    },

    /**
     * Get all progress for a student
     */
    getStudentProgress: async (studentId: string) => {
        const response = await api.get<{ data: StudentProgress[] }>(`/users/${studentId}/progress`);
        return response.data.data;
    },
};


