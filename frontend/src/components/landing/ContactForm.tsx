import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [hospital, setHospital] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API request
    setSubmitted(true);
  };

  return (
    <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Request an Enterprise Demo
          </h2>
          <p className="font-sans text-sm text-slate-600 dark:text-slate-400">
            Connect with our integration engineering team to schedule a custom SMART on FHIR integration mockup in your sandbox.
          </p>
        </div>

        {submitted ? (
          <div className="bg-teal-50 dark:bg-teal-950/40 p-8 rounded-2xl border border-teal-200 dark:border-teal-800 text-center animate-fade-in">
            <CheckCircle className="h-12 w-12 text-teal-500 mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2">Request Submitted</h3>
            <p className="font-sans text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Thank you! Our clinical integrations team will contact you at <b>{email}</b> within 24 hours to schedule your sandbox connection tour.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-lg text-left space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="Dr. Sarah Jenkins"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-sans text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider">Clinical Email</label>
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="s.jenkins@mercy-hospital.org"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-sans text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider">Hospital System</label>
              <input 
                type="text" required value={hospital} onChange={e => setHospital(e.target.value)}
                placeholder="Mercy Healthcare Group"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-sans text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 uppercase tracking-wider">Message / Scope</label>
              <textarea 
                rows={4} value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Explain your integration scope, beds volume, or standard EHR system..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-sans text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full mt-2 py-3 rounded-xl font-sans font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Send className="h-4 w-4" />
              <span>Book Integration Assessment</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
