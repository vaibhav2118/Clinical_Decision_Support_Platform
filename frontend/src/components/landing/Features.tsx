import React from 'react';
import { Activity, ShieldCheck, Cpu, UserCheck, FileSpreadsheet, Eye, BarChart3, Lock } from 'lucide-react';

export default function Features() {
  const list = [
    {
      icon: Cpu,
      title: "Ensemble Risk Classifiers",
      desc: "Automatically train and evaluate Logistic Regression, Random Forest, and XGBoost models, selecting the version with the highest test AUROC."
    },
    {
      icon: Eye,
      title: "Explainable AI (SHAP)",
      desc: "Demystify predictions. Visualizes feature contributions using SHAP Waterfall maps, translating mathematical impacts into clinical text."
    },
    {
      icon: UserCheck,
      title: "Bias Auditing (Fairlearn)",
      desc: "Promote demographic equity. Tracks Demographic Parity and Equalized Odds differences across gender, race, and age group attributes."
    },
    {
      icon: BarChart3,
      title: "Drift Monitoring (PSI)",
      desc: "Avoid silent model degradation. Monitors feature drift and Population Stability Index (PSI), signaling automated warnings above 0.2."
    },
    {
      icon: FileSpreadsheet,
      title: "Discharge PDF Reports",
      desc: "Auto-generate print-ready, secure clinical PDFs containing risk details, SHAP waterfall charts, and custom transitional care guidelines."
    },
    {
      icon: Lock,
      title: "Compliance Audit Trail",
      desc: "HIPAA-aligned security logging. Details administrator operations, credential logins, model changes, and patient data queries."
    }
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Advanced Clinical Intelligence Features
          </h2>
          <p className="font-sans text-slate-600 dark:text-slate-300">
            Enterprise tools designed to empower physicians, support transitional nurses, and enable rigorous compliance tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {list.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx} 
                className="group relative bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all duration-300 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {feat.title}
                </h3>
                <p className="font-sans text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
