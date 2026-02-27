import api from './api';

export interface PremiumPlan {
    _id: string;
    planName: string;
    description?: string;
    amount: number;
    durationDays: number;
    features: string[];
    isDeleted: boolean;
    createdAt: string;
}

export interface PaymentAccount {
    accountNumber: string;
    accountHolderFullName: string;
    bankName: string;
    message: string;
}

export interface PaymentTransaction {
    _id: string;
    transactionId: string;
    studentId: string;
    planId: { _id: string; planName: string; amount: number; durationDays: number; features: string[] } | string;
    senderName: string;
    recipientName: string;
    paidAmount: number;
    paymentDate: string;
    screenshotPath: string;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    expiresAt: string;
    createdAt: string;
}

export interface PremiumAccess {
    hasAccess: boolean;
    data: {
        planName: string;
        features: string[];
        expiresAt: string;
    } | null;
}

export const paymentService = {
    /**
     * Get payment account info (where to send money)
     */
    async getPaymentAccount(): Promise<PaymentAccount> {
        const response = await api.get<{ data: PaymentAccount }>('/account');
        return response.data.data;
    },

    /**
     * Get all active premium plans
     */
    async getActivePlans(): Promise<PremiumPlan[]> {
        const response = await api.get<{ data: PremiumPlan[] }>('/plans');
        return response.data.data;
    },

    /**
     * Check if current student has active premium access
     */
    async checkPremiumAccess(): Promise<PremiumAccess> {
        const response = await api.get<PremiumAccess>('/premium-access');
        return response.data;
    },

    /**
     * Upload a payment screenshot for verification
     * @param planId - the plan being paid for
     * @param imageUri - local URI of the image
     */
    async uploadPaymentScreenshot(
        planId: string,
        imageUri: string,
        phoneNumber?: string
    ): Promise<{ transactionId: string; planName: string; verificationStatus: string; expiresAt: string }> {
        const formData = new FormData();
        formData.append('planId', planId);
        if (phoneNumber) {
            formData.append('phoneNumber', phoneNumber);
        }
        formData.append('screenshot', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'payment.jpg',
        } as any);

        const response = await api.post<{ data: any }>('/upload-screenshot', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    /**
     * Get payment history for the current student
     */
    async getPaymentHistory(): Promise<PaymentTransaction[]> {
        const response = await api.get<{ data: PaymentTransaction[] }>('/history');
        return response.data.data;
    },

    /**
     * Get payment status by transaction ID
     */
    async getPaymentStatus(transactionId: string): Promise<PaymentTransaction> {
        const response = await api.get<{ data: PaymentTransaction }>(`/status/${transactionId}`);
        return response.data.data;
    },
};
