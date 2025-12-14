# Deploying LifeHub to Google Cloud Run (GUI Method)

This guide is the **easiest and most modern way** to deploy. We will connect your GitHub repository directly to Cloud Run. This enables **Continuous Deployment**—every time you push code to GitHub, Google Cloud will automatically rebuild and redeploy your app.

## Prerequisites
1. **GitHub Repository**: Ensure your latest code (with the `src` refactor) is pushed to your GitHub repo.
2. **Google Cloud Project**: Have a project created with billing enabled.

---

## Part 1: Backend Deployment

### 1. Go to Cloud Run
1. Log in to the [Google Cloud Console](https://console.cloud.google.com).
2. Search for **"Cloud Run"** in the top search bar and click it.
3. Click **User Interface** (Create Service) or the **+ CREATE SERVICE** button.

### 2. Configure Source
1. **Source**: Select **"Continuously deploy new revisions from a source repository"**.
2. **Click "SET UP CLOUD BUILD"**.
3. **Repository Provider**: Select **GitHub**.
4. **Repository**: Authenticate and select `nitheshkolluri/LifeHub-App`.
5. **Branch**: Select `^main$` (or your working branch).
6. **Build Type**: Select **Dockerfile**.
7. **Source location**: `/Dockerfile.backend` (Important: ensure you point to the existing backend Dockerfile or `backend/Dockerfile` if it's inside the folder. *Check your structure: it is in the root as `Dockerfile.backend`*).
    *   *Correction*: If the backend code is in `backend/`, and the Dockerfile is `Dockerfile.backend` in the root, we might need to be careful with the context.
    *   *Better Path*: It is often safer to select **"Build Configuration"** -> **Dockerfile**.
    *   **Dockerfile location**: `Dockerfile.backend`.
    *   **Context**: `/` (current directory).
8. Click **SAVE**.

### 3. Service Settings
1. **Service Name**: `lifehub-backend`.
2. **Region**: Select one close to you (e.g., `us-central1`).
3. **Authentication**: Select **"Allow unauthenticated invocations"** (This makes your API public so the frontend can talk to it).

### 4. Variables & Secrets (Crucial)
1. Expand the **"Container, Networking, Security"** dropdown at the bottom.
2. Click the **VARIABLES & SECRETS** tab.
3. Click **ADD VARIABLE** for each of your `.env` keys:
    *   `NODE_ENV`: `production`
    *   `FIREBASE_PROJECT_ID`: (Your ID)
    *   `GEMINI_API_KEY`: (Your Key)
    *   `STRIPE_SECRET_KEY`: (Your Key)
    *   ... (add all others from .env.example)

### 5. Create
Click **CREATE**.
*   Google Cloud will now build your container. This might take 3-5 minutes.
*   Once done, copy the **Service URL** (e.g., `https://lifehub-backend-xyz.a.run.app`).

---

## Part 2: Frontend Deployment

### 1. Update Frontend Config
1. Go to your local code.
2. Open `.env.production` (or creates it).
3. Set `VITE_API_URL` to the **Backend Service URL** you just copied.
4. **Commit and Push** this change to GitHub.

### 2. Go to Cloud Run (again)
1. Click **+ CREATE SERVICE**.

### 3. Configure Source
1. **Source**: Continuously deploy from repository.
2. Select your Repo again.
3. **Build Type**: Dockerfile.
4. **Dockerfile location**: `Dockerfile.frontend`.
5. **Context**: `/`.
6. Click **SAVE**.

### 4. Service Settings
1. **Service Name**: `lifehub-frontend`.
2. **Authentication**: **"Allow unauthenticated invocations"**.
3. **Internal Port**: The `Dockerfile.frontend` uses Nginx which listens on port **80**. Cloud Run often defaults to 8080.
    *   Expand **"Container, Networking, Security"**.
    *   In the **Container** tab, look for **Container port**. Set it to **80**.

### 5. Create
Click **CREATE**.
*   Wait for the build.
*   Click the resulting URL to see your live App!

---

## Part 3: Final Link
1. Copy the **Frontend URL**.
2. Go to the [Firebase Console](https://console.firebase.google.com).
3. **Authentication** -> **Settings** -> **Authorized Domains**.
4. Add your Frontend Cloud Run domain (e.g., `lifehub-frontend-xyz.a.run.app`).
