import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  Activity, Users, ShieldAlert, BarChart3, 
  Search, ShieldCheck, Sun, Moon, LogOut, FileText,
  UserCheck, Download, AlertTriangle, RefreshCw, Layers, Bell, HelpCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line
} from 'recharts';

// Marketing Landing Page Components
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import ROICalculator from './components/landing/ROICalculator';
import Features from './components/landing/Features';
import EHRShowcase from './components/landing/EHRShowcase';
import WorkflowVisual from './components/landing/WorkflowVisual';
import ComparisonGrid from './components/landing/ComparisonGrid';
import Pricing from './components/landing/Pricing';
import FAQ from './components/landing/FAQ';
import ContactForm from './components/landing/ContactForm';
import Footer from './components/landing/Footer';

// Onboarding Components
import OnboardingTour from './components/onboarding/OnboardingTour';
import SetupWizard from './components/onboarding/SetupWizard';

// Advanced Clinical Components
import AlertCenter from './components/dashboard/AlertCenter';
import CareChecklist from './components/dashboard/CareChecklist';
import PatientTimeline from './components/dashboard/PatientTimeline';
import CohortBuilder from './components/dashboard/CohortBuilder';
import DriftDashboard from './components/dashboard/DriftDashboard';
import ClinicalNarrative from './components/dashboard/ClinicalNarrative';

const API_BASE = 'http://localhost:8000';

interface User {
  username: string;
  role: string;
  token: string;
  tenant_id?: number;
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cdss_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState<{id: number; text: string; type: 'success' | 'error'}[]>([]);

