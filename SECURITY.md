# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@lifehub.app** (or your preferred contact email)

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information in your report:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Best Practices for Contributors

### API Keys and Secrets

1. **Never commit API keys, tokens, or credentials** to the repository
2. Always use environment variables for sensitive configuration
3. Use `.env.example` as a template, never commit `.env` files
4. Review your commits before pushing to ensure no secrets are included

### Code Security

1. **Dependencies**: Keep all dependencies up to date
2. **Input Validation**: Always validate and sanitize user input
3. **Authentication**: Use Firebase Auth and JWT tokens properly
4. **Authorization**: Implement proper role-based access control
5. **SQL Injection**: Use parameterized queries (we use Firestore, which is safe by default)
6. **XSS Prevention**: Sanitize all user-generated content before rendering

### Environment Variables

Required environment variables are documented in `.env.example`. Never use default or example values in production.

**Frontend (Public - Safe to Expose):**
- Firebase client configuration (API key, auth domain, etc.)
- Stripe publishable key
- API URLs

**Backend (Private - Never Expose):**
- Firebase Admin SDK credentials
- Stripe secret key
- JWT secrets
- Database credentials
- Third-party API keys

### API Key Rotation

If you suspect an API key has been compromised:

1. **Immediately** rotate the key in your service provider (Firebase, Stripe, etc.)
2. Update the key in your deployment environment variables
3. Report the incident to security@lifehub.app
4. Review access logs for suspicious activity

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release patches as soon as possible

## Security Updates

Security updates will be released as patch versions (e.g., 1.0.1) and announced via:

- GitHub Security Advisories
- Release notes
- Email to registered users (if applicable)

## Compliance

LifeHub is designed with the following security standards in mind:

- **GDPR**: User data privacy and right to deletion
- **PCI DSS**: Payment security via Stripe (we don't store card data)
- **OWASP Top 10**: Protection against common web vulnerabilities

## Third-Party Security

We rely on trusted third-party services:

- **Firebase**: Authentication, database, and hosting
- **Stripe**: Payment processing (PCI DSS Level 1 certified)
- **Google Cloud**: Infrastructure and AI services

## Security Features

- **Authentication**: Firebase Auth with JWT tokens
- **Authorization**: Role-based access control
- **Encryption**: HTTPS everywhere, data encrypted at rest
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Strict CORS policies
- **CSP**: Content Security Policy headers
- **Helmet.js**: Security headers for Express.js

## Contact

For security concerns, contact: **security@lifehub.app**

For general questions, use: **support@lifehub.app**

---

**Thank you for helping keep LifeHub and our users safe!**
