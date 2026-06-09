import React from 'react';
import { Check, X, Info } from 'lucide-react';

export default function ComparisonGrid() {
  const metrics = [
    { name: "Real-time Patient Scoring", us: true, epic: true, closedloop: true, clarify: true, jvion: true },
    { name: "Explainable AI (SHAP drivers)", us: true, epic: false, closedloop: true, clarify: false, jvion: false },
    { name: "Fairness bias checks (Fairlearn)", us: true, epic: false, closedloop: false, clarify: false, jvion: false },
    { name: "Dynamic local retraining pipeline", us: true, epic: false, closedloop: true, clarify: false, jvion: false },
    { name: "Automated Clinical PDF Reports", us: true, epic: false, closedloop: false, clarify: false, jvion: false },
    { name: "Low-overhead self-hosted model", us: true, epic: false, closedloop: false, clarify: false, jvion: false },
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            How We Compare
          </h2>
          <p className="font-sans text-slate-600 dark:text-slate-300">
            Compare CDSS Readmission against standard industry analytics and EHR models.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-5 font-display font-bold text-sm text-slate-700 dark:text-slate-200 w-1/3">Core Capabilities</th>
                  <th className="p-5 font-display font-bold text-sm text-blue-600 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-950/20 text-center">CDSS Platform</th>
                  <th className="p-5 font-display font-bold text-sm text-slate-700 dark:text-slate-200 text-center">Epic Model</th>
                  <th className="p-5 font-display font-bold text-sm text-slate-700 dark:text-slate-200 text-center">ClosedLoop</th>
                  <th className="p-5 font-display font-bold text-sm text-slate-700 dark:text-slate-200 text-center">Clarify Health</th>
                  <th className="p-5 font-display font-bold text-sm text-slate-700 dark:text-slate-200 text-center">Jvion</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="p-5 font-sans font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      {row.name}
                    </td>
                    <td className="p-5 bg-blue-50/10 dark:bg-blue-950/10 text-center">
                      <Check className="h-5 w-5 text-teal-500 mx-auto" />
                    </td>
                    <td className="p-5 text-center">
                      {row.epic ? <Check className="h-5 w-5 text-slate-600 dark:text-slate-400 mx-auto" /> : <X className="h-5 w-5 text-slate-300 dark:text-slate-700 mx-auto" />}
                    </td>
                    <td className="p-5 text-center">
                      {row.closedloop ? <Check className="h-5 w-5 text-slate-600 dark:text-slate-400 mx-auto" /> : <X className="h-5 w-5 text-slate-300 dark:text-slate-700 mx-auto" />}
                    </td>
                    <td className="p-5 text-center">
                      {row.clarify ? <Check className="h-5 w-5 text-slate-600 dark:text-slate-400 mx-auto" /> : <X className="h-5 w-5 text-slate-300 dark:text-slate-700 mx-auto" />}
                    </td>
                    <td className="p-5 text-center">
                      {row.jvion ? <Check className="h-5 w-5 text-slate-600 dark:text-slate-400 mx-auto" /> : <X className="h-5 w-5 text-slate-300 dark:text-slate-700 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
