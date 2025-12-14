# Local Testing Guide for LifeHub

## 1. Local Setup (Frontend & Backend)

### Prerequisites
- Node.js 20+
- `.env` file populated (copy `.env.example`).

### Running Manually

 **Terminal 1: Backend**
```bash
cd backend
npm install
npm run dev
# The API will start at http://localhost:5000
```

 **Terminal 2: Frontend**
```bash
# In the root 'lifehub (V 1.2)' directory
npm install
npm run dev
# The App will start at http://localhost:3000 (or similar)
```

## 2. Testing the "3 Uses" Limit

1. Open http://localhost:3000
2. **Action 1**: Click the large "+" button and create a task (e.g., "Test Task 1").
3. **Action 2**: Create another task (e.g., "Test Task 2").
4. **Action 3**: Go to the "Assistant" tab and send a message "Hello".
5. **Action 4**: Try to create a 3rd task.
   - **Expected**: A "Free Limit Reached" modal appears.
   - **Fix**: Use the `resetUsage` or clear LocalStorage/Incognito to reset.

## 3. Testing Docker (Production Simulation)

To verify the Docker containers work locally:

```bash
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/health
