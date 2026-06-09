import React from 'react';
import { Activity } from 'lucide-react';

interface NavbarProps {
  onLoginClick: () => void;
  onDemoClick: () => void;
}

export default function Navbar({ onLoginClick, onDemoClick }: NavbarProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="font-display font-bold text-lg bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              CDSS ENTERPRISE
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 font-sans font-medium text-sm text-slate-600 dark:text-slate-300">
            <button onClick={() => scrollToSection('features')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</button>
            <button onClick={() => scrollToSection('workflow')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Clinical Workflow</button>
            <button onClick={() => scrollToSection('integrations')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">EHR Connections</button>
            <button onClick={() => scrollToSection('roi')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">ROI Calculator</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">FAQ</button>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onLoginClick} 
              className="px-4 py-2 font-sans font-semibold text-sm text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={onDemoClick} 
              className="px-5 py-2.5 rounded-xl font-sans font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/25 transition-all"
            >
              Request Demo
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
