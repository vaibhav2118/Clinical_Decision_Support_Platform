import React, { useState } from 'react';
import { Share2, FileCode, CheckCircle, RefreshCw, Layers } from 'lucide-react';

interface SetupWizardProps {
  headers: any;
  onComplete: () => void;
}

export default function SetupWizard({ headers, onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: SMART on FHIR Sync
  const [fhirMrn, setFhirMrn] = useState('FHIR-2003');
  const [fhirGender, setFhirGender] = useState('Female');
  const [fhirRace, setFhirRace] = useState('African American');
  const [fhirDob, setFhirDob] = useState('1956-08-14');

  // Step 2: HL7 ADT message
  const [hl7Message, setHl7Message] = useState(
    `MSH|^~\\&|EPIC|MERCY|CDSS|SYSTEM|20260609||ADT^A01|MSG001|P|2.3\nPID|||HL7-889900||SMITH^JANE||19611123|F||African American\nPV1||E|CARDIOLOGY|||||||Private`
  );

  const handleFhirSync = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await fetch('http://localhost:8000/api/integration/fhir/patient-sync', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          patient_mrn: fhirMrn,
          gender: fhirGender,
          race: fhirRace,
          date_of_birth: fhirDob
        })
      });
      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();
      setSuccessMsg(`FHIR Sync complete! Synced patient ${data.patient_mrn} with admission ID ${data.admission_id}`);
    } catch (e) {
      setSuccessMsg('Error syncing FHIR resource. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleHl7Trigger = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await fetch('http://localhost:8000/api/integration/hl7/admission-trigger', {
        method: 'POST',
        headers,
        body: JSON.stringify({ hl7_message: hl7Message })
      });
      if (!res.ok) throw new Error('HL7 processing failed');
      const data = await res.json();
      setSuccessMsg(`HL7 Message processed! Generated risk assessment: ${data.simulated_risk * 100}% for patient MRN ${data.patient_mrn}`);
    } catch (e) {
      setSuccessMsg('Error processing HL7 message. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-lg text-left">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-850">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Healthcare Connection Setup</h2>
          <p className="font-sans text-xs text-slate-500">Configure simulated EHR data syncing environments.</p>
        </div>
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full">
          Step {step} of 3
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50 dark:bg-teal-950/20 text-teal-800 dark:text-teal-400 text-xs font-medium flex items-start gap-2">
          <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Step Contents */}
      {step === 1 && (
        <div>
          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <Share2 className="h-4 w-4 text-blue-600" /> 1. SMART on FHIR Resource Sync
          </h3>
          <p className="font-sans text-xs text-slate-500 leading-relaxed mb-6">
            Verify the FHIR sync mapping endpoints. CDSS automatically pulls resource details (Demographics, Conditions, Procedures) on login.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Patient MRN</label>
              <input type="text" className="form-input text-xs" value={fhirMrn} onChange={e => setFhirMrn(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Gender</label>
              <select className="form-input text-xs" value={fhirGender} onChange={e => setFhirGender(e.target.value)}>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Demographic Race</label>
              <input type="text" className="form-input text-xs" value={fhirRace} onChange={e => setFhirRace(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Date of Birth</label>
              <input type="date" className="form-input text-xs" value={fhirDob} onChange={e => setFhirDob(e.target.value)} />
            </div>
          </div>

          <button 
            onClick={handleFhirSync} disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold font-sans flex items-center gap-2 transition-all shadow-md shadow-blue-500/10 active:scale-95"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync FHIR Resource
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <FileCode className="h-4 w-4 text-blue-600" /> 2. Inbound HL7 ADT message simulator
          </h3>
          <p className="font-sans text-xs text-slate-500 leading-relaxed mb-6">
            Test TCP inbound channels. Sending this message triggers an automated admission record creation and immediate risk scoring.
          </p>

          <div className="mb-6">
            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">HL7 ADT Message payload</label>
            <textarea 
              rows={5} className="form-input text-xs font-mono resize-none leading-relaxed" 
              value={hl7Message} onChange={e => setHl7Message(e.target.value)} 
            />
          </div>

          <button 
            onClick={handleHl7Trigger} disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold font-sans flex items-center gap-2 transition-all shadow-md shadow-blue-500/10 active:scale-95"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Ingest & Invalidate
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4 text-blue-600" /> 3. Classifier Pipeline Registry
          </h3>
          <p className="font-sans text-xs text-slate-500 leading-relaxed mb-6">
            Ensure active pipeline models are configured. You can re-trigger dynamic calibration comparisons inside the Model Quality dashboard.
          </p>

          <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 mb-6 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <b>Current Configuration status:</b><br />
            • Ingestion pipeline: imputed values stratified by median indicator weights.<br />
            • Model metrics tracked dynamically inside **MLflow** Local Experiment Registry.
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-6 mt-8">
        <button 
          onClick={() => setStep(s => Math.max(s - 1, 1))}
          disabled={step === 1}
          className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-xs font-bold font-sans transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          Previous
        </button>

        {step < 3 ? (
          <button 
            onClick={() => { setStep(s => s + 1); setSuccessMsg(''); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold font-sans transition-all shadow-md shadow-blue-500/10"
          >
            Next Step
          </button>
        ) : (
          <button 
            onClick={onComplete}
            className="px-5 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-lg text-xs font-bold font-sans transition-all shadow-md shadow-teal-500/15"
          >
            Complete Onboarding Wizard
          </button>
        )}
      </div>
    </div>
  );
}
