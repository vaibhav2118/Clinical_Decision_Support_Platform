import React from 'react';
import { UserCheck, Database, RefreshCw, BarChart2, ShieldAlert, FileCheck2 } from 'lucide-react';

export default function WorkflowVisual() {
  const steps = [
    {
      icon: UserCheck,
      title: "1. Patient Admission",
      desc: "Patient enters the ward. ADT^A01 triggers an encounter file in the EHR."
    },
    {
      icon: Database,
      title: "2. Data Ingestion",
      desc: "CDSS retrieves demographics, ICD-9 diagnoses, and procedures logs."
    },
    {
      icon: RefreshCw,
      title: "3. AI Risk Prediction",
      desc: "Active XGBoost pipeline scales features and evaluates 30-day readmission risk."
    },
    {
      icon: BarChart2,
      title: "4. SHAP Diagnostics",
      desc: "Explainer calculates local shapley values to map specific clinical drivers."
    },
    {
      icon: ShieldAlert,
      title: "5. Bias Check & Alert",
      desc: "Parity auditing checks fairness boundaries and adds flags to dashboard."
    },
    {
      icon: FileCheck2,
      title: "6. Care Outreach",
      desc: "Clinicians download PDF reports and execute follow-up checklists."
    }
  ];

  return (
    <section id="workflow" className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Clinical Workflow Pipeline
          </h2>
          <p className="font-sans text-slate-600 dark:text-slate-300">
            From admission file synchronization to risk predictions and care team follow-ups.
          </p>
        </div>

        <div className="relative">
          {/* Centered line in vertical timeline (desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -translate-x-1/2"></div>
          
          <div className="space-y-12">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className={`flex flex-col lg:flex-row items-center gap-8 ${isEven ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Left blank side placeholder (desktop spacer) */}
                  <div className="hidden lg:block w-1/2"></div>
                  
                  {/* Stepper Dot */}
                  <div className="z-10 w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shrink-0 scale-110">
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Card Content */}
                  <div className="w-full lg:w-1/2 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 text-left hover:border-blue-500/50 transition-all">
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="font-sans text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
