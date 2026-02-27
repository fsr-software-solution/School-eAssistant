import api from './api';

export interface ChatSession {
    _id: string;
    studentId: string;
    type: 'interaction' | 'quiz';
    summary?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Interaction {
    _id: string;
    chatSessionId?: string;
    sectionId?: string;
    studentId: string;
    studentQuestion: string;
    aiAnswer: string;
    confidenceScore?: number;
    createdAt: string;
}

export interface Quiz {
    _id: string;
    chatSessionId: string;
    question: string;
    choices: string[];
    answer: string;
    explanation?: string;
    studentAttempt?: string;
    createdAt: string;
}

export const chatService = {
    // ── Chat Sessions ──────────────────────────────────
    async getAllChats(): Promise<ChatSession[]> {
        const response = await api.get<{ data: ChatSession[] }>('/chats');
        return response.data.data;
    },

    async getChatById(id: string): Promise<ChatSession> {
        const response = await api.get<{ data: ChatSession }>(`/chats/${id}`);
        return response.data.data;
    },

    async createChat(studentId: string, type: 'interaction' | 'quiz'): Promise<ChatSession> {
        const response = await api.post<{ data: ChatSession }>('/chats', { studentId, type });
        return response.data.data;
    },

    async deleteChat(id: string): Promise<void> {
        await api.delete(`/chats/${id}`);
    },

    // ── Interactions (AI Chat Messages) ───────────────
    async getChatInteractions(chatId: string): Promise<Interaction[]> {
        const response = await api.get<{ data: Interaction[] }>(`/chats/${chatId}/interactions`);
        return response.data.data;
    },

    async sendMessage(chatSessionId: string, studentQuestion: string): Promise<Interaction> {
        const response = await api.post<{ data: Interaction }>('/interactions', {
            chatSessionId,
            studentQuestion,
        });
        return response.data.data;
    },

    // ── Quizzes ────────────────────────────────────────
    async getChatQuizzes(chatId: string): Promise<Quiz[]> {
        const response = await api.get<{ data: Quiz[] }>(`/chats/${chatId}/quizzes`);
        return response.data.data;
    },

    async generateQuizzes(
        chatSessionId: string,
        baseIdea: string,
        numberOfQuestions: number = 5
    ): Promise<Quiz[]> {
        const response = await api.post<{ data: Quiz[] }>('/quizzes', {
            chatSessionId,
            baseIdea,
            numberOfQuestions,
        });
        return response.data.data;
    },
};
