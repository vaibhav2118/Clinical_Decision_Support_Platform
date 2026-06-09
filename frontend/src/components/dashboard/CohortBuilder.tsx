import React, { useState, useEffect } from 'react';
import { Filter, Bookmark, Trash, Save, HelpCircle } from 'lucide-react';

interface CohortBuilderProps {
  headers: any;
  addToast: (t: string, type?: 'success' | 'error') => void;
}

export default function CohortBuilder({ headers, addToast }: CohortBuilderProps) {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  
  // Active Filters
  const [gender, setGender] = useState('All');
  const [race, setRace] = useState('All');
  const [minAge, setMinAge] = useState(30);
  const [maxAge, setMaxAge] = useState(85);
  const [riskTier, setRiskTier] = useState('All');
  const [comorbidity, setComorbidity] = useState('All');

  const fetchCohorts = () => {
    fetch('http://localhost:8000/api/cohorts', { headers })
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) setCohorts(json);
      });
  };

  useEffect(() => {
    fetchCohorts();
  }, []);

  const handleSaveCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const filters = { gender, race, minAge, maxAge, riskTier, comorbidity };
      const res = await fetch('http://localhost:8000/api/cohorts', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, description: desc, filters_json: filters })
      });
      if (!res.ok) throw new Error('Save failed');
      addToast('Clinical cohort saved successfully!');
      setName('');
      setDesc('');
      fetchCohorts();
    } catch (e) {
      addToast('Failed to save cohort.', 'error');
    }
  };

  const handleDeleteCohort = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/cohorts/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Delete failed');
      addToast('Cohort deleted.');
      fetchCohorts();
    } catch (e) {
      addToast('Failed to delete cohort.', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch text-left">
      
      {/* Left: Filter Builder */}
      <form onSubmit={handleSaveCohort} className="lg:col-span-8 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/85 shadow-lg flex flex-col justify-between space-y-6">
        <div>
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <Filter className="h-5 w-5 text-blue-600" /> Filter Patient Cohorts
          </h3>
          <p className="font-sans text-xs text-slate-500 mb-6">
            Segment hospital records dynamically based on clinical and demographic indicators.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Gender</label>
              <select className="form-input text-xs" value={gender} onChange={e => setGender(e.target.value)}>
                <option value="All">All Genders</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Race Demographics</label>
              <select className="form-input text-xs" value={race} onChange={e => setRace(e.target.value)}>
                <option value="All">All Races</option>
                <option value="Caucasian">Caucasian</option>
                <option value="African American">African American</option>
                <option value="Asian">Asian</option>
                <option value="Hispanic">Hispanic</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Risk Tier Classification</label>
              <select className="form-input text-xs" value={riskTier} onChange={e => setRiskTier(e.target.value)}>
                <option value="All">All Tiers</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Comorbidity Index Score</label>
              <select className="form-input text-xs" value={comorbidity} onChange={e => setComorbidity(e.target.value)}>
                <option value="All">All Scores</option>
                <option value="0">0 Comorbidities</option>
                <option value="1">1 Active Comorbidity</option>
                <option value="2">2 Active Comorbidities</option>
                <option value="3+">3+ Comorbidities</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                <span>Age Bracket</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{minAge} to {maxAge} years</span>
              </div>
              <div className="flex gap-4 items-center">
                <input 
                  type="range" min="20" max="100" value={minAge} onChange={e => setMinAge(Math.min(Number(e.target.value), maxAge - 5))}
                  className="w-1/2 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <input 
                  type="range" min="20" max="100" value={maxAge} onChange={e => setMaxAge(Math.max(Number(e.target.value), minAge + 5))}
                  className="w-1/2 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-850 my-6" />

          {/* Name & Save details */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Cohort Segment Name</label>
              <input 
                type="text" required value={name} onChange={e => setName(e.target.value)} 
                placeholder="High Risk Diabetic Cohort" className="form-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Description</label>
              <input 
                type="text" value={desc} onChange={e => setDesc(e.target.value)} 
                placeholder="Patients with comorbidity score of 2+ showing elevated readmission probability." className="form-input text-xs"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full mt-4 py-3 rounded-xl font-sans font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 active:scale-95 transition-all text-xs"
        >
          <Save className="h-4 w-4" /> Save Clinical Segment
        </button>
      </form>

      {/* Right: Saved Cohorts List */}
      <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-md flex flex-col justify-between">
        <div className="h-full">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <Bookmark className="h-5 w-5 text-blue-600" /> Saved Segments
          </h3>
          <p className="font-sans text-xs text-slate-500 mb-6">Saved cohorts for direct directory filters.</p>

          <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
            {cohorts.map(c => (
              <div 
                key={c.id} 
                className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl relative hover:shadow-sm text-left transition-all"
              >
                <button 
                  onClick={() => handleDeleteCohort(c.id)}
                  className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
                <div className="font-display font-bold text-xs text-slate-900 dark:text-white pr-6">{c.name}</div>
                {c.description && <p className="font-sans text-[10px] text-slate-400 mt-1 leading-relaxed">{c.description}</p>}
                
                {/* Visual filter badges mapping */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  <span className="text-[9px] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                    Age: {c.filters_json.minAge}-{c.filters_json.maxAge}
                  </span>
                  <span className="text-[9px] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                    Risk: {c.filters_json.riskTier}
                  </span>
                </div>
              </div>
            ))}

            {cohorts.length === 0 && (
              <div className="text-xs text-slate-400 text-center py-6">No saved cohorts found.</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
