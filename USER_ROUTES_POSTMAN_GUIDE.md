# User Management Routes - Postman Testing Guide

## Base URL
All routes: `http://localhost:5000/api/auth`

---

## Step-by-Step Testing Guide

### Prerequisites

1. **Start your server** (if not running)
   ```bash
   npm start
   # or
   node server.js
   ```

2. **Get Authentication Tokens**
   - You'll need tokens for both **Student** and **Admin** users
   - Save tokens as Postman environment variables for easy reuse

---

## Setup Postman Environment Variables

### Create Environment Variables:

1. Click **Environments** → **Create Environment**
2. Name it: `School eAssistant`
3. Add these variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `studentToken`: (will be set after login)
   - `adminToken`: (will be set after login)
   - `userId`: (will be set after getting user list)

---

## Testing All Routes

### 1. Login as Student (Get Student Token)

**Request:**
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
```json
{
  "username": "student_username",
  "password": "student_password"
}
```

**Expected Response:**
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

**Action:** Copy the `accessToken` and save it to `studentToken` variable.

---

### 2. Login as Admin (Get Admin Token)

**Request:**
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
```json
{
  "username": "admin_username",
  "password": "admin_password"
}
```

**Action:** Copy the `accessToken` and save it to `adminToken` variable.

---

### 3. Get All Users (Admin Only)

**Request:**
- **Method:** `GET`
- **URL:** `{{baseUrl}}/auth/users`
- **Headers:**
  - `Authorization`: `Bearer {{adminToken}}`
- **Query Parameters (Optional):**
  - `page`: `1` (default: 1)
  - `limit`: `10` (default: 10)
  - `role`: `student` or `admin` (filter by role)
  - `search`: `username` (search by username)

**Example URLs:**
- `{{baseUrl}}/auth/users`
- `{{baseUrl}}/auth/users?page=1&limit=20`
- `{{baseUrl}}/auth/users?role=student`
- `{{baseUrl}}/auth/users?search=john`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id_1",
      "username": "student1",
      "role": "student",
      "isDeleted": false,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

**Test Cases:**
- ✅ Should work with admin token
- ❌ Should fail with student token (403 Forbidden)
- ❌ Should fail without token (401 Unauthorized)

---

### 4. Get User by ID

**Request:**
- **Method:** `GET`
- **URL:** `{{baseUrl}}/auth/users/:id`
- **Headers:**
  - `Authorization`: `Bearer {{studentToken}}` or `Bearer {{adminToken}}`
- **Path Variables:**
  - `id`: Replace with actual user ID

**Example:**
- `{{baseUrl}}/auth/users/507f1f77bcf86cd799439011`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "student1",
    "role": "student",
    "isDeleted": false,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Test Cases:**
- ✅ Student can view their own profile
- ✅ Admin can view any user profile
- ❌ Student cannot view other user's profile (403 Forbidden)
- ❌ Should fail with invalid user ID (404 Not Found)

---

### 5. Get User Progress

**Request:**
- **Method:** `GET`
- **URL:** `{{baseUrl}}/auth/users/:id/progress`
- **Headers:**
  - `Authorization`: `Bearer {{studentToken}}` or `Bearer {{adminToken}}`
- **Path Variables:**
  - `id`: Replace with student user ID

