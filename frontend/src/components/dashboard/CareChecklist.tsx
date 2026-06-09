import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckSquare, Square, RefreshCw } from 'lucide-react';

interface CareChecklistProps {
  admissionId: number;
  headers: any;
  addToast: (t: string) => void;
}

export default function CareChecklist({ admissionId, headers, addToast }: CareChecklistProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChecklist = () => {
    setLoading(true);
    fetch(`http://localhost:8000/api/checklist/${admissionId}`, { headers })
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) {
          setItems(json);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchChecklist();
  }, [admissionId]);

  const toggleItem = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/checklist/toggle/${id}`, {
        method: 'POST',
        headers
      });
      if (!res.ok) throw new Error('Toggle failed');
      const data = await res.json();
      
      setItems(prev => prev.map(i => i.id === id ? { 
        ...i, 
        is_completed: data.is_completed, 
        completed_at: data.completed_at 
      } : i));
      
      addToast(data.is_completed ? 'Checklist item completed!' : 'Checklist item unchecked.');
    } catch (e) {
      addToast('Failed to toggle checklist item.');
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 text-left">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200/60 dark:border-slate-800 pb-2">
        <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ClipboardList className="h-4.5 w-4.5 text-blue-600" /> Care Transitional Checklist
        </h4>
        <button onClick={fetchChecklist} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-slate-400 text-center py-4">Loading care plan...</div>
      ) : items.length === 0 ? (
        <div className="text-xs text-slate-400 text-center py-4">No checklist items generated yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div 
              key={item.id} 
              onClick={() => toggleItem(item.id)}
              className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 cursor-pointer hover:border-blue-500/40 select-none transition-all"
            >
              <button className="text-blue-600 mt-0.5 shrink-0">
                {item.is_completed ? (
                  <CheckSquare className="h-5 w-5 text-teal-500" />
                ) : (
                  <Square className="h-5 w-5 text-slate-300 dark:text-slate-700" />
                )}
              </button>
              
              <div className="flex-grow">
                <p className={`font-sans text-xs text-slate-700 dark:text-slate-300 leading-relaxed ${
                  item.is_completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                }`}>
                  {item.task_description}
                </p>
                {item.is_completed && item.completed_at && (
                  <span className="text-[9px] text-teal-600 dark:text-teal-400 font-semibold block mt-1">
                    Completed at {item.completed_at.split(' ')[0]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
