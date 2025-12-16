import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useUsage } from '../store/UsageContext';
import { DollarSign, Check, Plus, Lock, TrendingUp, Layers, CreditCard } from 'lucide-react';

// Styles for the liquid wave animation
const liquidStyles = `
  @keyframes wave {
    0% { transform: translateX(-50%) rotate(0deg); }
    50% { transform: translateX(-50%) rotate(180deg); }
    100% { transform: translateX(-50%) rotate(360deg); }
  }
  .liquid-container {
    position: relative;
    overflow: hidden;
  }
  .wave {
    position: absolute;
    left: 50%;
    width: 200%;
    height: 200%;
    border-radius: 40%;
    animation: wave 10s infinite linear;
    transform-origin: 50% 50%;
  }
`;

export const Finance = () => {
   const { finance, togglePaid, addFinanceItem, deleteFinanceItem, updateFinanceItem } = useApp();
   const { isPremium, setShowPaywall } = useUsage();
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingItem, setEditingItem] = useState<FinanceItem | null>(null);

   // Stats
   const totalMonthly = finance.reduce((sum, item) => sum + item.amount, 0);
   const paidThisMonth = finance.filter(f => f.isPaidThisMonth).reduce((sum, item) => sum + item.amount, 0);
   const percentage = totalMonthly > 0 ? (paidThisMonth / totalMonthly) * 100 : 0;

   // Form
   const [title, setTitle] = useState('');
   const [amount, setAmount] = useState('');
   const [dueDay, setDueDay] = useState('');

   const openAddModal = () => {
      setEditingItem(null);
      setTitle('');
      setAmount('');
      setDueDay('');
      setIsModalOpen(true);
   };

   const openEditModal = (item: FinanceItem) => {
      setEditingItem(item);
      setTitle(item.title);
      setAmount(item.amount.toString());
      setDueDay(item.dueDay.toString());
      setIsModalOpen(true);
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (title && amount) {
         if (editingItem) {
            updateFinanceItem(editingItem.id, {
               title,
               amount: parseFloat(amount),
               dueDay: parseInt(dueDay) || 1
            });
         } else {
            await addFinanceItem({
               title,
               amount: parseFloat(amount),
               dueDay: parseInt(dueDay) || 1,
               type: 'bill'
            });
         }
         setIsModalOpen(false);
         setTitle(''); setAmount(''); setDueDay('');
      }
   };

   return (
      <div className="min-h-screen pb-32 pt-6 px-2 font-sans">
         <style>{liquidStyles}</style>

         <div className="flex justify-between items-end mb-8 px-4">
            <div>
               <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-1">Vault</h1>
               <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100/50 px-2 py-1 rounded-lg w-fit">
                  <Lock size={10} />
                  <span>Offline Mode • Privacy Active</span>
               </div>
            </div>
            <button onClick={openAddModal} className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
               <Plus size={20} />
            </button>
         </div>

         {/* --- LIQUID BUDGET CARD --- */}
         <div className="liquid-container h-64 bg-slate-900 rounded-[40px] mb-8 relative shadow-2xl shadow-indigo-200 mx-2">
            {/* The Liquid */}
            <div
               className="wave bg-gradient-to-t from-indigo-600 to-purple-600 opacity-80"
               style={{ bottom: `${percentage - 110}%` }} // Adjust offset to fill up
            />
            <div
               className="wave bg-indigo-500 opacity-40"
               style={{ bottom: `${percentage - 115}%`, animationDuration: '12s' }}
            />

            {/* Content Overlay */}
            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
               <div className="flex justify-between text-white/80">
                  <span className="text-xs font-bold uppercase tracking-widest">Monthly Cap</span>
                  <TrendingUp size={16} />
               </div>

               <div className="text-center">
                  <span className="block text-5xl font-black text-white tracking-tight mb-2">${totalMonthly - paidThisMonth}</span>
                  <span className="text-sm font-bold text-indigo-200 uppercase tracking-widest">Remaining</span>
               </div>

               <div className="flex justify-between items-end text-white">
                  <div>
                     <p className="text-[10px] font-bold uppercase opacity-60">Paid</p>
                     <p className="font-bold text-lg">${paidThisMonth}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-bold uppercase opacity-60">Total</p>
                     <p className="font-bold text-lg">${totalMonthly}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* --- EXPENSE TICKETS --- */}
         <div className="space-y-3 px-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 mb-2">Upcoming Tickets</h3>

            <div className="space-y-4">
               {finance.length === 0 ? (
                  <div className="glass-card text-center py-12">
                     <DollarSign size={32} className="mx-auto mb-2 text-slate-300" />
                     <p className="text-slate-400 font-bold">No items in wallet.</p>
                  </div>
               ) : (
                  finance.map(item => (
                     <div
                        key={item.id}
                        onClick={() => openEditModal(item)}
                        className={`glass-card p-5 flex items-center justify-between group cursor-pointer hover:border-indigo-200 transition-all ${item.isPaidThisMonth ? 'opacity-60' : ''}`}
                     >
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'income' ? 'bg-emerald-100 text-emerald-600' :
                              item.type === 'bill' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                              }`}>
                              {item.type === 'income' ? <TrendingUp size={18} /> : <CreditCard size={18} />}
                           </div>
                           <div>
                              <h3 className="font-bold text-slate-800">{item.title}</h3>
                              <p className="text-xs text-slate-400 font-bold">
                                 Due Day: {item.dueDay}
                              </p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className={`block font-black text-lg ${item.type === 'income' ? 'text-emerald-500' : 'text-slate-800'}`}>
                           </span>
                           <div className="flex flex-col items-end gap-1">
                              {!item.isPaidThisMonth && item.type === 'bill' && (
                                 <button
                                    onClick={(e) => { e.stopPropagation(); togglePaid(item.id); }}
                                    className="text-[10px] font-bold text-primary-500 bg-primary-50 px-2 py-1 rounded-md hover:bg-primary-100 transition-colors"
                                 >
                                    MARK PAID
                                 </button>
                              )}
                              <button
                                 onClick={(e) => { e.stopPropagation(); deleteFinanceItem(item.id); }}
                                 className="text-[10px] font-bold text-slate-400 hover:text-rose-500 px-2 py-1 transition-colors"
                              >
                                 DELETE
                              </button>
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Add Logic */}
         <button
            onClick={openAddModal}
            className="fixed right-6 bottom-24 md:bottom-10 md:right-10 w-16 h-16 bg-slate-900 rounded-[24px] text-white shadow-2xl shadow-slate-900/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
         >
            <Plus size={32} />
         </button>

         {/* Add Modal */}
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
               <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
               <form onSubmit={handleSubmit} className="relative w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl animate-scale-in">
                  <h2 className="text-2xl font-black text-slate-900 mb-6">{editingItem ? 'Edit Expense' : 'New Expense'}</h2>
                  <div className="space-y-4">
                     <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Netflix, Rent..." className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-800 border-none focus:ring-2 focus:ring-indigo-100" autoFocus />
                     <div className="flex gap-4">
                        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="$0.00" type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-800 border-none focus:ring-2 focus:ring-indigo-100" />
                        <input value={dueDay} onChange={e => setDueDay(e.target.value)} placeholder="Day (1-31)" type="number" className="w-1/3 p-4 bg-slate-50 rounded-2xl font-bold text-slate-800 border-none focus:ring-2 focus:ring-indigo-100 text-center" />
                     </div>
                  </div>
                  <button className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform">
                     {editingItem ? 'Update Vault' : 'Add to Vault'}
                  </button>
               </form>
            </div>
         )}
      </div>
   );
};