**Example:**
- `{{baseUrl}}/auth/users/507f1f77bcf86cd799439011/progress`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "studentId": "507f1f77bcf86cd799439011",
    "username": "student1",
    "progress": [
      {
        "_id": "progress_id",
        "studentId": "507f1f77bcf86cd799439011",
        "sectionId": {
          "_id": "section_id",
          "title": "Section 1",
          "sectionNumber": 1
        },
        "status": "completed",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

**Test Cases:**
- ✅ Student can view their own progress
- ✅ Admin can view any student's progress
- ❌ Student cannot view other student's progress (403 Forbidden)
- ❌ Should fail if user is not a student (400 Bad Request)
- ❌ Should fail with invalid user ID (404 Not Found)

---

### 6. Update User

**Request:**
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/auth/users/:id`
- **Headers:**
  - `Authorization`: `Bearer {{studentToken}}` or `Bearer {{adminToken}}`
  - `Content-Type`: `application/json`
- **Path Variables:**
  - `id`: Replace with user ID
- **Body (raw JSON):**
```json
{
  "username": "new_username",
  "password": "new_password"
}
```

**Note:** 
- Students can update: `username`, `password`
- Students **cannot** update: `role`
- Admins can update: `username`, `password`, `role`

**Example Body (Student):**
```json
{
  "username": "updated_student_name"
}
```

**Example Body (Admin updating role):**
```json
{
  "role": "admin"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "updated_student_name",
    "role": "student",
    "isDeleted": false,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-16T10:00:00.000Z"
  }
}
```

**Test Cases:**
- ✅ Student can update their own username
- ✅ Student can update their own password
- ✅ Admin can update any user's username
- ✅ Admin can update any user's role
- ❌ Student cannot update their own role (403 Forbidden)
- ❌ Student cannot update other user's profile (403 Forbidden)
- ❌ Should fail if username already exists (409 Conflict)
- ❌ Should fail with invalid user ID (404 Not Found)

---

### 7. Delete User (Admin Only)

**Request:**
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/auth/users/:id`
- **Headers:**
  - `Authorization`: `Bearer {{adminToken}}`
- **Path Variables:**
  - `id`: Replace with user ID to delete

**Example:**
- `{{baseUrl}}/auth/users/507f1f77bcf86cd799439011`

**Expected Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Test Cases:**
- ✅ Admin can delete any user
- ❌ Admin cannot delete themselves (400 Bad Request)
- ❌ Student cannot delete users (403 Forbidden)
- ❌ Should fail with invalid user ID (404 Not Found)
- ❌ Should fail without token (401 Unauthorized)

---

## Complete Postman Collection Setup

### Create a Collection:

1. Click **Collections** → **New Collection**
2. Name it: `School eAssistant - User Management`

### Add Requests in Order:

1. **Login Student**
   - Method: POST
   - URL: `{{baseUrl}}/auth/login`
   - Save response token to `studentToken`

2. **Login Admin**
   - Method: POST
   - URL: `{{baseUrl}}/auth/login`
   - Save response token to `adminToken`

3. **Get All Users**
   - Method: GET
   - URL: `{{baseUrl}}/auth/users`
   - Auth: Bearer Token → `{{adminToken}}`

4. **Get User by ID**
   - Method: GET
   - URL: `{{baseUrl}}/auth/users/{{userId}}`
   - Auth: Bearer Token → `{{studentToken}}`

5. **Get User Progress**
   - Method: GET
   - URL: `{{baseUrl}}/auth/users/{{userId}}/progress`
   - Auth: Bearer Token → `{{studentToken}}`

6. **Update User**
   - Method: PUT
   - URL: `{{baseUrl}}/auth/users/{{userId}}`
   - Auth: Bearer Token → `{{studentToken}}`
   - Body: JSON with update data

7. **Delete User**
   - Method: DELETE
   - URL: `{{baseUrl}}/auth/users/{{userId}}`
   - Auth: Bearer Token → `{{adminToken}}`

---

## Quick Test Script (Postman Pre-request Script)

For **Login Student** request, add this script to save token automatically:

```javascript
// In Tests tab
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("studentToken", response.accessToken);
    pm.environment.set("userId", response.user.id);
}
```

For **Login Admin** request:

```javascript
// In Tests tab
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("adminToken", response.accessToken);
}
```

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
  "message": "You can only view your own profile"
}
```
**Solution:** Use admin token or access your own profile

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```
**Solution:** Check if user ID is correct and user exists

### 409 Conflict
```json
{
  "success": false,
  "message": "Username already exists"
}
```
**Solution:** Choose a different username

---

## Testing Checklist

### Authentication Tests
- [ ] Login as student (get token)
- [ ] Login as admin (get token)
- [ ] Test routes without token (should fail)
- [ ] Test routes with invalid token (should fail)

### Get All Users
- [ ] Get all users as admin (should work)
- [ ] Get all users as student (should fail - 403)
- [ ] Get users with pagination (?page=1&limit=5)
- [ ] Get users filtered by role (?role=student)
- [ ] Search users by username (?search=john)

### Get User by ID
- [ ] Get own profile as student (should work)
- [ ] Get other user's profile as student (should fail - 403)
- [ ] Get any user's profile as admin (should work)
- [ ] Get non-existent user (should fail - 404)

### Get User Progress
- [ ] Get own progress as student (should work)
- [ ] Get other student's progress as student (should fail - 403)
- [ ] Get any student's progress as admin (should work)
- [ ] Get progress for admin user (should fail - 400)

### Update User
- [ ] Update own username as student (should work)
- [ ] Update own password as student (should work)
- [ ] Update own role as student (should fail - 403)
- [ ] Update other user as student (should fail - 403)
- [ ] Update any user as admin (should work)
- [ ] Update user role as admin (should work)
- [ ] Update with existing username (should fail - 409)

### Delete User
- [ ] Delete user as admin (should work)
- [ ] Delete user as student (should fail - 403)
- [ ] Delete own account as admin (should fail - 400)
- [ ] Delete non-existent user (should fail - 404)

---

## Tips for Postman

1. **Use Environment Variables**: Set `baseUrl`, `studentToken`, `adminToken` for easy switching
2. **Save Responses**: Right-click response → Save Response → Save to file
3. **Use Collection Runner**: Run all requests in sequence
4. **Set Tests**: Automatically verify responses
5. **Use Pre-request Scripts**: Set variables before requests
6. **Organize Folders**: Group related requests in folders

---

## Example Postman Test Scripts

### Test for Successful Response:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.eql(true);
});
```

### Test for Error Response:
```javascript
pm.test("Status code is 403", function () {
    pm.response.to.have.status(403);
});

pm.test("Error message is present", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('message');
});
```

---

## Quick Reference

| Route | Method | Auth | Admin Only | Description |
|-------|--------|------|------------|-------------|
| `/auth/users` | GET | ✅ | ✅ | Get all users |
| `/auth/users/:id` | GET | ✅ | ❌ | Get user by ID |
| `/auth/users/:id/progress` | GET | ✅ | ❌ | Get user progress |
| `/auth/users/:id` | PUT | ✅ | ❌ | Update user |
| `/auth/users/:id` | DELETE | ✅ | ✅ | Delete user |

---

**Happy Testing! 🚀**

