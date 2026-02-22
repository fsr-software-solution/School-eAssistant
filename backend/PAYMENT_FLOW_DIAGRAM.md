# Payment System - Visual Flow Diagram

## 🎯 Simple Overview

```
┌─────────────┐
│   Student   │
└──────┬──────┘
       │
       │ 1. Views payment account info
       ▼
┌─────────────────────┐
│  PaymentAccount DB   │
│  (Where to pay)      │
└─────────────────────┘
       │
       │ 2. Views available plans
       ▼
┌─────────────────────┐
│   PremiumPlan DB     │
│  (Subscription plans)│
└─────────────────────┘
       │
       │ 3. Makes payment via mobile banking
       │ 4. Takes screenshot
       │ 5. Uploads screenshot
       ▼
┌─────────────────────┐
│  paymentRoutes.js    │
│  (API Endpoint)      │
└──────┬──────────────┘
       │
       │ Middleware: Auth + File Upload
       ▼
┌─────────────────────┐
│ paymentController.js│
│ (Main Logic)        │
└──────┬──────────────┘
       │
       │ 6. Uploads to Cloudinary
       ▼
┌─────────────────────┐
│   Cloudinary        │
│  (Image Storage)    │
└──────┬──────────────┘
       │
       │ 7. Calls OCR Service
       ▼
┌─────────────────────┐
│ paymentOcrService.js │
│ (AI Extraction)     │
└──────┬──────────────┘
       │
       │ Extracts: Transaction ID, Names, Amount, Date
       ▼
┌─────────────────────┐
│ paymentController.js│
│ (Validation)        │
└──────┬──────────────┘
       │
       │ Validates against:
       │ • PaymentAccount (recipient name/account)
       │ • PremiumPlan (amount)
       │ • PaymentTransaction (duplicate check)
       ▼
┌─────────────────────┐
│ PaymentTransaction   │
│ (Saves payment)      │
└──────┬──────────────┘
       │
       │ 8. Grants premium access
       ▼
┌─────────────────────┐
│   Student gets      │
│  Premium Access!    │
└─────────────────────┘
```

---

## 📁 File Interaction Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    API Request                          │
│         POST /api/payments/upload-screenshot           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │   paymentRoutes.js      │
        │  • Defines endpoints    │
        │  • Applies middleware    │
        └────────┬─────────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │  paymentController.js   │
        │  • Main business logic  │
        │  • Orchestrates flow   │
        └────┬───────────┬────────┘
             │           │
             │           │
    ┌────────▼───┐  ┌────▼──────────────┐
    │ Cloudinary │  │ paymentOcrService │
    │ (Storage)  │  │ (AI Extraction)   │
    └────────────┘  └────┬──────────────┘
                         │
                         │ Extracted Data
                         ▼
        ┌────────────────────────┐
        │  paymentController.js   │
        │  (Validation)          │
        └────┬───────────┬────────┘
             │           │
    ┌────────▼───┐  ┌────▼──────────────┐
    │PaymentAccount│  │  PremiumPlan     │
    │ (Validates)  │  │  (Validates)    │
    └──────────────┘  └──────────────────┘
             │
             ▼
        ┌────────────────────────┐
        │ PaymentTransaction       │
        │ (Saves to DB)           │
        └─────────────────────────┘
```

---

## 🔄 Complete Request Flow

```
1. REQUEST
   └─> POST /api/payments/upload-screenshot
       Headers: Authorization: Bearer TOKEN
       Body: form-data
         - screenshot: [FILE]
         - planId: "plan123"

2. ROUTE HANDLER (paymentRoutes.js)
   └─> protect middleware (checks auth)
   └─> upload.single('screenshot') middleware (handles file)
   └─> PaymentController.uploadPaymentScreenshot()

3. CONTROLLER (paymentController.js)
   ├─> Validates planId from body
   ├─> Uploads file to Cloudinary
   │   └─> Gets secure_url
   │
   ├─> Calls OCR Service
   │   └─> paymentOcrService.extractPaymentFromImage()
   │       ├─> Tries Gemini AI first
   │       └─> Falls back to Tesseract if needed
   │       └─> Returns extracted data
   │
   ├─> Validates Payment
   │   ├─> Gets PremiumPlan from DB
   │   ├─> Gets PaymentAccount from DB
   │   ├─> Validates recipient name matches
   │   ├─> Validates account number (if visible)
   │   ├─> Validates amount ≥ plan amount
   │   └─> Checks for duplicate transaction ID
   │
   ├─> Creates PaymentTransaction
   │   └─> Saves to database
   │
   └─> Returns Success Response

