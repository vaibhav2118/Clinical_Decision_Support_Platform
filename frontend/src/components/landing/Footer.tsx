import React from 'react';
import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-base text-white">CDSS PLATFORM</span>
            </div>
            <p className="font-sans text-xs text-slate-400 leading-relaxed">
              Enterprise-grade healthcare analytics. Predicting 30-day patient readmissions using Explainable AI and demographic parity checks.
            </p>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-display text-white font-semibold text-sm mb-4">Solutions</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-white transition-colors">Risk Prediction</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">SHAP Diagnostic Drivers</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Fairness Group Audit</a></li>
              <li><a href="#roi" className="hover:text-white transition-colors font-semibold text-teal-400">ROI Calculator</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-white font-semibold text-sm mb-4">Integrations</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#integrations" className="hover:text-white transition-colors">Epic Launch</a></li>
              <li><a href="#integrations" className="hover:text-white transition-colors">Cerner CODE</a></li>
              <li><a href="#integrations" className="hover:text-white transition-colors">SMART on FHIR</a></li>
              <li><a href="#integrations" className="hover:text-white transition-colors">HL7 ADT Messages</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-white font-semibold text-sm mb-4">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">System Model Card</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Fairness Limitations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Developer API Docs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">HIPAA Trust Center</a></li>
            </ul>
          </div>

        </div>

        <div className="h-px bg-slate-800 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="text-center sm:text-left leading-relaxed">
            &copy; {new Date().getFullYear()} CDSS Healthcare Solutions, Inc. All rights reserved.<br />
            <span className="text-[10px] text-slate-600 block mt-1">
              Disclaimer: Predictor metrics are clinical guidelines and must never override standard physician judgment.
            </span>
          </div>
          <div className="flex gap-6 font-semibold">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
