# LifeHub – AI-Powered Life Management Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey.svg)
![Stack](https://img.shields.io/badge/tech-React%20%7C%20Node.js%20%7C%20Firebase%20%7C%20Stripe-indigo.svg)
[![Security Status](https://img.shields.io/badge/security-compliant-green)](./SECURITY.md)

**LifeHub** is a production-ready, AI-powered life management platform that unifies tasks, habits, and financial tracking into a single, intelligent mobile and web application. Built with modern technologies and designed for scale.

> [!IMPORTANT]
> **Public Repository Notice**
> This is a public repository implemented with production-level security standards. All sensitive keys have been externalized to environment variables. Please see [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) for configuration instructions.

## 🚀 Features

### Core Functionality

- **🎯 Smart Task Management**: AI-powered task creation with intelligent priority detection and due date inference
- **🔥 Habit Tracking**: Build lasting habits with streak tracking, visual progress charts, and motivational insights
- **💰 Finance Management**: Privacy-first bill and subscription tracking with installment support
- **🤖 AI Assistant**: Context-aware chat interface powered by Google Gemini AI
- **📊 Analytics & Reports**: Weekly AI-generated executive briefs (Premium)

### Mobile-First Design

- **📱 Native iOS & Android Apps**: Built with Capacitor for true native experience
- **🔔 Push Notifications**: Real-time reminders and updates
- **👆 Haptic Feedback**: Enhanced user experience with tactile responses
- **🌙 Dark Mode**: Beautiful glassmorphism UI with dark mode support

### Subscription Model

- **💎 Free Tier**: Core features with limited AI interactions
- **⭐ Premium Tier**: Unlimited AI, advanced analytics, priority support
- **💳 Stripe Integration**: Secure payment processing with subscription management
- **🍎 In-App Purchases**: iOS App Store and Google Play billing support

## 🏗️ Architecture

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Mobile**: Capacitor 6 (iOS & Android)
- **State Management**: React Context API
- **UI**: Custom glassmorphism design system
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: Firebase Auth + JWT
- **Database**: Firebase Firestore
- **Caching**: Redis
- **Logging**: Winston
- **Error Tracking**: Sentry (optional)

### AI & Services
- **AI Engine**: Google Gemini 2.5 Flash
- **Payments**: Stripe
- **Push Notifications**: Firebase Cloud Messaging
- **Storage**: Firebase Storage

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (Frontend), Google Cloud Run (Backend)

## 📦 Repository Structure

```
lifehub/
├── backend/                 # Node.js/Express backend API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── tests/              # Backend tests
│   ├── package.json
│   └── tsconfig.json
├── src/                     # React frontend source
│   ├── components/         # React components
│   ├── services/           # API clients
│   ├── store/              # Context providers
│   └── mobile/             # Mobile-specific code
├── docs/                    # Documentation
│   ├── DEPLOYMENT.md       # Deployment guide
│   ├── PAYMENT_SETUP.md    # Stripe setup guide
│   ├── MOBILE_DEPLOYMENT.md # App store submission guide
│   └── API.md              # API documentation
├── ios/                     # iOS native project (Capacitor)
├── android/                 # Android native project (Capacitor)
├── nginx/                   # Nginx configuration
├── .github/workflows/       # CI/CD pipelines
├── docker-compose.yml       # Local development setup
├── Dockerfile.frontend      # Frontend container
├── Dockerfile.backend       # Backend container
├── capacitor.config.ts      # Capacitor configuration
└── .env.example             # Environment variables template

```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Docker (optional, for containerized development)
- Firebase project
- Stripe account

### 1. Clone Repository

### 1. Clone Repository

```bash
git clone https://github.com/nitheshkolluri/LifeHub-App.git
cd LifeHub-App
```

### 2. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env and fill in your API keys
# See .env.example for all required variables
```

### 4. Start Development Servers

**Option A: Using Docker Compose (Recommended)**

```bash
docker-compose up
```

**Option B: Manual Start**

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

## 📱 Mobile Development

### Build for iOS

```bash
npm run build:ios
```

This will:
1. Build the web app
2. Sync to iOS project
3. Open Xcode

### Build for Android

```bash
npm run build:android
```

This will:
1. Build the web app
2. Sync to Android project
3. Open Android Studio

See [docs/MOBILE_DEPLOYMENT.md](./docs/MOBILE_DEPLOYMENT.md) for complete mobile deployment guide.

## 🚢 Deployment

### Backend Deployment

Deploy to Google Cloud Run:

```bash
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/lifehub-backend
gcloud run deploy lifehub-backend --image gcr.io/YOUR_PROJECT_ID/lifehub-backend
```

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for other platforms (Railway, Heroku, AWS).

### Frontend Deployment

Deploy to Vercel:

```bash
npm install -g vercel
vercel --prod
```

Or connect your GitHub repository in Vercel dashboard for automatic deployments.

## 💳 Payment Setup

1. Create Stripe account
2. Configure products and pricing
3. Set up webhooks
4. Add API keys to environment variables

See [docs/PAYMENT_SETUP.md](./docs/PAYMENT_SETUP.md) for detailed setup guide.

## 📚 Documentation

- **[Deployment Guide](./docs/DEPLOYMENT.md)**: Complete deployment instructions
- **[Payment Setup](./docs/PAYMENT_SETUP.md)**: Stripe configuration guide
- **[Mobile Deployment](./docs/MOBILE_DEPLOYMENT.md)**: App store submission guide
- **[API Documentation](./docs/API.md)**: Backend API reference
- **[Contributing](./CONTRIBUTING.md)**: Contribution guidelines

## 🔐 Security

- **Authentication**: Firebase Auth with JWT tokens
- **Authorization**: Role-based access control
- **Data Encryption**: HTTPS everywhere, encrypted at rest
- **API Security**: Rate limiting, CORS, Helmet.js
- **Payment Security**: PCI-compliant via Stripe
- **Privacy**: No third-party data sharing, GDPR compliant

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test

# E2E tests
npm run test:e2e
```

## 📊 Monitoring

- **Error Tracking**: Sentry integration
- **Logging**: Winston with file rotation
- **Analytics**: Firebase Analytics
- **Uptime**: UptimeRobot monitoring
- **Performance**: Lighthouse CI

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent features
- Firebase for backend infrastructure
- Stripe for payment processing
- Capacitor for mobile app framework
- Open source community

## 📞 Support

- **Email**: support@lifehub.app
- **Documentation**: https://docs.lifehub.app
- **Issues**: https://github.com/yourusername/lifehub/issues
- **Discord**: https://discord.gg/lifehub

## 🗺️ Roadmap

- [ ] Team collaboration features
- [ ] Calendar integration (Google, Outlook)
- [ ] Voice commands
- [ ] Wear OS / watchOS apps
- [ ] Desktop apps (Electron)
- [ ] API webhooks
- [ ] Third-party integrations

---

**Built with ❤️ for productivity enthusiasts**

*Transform your life, one task at a time.*

