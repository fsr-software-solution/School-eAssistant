# Payment Routes Testing Guide

## Base URL
All payment routes start with: `http://localhost:5000/api/v1/payments`

---

## Prerequisites

### Step 1: Get Authentication Tokens

**1.1 Login as Student:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "student_username",
  "password": "student_password"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id_here",
    "username": "student_username",
    "role": "student"
  }
}
```

**1.2 Login as Admin:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "admin_username",
  "password": "admin_password"
}
```

**Save the tokens:**
- Student Access Token: `STUDENT_TOKEN`
- Admin Access Token: `ADMIN_TOKEN`

---

## PUBLIC ROUTES (No Authentication Required)

### Route 1: Get Payment Account Info
**Purpose:** Get bank account details where students should send payment

**Request:**
```http
GET http://localhost:5000/api/v1/payments/account
```

**Expected Response (Success):**
```json
{
  "success": true,
  "data": {
    "accountNumber": "1234567890",
    "accountHolderFullName": "School eAssistant",
    "bankName": "Bank Name",
    "message": "Please pay using mobile banking and verify the recipient full name before confirming."
  }
}
```

**Expected Response (No Account Configured):**
```json
{
  "success": false,
  "message": "Payment account not configured. Please contact admin."
}
```

---

## STUDENT ROUTES (Require Student Authentication)

### Route 2: Get Active Premium Plans
**Purpose:** View available premium plans

**Request:**
```http
GET http://localhost:5000/api/v1/payments/plans
Authorization: Bearer STUDENT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "plan_id_1",
      "planName": "Monthly Plan",
      "amount": 1000,
      "durationDays": 30,
      "features": ["feature1", "feature2"],
      "isActive": true
    }
  ]
}
```

---

### Route 3: Check Premium Access
**Purpose:** Check if current student has active premium access

**Request:**
```http
GET http://localhost:5000/api/v1/payments/premium-access
Authorization: Bearer STUDENT_TOKEN
```

**Expected Response (Has Access):**
```json
{
  "success": true,
  "hasAccess": true,
  "data": {
    "planName": "Monthly Plan",
    "features": ["feature1", "feature2"],
    "expiresAt": "2024-12-31T23:59:59.000Z"
  }
}
```

**Expected Response (No Access):**
```json
{
  "success": true,
  "hasAccess": false,
  "data": null
}
```

---

### Route 4: Upload Payment Screenshot
**Purpose:** Upload payment screenshot for verification

**Request:**
```http
POST http://localhost:5000/api/v1/payments/upload-screenshot
Authorization: Bearer STUDENT_TOKEN
Content-Type: multipart/form-data

Form Data:
- screenshot: [FILE] (image file: jpg, jpeg, or png)
- planId: "plan_id_here"
```

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/v1/payments/upload-screenshot \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -F "screenshot=@/path/to/payment_screenshot.jpg" \
  -F "planId=plan_id_here"
```

**Using Postman:**
1. Select POST method
2. URL: `http://localhost:5000/api/v1/payments/upload-screenshot`
3. Headers: `Authorization: Bearer STUDENT_TOKEN`
4. Body → form-data:
   - Key: `screenshot` (Type: File) → Select image file
   - Key: `planId` (Type: Text) → Enter plan ID

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Payment verified successfully. You now have premium access!",
  "data": {
    "transactionId": "TXN123456",
    "planName": "Monthly Plan",
    "amount": 1000,
    "verificationStatus": "approved",
    "expiresAt": "2024-12-31T23:59:59.000Z"
  }
}
```

**Possible Error Responses:**
- Missing file: `{"success": false, "message": "Payment screenshot file is required"}`
- Invalid format: `{"success": false, "message": "Invalid format. Allowed: jpg, jpeg, png"}`
- Amount insufficient: `{"success": false, "message": "Payment amount is insufficient"}`
- Duplicate transaction: `{"success": false, "message": "This payment has already been processed..."}`

---

### Route 5: Get Payment History
**Purpose:** Get all payment transactions for current student

**Request:**
```http
GET http://localhost:5000/api/v1/payments/history
Authorization: Bearer STUDENT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "transaction_id",
      "transactionId": "TXN123456",
      "studentId": "student_id",
      "planId": {
        "_id": "plan_id",
        "planName": "Monthly Plan",
        "amount": 1000,
        "durationDays": 30
      },
      "paidAmount": 1000,
      "verificationStatus": "approved",
      "paymentDate": "2024-01-15T10:00:00.000Z",
      "expiresAt": "2024-02-15T10:00:00.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### Route 6: Get Payment Status by Transaction ID
