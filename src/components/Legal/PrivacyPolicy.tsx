import React from 'react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                <p className="text-sm text-gray-600 mb-8">Last Updated: December 13, 2024</p>

                <div className="space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
                        <p>
                            Welcome to LifeHub ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our mobile application and services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>

                        <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">2.1 Information You Provide</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Account Information:</strong> Email address, name, password</li>
                            <li><strong>User Content:</strong> Tasks, habits, finance items, chat messages, brain dumps</li>
                            <li><strong>Payment Information:</strong> Processed securely by Stripe (we do not store credit card details)</li>
                        </ul>

                        <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">2.2 Automatically Collected Information</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Usage Data:</strong> App interactions, features used, time spent</li>
                            <li><strong>Device Information:</strong> Device type, operating system, app version</li>
                            <li><strong>Analytics:</strong> Firebase Analytics data (anonymized)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide and maintain our services</li>
                            <li>Process your transactions and subscriptions</li>
                            <li>Send you important updates and notifications</li>
                            <li>Improve our app through analytics and user feedback</li>
                            <li>Provide AI-powered features (via Google Gemini API)</li>
                            <li>Ensure security and prevent fraud</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Data Sharing and Third Parties</h2>
                        <p className="mb-3">We share your data only with the following trusted third parties:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Firebase (Google):</strong> Authentication, database, analytics</li>
                            <li><strong>Stripe:</strong> Payment processing</li>
                            <li><strong>Google Gemini AI:</strong> AI-powered features (your data is processed but not stored by Google)</li>
                        </ul>
                        <p className="mt-3 font-semibold">We do NOT sell your personal information to third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
                        <p>We implement industry-standard security measures:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>End-to-end encryption for data transmission (HTTPS)</li>
                            <li>Secure authentication with Firebase Auth</li>
                            <li>Firestore security rules to protect your data</li>
                            <li>Regular security audits and updates</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Your Rights (GDPR & CCPA)</h2>
                        <p className="mb-3">You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Access:</strong> Request a copy of your data</li>
                            <li><strong>Rectification:</strong> Correct inaccurate data</li>
                            <li><strong>Erasure:</strong> Delete your account and all associated data</li>
                            <li><strong>Data Portability:</strong> Export your data in JSON format</li>
                            <li><strong>Withdraw Consent:</strong> Opt-out of non-essential data processing</li>
                        </ul>
                        <p className="mt-3">
                            To exercise these rights, go to <strong>Settings → Account → Privacy</strong> or email us at <a href="mailto:privacy@lifehub.app" className="text-indigo-600 hover:underline">privacy@lifehub.app</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Data Retention</h2>
                        <p>
                            We retain your data for as long as your account is active. When you delete your account, all your data is permanently deleted within 30 days. Backup copies are deleted within 90 days.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Children's Privacy</h2>
                        <p>
                            LifeHub is not intended for users under 18 years of age. We do not knowingly collect data from children. If you believe a child has provided us with personal information, please contact us immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. International Data Transfers</h2>
                        <p>
                            Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of significant changes via email or in-app notification. Continued use of the app after changes constitutes acceptance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
                        <p>If you have questions about this Privacy Policy, contact us:</p>
                        <ul className="list-none space-y-2 mt-3">
                            <li><strong>Email:</strong> <a href="mailto:privacy@lifehub.app" className="text-indigo-600 hover:underline">privacy@lifehub.app</a></li>
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

export default PrivacyPolicy;
