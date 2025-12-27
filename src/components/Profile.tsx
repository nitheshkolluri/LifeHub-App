import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useApp } from '../store/AppContext';
import {
   X, LogOut, Bell, Crown, User, ChevronRight, Loader2,
   Zap, ShieldAlert, Crosshair, ArrowLeft, Target, Flame, CheckSquare
} from 'lucide-react';
import { apiService } from '../services/api.service';
import { NotificationPreferences } from '../types';
import { PrivacyModal, TermsModal } from '../pages/Legal';

// Minimalist Delete Confirmation
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading }: any) => {
   const [confirmText, setConfirmText] = useState('');
   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-zinc-900/60 backdrop-blur-md animate-in fade-in">
         <div className="w-full max-w-sm bg-white rounded-3xl border border-rose-100 p-6 space-y-6 shadow-2xl">
            <h3 className="text-xl font-bold text-zinc-900 text-center">Delete Everything?</h3>
            <p className="text-zinc-500 text-center text-sm">Type <span className="text-rose-500 font-bold">DELETE</span> to confirm.</p>
            <input
               className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-center text-zinc-900 font-bold outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
               value={confirmText}
               onChange={e => setConfirmText(e.target.value)}
               placeholder="DELETE"
            />
            <div className="grid grid-cols-2 gap-4">
               <button onClick={onClose} className="py-3 rounded-xl bg-zinc-100 text-zinc-500 font-bold hover:bg-zinc-200">Cancel</button>
               <button
                  disabled={confirmText !== 'DELETE' || isLoading}
                  onClick={onConfirm}
                  className="py-3 rounded-xl bg-rose-500 text-white font-bold disabled:opacity-50 shadow-lg shadow-rose-500/20"
               >
                  {isLoading ? '...' : 'Goodbye'}
               </button>
            </div>
         </div>
      </div>
   );
};

interface ProfileModalProps {
   isOpen: boolean;
   onClose: () => void;
}

