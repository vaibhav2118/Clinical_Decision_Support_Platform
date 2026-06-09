import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface OnboardingTourProps {
  onClose: () => void;
}

export default function OnboardingTour({ onClose }: OnboardingTourProps) {
  const steps = [
    {
      title: "Welcome to CDSS Enterprise",
      desc: "This clinical decision support platform assists you in predicting 30-day patient readmissions, auditing demographic fairness, and compiling transition checklists."
    },
    {
      title: "Clinical Dashboard Overview",
      desc: "Monitor hospital-wide readmission trends, identify average risk percentages per department, and examine race demographic distributions in real-time."
    },
    {
      title: "Explainable AI (SHAP)",
      desc: "For every patient record, review detailed SHAP Waterfall charts showing exactly which clinical drivers (e.g. length of stay, comorbidities) impacted their risk probability."
    },
    {
      title: "Group Fairness Auditing",
      desc: "Monitor algorithm parity. Inspect selection rates, false positive rates (FPR), and false negative rates (FNR) across sensitive patient demographics."
    },
    {
      title: "Model Governance & Drift",
      desc: "Review population stability index (PSI) drift trends. Trigger retraining workflows or toggle active model versions dynamically in the model registry."
    }
  ];

  const [current, setCurrent] = useState(0);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div 
          key={current}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.25, cubicBezier: [0.4, 0, 0.2, 1] }}
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-left"
        >
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Tour Step Icon Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">Clinical Tour</span>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white leading-tight">
                {steps[current].title}
              </h3>
            </div>
          </div>

          {/* Text Description */}
          <p className="font-sans text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8 h-20 overflow-y-auto">
            {steps[current].desc}
          </p>

          {/* Pagination Indicators and Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5">
            {/* Dots */}
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    current === idx ? 'w-5 bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {current > 0 && (
                <button 
                  onClick={() => setCurrent(c => c - 1)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center gap-1 active:scale-95 transition-all text-xs font-bold"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </button>
              )}
              {current < steps.length - 1 ? (
                <button 
                  onClick={() => setCurrent(c => c + 1)}
                  className="px-3.5 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-1 active:scale-95 transition-all text-xs font-bold shadow-md shadow-blue-500/10"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button 
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-slate-950 bg-teal-400 hover:bg-teal-300 active:scale-95 transition-all text-xs font-bold shadow-md shadow-teal-500/15"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
