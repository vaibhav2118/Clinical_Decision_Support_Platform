import React from 'react';
import { Check } from 'lucide-react';

export default function Pricing() {
  const tiers = [
    {
      name: "Starter",
      price: "$950",
      desc: "For single specialized hospital departments.",
      features: [
        "Up to 10 active clinicians",
        "Standard ML models (Random Forest)",
        "Patient directory filter & search",
        "Discharge checklists",
        "Secure PDF download logs"
      ],
      cta: "Start 14-Day Free Trial",
      popular: false
    },
    {
      name: "Professional",
      price: "$3,800",
      desc: "For full hospital campus coordinates.",
      features: [
        "Unlimited clinical users",
        "Active XGBoost risk predictions",
        "SHAP explainability drivers",
        "Fairlearn demographic auditing",
        "Standard HL7 sync feeds",
        "1-click ML retraining registry"
      ],
      cta: "Schedule EHR Setup",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For multi-facility healthcare networks.",
      features: [
        "Dedicated cloud cluster / on-prem",
        "Native SMART on FHIR embeds",
        "MFA & SAML SSO credentials",
        "Custom dataset recalibrations",
        "24/7 technical clinical support",
        "Full row-level multi-tenancy"
      ],
      cta: "Contact Clinical Sales",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Predictable SaaS Pricing Plans
          </h2>
          <p className="font-sans text-slate-600 dark:text-slate-300">
            Select the tier matching your clinical scope and data pipeline requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, idx) => (
            <div 
              key={idx}
              className={`bg-slate-50 dark:bg-slate-950 p-8 rounded-2xl border flex flex-col justify-between text-left relative ${
                tier.popular 
                  ? 'border-blue-600 dark:border-blue-500 shadow-xl shadow-blue-500/10' 
                  : 'border-slate-200/60 dark:border-slate-800/80 shadow-sm'
              }`}
            >
              {tier.popular && (
                <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mb-6">
                  {tier.desc}
                </p>
                <div className="flex items-baseline mb-8">
                  <span className="font-display text-4xl font-bold text-slate-900 dark:text-white">{tier.price}</span>
                  {tier.price !== "Custom" && <span className="font-sans text-sm text-slate-500 dark:text-slate-400">/month</span>}
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800/80 mb-8" />

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300 items-start">
                      <Check className="h-5 w-5 text-teal-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                className={`w-full py-3 rounded-xl font-sans font-bold text-sm text-center transition-all ${
                  tier.popular 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20' 
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
