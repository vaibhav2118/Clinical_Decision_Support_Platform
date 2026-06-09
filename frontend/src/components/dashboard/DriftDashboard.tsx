import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { ShieldAlert, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export default function DriftDashboard() {
  // Mock Drift historical scores
  const psiHistory = [
    { month: "Jan", PSI: 0.021, threshold: 0.1 },
    { month: "Feb", PSI: 0.035, threshold: 0.1 },
    { month: "Mar", PSI: 0.052, threshold: 0.1 },
    { month: "Apr", PSI: 0.081, threshold: 0.1 },
    { month: "May", PSI: 0.115, threshold: 0.1 },
    { month: "Jun", PSI: 0.042, threshold: 0.1 } // dropped due to retrain
  ];

  const featureDrift = [
    { feature: "Prev Admissions", drift: 0.042 },
    { feature: "Length of Stay", drift: 0.085 },
    { feature: "Comorbidity Index", drift: 0.021 },
    { feature: "Num Diagnoses", drift: 0.091 },
    { feature: "Insurance Type", drift: 0.142 } // highest drift
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold mb-0.5">PSI Status</div>
            <div className="text-xl font-display font-bold text-slate-900 dark:text-white">Normal (0.042)</div>
            <div className="text-[10px] text-teal-500 font-medium">Safe Boundary limit &lt; 0.1</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Last Retrained</div>
            <div className="text-xl font-display font-bold text-slate-900 dark:text-white">Active Version</div>
            <div className="text-[10px] text-slate-400 font-semibold">Stability checked 24 hours ago</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Highest Drift Feature</div>
            <div className="text-xl font-display font-bold text-slate-900 dark:text-white">Insurance Type</div>
            <div className="text-[10px] text-red-500 font-medium">PSI Shift: 0.142</div>
          </div>
        </div>
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* PSI Area Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/85 shadow-lg">
          <div className="font-display font-bold text-sm text-slate-900 dark:text-white mb-4">Historical Population Stability Index (PSI)</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={psiHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPsi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3182ce" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3182ce" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="#718096" style={{ fontSize: '10px' }} />
                <YAxis stroke="#718096" style={{ fontSize: '10px' }} />
                <Tooltip />
                <Legend style={{ fontSize: '10px' }} />
                <Area type="monotone" dataKey="PSI" stroke="#3182ce" fillOpacity={1} fill="url(#colorPsi)" name="Actual PSI" strokeWidth={2} />
                <Line type="monotone" dataKey="threshold" stroke="#e53e3e" strokeDasharray="4 4" name="Target Boundary Limit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Drift Bar list */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/85 shadow-lg">
          <div className="font-display font-bold text-sm text-slate-900 dark:text-white mb-2">Feature Shift Drift Analysis</div>
          <p className="font-sans text-[10px] text-slate-500 mb-6 leading-relaxed">
            Measures population covariate shift for individual active features compared against baseline parameters.
          </p>

          <div className="space-y-4">
            {featureDrift.map((item, idx) => {
              const widthPct = Math.min(item.drift * 500, 100);
              return (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>{item.feature}</span>
                    <span className={item.drift > 0.1 ? 'text-red-500 font-bold' : 'text-slate-500'}>
                      {item.drift.toFixed(3)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.drift > 0.1 ? 'bg-red-500 animate-pulse' : 'bg-blue-600'}`} 
                      style={{ width: `${widthPct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
