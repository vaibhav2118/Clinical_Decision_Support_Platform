import React from 'react';
import { Play, ArrowRight, ShieldCheck, Activity, Users, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onDemoClick: () => void;
  onWatchWalkthrough: () => void;
}

export default function Hero({ onDemoClick, onWatchWalkthrough }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-20 lg:py-28">
      {/* Background Graphic Patterns */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-600/10"></div>
      <div className="absolute bottom-10 left-10 -z-10 w-72 h-72 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-600/10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800/80 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <ShieldCheck className="h-4 w-4" /> HIPAA Compliance Ready
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
              Reduce Hospital Readmissions <br />
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Before They Happen
              </span>
            </h1>
            
            <p className="font-sans text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              Use Explainable AI, Clinical Intelligence, and Fairness Monitoring to identify high-risk patients before discharge. Integrate seamlessly with your EHR workflow via SMART on FHIR.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={onDemoClick}
                className="px-6 py-3.5 rounded-xl font-sans font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-2 transition-all"
              >
                <span>Request Enterprise Demo</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button 
                onClick={onWatchWalkthrough}
                className="px-6 py-3.5 rounded-xl font-sans font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-all"
              >
                <Play className="h-4 w-4 text-teal-500" />
                <span>Watch Clinical Walkthrough</span>
              </button>
            </div>
          </div>

          {/* Right Visual Dashboard Preview Column */}
          <div className="lg:col-span-6">
            <div className="relative p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl shadow-slate-200 dark:shadow-none">
              {/* Mock Dashboard View */}
              <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span className="font-display font-bold text-xs text-slate-900 dark:text-white">CDSS Core Risk Engine</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800/80">
                    <div className="text-red-500 font-display font-bold text-lg">18%</div>
                    <div className="text-[10px] text-slate-500">Readmission rate</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800/80">
                    <div className="text-teal-500 font-display font-bold text-lg">94.2%</div>
                    <div className="text-[10px] text-slate-500">Model AUROC</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800/80">
                    <div className="text-blue-500 font-display font-bold text-lg">0.03</div>
                    <div className="text-[10px] text-slate-500">Demographic Parity</div>
                  </div>
                </div>

                {/* Simulated Waterfall Row */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800/80 text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white mb-2">High-Risk Patient Case Analysis</div>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Previous Admissions (4)</span>
                      <span className="text-red-500 font-bold">+24.2%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full w-[75%]" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Length of Stay (8 Days)</span>
                      <span className="text-red-500 font-bold">+12.5%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full w-[45%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
