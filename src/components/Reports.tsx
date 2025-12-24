import React, { useEffect, useState } from 'react';
import { useApp } from '../store/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, Sparkles, Clock, FileText } from 'lucide-react';

export const Reports = () => {
  const { habits, reports, generateReport } = useApp();
  const [loading, setLoading] = useState(false);

  // Prepare chart data
  const data = habits.map(h => ({
    name: h.title.substring(0, 10),
    streak: h.streak,
  }));

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateReport();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Reports & Insights</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Habit Consistency</h2>
        {data.length > 0 ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="streak" radius={[6, 6, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
            No active habits to analyze.
          </div>
        )}
      </div>

      {/* Latest AI Report or Generator */}
      <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl border border-indigo-100 relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="text-indigo-600" size={24} />
            <h2 className="text-xl font-bold text-slate-900">Weekly Analysis</h2>
          </div>

          {reports.length > 0 && (new Date(reports[0].generatedAt).toDateString() === new Date().toDateString()) ? (
            <div className="prose prose-slate">
              <p className="whitespace-pre-line text-slate-700 leading-relaxed text-sm">{reports[0].text}</p>
              <div className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Generated {new Date(reports[0].generatedAt).toLocaleTimeString()}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 mb-6 text-sm">Analyze your task load, habit streaks, and financial output for this week.</p>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center mx-auto space-x-2 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <span className="flex items-center gap-2"><Sparkles size={16} /> Generate Report</span>}
              </button>
            </div>
          )}
        </div>

        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Report History */}
      {reports.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Archive</h3>
          {reports.slice(new Date(reports[0].generatedAt).toDateString() === new Date().toDateString() ? 1 : 0).map(report => (
            <div key={report.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-start gap-4 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 text-slate-500">
                <FileText size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={12} className="text-slate-500" />
                  <span className="text-xs font-bold text-slate-500">{new Date(report.generatedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{report.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};