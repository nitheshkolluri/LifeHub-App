# Contributing to LifeHub

Thank you for your interest in contributing to LifeHub! We are building the future of personal productivity, and we'd love your help.

## Getting Started

1.  **Fork the repo** and create your branch from `main`.
2.  **Environment Setup**:
    -   Copy `.env.example` to `.env`.
    -   Follow instructions in `docs/ENVIRONMENT_SETUP.md` to configure your local development environment.
    -   **NEVER commit your .env file.**
3.  **Install dependencies**:
    ```bash
    npm install
    cd backend && npm install
    ```

## Development Process

1.  **Branching**: Create a feature branch (`git checkout -b feature/amazing-feature`).
2.  **Coding Standards**:
    -   **TypeScript:** Use strict typing where possible. Avoid `any`.
    -   **Styling:** Use Tailwind CSS utility classes.
    -   **State:** Use the provided `AppContext` for global state.
    -   **Architecture:** Follow the Clean Architecture patterns established in the project.
3.  **Security**:
    -   Review `SECURITY.md` before starting work.
    -   Do not hardcode secrets or API keys.
    -   Sanitize all user inputs.
4.  **Test your changes**. Ensure no regression in core features.
    -   Run `npm test` if available.
    -   Manually verify the feature in the browser.
5.  **Commit Messages**: Use clear, descriptive commit messages.

## Pull Request Process

1.  Update the `README.md` with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
2.  Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent.
3.  You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.
4.  Fill out the Pull Request template completely.

## Reporting Issues

Please use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) or [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) templates to report bugs or suggest features.