**Purpose:** Get details of a specific payment transaction

**Request:**
```http
GET http://localhost:5000/api/v1/payments/status/TXN123456
Authorization: Bearer STUDENT_TOKEN
```

**Replace `TXN123456` with actual transaction ID**

**Expected Response (Success):**
```json
{
  "success": true,
  "data": {
    "_id": "transaction_id",
    "transactionId": "TXN123456",
    "planId": {
      "_id": "plan_id",
      "planName": "Monthly Plan",
      "amount": 1000,
      "durationDays": 30
    },
    "verificationStatus": "approved",
    "paidAmount": 1000,
    "expiresAt": "2024-02-15T10:00:00.000Z"
  }
}
```

**Expected Response (Not Found):**
```json
{
  "success": false,
  "message": "Payment transaction not found"
}
```

---

## ADMIN ROUTES (Require Admin Authentication)

### Route 7: Create Premium Plan
**Purpose:** Create a new premium plan (Admin only)

**Request:**
```http
POST http://localhost:5000/api/v1/payments/admin/plans
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "planName": "Yearly Plan",
  "amount": 10000,
  "durationDays": 365,
  "features": ["feature1", "feature2", "feature3"],
  "isActive": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Premium plan created successfully",
  "data": {
    "_id": "plan_id",
    "planName": "Yearly Plan",
    "amount": 10000,
    "durationDays": 365,
    "features": ["feature1", "feature2", "feature3"],
    "isActive": true
  }
}
```

---

### Route 8: Get All Plans (Admin)
**Purpose:** Get all premium plans including inactive ones

**Request:**
```http
GET http://localhost:5000/api/v1/payments/admin/plans
Authorization: Bearer ADMIN_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "plan_id",
      "planName": "Monthly Plan",
      "amount": 1000,
      "durationDays": 30,
      "features": ["feature1"],
      "isActive": true,
      "isDeleted": false
    }
  ]
}
```

---

### Route 9: Get Plan by ID (Admin)
**Purpose:** Get details of a specific plan

**Request:**
```http
GET http://localhost:5000/api/v1/payments/admin/plans/plan_id_here
Authorization: Bearer ADMIN_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "plan_id",
    "planName": "Monthly Plan",
    "amount": 1000,
    "durationDays": 30,
    "features": ["feature1"],
    "isActive": true
  }
}
```

---

### Route 10: Update Premium Plan
**Purpose:** Update an existing premium plan

**Request:**
```http
PUT http://localhost:5000/api/v1/payments/admin/plans/plan_id_here
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "planName": "Updated Monthly Plan",
  "amount": 1200,
  "durationDays": 30,
  "features": ["feature1", "feature2"],
  "isActive": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Premium plan updated successfully",
  "data": {
    "_id": "plan_id",
    "planName": "Updated Monthly Plan",
    "amount": 1200,
    "durationDays": 30,
    "features": ["feature1", "feature2"],
    "isActive": true
  }
}
```

---

### Route 11: Delete Premium Plan (Soft Delete)
**Purpose:** Soft delete a premium plan

**Request:**
```http
DELETE http://localhost:5000/api/v1/payments/admin/plans/plan_id_here
Authorization: Bearer ADMIN_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Premium plan deleted successfully"
}
```

---

### Route 12: Restore Premium Plan
**Purpose:** Restore a soft-deleted premium plan

**Request:**
```http
PUT http://localhost:5000/api/v1/payments/admin/plans/plan_id_here/restore
Authorization: Bearer ADMIN_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Premium plan restored successfully"
}
```

---

### Route 13: Get Payment Account (Admin)
**Purpose:** Get payment account configuration

**Request:**
```http
GET http://localhost:5000/api/v1/payments/admin/account
Authorization: Bearer ADMIN_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "account_id",
    "accountNumber": "1234567890",
    "accountHolderFullName": "School eAssistant",
    "bankName": "Bank Name",
    "isActive": true
  }
}
```

---

### Route 14: Create/Update Payment Account
**Purpose:** Create or update payment account configuration

**Request:**
```http
PUT http://localhost:5000/api/v1/payments/admin/account
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "accountNumber": "1234567890",
  "accountHolderFullName": "School eAssistant",
  "bankName": "Bank Name"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment account updated successfully",
  "data": {
    "_id": "account_id",
    "accountNumber": "1234567890",
    "accountHolderFullName": "School eAssistant",
    "bankName": "Bank Name",
    "isActive": true
  }
}
```