import { SubscriptionModal } from './Subscription';

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
   const { user, logout } = useAuth();
   const { tasks, habits, updateNotificationSettings } = useApp();
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [showSubscription, setShowSubscription] = useState(false);
   const [showPrivacy, setShowPrivacy] = useState(false);
   const [showTerms, setShowTerms] = useState(false);
   const [loading, setLoading] = useState(false);

   // Local state for settings
   const [prefs, setPrefs] = useState<NotificationPreferences>({
      quietTimeStart: user?.notificationPreferences?.quietTimeStart || '22:00',
      quietTimeEnd: user?.notificationPreferences?.quietTimeEnd || '07:00',
      afterWorkTime: user?.notificationPreferences?.afterWorkTime || '17:30',
      morningBriefTime: user?.notificationPreferences?.morningBriefTime || '08:00',
      phoneNumber: user?.notificationPreferences?.phoneNumber || '',
      enableSMS: user?.notificationPreferences?.enableSMS || false,
      enablePush: user?.notificationPreferences?.enablePush || false,
      enableTimeSensitive: user?.notificationPreferences?.enableTimeSensitive || false,
   });

   const handleSavePrefs = async () => {
      setLoading(true);
      await updateNotificationSettings(prefs);
      setLoading(false);
   };

   const confirmDeleteAccount = async () => {
      setLoading(true);
      try {
         await apiService.user.deleteAccount();
         await logout();
      } catch (error) {
         alert("Failed. Re-login and try again.");
      }
      setLoading(false);
   };

   if (!isOpen) return null;

   const isPro = user?.isPremium;
   const totalTasks = tasks.filter(t => t.status === 'completed').length;
   const streakScore = habits.reduce((acc, h) => acc + h.streak, 0);
   const efficiency = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0;

   // SECTIONS COMPONENT
   const Section = ({ title, icon: Icon, children }: any) => (
      <div className="mb-8">
         <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Icon size={14} /> {title}
         </h3>
         <div className="bg-white rounded-3xl p-1 border border-zinc-100 shadow-sm space-y-1">
            {children}
         </div>
      </div>
   );

   const StatCard = ({ icon: Icon, label, value, color }: any) => (
      <div className="flex-1 bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-zinc-100 shadow-sm">
         <Icon size={20} className={color} />
         <span className="text-2xl font-black text-zinc-900">{value}</span>
         <span className="text-[10px] uppercase font-bold text-zinc-400">{label}</span>
      </div>
   );

   const SettingRow = ({ label, sub, action }: any) => (
      <div className="flex items-center justify-between p-4 hover:bg-zinc-50 rounded-2xl transition-colors">
         <div>
            <div className="font-bold text-zinc-800 text-sm">{label}</div>
            {sub && <div className="text-xs text-zinc-400 mt-0.5">{sub}</div>}
         </div>
         {action}
      </div>
   );

   return (
      <div className="fixed inset-0 z-[60] bg-[#FDFBF7] animate-in fade-in duration-200 font-sans flex flex-col">
         {/* HEADER */}
         <div className="px-6 py-6 flex items-center justify-between sticky top-0 bg-[#FDFBF7]/80 backdrop-blur-xl z-10 border-b border-zinc-100">
            <h2 className="text-2xl font-black text-zinc-900">Me</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-zinc-400 shadow-sm border border-zinc-100 hover:bg-zinc-50">
               <X size={20} />
            </button>
         </div>

         {/* SCROLLABLE CONTENT */}
         <div className="flex-1 overflow-y-auto p-6 scrollbar-hide pb-32">

            {/* USER INFO */}
            <div className="text-center mb-8">
               <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full p-0.5 mb-4 shadow-xl shadow-indigo-200">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-3xl font-black text-zinc-900">
                     {user?.name?.charAt(0).toUpperCase()}
                  </div>
               </div>
               <h2 className="text-xl font-bold text-zinc-900 mb-1">{user?.name}</h2>
               <p className="text-sm text-zinc-500 font-medium mb-4">{user?.email}</p>
               <button onClick={() => setShowSubscription(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-zinc-200 hover:border-yellow-400/50 transition-colors active:scale-95 shadow-sm">
                  <Crown size={14} className={isPro ? "text-yellow-400" : "text-zinc-400"} />
                  <span className="text-xs font-bold text-zinc-700">{isPro ? 'Pro Active' : 'Upgrade to Pro'}</span>
               </button>
            </div>

            {/* 1. STATS SECTION */}
            <div className="flex gap-4 mb-10 overflow-x-auto pb-2 px-1">
               <StatCard icon={CheckSquare} label="Done" value={totalTasks} color="text-blue-500" />
               <StatCard icon={Flame} label="Streak" value={streakScore} color="text-orange-500" />
               <StatCard icon={Target} label="Focus" value={`${efficiency}%`} color="text-emerald-500" />
            </div>

            {/* 2. NOTIFICATIONS */}
            <Section title="Focus & Alerts" icon={Bell}>
               <SettingRow
                  label="Precision Alerts"
                  sub="Interrupt for high priority tasks"
                  action={
                     <div className="relative">
                        <input
                           type="checkbox"
                           checked={prefs.enableTimeSensitive}
                           onChange={e => setPrefs({ ...prefs, enableTimeSensitive: e.target.checked })}
                           className="peer sr-only" id="n1"
                        />
                        <label htmlFor="n1" className="block w-12 h-7 bg-zinc-200 rounded-full peer-checked:bg-indigo-500 transition-colors cursor-pointer after:absolute after:top-1 after:left-1 after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-transform peer-checked:after:translate-x-5 shadow-inner" />
                     </div>
                  }
               />
               <SettingRow
                  label="Morning Briefing"
                  sub="Get ready for the day"
                  action={
                     <input type="time" value={prefs.morningBriefTime} onChange={e => setPrefs({ ...prefs, morningBriefTime: e.target.value })} className="bg-transparent text-zinc-900 font-bold outline-none text-right" />
                  }
               />
               <div className="p-2">
                  <button onClick={handleSavePrefs} className="w-full py-3 bg-zinc-900 text-white font-bold rounded-xl active:scale-95 transition-transform hover:bg-black shadow-lg shadow-zinc-300">
                     {loading ? 'Saving...' : 'Save Changes'}
                  </button>
               </div>
            </Section>

            {/* 3. SETTINGS */}
            <Section title="Account" icon={User}>
               <button onClick={() => setShowTerms(true)} className="w-full text-left">
                  <SettingRow label="Terms of Service" action={<ChevronRight size={16} className="text-zinc-400" />} />
               </button>
               <button onClick={() => setShowPrivacy(true)} className="w-full text-left">
                  <SettingRow label="Privacy Policy" action={<ChevronRight size={16} className="text-zinc-400" />} />
               </button>
               <button onClick={() => setShowDeleteModal(true)} className="w-full text-left">
                  <SettingRow label={<span className="text-rose-500">Delete Account</span>} action={<ChevronRight size={16} className="text-rose-300" />} />
               </button>
            </Section>

            {/* LOGOUT */}
            <button onClick={logout} className="w-full py-4 text-zinc-400 font-bold hover:text-zinc-900 transition-colors flex items-center justify-center gap-2">
               <LogOut size={18} /> Sign Out
            </button>

         </div>

         {/* MODALS */}
         <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDeleteAccount}
            isLoading={loading}
         />
         <SubscriptionModal isOpen={showSubscription} onClose={() => setShowSubscription(false)} />
         <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
         <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />

      </div>
   );
};
