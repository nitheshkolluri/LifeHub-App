import React from 'react';
import { ArrowLeft, Shield, Scale, ScrollText, Lock, FileText, X } from 'lucide-react';

// --- CONTENT DEFINITIONS ---

export const PRIVACY_CONTENT = (
    <div className="space-y-6 text-justify text-slate-600 leading-relaxed font-sans">
        <p className="text-lg font-medium text-slate-800">
            At LifeHub ("we," "our," or "us"), your digital privacy is not just a policy—it's part of our core architecture.
            This Privacy Policy details how we handle your data within the LifeHub OS ecosystem, including our advanced AI integrations.
        </p>

        <section>
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 mt-8">1. Information Collection & Usage</h3>
            <p className="mb-4">To deliver intelligent life management, we process specific data points. We are strictly a data processor; you remain the data controller.</p>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-slate-900">Identity Data:</strong> Name, email address, and profile customization settings.</li>
                <li><strong className="text-slate-900">Life Data (User Content):</strong> Tasks, habits, financial logs, journal entries, and personal notes you explicitly input.</li>
                <li><strong className="text-slate-900">Voice Data:</strong> Audio recordings captured via "Voice Note" are transcribed in real-time and immediately deleted. We do not retain raw audio files.</li>
                <li><strong className="text-slate-900">Local Device Data:</strong> For Offline Mode (PWA), we store an encrypted cache of your data locally on your device (`IndexedDB`).</li>
            </ul>
        </section>

        <section>
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 mt-8">2. AI Data Processing (Google Gemini)</h3>
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <p className="mb-3 font-medium text-indigo-900">LifeHub utilizes Google Gemini Pro to power "Neural Capture" and "Daily Briefing".</p>
                <ul className="list-disc pl-5 space-y-2 text-indigo-800/80">
                    <li><strong className="text-indigo-900">Enterprise Privacy:</strong> We access Gemini via the Vertex AI API, which creates a privacy firewall. <strong>Your data is NOT used to train Google's public AI models.</strong></li>
                    <li><strong className="text-indigo-900">Stateless Processing:</strong> Data sent to the AI for analysis is ephemeral. Google does not retain your prompts or our system instructions.</li>
                    <li><strong className="text-indigo-900">Safe Mode:</strong> Enabling "Safe Mode" in settings attempts to redact detected PII (names, phone numbers) before AI processing.</li>
                </ul>
            </div>
        </section>

        <section>
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 mt-8">3. Financial Data Integrity</h3>
            <p>
                LifeHub provides manual financial tracking tools. We do <strong>not</strong> currently integrate with Open Banking protocols (PSD2/Plaid).
                All financial entries are stored with strict Row-Level Security (RLS), ensuring no other user (including admins) can query your financial records.
            </p>
        </section>

        <section>
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 mt-8">4. Data Security & Retention</h3>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-slate-900">Encryption:</strong> AES-256 encryption at rest (Google Cloud Firestore) and TLS 1.3 in transit.</li>
                <li><strong className="text-slate-900">Right to Erasure:</strong> The "Danger Zone" in your profile performs a hard delete. This action creates a cryptographic shredding event, making data recovery impossible.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 mt-8">5. Contact & DPO</h3>
            <p>
                For strict privacy inquiries or to export your data in JSON format, contact our Data Protection Office at
                <a href="mailto:privacy@lifehub.app" className="text-indigo-600 font-bold hover:underline ml-1">privacy@lifehub.app</a>.
            </p>
        </section>
    </div>
);

export const TERMS_CONTENT = (
    <div className="space-y-6 text-justify text-slate-600 leading-relaxed font-sans">
        <p className="text-lg font-medium text-slate-800">
            Welcome to LifeHub OS. By creating an account, you agree to these Terms of Service.
            These terms govern your use of the LifeHub application, PWA, and AI companion features.
        </p>

        <section>
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 mt-8">1. License & Usage</h3>
            <p>
                LifeHub grants you a limited, non-exclusive, non-transferable license to use the application for personal productivity.
                You act as the responsible entity for all content input into the system.
            </p>
        </section>

        <section>
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 mt-8">2. Subscription & Payments</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="mb-2"><strong className="text-slate-900">Executive Plan ($3.99/mo):</strong></p>
                <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>Unlocks unlimited vaults, advanced AI analysis, and Priority Support.</li>
                    <li>Includes a <strong>7-Day Free Trial</strong> for new users.</li>
                </ul>
                <p className="mb-2"><strong className="text-slate-900">Billing Policy:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Payments are processed securely via <strong>Stripe</strong>. LifeHub does not store your credit card details.</li>
                    <li>Subscriptions renew automatically appropriately unless cancelled at least 24 hours before the period ends.</li>
                    <li>You may cancel anytime via the "Manage Subscription" portal in your Profile. Refunds are subject to Stripe's standard processing timing.</li>
                </ul>
            </div>
        </section>

        <section>
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 mt-8">3. AI Disclaimer (Important)</h3>
            <p className="mb-2">
                LifeHub uses third-party AI models (Google Gemini) to generate insights. By using these features, you acknowledge:
            </p>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-slate-900">No Professional Advice:</strong> AI outputs are for informational purposes only. Do not rely on LifeHub for medical, legal, or investment advice.</li>
                <li><strong className="text-slate-900">Hallucinations:</strong> Large Language Models may occasionally generate factually incorrect information. <strong>Always verify critical data.</strong></li>
            </ul>
        </section>

        <section>
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 mt-8">4. Acceptable Use</h3>
            <p>You agree NOT to use LifeHub to:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Store illegal material or hate speech.</li>
                <li>Reverse engineer the application code or API.</li>
                <li>Attempt to gain unauthorized access to other user's vaults.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 mt-8">5. Termination</h3>
            <p>
                We reserve the right to suspend accounts that violate these terms. You may terminate your agreement at any time by deleting your account,
                which permanently erases your data from our servers.
            </p>
        </section>

        <section>
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 mt-8">6. Governing Law</h3>
            <p>
                These terms are governed by the laws of the State of Delaware, USA. Any disputes shall be resolved in the competent courts of Delaware.
            </p>
        </section>
    </div>
);


// --- PAGE COMPONENT (For Routing) ---

const LegalLayout = ({ title, date, icon: Icon, children }: { title: string, date: string, icon: any, children: React.ReactNode }) => (
    <div className="min-h-screen bg-white font-sans text-slate-900">
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

            <div className="prose prose-slate prose-lg max-w-none">
                {children}
            </div>

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
        {PRIVACY_CONTENT}
    </LegalLayout>
);

export const TermsOfService = () => (
    <LegalLayout title="Terms of Service" date="December 24, 2025" icon={Scale}>
        {TERMS_CONTENT}
    </LegalLayout>
);


// --- MODAL COMPONENT (For In-App View) ---

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon?: any;
    children: React.ReactNode;
}

const LegalModal = ({ isOpen, onClose, title, icon: Icon, children }: LegalModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" style={{ zIndex: 9999 }}>
            {/* Widened container (max-w-4xl) for better reading experience */}
            <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 font-sans">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        {Icon && <div className="p-2 bg-slate-100 rounded-lg text-slate-700"><Icon size={20} /></div>}
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                    {children}
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
};

export const PrivacyModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
    <LegalModal isOpen={isOpen} onClose={onClose} title="Privacy Policy" icon={Lock}>
        {PRIVACY_CONTENT}
    </LegalModal>
);

export const TermsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
    <LegalModal isOpen={isOpen} onClose={onClose} title="Terms of Service" icon={Scale}>
        {TERMS_CONTENT}
    </LegalModal>
);
