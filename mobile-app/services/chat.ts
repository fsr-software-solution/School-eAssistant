import api from './api';

export interface ChatSession {
    _id: string;
    studentId: string;
    type: 'interaction' | 'quiz';
    summary?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Reference {
    _id: string;
    bookId: {
        _id: string;
        subject: string;
        gradeLevel: string;
        yearOfPublish?: string;
        filePath?: string;
    } | string;
    quotedText: string;
    pageNumber: number;
    lineFrom?: number;
    lineTo?: number;
    unitName?: string;
    sectionName?: string;
    createdAt: string;
}

export interface Interaction {
    _id: string;
    chatSessionId?: string;
    sectionId?: string;
    studentId: string;
    studentQuestion: string;
    aiAnswer: string;
    confidenceScore?: number;
    references?: Reference[];
    createdAt: string;
}

export interface Quiz {
    _id: string;
    chatSessionId: string;
    question: string;
    choices: string[] | Record<string, string>;
    answer: string;
    explanation?: string;
    studentAttempt?: string;
    references?: Reference[];
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

    async createChat(studentId: string, type: 'interaction' | 'quiz', signal?: AbortSignal): Promise<ChatSession> {
        const response = await api.post<{ data: ChatSession }>('/chats', { studentId, type }, { signal });
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

    async sendMessage(chatSessionId: string, studentQuestion: string, sectionId?: string): Promise<Interaction> {
        const response = await api.post<{ data: { interaction: Interaction; references: Reference[] } }>('/interactions', {
            chatSessionId,
            studentQuestion,
            sectionId,
        });
        const { interaction, references } = response.data.data;
        return { ...interaction, references };
    },

    // ── Quizzes ────────────────────────────────────────
    async getChatQuizzes(chatId: string): Promise<Quiz[]> {
        const response = await api.get<{ data: Quiz[] }>(`/chats/${chatId}/quizzes`);
        return response.data.data;
    },

    async generateQuizzes(
        chatSessionId: string,
        baseIdea: string,
        numberOfQuestions: number = 5,
        signal?: AbortSignal
    ): Promise<Quiz[]> {
        const response = await api.post<{ data: any[] }>('/quizzes', {
            chatSessionId,
            baseIdea,
            numberOfQuestions,
        }, { signal });

        return (response.data.data || []).map((item: any) => ({
            ...(item.quiz || item),
            references: item.reference ? [item.reference] : (item.references || [])
        }));
    },

    async submitQuizAttempt(quizId: string, attempt: string): Promise<Quiz> {
        const response = await api.put<{ data: Quiz }>(`/quizzes/${quizId}`, {
            attempt,
        });
        return response.data.data;
    },
    async getQuizReferences(quizId: string): Promise<Reference[]> {
        const response = await api.get<{ data: Reference[] }>(`/quizzes/${quizId}/references`);
        return response.data.data;
    },

    async getBookById(id: string): Promise<any> {
        const response = await api.get<{ data: any }>(`/books/${id}`);
        return response.data.data;
    },
};
