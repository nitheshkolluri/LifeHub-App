# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-14

### Added

- **Smart Task Management**: AI-powered task creation with intelligent priority detection and due date inference.
- **Habit Tracking**: Streak tracking, visual progress charts, and motivational insights.
- **Finance Management**: Privacy-first bill and subscription tracking with installment support.
- **AI Assistant**: Context-aware chat interface powered by Google Gemini AI (Backend secured API).
- **Mobile Apps**: Native iOS and Android applications using Capacitor.
- **Subscription System**: Stripe integration for Premium tier features.
- **Analytics**: Weekly AI-generated executive briefs for Premium users.
- **Security**: 
  - Implementation of `SECURITY.md` policy.
  - Environment variable validation for Firebase configuration.
  - Hardcoded API keys removed from source code.
- **Documentation**: 
  - Comprehensive `README.md`.
  - Deployment guides for Web, Mobile, and Backend.
  - Payment setup guide.

### Changed

- Migrated from local development setup to production-ready structure.
- Secured Firebase initialization to use environment variables exclusively.
- Updated project structure for public open-source release.

### Security

- Removed all hardcoded credentials from codebase.
- Added strict content security policies and headers.