---

### Route 15: Get All Payments (Admin)
**Purpose:** Get all payment transactions with filters

**Request:**
```http
GET http://localhost:5000/api/v1/payments/admin/payments?status=approved&studentId=student_id&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer ADMIN_TOKEN
```

**Query Parameters (all optional):**
- `status`: Filter by status (pending, approved, rejected)
- `studentId`: Filter by student ID
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "transaction_id",
      "transactionId": "TXN123456",
      "studentId": {
        "_id": "student_id",
        "username": "student_username"
      },
      "planId": {
        "_id": "plan_id",
        "planName": "Monthly Plan",
        "amount": 1000
      },
      "paidAmount": 1000,
      "verificationStatus": "approved",
      "paymentDate": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### Route 16: Update Payment Status
**Purpose:** Update payment verification status

**Request:**
```http
PUT http://localhost:5000/api/v1/payments/admin/payments/TXN123456/status
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "status": "approved",
  "rejectionReason": "Optional reason if rejected"
}
```

**Status values:** `pending`, `approved`, `rejected`

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment status updated",
  "data": {
    "transactionId": "TXN123456",
    "status": "approved"
  }
}
```

---

## Testing Checklist

### Public Routes
- [ ] Get payment account info (no auth)
- [ ] Get payment account info (when not configured)

### Student Routes
- [ ] Get active plans (with auth)
- [ ] Get active plans (without auth - should fail)
- [ ] Check premium access (no access)
- [ ] Check premium access (with access)
- [ ] Upload payment screenshot (valid)
- [ ] Upload payment screenshot (invalid format)
- [ ] Upload payment screenshot (missing file)
- [ ] Get payment history (empty)
- [ ] Get payment history (with transactions)
- [ ] Get payment status (valid transaction)
- [ ] Get payment status (invalid transaction)

### Admin Routes
- [ ] Create premium plan
- [ ] Get all plans
- [ ] Get plan by ID
- [ ] Update plan
- [ ] Delete plan
- [ ] Restore plan
- [ ] Get payment account
- [ ] Create/Update payment account
- [ ] Get all payments (no filters)
- [ ] Get all payments (with filters)
- [ ] Update payment status (approved)
- [ ] Update payment status (rejected)
- [ ] Test admin routes with student token (should fail)

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```
**Solution:** Add `Authorization: Bearer TOKEN` header

### 403 Forbidden
```json
{
  "success": false,
  "message": "Admin access required"
}
```
**Solution:** Use admin token instead of student token

### 404 Not Found
```json
{
  "success": false,
  "message": "Route not found"
}
```
**Solution:** Check the URL path and base URL

---

## Testing Tools

### Option 1: Postman
1. Import collection or create manually
2. Set environment variables for tokens
3. Use collection runner for batch testing

### Option 2: cURL
Use the cURL commands provided above

### Option 3: Thunder Client (VS Code Extension)
1. Install Thunder Client extension
2. Create requests in VS Code
3. Save tokens as environment variables

### Option 4: REST Client (VS Code Extension)
1. Install REST Client extension
2. Create `.http` file with requests
3. Click "Send Request" above each request

---

## Quick Test Script (Using REST Client)

Save this as `test-payments.http`:

```http
### Variables
@baseUrl = http://localhost:5000/api/v1/payments
@studentToken = YOUR_STUDENT_TOKEN_HERE
@adminToken = YOUR_ADMIN_TOKEN_HERE

### 1. Get Payment Account (Public)
GET {{baseUrl}}/account

### 2. Get Plans (Student)
GET {{baseUrl}}/plans
Authorization: Bearer {{studentToken}}

### 3. Check Premium Access (Student)
GET {{baseUrl}}/premium-access
Authorization: Bearer {{studentToken}}

### 4. Get Payment History (Student)
GET {{baseUrl}}/history
Authorization: Bearer {{studentToken}}

### 5. Get All Plans (Admin)
GET {{baseUrl}}/admin/plans
Authorization: Bearer {{adminToken}}

### 6. Get Payment Account (Admin)
GET {{baseUrl}}/admin/account
Authorization: Bearer {{adminToken}}

### 7. Get All Payments (Admin)
GET {{baseUrl}}/admin/payments
Authorization: Bearer {{adminToken}}
```

