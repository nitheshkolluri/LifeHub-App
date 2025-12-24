import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useApp } from '../store/AppContext';
import {
   X, LogOut, Bell, Zap, Crown, User, CreditCard, ChevronRight, Loader2,
   TrendingUp, Trophy, Target, Sparkles, Activity, ShieldAlert, Crosshair, Trash2
} from 'lucide-react';
import { apiService } from '../services/api.service';
import { NotificationPreferences } from '../types';

interface DeleteConfirmationModalProps {
   isOpen: boolean;
   onClose: () => void;
   onConfirm: () => Promise<void>;
   isLoading: boolean;
}

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading }: DeleteConfirmationModalProps) => {
   const [confirmText, setConfirmText] = useState('');

   if (!isOpen) return null;

   const isMatch = confirmText === 'DELETE';

   return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
         <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-scale-in">
            <div className="p-6">
               <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-rose-100/50 rounded-full text-rose-600 border border-rose-100 shadow-inner">
                     <ShieldAlert size={28} />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-zinc-900">Delete Account?</h3>
                     <p className="text-sm font-medium text-rose-600">This action is permanent.</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-sm text-zinc-600 leading-relaxed">
                     You are about to permanently destroy all your data, including
                     <span className="font-bold text-zinc-900"> Tasks, Habits, Finance Records, and Subscription History</span>.
                     Access will be revoked immediately.
                  </p>

                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                     <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                        To confirm, type <span className="text-zinc-900 select-all">DELETE</span> below:
                     </label>
                     <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="DELETE"
                        className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-lg text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-zinc-300"
                        autoFocus
                     />
                  </div>
               </div>
            </div>

            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3">
               <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-5 py-2.5 text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-xl transition-colors"
               >
                  Cancel
               </button>
               <button
                  onClick={onConfirm}
                  disabled={!isMatch || isLoading}
                  className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all flex items-center gap-2 ${isMatch && !isLoading
                     ? 'bg-rose-600 hover:bg-rose-700 hover:shadow-rose-500/20 active:scale-[0.98]'
                     : 'bg-zinc-300 cursor-not-allowed opacity-70'
                     }`}
               >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Permanently Delete
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

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
   const { user, logout } = useAuth();
   const { tasks, habits, updateNotificationSettings, setShowUpsell } = useApp();
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [activeTab, setActiveTab] = useState<'overview' | 'notifications'>('overview');
   const [loading, setLoading] = useState(false);

   // Local state for settings form
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

   // Open Custom Modal
   const handleDeleteClick = () => setShowDeleteModal(true);

   // Actual API Call (Passed to Modal)
   const confirmDeleteAccount = async () => {
      setLoading(true);
      try {
         await apiService.user.deleteAccount();
         await logout();
         setShowDeleteModal(false);
         onClose(); // Close Profile Modal
         // No alert needed, logout will redirect
      } catch (error) {
         console.error("Delete failed", error);
         alert("Failed to delete account. You may need to re-login first for security.");
         setLoading(false);
      }
   };

   if (!isOpen) return null;

   // Stats
   const completionRate = tasks.length > 0
      ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
      : 0;
   const totalRituals = habits.reduce((acc, h) => acc + h.streak, 0);

   const isPro = user?.isPremium;

   // Brand Colors: Indigo/Violet gradients to match Logo
   const brandGradient = "bg-gradient-to-r from-indigo-600 to-violet-600";

   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-200 font-sans">
         <div className="absolute inset-0" onClick={onClose} />

         {/* Main Container */}
         <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row h-[85vh] max-h-[750px] animate-scale-in border border-zinc-200 overflow-hidden text-zinc-900">

            {/* SIDEBAR */}
            <div className="w-full md:w-72 bg-zinc-50/80 backdrop-blur border-r border-zinc-200 p-6 flex flex-col">
               <div className="mb-8 pl-2">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold mb-4 shadow-lg shadow-indigo-500/20 ${brandGradient}`}>
                     <span className="text-xl">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 truncate tracking-tight">{user?.name}</h2>
                  <p className="text-xs text-zinc-500 truncate font-medium flex items-center gap-1">
                     {user?.email}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                     {isPro ? <Crown size={12} className="fill-indigo-600 text-indigo-600" /> : <User size={12} className="text-indigo-600" />}
                     <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wide">
                        {isPro ? 'Executive Member' : 'Free Account'}
                     </span>
                  </div>
               </div>

               <nav className="space-y-1 flex-1">
                  <button
                     onClick={() => setActiveTab('overview')}
                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group ${activeTab === 'overview' ? 'bg-white text-indigo-900 shadow-sm ring-1 ring-zinc-200' : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900'}`}
                  >
                     <Activity size={18} className={activeTab === 'overview' ? 'text-indigo-600' : 'group-hover:text-zinc-700'} />
                     Dashboard
                  </button>
                  <button
                     onClick={() => setActiveTab('notifications')}
                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group ${activeTab === 'notifications' ? 'bg-white text-indigo-900 shadow-sm ring-1 ring-zinc-200' : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900'}`}
                  >
                     <Bell size={18} className={activeTab === 'notifications' ? 'text-indigo-600' : 'group-hover:text-zinc-700'} />
                     Notifications
                     {!prefs.enableTimeSensitive && <span className="ml-auto w-2 h-2 rounded-full bg-rose-500" />}
                  </button>
               </nav>

               <div className="mt-auto space-y-3 pt-6 border-t border-zinc-200">
                  {/* SUBSCRIPTION BUTTON */}
                  <button
                     onClick={() => setShowUpsell(true)}
                     className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold border transition-all shadow-sm group relative overflow-hidden ${isPro
                        ? 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'
                        : 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-900 border-amber-200 hover:border-amber-300'
                        }`}
                  >
                     <div className="flex items-center gap-2 relative z-10">
                        {isPro ? <CreditCard size={14} /> : <Crown size={14} className="fill-current" />}
                        <span>{isPro ? 'Manage Subscription' : 'Upgrade to Pro'}</span>
                     </div>
                     <ChevronRight size={14} className="relative z-10 opacity-50 group-hover:translate-x-0.5 transition-transform" />

                     {!isPro && <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>

                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:bg-rose-50 hover:text-rose-600 transition-all">
                     <LogOut size={16} /> Sign Out
                  </button>
               </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 bg-white overflow-y-auto relative">
               <button onClick={onClose} className="absolute top-6 right-8 p-2 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors z-20">
                  <X size={20} />
               </button>

               <div className="p-10">
                  <div className="mb-10">
                     <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
                        {activeTab === 'overview' ? 'Performance Overview' : 'Notification Center'}
                     </h1>
                     <p className="text-zinc-500 font-medium">
                        {activeTab === 'overview'
                           ? 'Metrics, achievements, and account health.'
                           : 'Customize how and when LifeHub interrupts you.'}
                     </p>
                  </div>

                  {activeTab === 'overview' ? (
                     <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">

                        {/* VISUAL STATS ROW */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {/* Efficiency Card */}
                           <div className="p-5 rounded-2xl border border-zinc-100 bg-white shadow-xl shadow-zinc-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:scale-110 transition-transform"><Target size={20} /></div>
                                 <span className={`text-xs font-bold px-2 py-1 rounded-full ${completionRate > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                                    {completionRate > 80 ? 'Excellent' : 'Improving'}
                                 </span>
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Weekly Efficiency</p>
                                 <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-zinc-900">{completionRate}</span>
                                    <span className="text-sm font-bold text-zinc-500">%</span>
                                 </div>
                              </div>
                              {/* Progress Bar */}
                              <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-4 overflow-hidden">
                                 <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${completionRate}%` }} />
                              </div>
                           </div>

                           {/* Rituals Card */}
                           <div className="p-5 rounded-2xl border border-zinc-100 bg-white shadow-xl shadow-zinc-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="p-2 bg-violet-50 rounded-lg text-violet-600 group-hover:scale-110 transition-transform"><Trophy size={20} /></div>
                                 <span className="text-xs font-bold px-2 py-1 rounded-full bg-zinc-100 text-zinc-500">Level 1</span>
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Ritual Streak</p>
                                 <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-zinc-900">{totalRituals}</span>
                                    <span className="text-sm font-bold text-zinc-500">xp</span>
                                 </div>
                              </div>
                              <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-4 overflow-hidden">
                                 <div className="h-full bg-violet-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(totalRituals * 10, 100)}%` }} />
                              </div>
                           </div>

                           {/* Focus Card (Compass) */}
                           <div className="p-5 rounded-2xl border border-zinc-100 bg-white shadow-xl shadow-zinc-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:scale-110 transition-transform"><Sparkles size={20} /></div>
                                 <span className="text-xs font-bold px-2 py-1 rounded-full bg-zinc-100 text-zinc-500">Focus</span>
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Top Category</p>
                                 <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-zinc-900 truncate">Deep Work</span>
                                 </div>
                              </div>
                              <div className="mt-4 text-xs font-medium text-zinc-500">
                                 mostly active in mornings
                              </div>
                           </div>
                        </div>

                        {/* PRO UPSELL BANNER */}
                        {/* 1. COMPACT PRO BANNER (Visual Only) */}
                        {!isPro && (
                           <div onClick={() => setShowUpsell(true)} className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-1 shadow-lg shadow-indigo-200 transition-all hover:scale-[1.01] hover:shadow-xl">
                              <div className="flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur-sm rounded-xl">
                                 <div className="flex items-center gap-3 text-white">
                                    <div className="p-2 bg-white/20 rounded-lg"><Crown size={20} className="text-amber-300 fill-amber-300" /></div>
                                    <div>
                                       <h4 className="font-black text-lg tracking-tight">Go Executive</h4>
                                       <p className="text-indigo-100 text-xs font-medium">Unlock full potential</p>
                                    </div>
                                 </div>
                                 <ChevronRight size={20} className="text-white/80" />
                              </div>
                           </div>
                        )}

                        {/* 2. VISUAL STATS GRID (No generic text) */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                           {/* Plan Badge */}
                           <div className={`col-span-2 p-4 rounded-2xl border ${isPro ? 'bg-indigo-50 border-indigo-100' : 'bg-zinc-50 border-zinc-100'} flex items-center justify-between`}>
                              <div className="flex items-center gap-3">
                                 <div className={`p-2 rounded-xl ${isPro ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-200 text-zinc-500'}`}>
                                    <User size={20} />
                                 </div>
                                 <div>
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Member</p>
                                    <p className="font-bold text-zinc-900 truncate max-w-[120px]">{user?.email?.split('@')[0]}</p>
                                 </div>
                              </div>
                              <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${isPro ? 'bg-indigo-600 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                                 {isPro ? 'PRO' : 'FREE'}
                              </span>
                           </div>

                           {/* Tasks */}
                           <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center">
                              <p className="text-2xl font-black text-emerald-600">{tasks.filter(t => t.status === 'completed').length}</p>
                              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Done</p>
                           </div>

                           {/* Habits */}
                           <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center">
                              <p className="text-2xl font-black text-amber-600">{habits.length}</p>
                              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-1">Rituals</p>
                           </div>
                        </div>

                        {/* DANGER ZONE (Compliance) */}
                        <div className="mt-8 pt-8 border-t border-rose-100">
                           <div className="flex items-center justify-between p-3 bg-rose-50/50 rounded-xl border border-rose-100 group hover:bg-rose-50 transition-colors">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-rose-100 text-rose-500 rounded-lg group-hover:bg-rose-200 transition-colors">
                                    <Trash2 size={18} />
                                 </div>
                                 <div>
                                    <p className="font-bold text-rose-900 text-sm">Danger Zone</p>
                                    <p className="text-[10px] text-rose-600/80 font-medium">Irreversible Account Deletion</p>
                                 </div>
                              </div>
                              <button
                                 onClick={handleDeleteClick}
                                 disabled={loading}
                                 className="px-3 py-1.5 bg-white text-rose-600 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                              >
                                 Delete
                              </button>
                           </div>
                        </div>

                     </div>
                  ) : (
                     <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">

                        {/* PRECISION ALERTS (Restored) */}
                        <div className={`p-6 rounded-2xl border transition-all ${prefs.enableTimeSensitive ? 'bg-indigo-50 border-indigo-100 ring-1 ring-indigo-200' : 'bg-white border-zinc-200'}`}>
                           <div className="flex items-start justify-between">
                              <div className="flex gap-4">
                                 <div className={`p-3 rounded-xl ${prefs.enableTimeSensitive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-300' : 'bg-zinc-100 text-zinc-500'}`}>
                                    <Crosshair size={24} />
                                 </div>
                                 <div>
                                    <h3 className={`font-bold text-base ${prefs.enableTimeSensitive ? 'text-indigo-900' : 'text-zinc-900'}`}>Precision Alerts</h3>
                                    <p className={`text-sm mt-1 max-w-sm ${prefs.enableTimeSensitive ? 'text-indigo-700' : 'text-zinc-500'}`}>
                                       Get interrupted exactly when high-priority tasks are due. Bypasses standard quiet hours.
                                    </p>
                                 </div>
                              </div>
                              <div className="relative">
                                 <input
                                    type="checkbox"
                                    checked={prefs.enableTimeSensitive}
                                    onChange={e => setPrefs({ ...prefs, enableTimeSensitive: e.target.checked })}
                                    className="sr-only peer"
                                    id="precision-toggle"
                                 />
                                 <label htmlFor="precision-toggle" className="block w-14 h-8 bg-zinc-200 rounded-full peer-checked:bg-indigo-600 cursor-pointer transition-colors after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-transform peer-checked:after:translate-x-6 shadow-inner"></label>
                              </div>
                           </div>
                        </div>

                        {/* Master Push Toggle */}
                        <div className="flex items-center justify-between p-5 rounded-2xl border border-zinc-200 bg-white">
                           <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-zinc-100 text-zinc-600 rounded-xl"><Bell size={20} /></div>
                              <div>
                                 <p className="font-bold text-zinc-900 text-sm">Push Notifications</p>
                                 <p className="text-xs text-zinc-500">Master switch for device alerts</p>
                              </div>
                           </div>
                           <input type="checkbox" checked={prefs.enablePush} onChange={e => setPrefs({ ...prefs, enablePush: e.target.checked })} className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" />
                        </div>

                        {/* Time Grid with Icons */}
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-5 rounded-2xl border border-zinc-200 bg-white hover:border-indigo-200 transition-colors group">
                              <div className="flex items-center justify-between mb-3">
                                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Kickoff</span>
                                 <Zap size={14} className="text-amber-500" />
                              </div>
                              <div className="relative">
                                 <input type="time" value={prefs.morningBriefTime} onChange={e => setPrefs({ ...prefs, morningBriefTime: e.target.value })} className="w-full bg-transparent font-black text-2xl text-zinc-900 outline-none" />
                                 <p className="text-xs text-zinc-500 mt-1 font-medium">Morning Brief</p>
                              </div>
                           </div>

                           <div className="p-5 rounded-2xl border border-zinc-200 bg-white hover:border-indigo-200 transition-colors group">
                              <div className="flex items-center justify-between mb-3">
                                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cooldown</span>
                                 <ShieldAlert size={14} className="text-indigo-500" />
                              </div>
                              <div className="relative">
                                 <input type="time" value={prefs.afterWorkTime} onChange={e => setPrefs({ ...prefs, afterWorkTime: e.target.value })} className="w-full bg-transparent font-black text-2xl text-zinc-900 outline-none" />
                                 <p className="text-xs text-zinc-500 mt-1 font-medium">Evening Wrap</p>
                              </div>
                           </div>
                        </div>

                        <div className="pt-4">
                           <button onClick={handleSavePrefs} disabled={loading} className={`w-full py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] ${brandGradient} text-white hover:brightness-110`}>
                              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Preferences'}
                           </button>
                        </div>
                     </div>
                  )}

                  {/* LEGAL FOOTER */}
                  <div className="py-8 text-center">
                     <div className="flex justify-center gap-4 text-xs font-bold text-slate-500">
                        <a href="#" className="hover:text-indigo-600 hover:underline">Terms of Service</a>
                        <span>•</span>
                        <a href="#" className="hover:text-indigo-600 hover:underline">Privacy Policy</a>
                     </div>
                     <p className="text-[10px] text-zinc-400 mt-2">v1.2.0 • LifeHub OS</p>
                  </div>
               </div>
            </div>
         </div>
         <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDeleteAccount}
            isLoading={loading}
         />
      </div>
   );
};