  // Dark Mode Class Toggling
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addToast = (text: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${user?.token}`,
      'Content-Type': 'application/json'
    };
  };

  return (
    <Router>
      <div className="app-container font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors duration-350 min-h-screen flex flex-col justify-between">
        
        {/* Global Toasts */}
        <div className="toast-container fixed bottom-6 right-6 z-[2000] space-y-2">
          {toasts.map(t => (
            <div key={t.id} className={`toast flex items-center gap-3 px-4 py-3.5 rounded-xl border bg-white dark:bg-slate-950 shadow-xl border-l-4 ${
              t.type === 'success' ? 'border-l-teal-500' : 'border-l-red-500'
            } animate-slide-in text-xs font-medium`}>
              <span className="font-bold text-slate-900 dark:text-white uppercase">{t.type}:</span>
              <span>{t.text}</span>
            </div>
          ))}
        </div>

        <Routes>
          {/* Landing Page */}
          <Route path="/" element={
            <LandingPageRoute 
              user={user} 
              onLogout={() => { setUser(null); localStorage.removeItem('cdss_user'); }} 
            />
          } />

          {/* Login Route */}
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : (
              <LoginPage onLogin={(u) => { setUser(u); addToast(`Welcome, ${u.username}!`); }} />
            )
          } />

          {/* Onboarding Wizard */}
          <Route path="/onboarding" element={
            !user ? <Navigate to="/login" replace /> : (
              <OnboardingRoute headers={getAuthHeaders()} />
            )
          } />

          {/* Authenticated Dashboard */}
          <Route path="/dashboard/*" element={
            !user ? <Navigate to="/login" replace /> : (
              <DashboardLayout 
                user={user} 
                setUser={setUser} 
                headers={getAuthHeaders()} 
                addToast={addToast} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
              />
            )
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

      </div>
    </Router>
  );
}

// --- LANDING PAGE ROUTE WRAPPER ---
function LandingPageRoute({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        onLoginClick={() => navigate(user ? '/dashboard' : '/login')} 
        onDemoClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
      />
      <main className="flex-grow">
        <Hero 
          onDemoClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
          onWatchWalkthrough={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })}
        />
        
        {/* Compliance Row */}
        <section className="bg-slate-50 dark:bg-slate-900/30 border-y border-slate-200/60 dark:border-slate-800/80 py-8 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center items-center gap-8 md:gap-16 text-slate-400 dark:text-slate-600 font-display font-bold text-xs uppercase tracking-widest">
            <span>HIPAA Ready</span>
            <span>SOC 2 Compliance</span>
            <span>GDPR Ready</span>
            <span>HL7 Feeds</span>
            <span>SMART on FHIR</span>
            <span>FDA SaMD Ready</span>
          </div>
        </section>

        {/* Clinical Impact Metrics */}
        <section className="py-16 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-blue-600 dark:text-blue-500 mb-1">25%</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Readmission Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-blue-600 dark:text-blue-500 mb-1">94.2%</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Risk Detection AUC</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-blue-600 dark:text-blue-500 mb-1">88%</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Clinician Adoption Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-blue-600 dark:text-blue-500 mb-1">11x</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Investment ROI</div>
            </div>
          </div>
        </section>

        <Features />
        <WorkflowVisual />
        <EHRShowcase />
        <ROICalculator />
        <ComparisonGrid />
        
        {/* Testimonials */}
        <section className="py-20 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-display text-3xl font-bold mb-12">Trusted by Leading Medical Professionals</h2>
            <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-md">
              <p className="font-sans italic text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                "Implementing the CDSS platform at our cardiac wards reduced readmission metrics by 22% in the first quarter. The SHAP explainability waterfall gives our physicians confidence to trust the recommendations during discharge checklists."
              </p>
              <div className="font-display font-bold text-sm text-slate-900 dark:text-white">Dr. Sarah Jenkins, MD</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mt-0.5">Chief of Medicine, Mercy Healthcare Group</div>
            </div>
          </div>
        </section>

        <Pricing />
        <FAQ />
        
        <div id="demo">
          <ContactForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}

// --- ONBOARDING WIZARD ROUTE WRAPPER ---
function OnboardingRoute({ headers }: { headers: any }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 p-6">
      <SetupWizard headers={headers} onComplete={() => navigate('/dashboard')} />
    </div>
  );
}

// --- LOGIN PAGE COMPONENT ---
function LoginPage({ onLogin }: { onLogin: (u: User) => void }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('doctor');
  const [password, setPassword] = useState('doctor');
  const [role, setRole] = useState('Doctor');
  const [tenantName, setTenantName] = useState('Alpha General Hospital');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // MFA States
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        throw new Error('Incorrect username or password');
      }
      const data = await res.json();
      
      if (data.mfa_required) {
        setMfaRequired(true);
        setLoading(false);
        return;
      }

      onLogin({
        username: data.username,
        role: data.role,
        token: data.access_token,
        tenant_id: data.tenant_id
      });
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/mfa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, token: mfaToken })
      });
      if (!res.ok) throw new Error('Invalid MFA token code');
      const data = await res.json();
      onLogin({
        username: data.username,
        role: data.role,
        token: data.access_token,
        tenant_id: data.tenant_id
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'MFA validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterFallback = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          email: `${username}@cdss.hospital.org`, 
          password, 
          role,
          tenant_name: tenantName
        })
      });
      if (!res.ok) {
        throw new Error('Registration failed (tenant connection error)');
      }
      const data = await res.json();
      onLogin({
        username: data.username,
        role: data.role,
        token: data.access_token,
        tenant_id: data.tenant_id
      });
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-w-md w-full p-8 rounded-2xl shadow-2xl relative text-left">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">CDSS Portal Access</h2>
          <p className="font-sans text-xs text-slate-500 mt-1">AI-Powered Readmission Analytics & Compliance Gateway</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {!mfaRequired ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Username</label>
              <input 
                type="text" required value={username} onChange={e => setUsername(e.target.value)}
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Password</label>
              <input 
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="form-input text-xs"
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-sans shadow-lg shadow-blue-500/10 active:scale-95 transition-all text-center block"
            >
              {loading ? 'Authenticating...' : 'Secure Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfaVerify} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">
                Enter MFA Token Code
              </label>
              <p className="font-sans text-[11px] text-slate-400 leading-normal mb-2">
                A verification code challenge has been sent to your device. Enter '123456' for simulated testing bypass.
              </p>
              <input 
                type="text" required maxLength={6} value={mfaToken} onChange={e => setMfaToken(e.target.value)}
                placeholder="123456" className="form-input text-xs tracking-[0.5em] text-center"
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-sans shadow-lg shadow-blue-500/10 active:scale-95 transition-all text-center block"
            >
              Verify Token
            </button>
          </form>
        )}

        {!mfaRequired && (
          <>
            <div className="my-6 flex items-center justify-between gap-4">
              <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase whitespace-nowrap">Or Register Test Account</span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Facility Tenant Name</label>
                <input 
                  type="text" value={tenantName} onChange={e => setTenantName(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Clinical Role profile</label>
                <select className="form-input text-xs font-semibold" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="Doctor">Doctor (Assess, Export Reports)</option>
                  <option value="Nurse">Nurse (Read-Only checklist access)</option>
                  <option value="Analyst">Analyst (Fairness Parity, Drift dashboard)</option>
                  <option value="Admin">Admin (Model Registry, Logs)</option>
                </select>
              </div>

              <button 
                type="button" onClick={handleRegisterFallback} disabled={loading}
                className="w-full py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-bold font-sans transition-all text-center block"
              >
                Create Account & Join
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// --- CLINICAL DASHBOARD LAYOUT & CONTROLLER ---
interface DashboardLayoutProps {
  user: User;
  setUser: (u: User | null) => void;
  headers: any;
  addToast: (t: string, type?: 'success' | 'error') => void;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
}

function DashboardLayout({ user, setUser, headers, addToast, darkMode, setDarkMode }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  
  // Modal states
  const [showAlertDrawer, setShowAlertDrawer] = useState(false);
  const [showOnboardingTour, setShowOnboardingTour] = useState(false);

  const logout = () => {
    localStorage.removeItem('cdss_user');
    setUser(null);
    setSelectedPatientId(null);
    addToast('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="flex flex-grow w-full h-full app-container">
      {/* Onboarding guided tour overlay modal */}
      {showOnboardingTour && (
        <OnboardingTour onClose={() => setShowOnboardingTour(false)} />
      )}

      {/* Slide-out Sidebar Alert drawer */}
      {showAlertDrawer && (
        <AlertCenter 
          headers={headers} 
          onClose={() => setShowAlertDrawer(false)} 
          onSelectPatient={(id) => { setSelectedPatientId(id); setActiveTab('patients'); }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar w-64 border-r border-slate-200/60 dark:border-slate-800 bg-slate-950 text-slate-400 flex flex-col justify-between shrink-0 select-none">
        <div>
          <div className="sidebar-brand h-16 px-6 flex items-center gap-2 border-b border-slate-900 bg-slate-950 font-display font-bold text-white text-base">
            <Activity className="h-5 w-5 text-blue-500" />
            <span>CDSS PLATFORM</span>
          </div>

          <ul className="p-3 space-y-1 list-none text-left">
            <li>
              <button 
                onClick={() => { setActiveTab('dashboard'); setSelectedPatientId(null); }}
                className={`sidebar-link w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'dashboard' ? 'active bg-slate-900 text-white border-l-4 border-l-blue-600' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <BarChart3 className="h-4.5 w-4.5" />
                <span>Clinical Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('patients'); setSelectedPatientId(null); }}
                className={`sidebar-link w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'patients' ? 'active bg-slate-900 text-white border-l-4 border-l-blue-600' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Users className="h-4.5 w-4.5" />
                <span>Patient Directory</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('cohorts'); setSelectedPatientId(null); }}
                className={`sidebar-link w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'cohorts' ? 'active bg-slate-900 text-white border-l-4 border-l-blue-600' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Search className="h-4.5 w-4.5" />
                <span>Cohort Builder</span>
              </button>
            </li>
            {(user.role === 'Admin' || user.role === 'Analyst') && (
              <li>
                <button 
                  onClick={() => { setActiveTab('fairness'); setSelectedPatientId(null); }}
                  className={`sidebar-link w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'fairness' ? 'active bg-slate-900 text-white border-l-4 border-l-blue-600' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <ShieldAlert className="h-4.5 w-4.5" />
                  <span>Fairness Audit</span>
                </button>
              </li>
            )}
            <li>
              <button 
                onClick={() => { setActiveTab('models'); setSelectedPatientId(null); }}
                className={`sidebar-link w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'models' ? 'active bg-slate-900 text-white border-l-4 border-l-blue-600' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Layers className="h-4.5 w-4.5" />
                <span>Quality & Drift</span>
              </button>
            </li>
            {user.role === 'Admin' && (
              <li>
                <button 
                  onClick={() => { setActiveTab('audit'); setSelectedPatientId(null); }}
                  className={`sidebar-link w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'audit' ? 'active bg-slate-900 text-white border-l-4 border-l-blue-600' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <ShieldCheck className="h-4.5 w-4.5" />
                  <span>Security Audit Logs</span>
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Profile Card Footer */}
        <div className="p-4 border-t border-slate-900 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center uppercase">
              {user.username[0]}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white leading-tight">{user.username}</div>
              <div className="text-[10px] text-slate-500 font-semibold">{user.role} Profile</div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="h-3.5 w-3.5" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-grow flex flex-col min-w-0">
        <header className="h-16 px-8 border-b border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-45 flex items-center justify-between select-none">
          <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
            {selectedPatientId ? 'Patient Encounter Analysis' : (
              <>
                {activeTab === 'dashboard' && 'Clinical Analytics Dashboard'}
                {activeTab === 'patients' && 'Patient Directory Management'}
                {activeTab === 'cohorts' && 'Saved Cohorts builder'}
                {activeTab === 'fairness' && 'Demographic Parity Bias Audit'}
                {activeTab === 'models' && 'Model Registry Governance'}
                {activeTab === 'audit' && 'Tamper-Proof Operations Log'}
              </>
            )}
          </h2>

          <div className="flex items-center gap-4">
            
            {/* Onboarding Tour Help Button */}
            <button 
              onClick={() => setShowOnboardingTour(true)}
              className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-slate-500 dark:text-slate-400 flex items-center gap-1.5 transition-all"
            >
              <HelpCircle className="h-4.5 w-4.5" />
              <span className="text-[10px] font-bold font-sans">Launch Tour</span>
            </button>

            {/* Quick switcher simulation dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <UserCheck className="h-4 w-4 text-slate-500" />
              <select 
                value={user.role} 
                onChange={(e) => {
                  const updated = { ...user, role: e.target.value };
                  setUser(updated);
                  localStorage.setItem('cdss_user', JSON.stringify(updated));
                  addToast(`Switched credentials to: ${e.target.value}`);
                }}
                className="bg-transparent outline-none border-none text-[10px] font-bold text-slate-700 dark:text-slate-300 font-sans cursor-pointer select-none"
              >
                <option value="Admin">Admin</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Analyst">Analyst</option>
              </select>
            </div>

            {/* Alerts Center Bell */}
            <button 
              onClick={() => setShowAlertDrawer(true)}
              className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-slate-500 dark:text-slate-400 transition-all relative"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>

            {/* Dark Mode button */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-slate-500 dark:text-slate-400 transition-all"
            >
              {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>
        </header>

        <main className="p-8 flex-grow max-w-7xl w-full mx-auto overflow-y-auto">
          {selectedPatientId ? (
            <PatientDetailsPage 
              patientId={selectedPatientId}
              onBack={() => setSelectedPatientId(null)}
              userRole={user.role}
              headers={headers}
              addToast={addToast}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardTab headers={headers} onSelectPatient={setSelectedPatientId} />}
              {activeTab === 'patients' && <PatientsTab headers={headers} onSelectPatient={setSelectedPatientId} />}
              {activeTab === 'cohorts' && <CohortBuilder headers={headers} addToast={addToast} />}
              {activeTab === 'fairness' && <FairnessTab headers={headers} />}
              {activeTab === 'models' && <ModelsTab headers={headers} userRole={user.role} addToast={addToast} />}
              {activeTab === 'audit' && <AuditTab headers={headers} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// --- CLINICAL DASHBOARD TAB ---
function DashboardTab({ headers, onSelectPatient }: { headers: any; onSelectPatient: (id: number) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/dashboard`, { headers })
      .then(res => res.json())
      .then(json => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoaderSkeleton />;
  if (!data) return <div>Failed to load dashboard data. Ensure backend is running.</div>;

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Stat Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-display font-bold text-slate-900 dark:text-white leading-tight">{data.high_risk_count}</div>
            <div className="text-xs text-slate-500">High-Risk Patients</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-display font-bold text-slate-900 dark:text-white leading-tight">{data.average_risk_score}%</div>
            <div className="text-xs text-slate-500">Avg Readmit Prob</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-display font-bold text-slate-900 dark:text-white leading-tight">{data.total_patients}</div>
            <div className="text-xs text-slate-500">Total Patients</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-display font-bold text-slate-900 dark:text-white leading-tight">{data.total_admissions}</div>
            <div className="text-xs text-slate-500">Total Admissions</div>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/85 shadow-lg">
          <div className="font-display font-bold text-sm text-slate-900 dark:text-white mb-4">Hospital Readmission Probability Trend (6 Months)</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.readmission_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3182ce" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3182ce" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="#718096" style={{ fontSize: '10px' }} />
                <YAxis unit="%" stroke="#718096" style={{ fontSize: '10px' }} />
                <Tooltip />
                <Area type="monotone" dataKey="avg_risk" stroke="#3182ce" fillOpacity={1} fill="url(#colorRisk)" name="Avg Risk" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/85 shadow-lg">
          <div className="font-display font-bold text-sm text-slate-900 dark:text-white mb-4">Department Readmission Index</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.department_analytics} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" unit="%" stroke="#718096" style={{ fontSize: '10px' }} />
                <YAxis dataKey="department" type="category" stroke="#718096" width={75} style={{ fontSize: '9px' }} />
                <Tooltip />
                <Bar dataKey="avg_risk" fill="#319795" radius={[0, 4, 4, 0]}>
                  {data.department_analytics.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.avg_risk > 20 ? '#e53e3e' : '#319795'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Demographics & High-Risk list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-4 bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/85 shadow-lg">
          <div className="font-display font-bold text-sm text-slate-900 dark:text-white mb-4">Race Demographics Distribution</div>
          <div className="h-60 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.demographics.race}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.demographics.race.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#3182ce', '#319795', '#ed8936', '#9f7aea', '#a0aec0'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/85 shadow-lg">
          <div className="font-display font-bold text-sm text-slate-900 dark:text-white mb-4">Attending Patients Flagged High-Risk</div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient MRN</th>
                  <th>Gender</th>
                  <th>Race</th>
                  <th>Readmit Probability</th>
                  <th>Classification</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_high_risk.map((pt: any) => (
                  <tr key={pt.patient_id}>
                    <td className="font-semibold">{pt.patient_mrn}</td>
                    <td>{pt.gender}</td>
                    <td>{pt.race}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-1.5 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: `${pt.probability}%` }} />
                        </div>
                        <span className="font-bold text-red-500">{pt.probability}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-high text-[10px]">High</span>
                    </td>
                    <td>
                      <button onClick={() => onSelectPatient(pt.patient_id)} className="btn btn-secondary py-1 px-3 text-[10px]">
                        Open Case
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- PATIENTS DIRECTORY TAB ---
function PatientsTab({ headers, onSelectPatient }: { headers: any; onSelectPatient: (id: number) => void }) {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [race, setRace] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPatients = () => {
    setLoading(true);
    let url = `${API_BASE}/api/patients?page=${page}&limit=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (gender) url += `&gender=${encodeURIComponent(gender)}`;
    if (race) url += `&race=${encodeURIComponent(race)}`;

    fetch(url, { headers })
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json.patients)) {
          setPatients(json.patients);
          setTotal(json.total);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPatients();
  }, [page, gender, race]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPatients();
  };

  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/85 shadow-lg text-left">
      <div className="font-display font-bold text-sm text-slate-900 dark:text-white mb-4">Patient Records Directory</div>

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4 mb-6">
        <div className="flex-grow min-w-[200px]">
          <input 
            type="text" 
            placeholder="Search Patient MRN..." 
            className="form-input text-xs" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>

        <select className="form-input text-xs w-[140px]" value={gender} onChange={e => { setGender(e.target.value); setPage(1); }}>
          <option value="">All Genders</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
        </select>

        <select className="form-input text-xs w-[160px]" value={race} onChange={e => { setRace(e.target.value); setPage(1); }}>
          <option value="">All Races</option>
          <option value="Caucasian">Caucasian</option>
          <option value="African American">African American</option>
          <option value="Asian">Asian</option>
          <option value="Hispanic">Hispanic</option>
          <option value="Other">Other</option>
        </select>

        <button type="submit" className="btn btn-primary py-2 px-4 text-xs">
          <Search className="h-4 w-4" /> Filter Directory
        </button>
      </form>

      {loading ? (
        <LoaderSkeleton />
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient MRN</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Race</th>
                  <th>Latest Admission Date</th>
                  <th>Risk Score</th>
                  <th>Risk Classification</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td className="font-semibold">{p.patient_mrn}</td>
                    <td>{p.age}</td>
                    <td>{p.gender}</td>
                    <td>{p.race}</td>
                    <td>{p.latest_admission_date}</td>
                    <td>
                      {p.latest_risk_score !== null ? (
                        <span className="font-bold text-xs" style={{ 
                          color: p.latest_risk_score > 60 ? 'var(--danger)' : p.latest_risk_score > 25 ? 'var(--warning)' : 'var(--success)' 
                        }}>
                          {p.latest_risk_score}%
                        </span>
                      ) : (
                        <span className="text-slate-400">Unassessed</span>
                      )}
                    </td>
                    <td>
                      {p.latest_risk_tier === 'High' && <span className="badge badge-high text-[10px]">High</span>}
                      {p.latest_risk_tier === 'Medium' && <span className="badge badge-medium text-[10px]">Medium</span>}
                      {p.latest_risk_tier === 'Low' && <span className="badge badge-low text-[10px]">Low</span>}
                      {(p.latest_risk_tier === 'Unassessed' || !p.latest_risk_tier) && <span className="badge bg-slate-100 text-slate-400 border border-slate-200 text-[10px]">None</span>}
                    </td>
                    <td>
                      <button onClick={() => onSelectPatient(p.id)} className="btn btn-secondary py-1 px-3 text-[10px]">
                        Open Case
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 text-xs text-slate-400">
            <span>Showing {patients.length} of {total} records</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}
                className="btn btn-secondary py-1 px-3 disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => p + 1)} disabled={page * 10 >= total}
                className="btn btn-secondary py-1 px-3 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- PATIENT ENCOUNTER DETAILS PAGE ---
interface PatientDetailsProps {
  patientId: number;
  onBack: () => void;
  userRole: string;
  headers: any;
  addToast: (t: string, type?: 'success' | 'error') => void;
}

function PatientDetailsPage({ patientId, onBack, userRole, headers, addToast }: PatientDetailsProps) {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<number | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  const loadDetails = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/patient/${patientId}`, { headers })
      .then(res => res.json())
      .then(json => {
        setPatient(json);
        if (json.admissions.length > 0) {
          setSelectedAdmissionId(json.admissions[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadDetails();
  }, [patientId]);

  const handleAssessRisk = async () => {
    if (!selectedAdmissionId) return;
    setAssessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/risk-assessment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ patient_id: patientId, admission_id: selectedAdmissionId })
      });
      if (!res.ok) throw new Error('Inference failure');
      const data = await res.json();
      setAssessmentResult(data);
      addToast('Readmission risk assessment computed successfully!');
      loadDetails();
    } catch (e: any) {
      addToast(e.message || 'Error running assessment', 'error');
    } finally {
      setAssessing(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!assessmentResult && !getSelectedAdmissionAssessment()) return;
    setGeneratingReport(true);
    try {
      let assessmentId = assessmentResult?.assessment_id;
      if (!assessmentId) {
        const selectedAdm = patient.admissions.find((a: any) => a.id === selectedAdmissionId);
        if (!selectedAdm || selectedAdm.risk_score === null) {
          throw new Error('Must run risk assessment before generating report');
        }
        const resAssess = await fetch(`${API_BASE}/api/risk-assessment`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ patient_id: patientId, admission_id: selectedAdmissionId })
        });
        const assessData = await resAssess.json();
        assessmentId = assessData.assessment_id;
      }

      const res = await fetch(`${API_BASE}/api/reports/generate/${assessmentId}`, {
        method: 'POST',
        headers
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const reportInfo = await res.json();
      
      window.open(`${API_BASE}/api/reports/download/${reportInfo.report_id}?token=${headers.Authorization.split(' ')[1]}`, '_blank');
      addToast('Clinical report PDF generated and download started!');
    } catch (e: any) {
      addToast(e.message || 'Error generating PDF report', 'error');
    } finally {
      setGeneratingReport(false);
    }
  };

  const getSelectedAdmissionAssessment = () => {
    if (!patient) return null;
    const adm = patient.admissions.find((a: any) => a.id === selectedAdmissionId);
    if (!adm || adm.risk_score === null) return null;
    return adm;
  };

  if (loading) return <LoaderSkeleton />;
  if (!patient) return <div>Failed to load patient record.</div>;

  const currentAdmission = patient.admissions.find((a: any) => a.id === selectedAdmissionId);
  const activeAssessment = assessmentResult || getSelectedAdmissionAssessment();

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <button onClick={onBack} className="btn btn-secondary py-2 px-4 text-xs font-semibold">
          ← Back to Patient Directory
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Demographic Specs */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/85 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">Patient File Specifications</h3>
            
            <div className="space-y-3 font-sans text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">MRN ID:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{patient.patient_mrn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gender:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{patient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Race Demographics:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{patient.race}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date of Birth:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{patient.dob}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Age:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{patient.age} years</span>
              </div>
            </div>

            <div className="my-5">
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Select Encounter Episode</label>
              <select 
                className="form-input text-xs font-semibold" 
                value={selectedAdmissionId || ''} 
                onChange={e => { setSelectedAdmissionId(Number(e.target.value)); setAssessmentResult(null); }}
              >
                {patient.admissions.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    Admitted {a.admission_date} ({a.admission_type})
                  </option>
                ))}
              </select>
            </div>

            {currentAdmission && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="font-bold text-slate-900 dark:text-white">Admission Specs</div>
                <div><b>Discharge:</b> {currentAdmission.discharge_date}</div>
                <div><b>Disposition:</b> {currentAdmission.discharge_disposition}</div>
                <div><b>Insurance:</b> {currentAdmission.insurance}</div>
                
                <div>
                  <div className="font-bold text-slate-900 dark:text-white mb-1">Diagnoses ICD-9</div>
                  <div className="flex flex-wrap gap-1">
                    {currentAdmission.diagnoses.map((d: any) => (
                      <span key={d.code} className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-2 py-0.5 rounded text-[10px]">
                        {d.code} - {d.category}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 dark:text-white mb-1">Procedures</div>
                  <div className="flex flex-wrap gap-1">
                    {currentAdmission.procedures.map((p: any) => (
                      <span key={p.code} className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-2 py-0.5 rounded text-[10px]">
                        {p.code}
                      </span>
                    ))}
                    {currentAdmission.procedures.length === 0 && <span className="italic text-slate-400">None logged</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Risk predictions and modular checklists/timelines */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/85 shadow-lg space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">Readmission Risk & Explainable AI</h3>
              
              <div className="flex gap-2">
                {userRole !== 'Nurse' && (
                  <button 
                    onClick={handleAssessRisk} disabled={assessing || !selectedAdmissionId}
                    className="btn btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95"
                  >
                    <RefreshCw className={`h-4 w-4 ${assessing ? 'animate-spin' : ''}`} />
                    <span>{assessing ? 'Calculating...' : 'Run Risk Engine'}</span>
                  </button>
                )}
                {activeAssessment && (
                  <button 
                    onClick={handleGenerateReport} disabled={generatingReport}
                    className="btn btn-secondary py-2 px-4 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download className="h-4 w-4" />
                    <span>{generatingReport ? 'Generating...' : 'Discharge PDF'}</span>
                  </button>
                )}
              </div>
            </div>

            {!activeAssessment ? (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl py-12 px-6 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <AlertTriangle className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">Prediction Pending</h4>
                <p className="font-sans text-xs max-w-sm leading-normal">
                  Calculate readmission risk using active model versions in the registry.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Score & Gauge panel */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center gap-6">
                  {/* Gauge */}
                  <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-24 h-24 -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="var(--border)" strokeWidth="6" fill="transparent" />
                      <circle 
                        cx="48" cy="48" r="40" 
                        stroke={activeAssessment.risk_tier === 'High' ? 'var(--danger)' : activeAssessment.risk_tier === 'Medium' ? 'var(--warning)' : 'var(--success)'} 
                        strokeWidth="6" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - (activeAssessment.probability || activeAssessment.risk_score) / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute font-display font-bold text-base text-slate-900 dark:text-white">
                      {activeAssessment.probability || activeAssessment.risk_score}%
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-slate-500 font-medium">30-Day Readmission Risk:</span>
                      {activeAssessment.risk_tier === 'High' && <span className="badge badge-high text-[9px]">High Risk</span>}
                      {activeAssessment.risk_tier === 'Medium' && <span className="badge badge-medium text-[9px]">Medium Risk</span>}
                      {activeAssessment.risk_tier === 'Low' && <span className="badge badge-low text-[9px]">Low Risk</span>}
                    </div>
                    <p className="font-sans text-[10px] text-slate-400">
                      Model Version: {activeAssessment.model_version || 'Active Model'}
                    </p>
                  </div>
                </div>

                {/* SHAP Waterfall Chart */}
                <div>
                  <h4 className="font-display text-xs font-bold text-slate-900 dark:text-white mb-3">SHAP Local Explainability drivers</h4>
                  <div className="space-y-2.5">
                    {activeAssessment.shap_waterfall?.map((item: any) => {
                      const isPositive = item.shap_value > 0;
                      const percentWidth = Math.min(Math.abs(item.shap_value) * 200, 100);
                      return (
                        <div key={item.feature} className="flex items-center gap-3 text-xs">
                          <div className="w-32 font-semibold text-slate-700 dark:text-slate-300 truncate">{item.display_name}</div>
                          <div className="w-10 text-slate-400">{item.value}</div>
                          
                          <div className="flex-grow h-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 rounded relative overflow-hidden">
                            <div 
                              className={`h-full absolute left-1/2 ${isPositive ? 'bg-red-500/40' : 'bg-teal-500/40'}`}
                              style={{ 
                                width: `${percentWidth}%`,
                                transform: isPositive ? 'none' : 'translateX(-100%)'
                              }}
                            />
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
                          </div>

                          <div className={`w-14 text-right font-bold ${isPositive ? 'text-red-500' : 'text-teal-500'}`}>
                            {isPositive ? '+' : ''}{(item.shap_value * 100).toFixed(1)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Interactive Checklist & Timelines & Clinical Narratives */}
          {selectedAdmissionId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CareChecklist admissionId={selectedAdmissionId} headers={headers} addToast={addToast} />
              <ClinicalNarrative patientId={patientId} headers={headers} addToast={addToast} />
            </div>
          )}

          {selectedAdmissionId && (
            <PatientTimeline admissions={patient.admissions} riskHistory={patient.risk_history} />
          )}

        </div>
      </div>
    </div>
  );
}

// --- FAIRNESS TAB COMPONENT ---
function FairnessTab({ headers }: { headers: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);

  const loadFairness = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/fairness-report`, { headers })
      .then(res => res.json())
      .then(json => {
        setData(json.audits);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadFairness();
  }, []);

  const handleTriggerAudit = async () => {
    setAuditing(true);
    try {
      const res = await fetch(`${API_BASE}/api/fairness-audit`, { method: 'POST', headers });
      if (!res.ok) throw new Error('Audit rerun failed');
      loadFairness();
    } catch (e) {
      alert('Error running audit');
    } finally {
      setAuditing(false);
    }
  };

  if (loading) return <LoaderSkeleton />;
  if (!data) return <div>Failed to load fairness data. Ensure model has been trained.</div>;

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
        <p className="text-xs text-slate-500 max-w-lg leading-normal">
          Fairlearn monitoring tracks parity differences to prevent biased clinical decisions across demographics.
        </p>
        <button onClick={handleTriggerAudit} disabled={auditing} className="btn btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-blue-500/10">
          <RefreshCw className={`h-4 w-4 ${auditing ? 'animate-spin' : ''}`} />
          <span>{auditing ? 'Re-auditing...' : 'Run Group Fairness Audit'}</span>
        </button>
      </div>

      {Object.entries(data).map(([attrName, value]: any) => {
        const chartData = value.metrics
          .filter((m: any) => m.metric === 'Selection Rate')
          .map((m: any) => {
            const fpr = value.metrics.find((x: any) => x.group === m.group && x.metric === 'FPR')?.value || 0;
            const fnr = value.metrics.find((x: any) => x.group === m.group && x.metric === 'FNR')?.value || 0;
            return {
              group: m.group,
              'Selection Rate': m.value * 100,
              'False Positive Rate': fpr * 100,
              'False Negative Rate': fnr * 100
            };
          });

        return (
          <div key={attrName} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/85 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-4 space-y-4">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white leading-tight">{attrName} Audit Overview</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">DEMOGRAPHIC PARITY DIFF</div>
                  <div className="text-xl font-display font-bold text-slate-900 dark:text-white">{(value.demographic_parity_difference * 100).toFixed(2)}%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Max difference in selection rate</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">EQUALIZED ODDS DIFF</div>
                  <div className="text-xl font-display font-bold text-slate-900 dark:text-white">{(value.equalized_odds_difference * 100).toFixed(2)}%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Max difference in error rates</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="group" stroke="#718096" style={{ fontSize: '10px' }} />
                  <YAxis unit="%" stroke="#718096" style={{ fontSize: '10px' }} />
                  <Tooltip />
                  <Legend style={{ fontSize: '10px' }} />
                  <Bar dataKey="Selection Rate" fill="#3182ce" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="False Positive Rate" fill="#e53e3e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="False Negative Rate" fill="#ed8936" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- MODELS QUALITY TAB COMPONENT ---
function ModelsTab({ headers, userRole, addToast }: { headers: any; userRole: string; addToast: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);

  const loadModels = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/monitoring/model`, { headers })
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleRetrain = async () => {
    setTraining(true);
    try {
      const res = await fetch(`${API_BASE}/api/monitoring/train`, { method: 'POST', headers });
      if (!res.ok) throw new Error('Training pipeline failed');
      const info = await res.json();
      addToast(`Retraining Complete! Best model: ${info.best_model}`);
      loadModels();
    } catch (e: any) {
      addToast(e.message || 'Error training models', 'error');
    } finally {
      setTraining(false);
    }
  };

  const handleActivateModel = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/monitoring/activate/${id}`, { method: 'POST', headers });
      if (!res.ok) throw new Error('Activation failed');
      addToast('Active model version updated!');
      loadModels();
    } catch (e: any) {
      addToast(e.message || 'Activation failed', 'error');
    }
  };

  if (loading) return <LoaderSkeleton />;
  if (!data) return <div>Failed to load model registry. Ensure backend is running.</div>;

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
        <p className="text-xs text-slate-500 max-w-lg leading-normal">
          Manage trained classifiers, active deployments, and data drift logs.
        </p>
        {userRole === 'Admin' && (
          <button onClick={handleRetrain} disabled={training} className="btn btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-blue-500/10">
            <RefreshCw className={`h-4 w-4 ${training ? 'animate-spin' : ''}`} />
            <span>{training ? 'Training models...' : 'Run ML Training Pipeline'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Model versions table */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/85 shadow-lg">
          <div className="font-display font-bold text-sm text-slate-900 dark:text-white mb-4">Model Registry</div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Classifier Name</th>
                  <th>AUROC</th>
                  <th>Recall</th>
                  <th>F1 Score</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.models.map((m: any) => (
                  <tr key={m.id}>
                    <td className="font-semibold text-xs">{m.version}</td>
                    <td>{m.name}</td>
                    <td>{m.metrics ? `${(m.metrics.auroc * 100).toFixed(1)}%` : 'N/A'}</td>
                    <td>{m.metrics ? `${(m.metrics.recall * 100).toFixed(1)}%` : 'N/A'}</td>
                    <td>{m.metrics ? `${(m.metrics.f1_score * 100).toFixed(1)}%` : 'N/A'}</td>
                    <td>
                      {m.is_active ? (
                        <span className="badge badge-low text-[10px] capitalize">Active</span>
                      ) : (
                        <span className="badge bg-slate-100 text-slate-400 border border-slate-200 text-[10px]">Inactive</span>
                      )}
                    </td>
                    <td>
                      {!m.is_active && userRole === 'Admin' ? (
                        <button onClick={() => handleActivateModel(m.id)} className="btn btn-secondary py-1 px-2.5 text-[10px]">
                          Activate
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drift logs */}
        <div className="lg:col-span-4">
          <DriftDashboard />
        </div>
      </div>

      {/* Feature Importance & Calibration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/85 shadow-lg">
          <div className="font-display font-bold text-sm text-slate-900 dark:text-white mb-4">Global Feature Importance (Active Model)</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.feature_importances} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="feature" stroke="#718096" style={{ fontSize: '9px' }} />
                <YAxis stroke="#718096" style={{ fontSize: '10px' }} />
                <Tooltip />
                <Bar dataKey="importance" fill="#2b6cb0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/85 shadow-lg">
          <div className="font-display font-bold text-sm text-slate-900 dark:text-white mb-4">Calibration Performance Curve</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.calibration_curve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="bin" stroke="#718096" style={{ fontSize: '10px' }} />
                <YAxis unit="%" stroke="#718096" style={{ fontSize: '10px' }} />
                <Tooltip />
                <Legend style={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="observed" stroke="#319795" name="Observed %" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="predicted" stroke="#e53e3e" name="Predicted %" strokeDasharray="5 5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- AUDIT TRAIL TAB ---
function AuditTab({ headers }: { headers: any }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/audit-logs`, { headers })
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) setLogs(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoaderSkeleton />;

  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/85 shadow-lg text-left">
      <div className="font-display font-bold text-sm text-slate-900 dark:text-white mb-4">Security & Operations Audit Trail (Admin-Only)</div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>IP Address</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td className="text-xs text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                <td className="font-semibold">{log.username}</td>
                <td>
                  <span className="badge bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/60 text-[9px] uppercase tracking-wider">
                    {log.action}
                  </span>
                </td>
                <td className="text-xs text-slate-400">{log.ip_address}</td>
                <td className="text-xs leading-relaxed">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- UTILITY SKELETON COMPONENT ---
function LoaderSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full text-left">
      <div className="skeleton h-8 w-[240px]"></div>
      <div className="skeleton h-48 w-full"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="skeleton h-32"></div>
        <div className="skeleton h-32"></div>
      </div>
    </div>
  );
}
