# Payment OCR Service - Detailed Explanation

## 📋 Overview

The `paymentOcrService.js` file is responsible for extracting payment information from screenshot images using AI (Gemini) and fallback OCR (Tesseract). It's the "brain" that reads payment screenshots and extracts structured data.

---

## 🏗️ File Structure

```
paymentOcrService.js
├── PaymentExtractionSchema (Zod schema)
├── PaymentOcrService class
│   ├── constructor()
│   ├── _getModel() - Initializes Gemini AI
│   ├── extractPaymentFromImage() - Main extraction method
│   └── extractWithTesseract() - Fallback OCR method
└── Export singleton instance
```

---

## 🔍 Part-by-Part Explanation

### **1. Imports & Dependencies**

```javascript
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';
import Tesseract from 'tesseract.js';
```

**What they do:**
- `ChatGoogleGenerativeAI` - Google's Gemini AI model wrapper
- `HumanMessage` - LangChain message format for AI
- `z` (Zod) - Schema validation library
- `Tesseract` - Fallback OCR library (reads text from images)

---

### **2. PaymentExtractionSchema (Lines 10-18)**

```javascript
export const PaymentExtractionSchema = z.object({
  transactionId: z.string().describe('Unique payment/transaction ID...'),
  senderName: z.string().describe('Full name of the person who sent...'),
  senderAccountNumber: z.string().optional().describe('...'),
  recipientName: z.string().describe('...'),
  recipientAccountNumber: z.string().describe('...'),
  amount: z.number().describe('...'),
  paymentDate: z.string().describe('...')
});
```

**Purpose:** Defines the structure of data to extract from screenshots

**What it does:**
- Tells AI what fields to extract
- Validates extracted data format
- Ensures data types are correct (string, number, etc.)

**Example Output:**
```javascript
{
  transactionId: "ETB-9854",
  senderName: "YOHANES DEBEBE MULATU",
  recipientName: "YARED SHIMELIS TESHOME",
  amount: 400.00,
  paymentDate: "2025-08-16"
}
```

---

### **3. PaymentOcrService Class**

#### **Constructor (Lines 25-28)**

```javascript
constructor() {
  this._model = null;
  this._structuredModel = null;
}
```

**Purpose:** Initializes empty model storage (lazy loading)

**Why:** Models are only created when needed (saves memory)

---

#### **_getModel() Method (Lines 30-83)**

**Purpose:** Initializes and tests Gemini AI models

**How it works:**

1. **Checks if model exists** (lazy loading)
   ```javascript
   if (!this._structuredModel) { ... }
   ```

2. **Gets API key from environment**
   ```javascript
   const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
   ```

3. **Tries multiple Gemini models** (fallback strategy)
   ```javascript
   const modelsToTry = [
     'gemini-1.5-flash',    // Most stable
     'gemini-1.5-pro',      // Pro version
     'gemini-pro',          // Legacy
     'gemini-flash'         // Legacy flash
   ];
   ```

4. **For each model:**
   - Creates ChatGoogleGenerativeAI instance
   - Wraps it with structured output (Zod schema)
   - Tests with a simple message
   - If test passes → use this model
   - If test fails → try next model

5. **Returns structured model** (or null if all fail)

**Why multiple models?**
- Some models might not be available
- API might change model names
- Ensures system works even if one model fails

---

#### **extractPaymentFromImage() - Main Method (Lines 90-193)**

**Purpose:** Extracts payment data from screenshot image

**Flow:**

```
1. Get Gemini Model
   ↓
2. If no model → Use Tesseract fallback
   ↓
3. Prepare Image
   ├─ If base64 → Extract base64 string
   └─ If URL → Fetch and convert to base64
   ↓
4. Create AI Prompt
   ├─ Instructions for extraction
   ├─ CBE format example
   └─ Critical fields highlighted
   ↓
5. Send to Gemini AI
   ├─ Text prompt + Image
   └─ Get structured output
   ↓
6. Clean Extracted Data
   ├─ Remove newlines from names
   ├─ Normalize spaces
   └─ Validate required fields
   ↓
7. Return Data
   └─ If error → Fallback to Tesseract
```

**Step-by-Step Breakdown:**

##### **Step 1: Check Model Availability (Lines 91-97)**
```javascript
const structuredModel = await this._getModel();
if (!structuredModel) {
  return await this.extractWithTesseract(imageUrl);
}
```

