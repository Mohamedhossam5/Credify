# Credify Bank Backend & API Documentation

This document provides a comprehensive overview of all backend API endpoints available through the API Gateway.

## 📡 API Endpoints

*Note: The frontend calls all backend endpoints through the API Gateway on port `3000` (e.g., `http://localhost:3000/api/auth/register`). The API Gateway handles rate limiting, security headers, and proxies requests to the appropriate internal microservice.*

---

### 1. Authentication (User Service)

#### `POST /api/auth/register`
Creates a new user account.
- **Body**: `firstName`, `lastName`, `email`, `password`, `idNumber`, `birthdate`, `address`
- **Response**: User object and JWT `token`.

#### `POST /api/auth/login`
Authenticates a user and returns a session token.
- **Body**: `email`, `password`
- **Response**: User object and JWT `token`.

#### `GET /api/auth/me`
Fetches the current user profile based on their token.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Full profile details, role, and KYC status.

---

### 2. Finance & Banking (User Service)

*All requests require `Authorization: Bearer <token>` in the headers.*

#### `POST /api/transfer`
Initiates a fund transfer from the authenticated user to another account.
- **Body**: 
  - `type` (SAME_BANK, DOMESTIC, INTERNATIONAL)
  - `amount`
  - `recipientName`, `recipientAccount`, `recipientBank` (optional)
  - `swiftCode` (optional), `recipientAddress` (optional), `reference` (optional)
- **Response**: Success message and transaction reference.

#### `GET /api/transactions`
Fetches transaction history for the authenticated user.
- **Query Params**: `limit` (e.g., `?limit=5`) to restrict the number of results. If the user is an admin, `?global=true` can be passed to fetch all transactions across the platform.
- **Response**: Array of `transactions` objects.

---

### 3. KYC (KYC Service)

*All requests require `Authorization: Bearer <token>` in the headers.*

#### `GET /api/kyc/status`
Gets the current KYC application status and completed documents checklist.
- **Response**: `{ status: "PENDING", documents: { nationalIdFront: true... } }`

#### `POST /api/kyc/verify`
Triggers the final manual or background verification process (often after document uploads are complete).
- **Body**: (Empty or confirmation payload)
- **Response**: `{ message: '...' }`

#### `POST /api/kyc/upload/national-id`
Uploads the ID scans (front and back).
- **Type**: `multipart/form-data`
- **Body**: `front` (Image/PDF), `back` (Image/PDF)

#### `POST /api/kyc/upload/proof-of-address`
Uploads utility bill or proof of residence documentation.
- **Type**: `multipart/form-data`
- **Body**: `document` (Image/PDF)

#### `POST /api/kyc/upload/face-selfie`
Uploads the selfie and automatically triggers AI Face Verification.
- **Type**: `multipart/form-data`
- **Body**: `selfie` (Image)

---

### 4. Admin API (API Gateway Orchestration)

*All requests require `Authorization: Bearer <token>` of an Admin user.*

#### `GET /api/admin/dashboard`
Fetches aggregated user data and KYC records for the admin dashboard. Reaches out to both User and KYC services internally.
- **Response**: `{ users: [...] }` (Array of users merged with their KYC match scores and status).

#### `DELETE /api/admin/users/:id`
Deletes a user account entirely. This endpoint safely cascades deletions across both the User Service (transactions, accounts) and KYC Service (documents, application state).
- **Params**: `id` (User ID)
- **Response**: `{ message: 'User deleted successfully.' }`

---

### 5. Utilities (API Gateway)

#### `GET /api/fx-rates`
Fetches live foreign exchange rates against the Egyptian Pound (EGP). Proxies requests securely to the external `fastforex.io` API.
- **Headers**: `Authorization: Bearer <token>` (Optional)
- **Response**: `{ base: "EGP", results: { USD: 0.021, EUR: 0.019, ... }, updated: "..." }`

---

### 6. Internal Machine Learning (Face Service)
*Internal Port `8000`. Called automatically by the KYC service; not exposed directly to the frontend.*

#### `POST /verify`
Performs facial recognition logic.
- **Type**: `multipart/form-data`
- **Body**: `id_image`, `selfie_image`
- **Response**: `{ "verified": true, "distance": 0.23, "model": "VGG-Face", "threshold": 0.40 }`

---

