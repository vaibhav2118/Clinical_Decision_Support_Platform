import React, { useState, useEffect } from 'react';
import { ShieldAlert, Bell, Eye, Check, X } from 'lucide-react';

interface AlertCenterProps {
  headers: any;
  onClose: () => void;
  onSelectPatient: (id: number) => void;
}

export default function AlertCenter({ headers, onClose, onSelectPatient }: AlertCenterProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = () => {
    fetch('http://localhost:8000/api/alerts', { headers })
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) {
          setAlerts(json);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
    // Poll alerts every 10 seconds for real-time simulation
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/alerts/read/${id}`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-slide-in text-left">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-5 w-5 text-blue-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="font-display font-bold text-sm text-slate-900 dark:text-white">Alert Notifications</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-xs text-slate-400 text-center py-6">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-6">No active notifications.</div>
          ) : (
            alerts.map(a => (
              <div 
                key={a.id} 
                className={`p-3 rounded-xl border transition-all text-xs relative ${
                  a.is_read 
                    ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-60' 
                    : a.severity === 'High'
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                      : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className={`font-semibold uppercase text-[9px] tracking-wider px-1.5 py-0.5 rounded-full ${
                    a.severity === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                  }`}>
                    {a.severity}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold">{a.created_at.split(' ')[1]}</span>
                </div>
                
                <p className="font-sans text-slate-700 dark:text-slate-300 leading-relaxed pr-6">{a.message}</p>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={() => { onSelectPatient(a.patient_id); onClose(); }}
                    className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    Open Case
                  </button>
                  {!a.is_read && (
                    <button 
                      onClick={() => markAsRead(a.id)}
                      className="p-1 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
