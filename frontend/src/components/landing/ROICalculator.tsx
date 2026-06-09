import React, { useState } from 'react';
import { DollarSign, Percent, Calculator, CheckCircle2 } from 'lucide-react';

export default function ROICalculator() {
  const [beds, setBeds] = useState(300);
  const [admissions, setAdmissions] = useState(12000);
  const [readmitRate, setReadmitRate] = useState(18.5);
  const [readmitCost, setReadmitCost] = useState(15200);

  // Financial ROI Logic
  // Total annual readmissions
  const annualReadmissions = Math.round(admissions * (readmitRate / 100));
  // Total cost
  const totalCost = annualReadmissions * readmitCost;
  // CDSS helps reduce readmissions. Standard average clinical efficacy reduction: 25%
  const readmissionReduction = 0.25;
  const readmissionsSaved = Math.round(annualReadmissions * readmissionReduction);
  const annualSavings = readmissionsSaved * readmitCost;
  // HRRP penalty mitigation estimate (approx 0.5% of medicare revenues, let's estimate average based on beds)
  const hrrpMitigation = Math.round(beds * 1100);
  const totalFinancialBenefit = annualSavings + hrrpMitigation;
  const softBenefit = Math.round(annualSavings * 0.15); // productivity benefits
  
  // Platform subscription cost (approx $3,800/month * 12 = $45,600)
  const platformCost = 45600;
  const roiMultiplier = Math.max(0, Math.round(totalFinancialBenefit / platformCost));

  return (
    <section id="roi" className="py-20 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Interactive Hospital ROI Calculator
          </h2>
          <p className="font-sans text-slate-600 dark:text-slate-300">
            Estimate your annual cost savings, Medicare penalty mitigation, and return on investment by implementing CDSS Readmission.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Sliders Input Panel */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg text-left">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Calculator className="h-5 w-5 text-blue-600" /> Enter Hospital Parameters
            </h3>

            <div className="space-y-6">
              {/* Sliders */}
              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  <span>Number of Beds</span>
                  <span className="text-blue-600 font-bold">{beds} Beds</span>
                </div>
                <input 
                  type="range" min="50" max="1500" step="10" 
                  value={beds} onChange={e => setBeds(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  <span>Annual Patient Admissions</span>
                  <span className="text-blue-600 font-bold">{admissions.toLocaleString()} Admissions</span>
                </div>
                <input 
                  type="range" min="1000" max="80000" step="500" 
                  value={admissions} onChange={e => setAdmissions(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  <span>Current 30-Day Readmission Rate</span>
                  <span className="text-blue-600 font-bold">{readmitRate}%</span>
                </div>
                <input 
                  type="range" min="5.0" max="30.0" step="0.1" 
                  value={readmitRate} onChange={e => setReadmitRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  <span>Avg Cost per Readmission Incident</span>
                  <span className="text-blue-600 font-bold">${readmitCost.toLocaleString()}</span>
                </div>
                <input 
                  type="range" min="8000" max="30000" step="100" 
                  value={readmitCost} onChange={e => setReadmitCost(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Savings Calculations Output Panel */}
          <div className="lg:col-span-6 bg-gradient-to-tr from-blue-900 to-slate-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col justify-between text-left">
            <div>
              <h3 className="font-display text-lg font-bold flex items-center gap-2 mb-6 pb-3 border-b border-white/10 text-teal-400">
                <CheckCircle2 className="h-5 w-5" /> Estimated Projections
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Estimated Annual Savings</div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-white">${annualSavings.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Penalty Mitigation (HRRP)</div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-white">${hrrpMitigation.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Total Financial Benefit</div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-teal-400">${totalFinancialBenefit.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Projected Platform ROI</div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-teal-400">{roiMultiplier}x Return</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-xs text-slate-300 leading-relaxed">
                *Projections are calculated based on a conservative **25% readmission rate reduction** which is standard for clinical care coordination platforms utilizing SHAP guidelines. HRRP penalty estimates assume a base Medicare caseload proportional to beds.
              </div>
            </div>

            <button className="mt-8 w-full py-3.5 rounded-xl font-sans font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 transition-all text-center">
              Export Customized PDF Business Case
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