4. RESPONSE
   └─> {
         "success": true,
         "message": "Payment verified successfully...",
         "data": { ... }
       }
```

---

## 🗄️ Database Models Relationship

```
┌──────────────┐
│    Users     │
│  (Students) │
└──────┬───────┘
       │
       │ studentId
       ▼
┌──────────────────────┐
│ PaymentTransaction   │
│                      │
│ • transactionId      │
│ • studentId ────────┼──> Users
│ • planId ───────────┼──> PremiumPlan
│ • recipientName     │
│ • paidAmount        │
│ • expiresAt         │
└──────────────────────┘
       │
       │ Validates against
       ▼
┌──────────────────────┐
│  PaymentAccount      │
│                      │
│ • accountNumber      │
│ • accountHolderName  │
│ • isActive           │
└──────────────────────┘
       │
       │ Referenced by
       ▼
┌──────────────────────┐
│   PremiumPlan       │
│                      │
│ • planName           │
│ • amount             │
│ • durationDays       │
│ • features           │
└──────────────────────┘
```

---

## 🔍 Validation Flow

```
Extracted Data from OCR
    │
    ├─> Recipient Name
    │   └─> Compare with PaymentAccount.accountHolderFullName
    │       └─> ✅ Match? → Continue
    │       └─> ❌ No Match? → Error
    │
    ├─> Recipient Account Number
    │   └─> Visible in screenshot?
    │       ├─> Yes → Compare with PaymentAccount.accountNumber
    │       └─> No → Use PaymentAccount.accountNumber (fallback)
    │
    ├─> Amount
    │   └─> Compare with PremiumPlan.amount
    │       └─> ✅ ≥ plan amount? → Continue
    │       └─> ❌ Less? → Error
    │
    └─> Transaction ID
        └─> Check PaymentTransaction for duplicates
            └─> ✅ Unique? → Continue
            └─> ❌ Exists? → Error (already processed)
```

---

## 🎨 Component Responsibilities

```
┌─────────────────────────────────────────┐
│         paymentRoutes.js                 │
│  • Route definitions                     │
│  • Middleware application                │
│  • Request routing                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      paymentController.js                │
│  • Business logic                        │
│  • Validation                           │
│  • Database operations                  │
│  • Response formatting                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      paymentOcrService.js                │
│  • Image processing                      │
│  • AI/OCR extraction                     │
│  • Data cleaning                        │
│  • Error handling                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         Models (Mongoose)                │
│  • PaymentAccount                        │
│  • PaymentTransaction                    │
│  • PremiumPlan                           │
│  • Data validation                       │
└─────────────────────────────────────────┘
```

---

## 📊 Data Flow Example

**Input:**
```
Screenshot Image (CBE Mobile Banking)
├─ Shows: "ETB 400.00 debited from YOHANES for YARED SHIMELIS TESHOME-ETB-9854"
└─ planId: "507f1f77bcf86cd799439011"
```

**Processing:**
```
1. Upload to Cloudinary
   └─> secure_url: "https://res.cloudinary.com/..."

2. OCR Extraction
   └─> {
         transactionId: "ETB-9854",
         senderName: "YOHANES DEBEBE MULATU",
         recipientName: "YARED SHIMELIS TESHOME",
         amount: 400.00,
         paymentDate: "2025-08-16"
       }

3. Validation
   ├─> PaymentAccount.accountHolderFullName = "YARED SHIMELIS TESHOME" ✅
   ├─> PremiumPlan.amount = 99.00, paidAmount = 400.00 ✅
   └─> Transaction ID "ETB-9854" not found ✅

4. Save Transaction
   └─> PaymentTransaction created with expiresAt = today + 30 days
```

**Output:**
```json
{
  "success": true,
  "message": "Payment verified successfully. You now have premium access!",
  "data": {
    "transactionId": "ETB-9854",
    "planName": "Premium Monthly",
    "amount": 400,
    "expiresAt": "2025-09-16T00:00:00.000Z"
  }
}
```

---

This visual guide complements the detailed README and helps understand the flow at a glance! 🎯

