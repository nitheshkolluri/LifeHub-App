import React, { useState } from 'react';
import { Trash2, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiService } from '../../services/api.service';
import { trackEvent, AnalyticsEvents } from '../../services/analytics.service';

const AccountSettings: React.FC = () => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    const handleExportData = async () => {
        setIsExporting(true);
        setExportSuccess(false);

        try {
            const response = await apiService.user.exportData();
            const data = response.data;

            // Create downloadable JSON file
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `lifehub-data-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setExportSuccess(true);
            trackEvent(AnalyticsEvents.DATA_EXPORTED);

            setTimeout(() => setExportSuccess(false), 5000);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
            alert('Please type "DELETE MY ACCOUNT" to confirm');
            return;
        }

        setIsDeleting(true);

        try {
            await apiService.user.deleteAccount();

            trackEvent(AnalyticsEvents.ACCOUNT_DELETED);

            // Clear local storage and redirect to goodbye page
            localStorage.clear();
            alert('Your account has been permanently deleted. We\'re sorry to see you go!');
            window.location.href = '/';
        } catch (error) {
            console.error('Delete account error:', error);
            alert('Failed to delete account. Please contact support.');
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-600 mt-2">Manage your account and privacy settings</p>
            </div>

            {/* Export Data Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Download className="w-6 h-6 text-indigo-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Export Your Data</h2>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Download all your data in JSON format. This includes tasks, habits, finance items, and reports.
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            <strong>GDPR Right to Data Portability:</strong> You have the right to receive your personal data in a structured, commonly used format.
                        </p>
                    </div>
                </div>

                {exportSuccess && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <span>Data exported successfully! Check your downloads folder.</span>
                    </div>
                )}

                <button
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    {isExporting ? 'Exporting...' : 'Export My Data'}
                </button>
            </section>

            {/* Delete Account Section */}
            <section className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Delete Account</h2>
                        <p className="text-gray-600 mb-4">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-red-800 font-medium mb-2">⚠️ Warning: This will permanently delete:</p>
                            <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                                <li>All your tasks, habits, and finance items</li>
                                <li>All AI chat history and reports</li>
                                <li>Your account and profile information</li>
                                <li>Your subscription (no refund for remaining time)</li>
                            </ul>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            <strong>GDPR Right to Erasure:</strong> You have the right to request deletion of your personal data.
                        </p>
                    </div>
                </div>

                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="w-5 h-5" />
                        Delete My Account
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type <span className="font-bold text-red-600">DELETE MY ACCOUNT</span> to confirm:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="DELETE MY ACCOUNT"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-5 h-5" />
                                {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                            </button>

                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteConfirmText('');
                                }}
                                disabled={isDeleting}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* Privacy & Legal Links */}
            <section className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Legal</h2>
                <div className="space-y-2">
                    <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                        Privacy Policy →
                    </a>
                    <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                        Terms of Service →
                    </a>
                </div>
            </section>
        </div>
    );
};

export default AccountSettings;
