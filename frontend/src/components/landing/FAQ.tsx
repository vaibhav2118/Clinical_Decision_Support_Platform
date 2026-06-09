import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQ() {
  const faqs = [
    {
      q: "Is the platform HIPAA and SOC 2 compliant?",
      a: "Yes. The platform is designed from the ground up for strict healthcare security. We support AES-256 data encryption at rest, TLS 1.3 in transit, granular Role-Based Access Control (RBAC), and detailed, tamper-proof security audit logs that capture every patient query and database operation."
    },
    {
      q: "How does SMART on FHIR integration work?",
      a: "Our frontend can launch inside Epic, Cerner, and other FHIR-compliant EHRs as an embedded application. When a clinician views a patient file, the EHR triggers an OAuth 2.0 handshake, launching our interface in context and passing the patient's ID to compute the readmission risk on the spot."
    },
    {
      q: "What is Explainable AI, and how do SHAP waterfalls work?",
      a: "Unlike typical 'black box' machine learning, our SHAP (SHapley Additive exPlanations) engine mathematically attributes the exact positive or negative impact that every patient feature (such as length of stay, comorbidities, or prior admissions) has on their final readmission probability score, presenting the drivers clearly to the care team."
    },
    {
      q: "What metrics trigger a Data Drift alert?",
      a: "We compute the Population Stability Index (PSI) to check if your current inpatient demographics or clinical feature distributions have shifted significantly from the model's training baseline. A PSI score above 0.2 triggers a warning, recommending that admins run the one-click ML retraining pipeline."
    }
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-slate-600 dark:text-slate-300">
            Answers to common questions about EHR integrations, model security, and explainability.
          </p>
        </div>

        <div className="space-y-4 text-left">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => toggle(idx)}
                  className="w-full p-5 flex items-center justify-between text-left font-display font-bold text-sm text-slate-900 dark:text-white select-none focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                
                {isOpen && (
                  <div className="px-5 pb-5 font-sans text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