##### **Step 2: Prepare Image (Lines 100-125)**
```javascript
// Handle two formats:
// 1. Base64: "data:image/jpeg;base64,/9j/4AAQ..."
// 2. URL: "https://res.cloudinary.com/..."

if (imageUrl.startsWith('data:')) {
  // Extract base64 from data URL
} else {
  // Fetch from URL and convert to base64
}
```

**Why base64?**
- Gemini API requires base64 format
- Easier to send in API request

##### **Step 3: Create AI Prompt (Lines 127-143)**
```javascript
const prompt = `Extract the payment transaction details...
Look for and extract:
1. Transaction ID / Payment ID
2. Sender Name
3. Sender Account Number
...
For CBE mobile banking screenshots, the format is typically:
"ETB [amount] debited from [SENDER] for [RECIPIENT]-[REF] on [DATE]"
...`;
```

**What the prompt does:**
- Tells AI what to look for
- Provides format example (CBE banking)
- Emphasizes critical fields (recipient name/account)

##### **Step 4: Send to AI (Lines 145-157)**
```javascript
const message = new HumanMessage({
  content: [
    { type: 'text', text: prompt },
    {
      type: 'image_url',
      image_url: { url: `data:${mimeType};base64,${base64Image}` }
    }
  ]
});

const result = await structuredModel.invoke([message]);
```

**What happens:**
- Creates message with text + image
- Sends to Gemini AI
- AI analyzes image and extracts data
- Returns structured data matching Zod schema

##### **Step 5: Clean Data (Lines 159-171)**
```javascript
const cleanName = (name) => {
  return name
    .replace(/\n+/g, ' ')   // Remove newlines
    .replace(/\r+/g, ' ')   // Remove carriage returns
    .replace(/\s+/g, ' ')   // Multiple spaces → single space
    .trim();
};

result.senderName = cleanName(result.senderName);
result.recipientName = cleanName(result.recipientName);
```

**Why clean?**
- OCR sometimes adds newlines: "YARED\nSHIMELIS\nTESHOME"
- Normalizes to: "YARED SHIMELIS TESHOME"
- Ensures proper validation

##### **Step 6: Validate (Lines 173-176)**
```javascript
if (!result.transactionId || !result.amount) {
  throw new Error('Required payment information not found...');
}
```

**Why validate?**
- Ensures critical data exists
- Prevents invalid transactions

##### **Step 7: Error Handling (Lines 179-192)**
```javascript
catch (error) {
  // Fallback to Tesseract if Gemini fails
  return await this.extractWithTesseract(imageUrl);
}
```

**Fallback strategy:**
- If Gemini fails → Use Tesseract
- Ensures system always works

---

#### **extractWithTesseract() - Fallback Method (Lines 200-310)**

**Purpose:** Extracts payment data using Tesseract OCR when Gemini fails

**How it works:**

1. **Convert Image to Buffer**
   ```javascript
   // Handle base64 or URL
   let imageBuffer = Buffer.from(...);
   ```

2. **Run Tesseract OCR**
   ```javascript
   const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
   // Returns raw text from image
   ```

3. **Parse Text with Regex**
   - Amount: `ETB 400.00` → `400.00`
   - Transaction ID: `ETB-9854` → `ETB-9854`
   - Date: `16-Aug-2025` → `2025-08-16`
   - Sender: `debited from YOHANES...` → `YOHANES DEBEBE MULATU`
   - Recipient: `for YARED...` → `YARED SHIMELIS TESHOME`

4. **Extract Each Field**

   **Amount Extraction:**
   ```javascript
   const amountMatch = text.match(/ETB\s*([0-9,]+\.?[0-9]*)/i) || 
                      text.match(/(?:amount|total|paid|debited)[:\s]*([0-9,]+\.?[0-9]*)/i);
   ```

   **Transaction ID:**
   ```javascript
   const transactionIdMatch = text.match(/(?:ETB[-]?)([0-9]+)/i) ||
                             text.match(/(?:ref|reference|id)[:\s-]+([A-Z0-9-]+)/i);
   ```

   **Recipient Name (CBE Format):**
   ```javascript
   // Format: "for YARED SHIMELIS TESHOME-ETB-9854"
   const recipientMatch = text.match(/for\s+([A-Z\s]+?)(?:\s*-\s*[A-Z0-9-]+|\s+on|$)/i);
   ```

5. **Clean and Format**
   ```javascript
   const extractedData = {
     transactionId: transactionIdMatch?.[1] || 'EXTRACTED_' + Date.now(),
     senderName: cleanName(senderMatch?.[1]),
     recipientName: cleanName(recipientMatch?.[1]),
     amount: parseFloat(amountMatch[1].replace(/,/g, '')),
     paymentDate: paymentDate
   };
   ```

