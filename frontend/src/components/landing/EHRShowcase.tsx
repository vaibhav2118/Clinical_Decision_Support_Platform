import React from 'react';
import { Share2, Zap, Database, Server, RefreshCw } from 'lucide-react';

export default function EHRShowcase() {
  const integrations = [
    { name: "Epic", type: "App Orchard / FHIR" },
    { name: "Cerner", type: "CODE / FHIR" },
    { name: "Meditech", type: "RESTful API / HL7" },
    { name: "Athenahealth", type: "MDR / FHIR" },
    { name: "SMART on FHIR", type: "OAuth SSO & Ingestion" },
    { name: "HL7 ADT Messages", type: "Inbound TCP Streams" }
  ];

  return (
    <section id="integrations" className="py-20 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Detail */}
          <div className="lg:col-span-5 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800/80 bg-teal-50/50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Seamless Connections
            </div>
            
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              EHR Native Integration Showcase
            </h2>
            <p className="font-sans text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Connect to your existing hospital infrastructure. We utilize standard healthcare transfer protocols to pull demographics, diagnoses, and procedure logs.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                <p className="font-sans text-sm text-slate-600 dark:text-slate-400"><b>SMART on FHIR Launch:</b> Embed our dashboard directly within Epic or Cerner patient encounter screens.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                <p className="font-sans text-sm text-slate-600 dark:text-slate-400"><b>HL7 Inbound Streams:</b> Process real-time admission (ADT^A01) and discharge (ADT^A03) messages via secure TCP links.</p>
              </div>
            </div>
          </div>

          {/* Right Visual Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {integrations.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col justify-between text-left group hover:border-blue-500 hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                  {idx % 2 === 0 ? <Share2 className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                </div>
                
                <div className="mt-4">
                  <div className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {item.type}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
