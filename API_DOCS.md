# Credify Bank Backend & API Documentation

## 📡 API Endpoints

*Note: The frontend calls these endpoints through the API Gateway on port `3000` (e.g., `http://localhost:3000/api/auth/register`).*

### 1. Authentication (User Service - Internal Port `3001`)

#### `POST /api/auth/register`
Creates a new user.
- **Body**: `firstName`, `lastName`, `email`, `password`, `idNumber`, `birthdate`, `address`
- **Response**: User object and JWT `token`.

#### `POST /api/auth/login`
Authenticates a user.
- **Body**: `email`, `password`
- **Response**: User object and JWT `token`.

#### `GET /api/auth/me`
Fetches current user profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Full profile details and KYC status.

### 2. KYC (KYC Service - Internal Port `3002`)

*All requests require `Authorization: Bearer <token>` in the headers.*

#### `GET /api/kyc/status`
Gets the current KYC application status and completed documents checklist.
- **Response**: `{ status: "PENDING", documents: { nationalIdFront: true... } }`

#### `POST /api/kyc/upload/national-id`
Uploads the ID scans.
- **Type**: `multipart/form-data`
- **Body**: `front` (Image/PDF), `back` (Image/PDF)

#### `POST /api/kyc/upload/proof-of-address`
Uploads utility bill or documentation.
- **Type**: `multipart/form-data`
- **Body**: `document` (Image/PDF)

#### `POST /api/kyc/upload/face-selfie`
Uploads the selfie and automatically triggers Face Verification.
- **Type**: `multipart/form-data`
- **Body**: `selfie` (Image)

### 3. Face Verification AI (Face Service - Internal Port `8000`)
*Called automatically by the KYC service.*

#### `POST /verify`
- **Type**: `multipart/form-data`
- **Body**: `id_image`, `selfie_image`
- **Response**: `{ "verified": true, "distance": 0.23, "model": "VGG-Face", "threshold": 0.40 }`
