import api from './api';

export interface Language {
    code: string;
    lang: string;
    language: string;
}

export const translationService = {
    /**
     * Get Ethiopian languages
     */
    async getEthiopianLanguages(): Promise<Language[]> {
        const response = await api.get<Language[]>('/translates/ethiopians');
        return response.data;
    },

    /**
     * Translate text
     * We pass the `lang` property (e.g. "amharic" or "somali") to ensure 
     * the backend uses the exact language string expected by google-translate-nodejs.
     */
    async translateText(text: string, to: string): Promise<string> {
        if (!text || !text.trim()) return '';

        try {
            // Very safe chunk size to avoid 503 errors and URL length limits
            const MAX_CHUNK_SIZE = 800;
            if (text.length <= MAX_CHUNK_SIZE) {
                return await this._doTranslate(text, to);
            }

            const chunks = this._splitText(text, MAX_CHUNK_SIZE);
            let fullTranslation = '';

            for (const chunk of chunks) {
                const translated = await this._doTranslate(chunk, to);
                fullTranslation += (fullTranslation ? '\n\n' : '') + translated;
                // Add a tiny artificial delay to avoid hammering the free API rate limits
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            return fullTranslation;
        } catch (error: any) {
            console.error('Translation error:', error);
            throw error;
        }
    },

    async _doTranslate(text: string, to: string): Promise<string> {
        if (!text.trim()) return '';
        const response = await api.post<{ data: any }>('/translates', { text, to });
        const result = response.data.data;
        if (typeof result === 'string') return result;
        if (result && typeof result === 'object') {
            if (result.target && typeof result.target === 'string') return result.target;
            if (result.text && typeof result.text === 'string') return result.text;
            return JSON.stringify(result);
        }
        return String(result || '');
    },

    _splitText(text: string, size: number): string[] {
        const chunks: string[] = [];
        let remaining = text;

        while (remaining.length > 0) {
            if (remaining.length <= size) {
                chunks.push(remaining);
                break;
            }

            let cutIndex = remaining.lastIndexOf('\n\n', size);
            if (cutIndex === -1) cutIndex = remaining.lastIndexOf('\n', size);
            if (cutIndex === -1) cutIndex = remaining.lastIndexOf('. ', size);
            if (cutIndex === -1) cutIndex = remaining.lastIndexOf(' ', size);
            if (cutIndex === -1) cutIndex = size;

            // Ensure we do not drop punctuation/whitespace boundaries which cause string truncation
            const offset = (cutIndex < remaining.length && (remaining[cutIndex] === '.' || remaining[cutIndex] === ' ' || remaining[cutIndex] === '\n')) ? 1 : 0;
            const chunk = remaining.substring(0, cutIndex + offset);

            if (chunk.trim()) {
                chunks.push(chunk.trim());
            }
            remaining = remaining.substring(cutIndex + offset).trimStart();
        }

        return chunks;
    },
};
