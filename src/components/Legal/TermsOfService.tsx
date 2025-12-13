import React from 'react';

const TermsOfService: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
                <p className="text-sm text-gray-600 mb-8">Last Updated: December 13, 2024</p>

                <div className="space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using LifeHub ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
                        <p>
                            LifeHub is an AI-powered life management platform that helps you organize tasks, track habits, manage finances, and improve productivity through intelligent automation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>

                        <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">3.1 Account Creation</h3>
                        <p>You must create an account to use the App. You agree to:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your password</li>
                            <li>Notify us immediately of any unauthorized access</li>
                            <li>Be responsible for all activities under your account</li>
                        </ul>

                        <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">3.2 Account Eligibility</h3>
                        <p>You must be at least 18 years old to use LifeHub.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Subscription and Payments</h2>

                        <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">4.1 Free and Premium Plans</h3>
                        <p>LifeHub offers both free and premium subscription plans:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li><strong>Free Plan:</strong> Limited AI interactions, basic features</li>
                            <li><strong>Premium Plan:</strong> Unlimited AI, advanced analytics, priority support</li>
                        </ul>

                        <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">4.2 Billing</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Subscriptions are billed monthly or annually</li>
                            <li>Payments are processed securely via Stripe</li>
                            <li>Subscriptions auto-renew unless cancelled</li>
                            <li>You can cancel anytime from your account settings</li>
                        </ul>

                        <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">4.3 Refund Policy</h3>
                        <p>
                            We offer a 7-day money-back guarantee for new premium subscriptions. After 7 days, subscriptions are non-refundable. To request a refund, contact <a href="mailto:support@lifehub.app" className="text-indigo-600 hover:underline">support@lifehub.app</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. User Content</h2>

                        <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">5.1 Your Content</h3>
                        <p>
                            You retain ownership of all content you create in the App (tasks, habits, notes, etc.). By using the App, you grant us a license to process and store your content to provide our services.
                        </p>

                        <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">5.2 AI Processing</h3>
                        <p>
                            When you use AI features, your content may be processed by Google Gemini AI. We do not store your content with third-party AI providers beyond what's necessary for processing.
                        </p>

                        <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">5.3 Prohibited Content</h3>
                        <p>You may not use the App to create, store, or share:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Illegal, harmful, or offensive content</li>
                            <li>Content that violates intellectual property rights</li>
                            <li>Malware, viruses, or malicious code</li>
                            <li>Spam or unsolicited commercial content</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Acceptable Use</h2>
                        <p>You agree NOT to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Reverse engineer, decompile, or hack the App</li>
                            <li>Use the App for any illegal purpose</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Abuse or overload our servers (rate limiting applies)</li>
                            <li>Resell or redistribute our services</li>
                            <li>Create multiple accounts to bypass limitations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Intellectual Property</h2>
                        <p>
                            The App, including its design, code, features, and branding, is owned by LifeHub and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our intellectual property without permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Privacy</h2>
                        <p>
                            Your privacy is important to us. Please review our <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a> to understand how we collect, use, and protect your data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Disclaimers</h2>

                        <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">9.1 "As Is" Service</h3>
                        <p>
                            The App is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the App will be error-free, uninterrupted, or secure.
                        </p>

                        <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">9.2 AI Accuracy</h3>
                        <p>
                            AI-generated content may contain errors or inaccuracies. You should verify important information and not rely solely on AI suggestions for critical decisions.
                        </p>

                        <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">9.3 Financial Advice</h3>
                        <p>
                            LifeHub is a productivity tool, not a financial advisor. Do not use the App as a substitute for professional financial advice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, LifeHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, revenue, or profits, arising from your use of the App.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Termination</h2>
                        <p>We may suspend or terminate your account if you:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Violate these Terms</li>
                            <li>Engage in fraudulent activity</li>
                            <li>Fail to pay subscription fees</li>
                            <li>Abuse our services</li>
                        </ul>
                        <p className="mt-3">
                            You may delete your account at any time from Settings. Upon deletion, all your data will be permanently removed.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Changes to Terms</h2>
                        <p>
                            We may update these Terms from time to time. We will notify you of significant changes via email or in-app notification. Continued use after changes constitutes acceptance of the new Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">13. Governing Law</h2>
                        <p>
                            These Terms are governed by the laws of [Your Jurisdiction]. Any disputes shall be resolved in the courts of [Your Jurisdiction].
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">14. Contact Us</h2>
                        <p>If you have questions about these Terms, contact us:</p>
                        <ul className="list-none space-y-2 mt-3">
                            <li><strong>Email:</strong> <a href="mailto:legal@lifehub.app" className="text-indigo-600 hover:underline">legal@lifehub.app</a></li>
                            <li><strong>Support:</strong> <a href="mailto:support@lifehub.app" className="text-indigo-600 hover:underline">support@lifehub.app</a></li>
                        </ul>
                    </section>
                </div>

                <div className="mt-12 pt-6 border-t border-gray-200">
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        ← Back to App
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
