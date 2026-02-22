import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';
import Tesseract from 'tesseract.js';

/**
 * Zod schema for structured payment extraction from screenshot
 * Used with LangChain + Gemini for OCR structured output
 */
export const PaymentExtractionSchema = z.object({
  transactionId: z.string().describe('Unique payment/transaction ID from the bank receipt'),
  senderName: z.string().describe('Full name of the person who sent the payment'),
  senderAccountNumber: z.string().optional().describe('Account number of the sender if visible'),
  recipientName: z.string().describe('Full name of the recipient who received the payment'),
  recipientAccountNumber: z.string().describe('Account number of the recipient'),
  amount: z.number().describe('The payment amount in numbers'),
  paymentDate: z.string().describe('Date and time of the payment in ISO format (YYYY-MM-DD or ISO 8601)')
});

/**
 * Payment OCR Service - Extracts payment data from screenshot using
 * LangChain + Gemini AI + Zod for structured output
 */
class PaymentOcrService {
  constructor() {
    this._model = null;
    this._structuredModel = null;
  }

  async _getModel() {
    if (!this._structuredModel) {
      const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY must be set for payment OCR');
      }
      
      // Try multiple Gemini models to find a working one
      const modelsToTry = [
        'gemini-1.5-flash',           // Most stable and reliable
        'gemini-1.5-pro',             // Pro version
        'gemini-pro',                 // Legacy pro
        'gemini-flash'                // Legacy flash
      ];
      
      for (const model of modelsToTry) {
        try {
          this._model = new ChatGoogleGenerativeAI({
            model: model,
            temperature: 0,
            apiKey
          });
          
          // Use withStructuredOutput - it returns a Runnable that can be invoked
          this._structuredModel = this._model.withStructuredOutput(PaymentExtractionSchema, {
            name: 'PaymentExtraction',
            method: 'functionCalling'
          });
          
          // Test the structured model with a simple request
          try {
            const testMessage = new HumanMessage({ content: 'Test' });
            await this._structuredModel.invoke([testMessage]);
            console.log(`Successfully initialized Gemini OCR with model: ${model}`);
            break;
          } catch (testError) {
            console.log(`Model ${model} test failed:`, testError.message);
            this._structuredModel = null;
            continue;
          }
        } catch (modelError) {
          console.log(`Model ${model} initialization failed:`, modelError.message);
          this._structuredModel = null;
          continue;
        }
      }
      
      if (!this._structuredModel) {
        console.warn('No working Gemini model found. Will use Tesseract fallback.');
        // Don't throw error, let it fall back to Tesseract
      }
    }
    return this._structuredModel;
  }

  /**
   * Extract payment data from image using Gemini Vision + LangChain structured output
   * @param {string} imageUrl - Cloudinary URL or base64 data URL of the payment screenshot
   * @returns {Promise<Object>} Extracted payment data validated by Zod schema
   */
  async extractPaymentFromImage(imageUrl) {
    const structuredModel = await this._getModel();
    
    // If Gemini model is not available, go directly to Tesseract
    if (!structuredModel) {
      console.log('Gemini model not available, using Tesseract OCR...');
      return await this.extractWithTesseract(imageUrl);
    }

    try {
      // Fetch image and convert to base64 for Gemini
      let base64Image;
      let mimeType = 'image/jpeg';

      if (imageUrl.startsWith('data:')) {
        // Already base64
        const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Image = match[2];
        } else {
          throw new Error('Invalid base64 image format');
        }
      } else {
        // Fetch from URL (Cloudinary)
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        base64Image = Buffer.from(arrayBuffer).toString('base64');
        const contentType = response.headers.get('content-type');
        if (contentType) {
          mimeType = contentType.split(';')[0].trim();
        }
      }

      const prompt = `Extract the payment transaction details from this mobile banking payment confirmation screenshot.
      
Look for and extract:
1. Transaction ID / Payment ID - the unique reference number from the bank (e.g., ETB-9854, or any reference number)
2. Sender Name - the full name of the person who made the payment (the person who sent/debited from)
3. Sender Account Number - if visible on the receipt (may be masked like 1***...)
4. Recipient Name - the full name of the account that received the payment (IMPORTANT: This is the beneficiary/recipient name - look for "for [NAME]" or "to [NAME]")
5. Recipient Account Number - the account number that received the payment (IMPORTANT: This is the beneficiary account number - may not always be visible)
6. Amount - the payment amount as a number (no currency symbols, e.g., 400.00 for ETB 400.00)
7. Payment Date - the date/time of the transaction (use ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)

For CBE (Commercial Bank of Ethiopia) mobile banking screenshots, the format is typically:
"ETB [amount] debited from [SENDER NAME] for [RECIPIENT NAME]-[REFERENCE] on [DATE]"

Return ONLY the extracted data. If a field is not visible or unclear, use empty string for strings and 0 for amount.

CRITICAL: The recipient name and account number are the MOST IMPORTANT fields. Make sure to extract the beneficiary/recipient information correctly, not the sender information.`;

      const message = new HumanMessage({
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ]
      });

      const result = await structuredModel.invoke([message]);

      // Clean extracted names (remove newlines, extra spaces)
      const cleanName = (name) => {
        if (!name || typeof name !== 'string') return '';
        return name
          .replace(/\n+/g, ' ')  // Replace newlines with spaces
          .replace(/\r+/g, ' ')   // Replace carriage returns with spaces
          .replace(/\s+/g, ' ')   // Replace multiple spaces with single space
          .trim();
      };

      // Clean all name fields
      result.senderName = cleanName(result.senderName);
      result.recipientName = cleanName(result.recipientName);

      // Validate required fields
      if (!result.transactionId || !result.amount) {
        throw new Error('Required payment information (transactionId, amount) not found in screenshot');
      }

      return result;
    } catch (error) {
      console.error('Gemini OCR extraction error:', error);
      
      // Fallback to Tesseract.js if Gemini fails
      console.log('Attempting fallback OCR with Tesseract.js...');
      try {
        return await this.extractWithTesseract(imageUrl);
      } catch (tesseractError) {
        console.error('Tesseract fallback also failed:', tesseractError);
        throw new Error(
          error.message || 'Failed to extract payment information from screenshot'
        );
      }
    }
  }

  /**
   * Fallback OCR using Tesseract.js (if Gemini fails)
   * Note: Tesseract returns raw text, requires manual parsing
   * Optimized for CBE (Commercial Bank of Ethiopia) mobile banking format
   */
  async extractWithTesseract(imageUrl) {
    try {
      let imageBuffer;
      
      if (imageUrl.startsWith('data:')) {
        const match = imageUrl.match(/^data:[^;]+;base64,(.+)$/);
        if (match) {
          imageBuffer = Buffer.from(match[1], 'base64');
        } else {
          throw new Error('Invalid base64 format');
        }
      } else {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error('Failed to fetch image');
        imageBuffer = Buffer.from(await response.arrayBuffer());
      }

      const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
        logger: () => {} // Suppress Tesseract logs
      });

      console.log('Tesseract extracted text:', text.substring(0, 500)); // Debug log

      // CBE format: "ETB [amount] debited from [SENDER] for [RECIPIENT]-[REF] on [DATE]"
      // Example: "ETB 400.00 debited from YOHANES DEBEBE MULATU for YARED SHIMELIS TESHOME-ETB-9854 on 16-Aug-2025"
      
      // Extract amount (ETB 400.00 or 400.00)
      const amountMatch = text.match(/ETB\s*([0-9,]+\.?[0-9]*)/i) || 
                         text.match(/(?:amount|total|paid|debited)[:\s]*([0-9,]+\.?[0-9]*)/i) ||
                         text.match(/([0-9,]+\.?[0-9]*)\s*(?:ETB|birr|br)/i);
      
      // Extract transaction ID/reference (ETB-9854, ETB9854, or any alphanumeric ref)
      const transactionIdMatch = text.match(/(?:ETB[-]?)([0-9]+)/i) ||
                                text.match(/(?:ref|reference|id|transaction)[:\s-]+([A-Z0-9-]+)/i) ||
                                text.match(/-([A-Z0-9]{4,})/); // Pattern like "-ETB-9854" or "-REF1234"
      
      // Extract date (16-Aug-2025, 16/08/2025, etc.)
      const dateMatch = text.match(/(\d{1,2}[-/]\w{3}[-/]\d{4})/i) || // 16-Aug-2025
                       text.match(/(\d{4}[-/]\d{2}[-/]\d{2})/) ||      // 2025-08-16
                       text.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{4})/);     // 16/08/2025
      
      // Extract sender name (after "debited from" or "from")
      const senderMatch = text.match(/debited\s+from\s+([A-Z\s]+?)(?:\s+for|\s+on|\s+-|$)/i) ||
                         text.match(/from\s+([A-Z\s]{5,}?)(?:\s+for|\s+to|\s+on|\s+-|$)/i);
      
      // Extract recipient name (after "for" before "-" or "on")
      const recipientMatch = text.match(/for\s+([A-Z\s]+?)(?:\s*-\s*[A-Z0-9-]+|\s+on|\s*ETB|$)/i) ||
                            text.match(/to\s+([A-Z\s]{5,}?)(?:\s*-\s*[A-Z0-9-]+|\s+on|\s*ETB|$)/i) ||
                            text.match(/recipient[:\s]+([A-Z\s]{5,}?)(?:\s*-\s*[A-Z0-9-]+|\s+on|$)/i);
      
      // Extract account numbers (look for patterns like "Account 1***..." or full numbers)
      const senderAccountMatch = text.match(/(?:account|acc)[:\s]+([0-9*]+)/i);
      const recipientAccountMatch = text.match(/(?:to|recipient|beneficiary)[:\s]+(?:account|acc)[:\s]+([0-9]+)/i) ||
                                   text.match(/account[:\s]+([0-9]{10,})/i); // Full account numbers are usually 10+ digits

      // Parse date to ISO format
      let paymentDate = new Date().toISOString().split('T')[0];
      if (dateMatch) {
        try {
          const dateStr = dateMatch[1];
          // Try to parse different date formats
          if (dateStr.includes('-') && dateStr.match(/\d{1,2}-\w{3}-\d{4}/)) {
            // Format: 16-Aug-2025
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) {
              paymentDate = parsed.toISOString().split('T')[0];
            }
          } else {
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) {
              paymentDate = parsed.toISOString().split('T')[0];
            }
          }
        } catch (e) {
          // Keep default date
        }
      }

      // Helper function to clean extracted names (remove newlines, extra spaces)
      const cleanName = (name) => {
        if (!name) return '';
        return name
          .replace(/\n+/g, ' ')  // Replace newlines with spaces
          .replace(/\r+/g, ' ')   // Replace carriage returns with spaces
          .replace(/\s+/g, ' ')   // Replace multiple spaces with single space
          .trim();
      };

      const extractedData = {
        transactionId: transactionIdMatch?.[1] || transactionIdMatch?.[0]?.replace(/^-/, '') || 'EXTRACTED_' + Date.now(),
        senderName: cleanName(senderMatch?.[1]),
        senderAccountNumber: senderAccountMatch?.[1]?.replace(/\*/g, '') || '',
        recipientName: cleanName(recipientMatch?.[1]),
        recipientAccountNumber: recipientAccountMatch?.[1] || '',
        amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0,
        paymentDate: paymentDate
      };

      console.log('Tesseract extracted data:', extractedData); // Debug log

      // Validate that we got at least amount and transaction ID
      if (!extractedData.amount || extractedData.amount === 0) {
        throw new Error('Could not extract payment amount from screenshot');
      }

      return extractedData;
    } catch (error) {
      console.error('Tesseract extraction error:', error);
      throw new Error(`Tesseract OCR extraction failed: ${error.message}`);
    }
  }
}

export default new PaymentOcrService();

