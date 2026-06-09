import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, RefreshCw } from 'lucide-react';

interface ClinicalNarrativeProps {
  patientId: number;
  headers: any;
  addToast: (t: string) => void;
}

export default function ClinicalNarrative({ patientId, headers, addToast }: ClinicalNarrativeProps) {
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(false);

  const generateNarrative = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/patient/${patientId}/narrative`, {
        method: 'POST',
        headers
      });
      if (!res.ok) throw new Error('Narrative generation failed');
      const data = await res.json();
      setNarrative(data.narrative);
      addToast('Discharge summary generated successfully.');
    } catch (e) {
      addToast('Failed to generate clinical summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setNarrative(''); // reset on change
  }, [patientId]);

  return (
    <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-left">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200/60 dark:border-slate-800 pb-2">
        <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-blue-600" /> AI Clinical Narrative Summary
        </h4>
        <button 
          onClick={generateNarrative} disabled={loading}
          className="text-xs font-sans font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate Summary</span>
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-slate-400 py-6 text-center">Analysing clinical logs, ICD-9 groupings, and SHAP vectors...</div>
      ) : narrative ? (
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 p-4 rounded-lg font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
          {narrative}
        </div>
      ) : (
        <div className="text-xs text-slate-400 py-6 text-center flex flex-col items-center justify-center gap-2">
          <FileText className="h-6 w-6 text-slate-300 dark:text-slate-700" />
          <span>No narrative report generated. Click button above to execute.</span>
        </div>
      )}
    </div>
  );
}
