# LifeHub Backend API

This is the backend API for the LifeHub application, built with Node.js, Express, and Firebase.

## Architecture

- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **AI**: Google Gemini Pro
- **Payments**: Stripe

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration and environment setup
│   ├── middleware/      # Authentication, validation, and error handling
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic (AI, Habits, Tasks)
│   ├── utils/           # Helper functions
│   └── app.ts           # App entry point
└── package.json
```

## Setup & Implementation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in this directory (or the root) based on `.env.example`.
   
   **Required Variables**:
   - `JWT_SECRET`: For session security
   - `GEMINI_API_KEY`: For AI features
   - `FIREBASE_SERVICE_ACCOUNT_PATH`: Path to your Firebase service account JSON

3. **Running Development Server**:
   ```bash
   npm run dev
   ```

## API Documentation

The API follows RESTful principles. All protected endpoints require a Bearer token in the Authorization header.

### Key Endpoints

- **Auth**: `/api/auth/*` (Login, Register)
- **Tasks**: `/api/tasks/*` (CRUD Operations)
- **Habits**: `/api/habits/*` (Tracking & Streaks)
- **Assistant**: `/api/assistant/*` (Chat & Insights)

See `docs/API.md` in the root directory for detailed documentation.

## Deployment

The backend is containerized for easy deployment to Google Cloud Run, AWS, or any Docker-compatible hosting.

```bash
# Build Docker image
docker build -f ../Dockerfile.backend -t lifehub-backend .

# Run container
docker run -p 5000:5000 --env-file .env lifehub-backend
```
