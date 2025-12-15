
import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useApp } from '../store/AppContext';
import { X, LogOut, Download, CreditCard, Bell, ChevronRight, Moon, Clock, Zap, Shield, Smartphone, MessageSquare, Sun, Sunset, Crosshair, Crown } from 'lucide-react';
import { NotificationPreferences } from '../types';

interface ProfileModalProps {
   isOpen: boolean;
   onClose: () => void;
}

// Organic Morphing Background for Avatar
const profileStyles = `
  @keyframes morph-avatar {
    0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
    100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  }
  .avatar-blob {
    animation: morph-avatar 6s ease-in-out infinite;
    transition: all 0.5s ease;
  }
  .glass-panel {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.4);
  }
  
  /* Toggle Switch */
  .toggle-checkbox:checked {
    right: 0;
    border-color: #68D391;
  }
  .toggle-checkbox:checked + .toggle-label {
    background-color: #68D391;
  }
`;

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
   const { user, logout } = useAuth();
   const { tasks, habits, finance, updateNotificationSettings } = useApp();
   const [showNotifSettings, setShowNotifSettings] = useState(false);
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
      setShowNotifSettings(false);
   };

   if (!isOpen) return null;

   const handleExportData = () => {
      // Helper to escape CSV fields
      const escapeCsv = (field: any) => {
         if (field === null || field === undefined) return '';
         const stringField = String(field);
         if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
         }
         return stringField;
      };

      let csvContent = `LifeHub Data Export\nGenerated Date,${new Date().toLocaleDateString()}\n\n`;

      csvContent += `TASKS\nTitle,Status,Priority,Due Date\n`;
      tasks.forEach(t => csvContent += `${escapeCsv(t.title)},${t.status},${t.priority},${escapeCsv(t.dueDate)}\n`);
      csvContent += `\nHABITS\nTitle,Streak\n`;
      habits.forEach(h => csvContent += `${escapeCsv(h.title)},${h.streak}\n`);
      csvContent += `\nFINANCE\nTitle,Amount,Paid\n`;
      finance.forEach(f => csvContent += `${escapeCsv(f.title)},${f.amount},${f.isPaidThisMonth}\n`);

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lifehub_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   const stats = [
      { label: 'Flows', value: tasks.length },
      { label: 'Rituals', value: habits.length },
      { label: 'Score', value: habits.length > 0 ? Math.round(habits.reduce((acc, h) => acc + h.streak, 0) * 10) : 0 }
   ];

   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300 font-sans">
         <style>{profileStyles}</style>
         <div className="absolute inset-0" onClick={onClose} />

         {/* Main Container */}
         <div className="relative w-full max-w-sm bg-white/80 backdrop-blur-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-in border border-white/50">

            {/* Artistic Header */}
            <div className="relative h-48 shrink-0 overflow-hidden">
               {/* Animated Background Mesh */}
               <div className="absolute inset-0 bg-slate-100">
                  <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent_50%)] animate-spin" style={{ animationDuration: '20s' }} />
                  <div className="absolute bottom-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.1),transparent_50%)] animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
               </div>

               <button
                  onClick={onClose}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center text-slate-800 transition-colors backdrop-blur-md z-20"
               >
                  <X size={20} />
               </button>

               {/* Avatar Blob */}
               <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 z-10 pointer-events-none">
                  <div className={`avatar-blob w-24 h-24 flex items-center justify-center shadow-2xl mb-3 ${user?.isPremium ? 'bg-gradient-to-tr from-amber-300 to-orange-500 text-white' : 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white'
                     }`}>
                     <span className="text-4xl font-black">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
                  <div className="flex items-center gap-1.5 mt-1">
                     {user?.isPremium ? <Zap size={12} className="text-amber-500" fill="currentColor" /> : <Shield size={12} className="text-slate-400" />}
                     <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{user?.plan === 'pro' ? 'Pro Account' : 'Free Account'}</span>
                  </div>
               </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">

               {!showNotifSettings ? (
                  <>
                     {/* Stats HUD */}
                     <div className="glass-panel rounded-[24px] p-4 flex justify-between items-center">
                        {stats.map((stat, i) => (
                           <div key={i} className="flex flex-col items-center flex-1 first:border-r border-slate-200/50 last:border-l">
                              <span className="text-2xl font-black text-slate-800">{stat.value}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                           </div>
                        ))}
                     </div>

                     {/* Menu Grid */}
                     <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">System</h3>

                        <button
                           onClick={() => setShowNotifSettings(true)}
                           className="w-full bg-white p-4 rounded-[20px] shadow-sm flex items-center justify-between group hover:scale-[1.02] transition-transform"
                        >
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                 <Bell size={20} />
                              </div>
                              <div className="text-left">
                                 <p className="font-bold text-slate-800">Notifications</p>
                                 <p className="text-xs text-slate-400 font-medium">Daily rhythm & Alerts</p>
                              </div>
                           </div>
                           <ChevronRight className="text-slate-300" size={18} />
                        </button>

                        <button
                           onClick={handleExportData}
                           className="w-full bg-white p-4 rounded-[20px] shadow-sm flex items-center justify-between group hover:scale-[1.02] transition-transform"
                        >
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                 <Download size={20} />
                              </div>
                              <div className="text-left">
                                 <p className="font-bold text-slate-800">Export Memory</p>
                                 <p className="text-xs text-slate-400 font-medium">Download CSV data</p>
                              </div>
                           </div>
                           <ChevronRight className="text-slate-300" size={18} />
                        </button>

                        <button
                           onClick={() => setShowUpsell(true)}
                           className="w-full bg-white p-4 rounded-[20px] shadow-sm flex items-center justify-between group hover:scale-[1.02] transition-transform"
                        >
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                 <Crown size={20} />
                              </div>
                              <div className="text-left">
                                 <p className="font-bold text-slate-800">Subscription</p>
                                 <p className="text-xs text-slate-400 font-medium">Manage Pro plan</p>
                              </div>
                           </div>
                           <ChevronRight className="text-slate-300" size={18} />
                        </button>
                     </div>

                     <div className="pt-4">
                        <button
                           onClick={logout}
                           className="w-full py-4 rounded-[20px] bg-rose-50 text-rose-500 font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors"
                        >
                           <LogOut size={18} />
                           <span>Disconnect</span>
                        </button>
                        <div className="mt-4 flex justify-center gap-4 text-slate-300">
                           <Clock size={14} />
                           <span className="text-[10px] font-mono">ID: {user?.id.substring(0, 8)}</span>
                        </div>
                     </div>
                  </>
               ) : (
                  /* Settings Sub-View */
                  <div className="space-y-6 animate-slide-in-right">
                     <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setShowNotifSettings(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                           <ChevronRight className="rotate-180" size={16} />
                        </button>
                        <h3 className="font-bold text-slate-900 text-lg">Notifications</h3>
                     </div>

                     <div className="bg-white rounded-[24px] p-5 shadow-sm space-y-6">

                        {/* Channels */}
                        <div>
                           <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <MessageSquare size={16} className="text-indigo-500" />
                              Channels
                           </h4>
                           <div className="space-y-4">
                              {/* Push Toggle */}
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                 <div className="flex items-center gap-3">
                                    <Bell size={20} className="text-slate-400" />
                                    <div>
                                       <p className="font-bold text-sm text-slate-700">Push Notifications</p>
                                       <p className="text-[10px] text-slate-400">Desktop & Mobile alerts.</p>
                                    </div>
                                 </div>
                                 <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" name="toggle" id="push-toggle" checked={prefs.enablePush} onChange={e => setPrefs({ ...prefs, enablePush: e.target.checked })} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300" style={{ right: prefs.enablePush ? '0' : 'auto', left: prefs.enablePush ? 'auto' : '0', borderColor: prefs.enablePush ? '#4F46E5' : '#CBD5E1' }} />
                                    <label htmlFor="push-toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${prefs.enablePush ? 'bg-indigo-500' : 'bg-slate-300'}`}></label>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="h-px bg-slate-100" />

                        {/* Daily Rhythm */}
                        <div>
                           <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <Clock size={16} className="text-orange-500" />
                              Daily Rhythm
                           </h4>

                           <div className="flex items-center gap-2 mb-4">
                              <div className="bg-amber-50 p-3 rounded-xl flex items-center gap-3 flex-1 border border-amber-100">
                                 <Sun size={18} className="text-amber-500" />
                                 <div className="flex-1">
                                    <span className="text-[9px] font-bold text-amber-500 uppercase block mb-1">Morning Brief</span>
                                    <input type="time" value={prefs.morningBriefTime} onChange={e => setPrefs({ ...prefs, morningBriefTime: e.target.value })} className="bg-transparent font-bold text-sm text-slate-800 w-full outline-none" />
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-2">
                              <div className="bg-indigo-50 p-3 rounded-xl flex items-center gap-3 flex-1 border border-indigo-100">
                                 <Sunset size={18} className="text-indigo-500" />
                                 <div className="flex-1">
                                    <span className="text-[9px] font-bold text-indigo-500 uppercase block mb-1">Work Wrap-up</span>
                                    <input type="time" value={prefs.afterWorkTime} onChange={e => setPrefs({ ...prefs, afterWorkTime: e.target.value })} className="bg-transparent font-bold text-sm text-slate-800 w-full outline-none" />
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="h-px bg-slate-100" />

                        {/* Precision Alerts */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                           <div className="flex items-center gap-3">
                              <Crosshair size={20} className="text-slate-400" />
                              <div>
                                 <p className="font-bold text-sm text-slate-700">Precision Alerts</p>
                                 <p className="text-[10px] text-slate-400">Notify at exact task time.</p>
                              </div>
                           </div>
                           <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                              <input type="checkbox" name="toggle" id="time-toggle" checked={prefs.enableTimeSensitive} onChange={e => setPrefs({ ...prefs, enableTimeSensitive: e.target.checked })} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300" style={{ right: prefs.enableTimeSensitive ? '0' : 'auto', left: prefs.enableTimeSensitive ? 'auto' : '0', borderColor: prefs.enableTimeSensitive ? '#4F46E5' : '#CBD5E1' }} />
                              <label htmlFor="time-toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${prefs.enableTimeSensitive ? 'bg-indigo-500' : 'bg-slate-300'}`}></label>
                           </div>
                        </div>

                     </div>

                     <button onClick={handleSavePrefs} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-[20px] font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-colors">
                        {loading ? 'Saving...' : 'Save Changes'}
                     </button>
                  </div>
               )}

            </div>
         </div>
      </div>
   );
};