6. **Validate**
   ```javascript
   if (!extractedData.amount || extractedData.amount === 0) {
     throw new Error('Could not extract payment amount...');
   }
   ```

**Why Regex Patterns?**
- Tesseract returns raw text, not structured data
- Need to parse manually with patterns
- Optimized for CBE mobile banking format

---

## 🔄 Complete Flow Diagram

```
Screenshot Image
    ↓
extractPaymentFromImage(imageUrl)
    ↓
    ├─> Try Gemini AI
    │   ├─> Initialize model (_getModel)
    │   ├─> Convert image to base64
    │   ├─> Create prompt
    │   ├─> Send to Gemini
    │   ├─> Get structured output
    │   ├─> Clean names
    │   └─> Validate → Return ✅
    │
    └─> If Gemini fails
        ↓
        extractWithTesseract(imageUrl)
            ├─> Convert to buffer
            ├─> Run Tesseract OCR
            ├─> Get raw text
            ├─> Parse with regex
            ├─> Extract fields
            ├─> Clean names
            └─> Validate → Return ✅
```

---

## 🎯 Key Features

### **1. Dual OCR Strategy**
- **Primary:** Gemini AI (intelligent, structured)
- **Fallback:** Tesseract (reliable, regex-based)

### **2. Model Fallback**
- Tries multiple Gemini models
- Ensures system works even if one model unavailable

### **3. Data Cleaning**
- Removes newlines, extra spaces
- Normalizes names for validation

### **4. CBE Format Optimization**
- Specifically optimized for CBE mobile banking
- Understands format: "ETB [amount] debited from [SENDER] for [RECIPIENT]-[REF]"

### **5. Error Handling**
- Graceful fallbacks
- Clear error messages
- Always returns valid data structure

---

## 📊 Input/Output Examples

### **Input:**
```
Image URL: "https://res.cloudinary.com/.../screenshot.jpg"
```

### **Output (Gemini):**
```javascript
{
  transactionId: "ETB-9854",
  senderName: "YOHANES DEBEBE MULATU",
  senderAccountNumber: "",
  recipientName: "YARED SHIMELIS TESHOME",
  recipientAccountNumber: "",
  amount: 400.00,
  paymentDate: "2025-08-16"
}
```

### **Output (Tesseract Fallback):**
```javascript
{
  transactionId: "ETB-9854",
  senderName: "YOHANES DEBEBE MULATU",
  senderAccountNumber: "",
  recipientName: "YARED SHIMELIS TESHOME",
  recipientAccountNumber: "",
  amount: 400.00,
  paymentDate: "2025-08-16"
}
```

---

## 🔧 Configuration

### **Required Environment Variables:**

```env
# Gemini AI (Primary OCR)
GOOGLE_API_KEY=your_api_key
# OR
GEMINI_API_KEY=your_api_key
```

### **Optional:**
- Tesseract works without API keys (local processing)

---

## 🐛 Common Issues & Solutions

### **Issue: "GOOGLE_API_KEY must be set"**
- **Cause:** Missing API key
- **Solution:** System falls back to Tesseract automatically

### **Issue: "No working Gemini model found"**
- **Cause:** All models failed initialization
- **Solution:** Uses Tesseract fallback (still works!)

### **Issue: "Required payment information not found"**
- **Cause:** OCR couldn't extract transactionId or amount
- **Solution:** Check image quality, ensure screenshot is clear

### **Issue: Names have newlines**
- **Cause:** OCR extraction artifacts
- **Solution:** Already handled by `cleanName()` function

---

## 💡 How It's Used

```javascript
// In paymentController.js
const extractedData = await paymentOcrService.extractPaymentFromImage(
  cloudinaryResult.secure_url
);

// extractedData contains:
// {
//   transactionId: "...",
//   senderName: "...",
//   recipientName: "...",
//   amount: 400.00,
//   ...
// }
```

---

## 📝 Summary

**The Payment OCR Service:**
1. ✅ Uses AI (Gemini) for intelligent extraction
2. ✅ Falls back to Tesseract if AI fails
3. ✅ Handles multiple image formats (URL, base64)
4. ✅ Cleans and normalizes extracted data
5. ✅ Validates required fields
6. ✅ Optimized for CBE mobile banking format
7. ✅ Always returns structured data

**It's the "eyes" of the payment system - reading and understanding payment screenshots!** 👁️🤖

