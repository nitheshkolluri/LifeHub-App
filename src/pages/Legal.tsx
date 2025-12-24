import React from 'react';
import { ArrowLeft, Shield, Scale, ScrollText, Lock, FileText } from 'lucide-react';

const LegalLayout = ({ title, date, icon: Icon, children }: { title: string, date: string, icon: any, children: React.ReactNode }) => (
    <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 z-50">
            <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <a href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </a>
                    <h1 className="font-bold text-slate-900">{title}</h1>
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Last Updated: {date}
                </div>
            </div>
        </header>

        {/* Content */}
        <main className="max-w-3xl mx-auto px-6 py-12">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-900 text-white rounded-xl">
                    <Icon size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
                    <p className="text-slate-500 font-medium mt-1">LifeHub OS • Legal Compliance</p>
                </div>
            </div>

            <div className="prose prose-slate prose-headings:font-bold prose-a:text-indigo-600 hover:prose-a:text-indigo-500 max-w-none">
                {children}
            </div>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 gap-4">
                <p>© {new Date().getFullYear()} LifeHub OS. All rights reserved.</p>
                <div className="flex gap-6 font-medium">
                    <a href="/terms" className="hover:text-slate-900">Terms</a>
                    <a href="/privacy" className="hover:text-slate-900">Privacy</a>
                    <a href="mailto:support@lifehub.app" className="hover:text-slate-900">Contact Support</a>
                </div>
            </footer>
        </main>
    </div>
);

export const PrivacyPolicy = () => (
    <LegalLayout title="Privacy Policy" date="December 24, 2025" icon={Lock}>
        <p className="lead text-lg text-slate-600">
            At LifeHub ("we," "our," or "us"), we prioritize the privacy and security of your digital life.
            This Privacy Policy explains how we collect, use, and protect your data when you use the LifeHub OS application,
            including its AI-powered features powered by Google Gemini.
        </p>

        <h3>1. Information We Collect</h3>
        <p>We collect information to provide you with a seamless, intelligent life management experience:</p>
        <ul>
            <li><strong>Account Information:</strong> Name, email address, and profile preferences.</li>
            <li><strong>User Content:</strong> Tasks, habits, financial records, journal entries, and notes you input.</li>
            <li><strong>Voice Data:</strong> Audio recordings processed via the "Voice Note" feature (transcribed and then immediately discarded or stored per your retention settings).</li>
            <li><strong>Usage Data:</strong> Application interaction logs, device type, and performance metrics to improve stability.</li>
        </ul>

        <h3>2. AI Data Processing (Gemini)</h3>
        <p>LifeHub utilizes Google's Gemini Pro AI models to power features like "Neural Capture" and "Daily Briefing".</p>
        <ul>
            <li><strong>Processing:</strong> Text inputs and transcripts are sent to Google's API for processing.</li>
            <li><strong>Zero Training (Enterprise Mode):</strong> We configure our API usage to ensure your data is <strong>NOT</strong> used to train Google's public models.</li>
            <li><strong>Redaction:</strong> We implement a "Safe Mode" that attempts to redact PII (Personally Identifiable Information) before sending data to the AI.</li>
        </ul>

        <h3>3. Data Security</h3>
        <p>We implement "Bank-Grade" security measures to protect your data:</p>
        <ul>
            <li><strong>Encryption:</strong> All data is encrypted in transit (TLS 1.2+) and at rest (AES-256) within Google Cloud Firestore.</li>
            <li><strong>Strict Access Control:</strong> Our database uses strict Row-Level Security (RLS) ensuring that <code>request.auth.uid == userId</code> is enforced for all data access.</li>
            <li><strong>Account Deletion:</strong> You retain the absolute right to delete your account and all associated data instantly via the "Danger Zone" in your profile.</li>
        </ul>

        <h3>4. Financial Data</h3>
        <p>
            LifeHub allows tracking of manual financial records. We do <strong>not</strong> connect directly to bank accounts via PSD2/Open Banking at this stage.
            All financial data entered is stored securely and is visible only to you.
        </p>

        <h3>5. Your Rights</h3>
        <p>Under GDPR, CCPA, and applicable laws, you have the right to:</p>
        <ul>
            <li>Access your personal data.</li>
            <li>Rectify inaccurate data.</li>
            <li>Request erasure of your data ("Right to be Forgotten").</li>
            <li>Restrict processing of your data.</li>
        </ul>

        <h3>6. Contact Us</h3>
        <p>
            For privacy-related inquiries, please contact our Data Protection Officer at <a href="mailto:privacy@lifehub.app">privacy@lifehub.app</a>.
        </p>
    </LegalLayout>
);

export const TermsOfService = () => (
    <LegalLayout title="Terms of Service" date="December 24, 2025" icon={Scale}>
        <p className="lead text-lg text-slate-600">
            Welcome to LifeHub. By accessing or using our application, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our services.
        </p>

        <h3>1. Acceptance of Terms</h3>
        <p>
            These Terms constitute a legally binding agreement between you and LifeHub regarding your use of the LifeHub web application
            and associated AI services.
        </p>

        <h3>2. AI Services & Liability</h3>
        <p>
            LifeHub incorporates artificial intelligence ("AI") provided by Google Gemini. By using the AI features:
        </p>
        <ul>
            <li><strong>Accuracy Disclaimer:</strong> AI models can "hallucinate" or generate incorrect information. You verify any critical advice (financial, medical, or legal) generated by the AI.</li>
            <li><strong>No Professional Advice:</strong> LifeHub is a productivity tool, not a financial advisor or medical professional. Do not rely on it for potential life-altering decisions.</li>
        </ul>

        <h3>3. User Conduct</h3>
        <p>You agree not to use LifeHub to:</p>
        <ul>
            <li>Upload illegal, harmful, or offensive content.</li>
            <li>Attempt to bypass security measures or reverse engineer the application.</li>
            <li>Use the AI to generate hate speech, violence, or sexual content.</li>
        </ul>

        <h3>4. Account Termination</h3>
        <p>
            We reserve the right to suspend or terminate your account at our sole discretion, without notice,
            for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
        </p>

        <h3>5. Subscription & Payments</h3>
        <p>
            Certain features ("Pro Plan") require a paid subscription via Stripe.
            Subscriptions automatically renew unless cancelled 24 hours before the end of the current period.
            Refunds are handled by Stripe's standard policy.
        </p>

        <h3>6. Limitation of Liability</h3>
        <p>
            To the maximum extent permitted by law, LifeHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
            including data loss or loss of profits, resulting from your use of the service.
        </p>

        <h3>7. Governing Law</h3>
        <p>
            These Terms are governed by the laws of the State of Delaware, without regard to its conflict of law principles.
        </p>
    </LegalLayout>
);
