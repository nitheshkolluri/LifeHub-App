
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useUsage } from '../store/UsageContext';
import { FinanceItem } from '../types';
import { DollarSign, Check, Plus, Lock, TrendingUp, Layers, CreditCard, X, Wallet, ShieldCheck, ArrowRight } from 'lucide-react';

export const Finance = () => {
   const { finance, togglePaid, addFinanceItem, deleteFinanceItem, updateFinanceItem } = useApp();
   const { isPremium, setShowPaywall } = useUsage();
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingItem, setEditingItem] = useState<FinanceItem | null>(null);

   // Stats
   const totalMonthly = finance.reduce((sum, item) => sum + item.amount, 0);
   const paidThisMonth = finance.filter(f => f.isPaidThisMonth).reduce((sum, item) => sum + item.amount, 0);
   const remaining = totalMonthly - paidThisMonth;
   const percentage = totalMonthly > 0 ? (paidThisMonth / totalMonthly) * 100 : 0;

   // Form
   const [title, setTitle] = useState('');
   const [amount, setAmount] = useState('');
   const [dueDate, setDueDate] = useState('');

   const openAddModal = () => {
      setEditingItem(null);
      setTitle('');
      setAmount('');
      setDueDate('');
      setIsModalOpen(true);
   };

   const openEditModal = (item: FinanceItem) => {
      setEditingItem(item);
      setTitle(item.title);
      setAmount(item.amount.toString());
      setDueDate(item.dueDate || ''); // Use dueDate if available
      setIsModalOpen(true);
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (title && amount) {
         const payload = {
            title,
            amount: parseFloat(amount),
            dueDate: dueDate || undefined, // Send date string
            dueDay: dueDate ? parseInt(dueDate.split('-')[2]) : 1, // Fallback for legacy sorting
            type: 'bill' as const
         };

         if (editingItem) {
            updateFinanceItem(editingItem.id, payload);
         } else {
            await addFinanceItem(payload);
         }
         setIsModalOpen(false);
         setTitle(''); setAmount(''); setDueDate('');
      }
   };
   return (
      <div className="min-h-screen pb-32 pt-6 px-2 font-sans text-zinc-900 animate-in-fade">

         {/* HEADER */}
         <div className="flex justify-between items-end mb-8 px-4">
            <div>
               <h1 className="text-4xl font-display font-black tracking-tight mb-2 text-zinc-900">Wallet</h1>
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full w-fit border border-emerald-200">
                  <ShieldCheck size={12} />
                  <span>Secure Local Vault</span>
               </div>
            </div>
            <button onClick={openAddModal} className="w-12 h-12 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 hover:scale-105 transition-transform group border border-white/10">
               <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
         </div>

         {/* --- SUMMARY CARDS --- */}
         <div className="grid grid-cols-2 gap-4 px-2 mb-10">
            <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xl shadow-indigo-500/30 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-30 transition-opacity">
                  <Wallet size={48} />
               </div>
               <span className="text-[10px] uppercase font-bold text-indigo-100 tracking-widest block mb-2">Total Monthly</span>
               <span className="text-3xl font-display font-black tracking-tight">${totalMonthly.toLocaleString()}</span>
            </div>
            <div className="p-6 rounded-[2.5rem] bg-white border border-zinc-100 shadow-md relative overflow-hidden">
               <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest block mb-2">Remaining</span>
               <span className="text-3xl font-display font-black tracking-tight text-zinc-900">${remaining.toLocaleString()}</span>

               {/* Progress Bar */}
               <div className="absolute bottom-0 left-0 w-full h-1.5 bg-zinc-100">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${percentage}%` }} />
               </div>
            </div>
         </div>

         {/* --- EXPENSE LIST --- */}
         <div className="space-y-4 px-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-2 mb-2 flex items-center gap-2">
               Upcoming Bills <span className="bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded text-[9px]">{finance.filter(f => !f.isPaidThisMonth).length}</span>
            </h3>

            <div className="space-y-3">
               {finance.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-zinc-200 rounded-[2rem] bg-white/50">
                     <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-zinc-100">
                        <DollarSign size={32} className="text-zinc-400" />
                     </div>
                     <p className="text-zinc-400 font-bold text-sm">Your wallet is empty.</p>
                     <button onClick={openAddModal} className="text-indigo-500 text-xs font-bold mt-2 hover:underline">Add Bill</button>
                  </div>
               ) : (
                  finance.map((item, index) => (
                     <div
                        key={item.id}
                        onClick={() => openEditModal(item)}
                        className={`group relative bg-white border border-zinc-100 p-5 rounded-[2rem] hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer animate-slide-up ${item.isPaidThisMonth ? 'grayscale opacity-60' : ''}`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                     >
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${item.type === 'income' ? 'bg-emerald-50 text-emerald-500' :
                                 item.type === 'bill' ? 'bg-rose-50 text-rose-500' : 'bg-zinc-100 text-zinc-500'
                                 }`}>
                                 {item.type === 'income' ? <TrendingUp size={20} /> : <CreditCard size={20} />}
                              </div>
                              <div>
                                 <h3 className="font-bold text-base text-zinc-800">{item.title}</h3>
                                 <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider bg-zinc-50 px-2 py-0.5 rounded-md w-fit mt-1 border border-zinc-100">
                                    Due {item.dueDay ? `Day ${item.dueDay}` : 'N/A'}
                                 </p>
                              </div>
                           </div>

                           <div className="text-right">
                              <span className={`block font-black text-lg ${item.type === 'income' ? 'text-emerald-500' : 'text-zinc-800'}`}>
                                 ${item.amount}
                              </span>
                           </div>
                        </div>

                        {/* HOVER ACTIONS (Desktop) / ALWAYS VISIBLE ACTIONS (Mobile logic handled by layout) */}
                        <div className="mt-4 flex justify-end gap-2 pt-4 border-t border-zinc-50">
                           {!item.isPaidThisMonth && item.type === 'bill' && (
                              <button
                                 onClick={(e) => { e.stopPropagation(); togglePaid(item.id); }}
                                 className="flex items-center gap-1.5 text-[10px] font-black text-white bg-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-500 transition-all shadow-md active:scale-95"
                              >
                                 <Check size={12} strokeWidth={3} /> MARK PAID
                              </button>
                           )}
                           {item.isPaidThisMonth && item.type === 'bill' && (
                              <button
                                 onClick={(e) => { e.stopPropagation(); togglePaid(item.id); }}
                                 className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 bg-zinc-100 px-4 py-2 rounded-xl hover:bg-zinc-200 transition-all active:scale-95"
                              >
                                 UNDO
                              </button>
                           )}
                           <button
                              onClick={(e) => { e.stopPropagation(); deleteFinanceItem(item.id); }}
                              className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                           >
                              <X size={14} />
                           </button>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* ADD BUTTON (Floating for Mobile) */}
         <button
            onClick={openAddModal}
            className="fixed right-6 bottom-24 md:bottom-10 md:right-10 w-14 h-14 bg-indigo-600 rounded-[1.2rem] text-white shadow-xl shadow-indigo-500/30 flex items-center justify-center hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all z-40 group border border-white/10"
         >
            <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
         </button>

         {/* Add Modal */}
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in-fade">
               <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
               <form onSubmit={handleSubmit} className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in-up border border-zinc-100">
                  <div className="flex justify-between items-center mb-8">
                     <h2 className="text-2xl font-black text-zinc-900">{editingItem ? 'Edit Bill' : 'New Bill'}</h2>
                     <button type="button" onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors">
                        <X size={20} />
                     </button>
                  </div>

                  <div className="space-y-6">
                     <div className="relative group">
                        <input
                           value={title}
                           onChange={e => setTitle(e.target.value)}
                           placeholder="e.g. Netflix"
                           className="w-full py-4 bg-transparent border-b-2 border-zinc-100 text-xl font-bold text-zinc-900 focus:border-indigo-500 focus:outline-none placeholder:text-zinc-300 transition-colors"
                           autoFocus
                        />
                     </div>
                     <div className="flex gap-4">
                        <div className="relative group flex-1">
                           <div className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</div>
                           <input
                              value={amount}
                              onChange={e => setAmount(e.target.value)}
                              placeholder="0.00"
                              type="number"
                              className="w-full py-3 pl-4 bg-transparent border-b-2 border-zinc-100 text-lg font-bold text-zinc-900 focus:border-indigo-500 focus:outline-none placeholder:text-zinc-300 transition-colors"
                           />
                        </div>
                        <input
                           value={dueDate}
                           onChange={e => setDueDate(e.target.value)}
                           type="date"
                           className="w-1/2 bg-zinc-50 rounded-xl px-3 font-bold text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500/50 border border-zinc-100"
                        />
                     </div>
                  </div>

                  <button className="w-full mt-10 bg-indigo-600 text-white py-4 rounded-[1.5rem] font-bold text-lg shadow-xl shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.98] transition-all">
                     {editingItem ? 'Update Vault' : 'Add to Vault'}
                  </button>
               </form>
            </div>
         )}
      </div>
   );
};
