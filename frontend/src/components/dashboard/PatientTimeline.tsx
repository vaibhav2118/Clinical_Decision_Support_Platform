import React from 'react';
import { Calendar, UserCheck, Stethoscope, ClipboardCheck, AlertTriangle } from 'lucide-react';

interface PatientTimelineProps {
  admissions: any[];
  riskHistory: any[];
}

export default function PatientTimeline({ admissions, riskHistory }: PatientTimelineProps) {
  // Sort admissions and risk logs chronologically
  const timelineEvents: any[] = [];

  admissions.forEach(adm => {
    timelineEvents.push({
      date: adm.admission_date,
      type: 'Admission',
      title: 'Hospital Admission Ingested',
      desc: `Patient admitted via ${adm.admission_type} episode. Primary coverage: ${adm.insurance}.`,
      icon: Stethoscope,
      color: 'bg-blue-500'
    });

    if (adm.risk_score !== null) {
      timelineEvents.push({
        date: adm.discharge_date, // use discharge time or approximate
        type: 'RiskAssessment',
        title: '30-Day Readmission Score Calculated',
        desc: `Risk score computed at ${adm.risk_score}% probability. Tier classification: ${adm.risk_tier}.`,
        icon: AlertTriangle,
        color: adm.risk_tier === 'High' ? 'bg-red-500' : adm.risk_tier === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
      });
    }

    timelineEvents.push({
      date: adm.discharge_date,
      type: 'Discharge',
      title: 'Encounter Discharge Logged',
      desc: `Discharged to: ${adm.discharge_disposition}. Care instructions exported.`,
      icon: Calendar,
      color: 'bg-teal-500'
    });
  });

  // Sort events newest first
  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800 text-left">
      <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <ClipboardCheck className="h-4.5 w-4.5 text-blue-600" /> Patient Lifecycle Journey
      </h4>

      <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-850 space-y-8">
        {timelineEvents.map((evt, idx) => {
          const Icon = evt.icon;
          return (
            <div key={idx} className="relative">
              {/* Stepper Node Dot */}
              <div className={`absolute -left-[35px] top-0.5 w-6 h-6 rounded-full ${evt.color} text-white flex items-center justify-center shadow-md`}>
                <Icon className="h-3 w-3" />
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  {evt.date}
                </span>
                <h5 className="font-display text-xs font-bold text-slate-900 dark:text-white">
                  {evt.title}
                </h5>
                <p className="font-sans text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {evt.desc}
                </p>
              </div>
            </div>
          );
        })}

        {timelineEvents.length === 0 && (
          <div className="text-xs text-slate-400 text-center py-4">No events found in this patient record.</div>
        )}
      </div>
    </div>
  );
}
