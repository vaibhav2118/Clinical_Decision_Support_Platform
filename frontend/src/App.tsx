import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, ShieldAlert, BarChart3, 
  Search, ShieldCheck, Sun, Moon, LogOut, FileText,
  UserCheck, Download, AlertTriangle, RefreshCw, Layers
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line
} from 'recharts';

const API_BASE = 'http://localhost:8000';

interface User {
  username: string;
  role: string;
  token: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cdss_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<{id: number; text: string; type: 'success' | 'error'}[]>([]);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  const addToast = (text: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const logout = () => {
    localStorage.removeItem('cdss_user');
    setUser(null);
    setSelectedPatientId(null);
    addToast('Logged out successfully');
  };

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${user?.token}`,
      'Content-Type': 'application/json'
    };
  };

  if (!user) {
    return <LoginPage onLogin={(u) => { setUser(u); addToast(`Welcome back, ${u.username}!`); }} />;
  }

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span style={{ fontWeight: 600 }}>{t.type === 'success' ? 'Success' : 'Error'}:</span>
            <span>{t.text}</span>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Activity size={24} style={{ color: '#fff' }} />
          <span>CDSS READMISSION</span>
        </div>
        
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <button 
              className={`sidebar-link w-full text-left ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); setSelectedPatientId(null); }}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
            >
              <BarChart3 size={18} />
              <span>Clinical Dashboard</span>
            </button>
          </li>
          <li className="sidebar-item">
            <button 
              className={`sidebar-link w-full text-left ${activeTab === 'patients' ? 'active' : ''}`}
              onClick={() => { setActiveTab('patients'); setSelectedPatientId(null); }}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
            >
              <Users size={18} />
              <span>Patient Directory</span>
            </button>
          </li>
          
          {(user.role === 'Admin' || user.role === 'Analyst') && (
            <li className="sidebar-item">
              <button 
                className={`sidebar-link w-full text-left ${activeTab === 'fairness' ? 'active' : ''}`}
                onClick={() => { setActiveTab('fairness'); setSelectedPatientId(null); }}
                style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
              >
                <ShieldAlert size={18} />
                <span>Fairness Monitoring</span>
              </button>
            </li>
          )}

          <li className="sidebar-item">
            <button 
              className={`sidebar-link w-full text-left ${activeTab === 'models' ? 'active' : ''}`}
              onClick={() => { setActiveTab('models'); setSelectedPatientId(null); }}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
            >
              <Layers size={18} />
              <span>Model Quality & Drift</span>
            </button>
          </li>

          {user.role === 'Admin' && (
            <li className="sidebar-item">
              <button 
                className={`sidebar-link w-full text-left ${activeTab === 'audit' ? 'active' : ''}`}
                onClick={() => { setActiveTab('audit'); setSelectedPatientId(null); }}
                style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
              >
                <ShieldCheck size={18} />
                <span>System Audit Logs</span>
              </button>
            </li>
          )}
        </ul>

        {/* Sidebar Profile Card */}
        <div className="sidebar-footer" style={{ background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, #4299e1 0%, #319795 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '12px'
            }}>
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{user.username}</div>
              <div style={{ fontSize: '11px', color: '#a0aec0' }}>{user.role}</div>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="btn btn-secondary" 
            style={{ width: '100%', padding: '6px 12px', fontSize: '12px', borderColor: 'rgba(255,255,255,0.1)', color: '#cbd5e0' }}
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-wrapper">
        <header className="main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 700 }}>
              {activeTab === 'dashboard' && 'Clinical Analytics Dashboard'}
              {activeTab === 'patients' && 'Patient Management System'}
              {activeTab === 'fairness' && 'Fairlearn Bias & Parity Auditing'}
              {activeTab === 'models' && 'Model Registry & Calibration'}
              {activeTab === 'audit' && 'System Security Audit Trail'}
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Quick Role Switcher for local testing convenience */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-app)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <UserCheck size={14} style={{ color: 'var(--text-muted)' }} />
              <select 
                value={user.role} 
                onChange={(e) => {
                  const updated = { ...user, role: e.target.value };
                  setUser(updated);
                  localStorage.setItem('cdss_user', JSON.stringify(updated));
                  addToast(`Switched active test role to: ${e.target.value}`);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '12px', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
              >
                <option value="Admin">Admin</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Analyst">Analyst</option>
              </select>
            </div>

            {/* Dark Mode Button */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="content-body">
          {selectedPatientId ? (
            <PatientDetailsPage 
              patientId={selectedPatientId} 
              onBack={() => setSelectedPatientId(null)} 
              userRole={user.role}
              headers={getAuthHeaders()} 
              addToast={addToast}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardTab headers={getAuthHeaders()} onSelectPatient={setSelectedPatientId} />}
              {activeTab === 'patients' && <PatientsTab headers={getAuthHeaders()} onSelectPatient={setSelectedPatientId} />}
              {activeTab === 'fairness' && <FairnessTab headers={getAuthHeaders()} />}
              {activeTab === 'models' && <ModelsTab headers={getAuthHeaders()} userRole={user.role} addToast={addToast} />}
              {activeTab === 'audit' && <AuditTab headers={getAuthHeaders()} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// --- LOGIN PAGE COMPONENT ---
function LoginPage({ onLogin }: { onLogin: (u: User) => void }) {
  const [username, setUsername] = useState('doctor');
  const [password, setPassword] = useState('doctor');
  const [role, setRole] = useState('Doctor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      onLogin({
        username: data.username,
        role: data.role,
        token: data.access_token
      });
    } catch (err: any) {
      // Fallback local registration bypass for immediate testing simplicity
      setError(err.message || 'Login failed');
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
        body: JSON.stringify({ username, email: `${username}@cdss.hospital.org`, password, role })
      });
      if (!res.ok) {
        throw new Error('User already exists or register failed');
      }
      const data = await res.json();
      onLogin({
        username: data.username,
        role: data.role,
        token: data.access_token
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)', padding: '20px' 
    }}>
      <div className="card" style={{ width: '420px', padding: '36px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '56px', height: '56px', borderRadius: '14px', 
            background: 'linear-gradient(135deg, #3182ce 0%, #319795 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto'
          }}>
            <Activity size={28} style={{ color: '#fff' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>CDSS Clinical Login</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Secure Readmission Prediction Engine</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '18px', border: '1px solid var(--danger)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-input" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flexGrow: 1 }}>
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>OR REGISTER TEST USER</span>
          <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
        </div>

        <div>
          <div className="form-group">
            <label className="form-label">Role Profile</label>
            <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
              <option value="Doctor">Doctor (Inference, Reports)</option>
              <option value="Nurse">Nurse (Read-Only Risk Scores)</option>
              <option value="Analyst">Analyst (Fairness monitoring)</option>
              <option value="Admin">Admin (Full Control)</option>
            </select>
          </div>
          <button 
            type="button" 
            onClick={handleRegisterFallback} 
            disabled={loading} 
            className="btn btn-secondary w-full"
            style={{ width: '100%' }}
          >
            Create & Sign In
          </button>
        </div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stat Panels */}
      <div className="grid-cols-12">
        <div className="col-span-3 card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(229, 62, 62, 0.15)', color: '#e53e3e' }}>
            <ShieldAlert size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{data.high_risk_count}</div>
            <div className="stat-label">High-Risk Patients</div>
          </div>
        </div>
        <div className="col-span-3 card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(49, 151, 149, 0.15)', color: '#319795' }}>
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{data.average_risk_score}%</div>
            <div className="stat-label">Average Readmit Probability</div>
          </div>
        </div>
        <div className="col-span-3 card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(66, 153, 225, 0.15)', color: '#4299e1' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{data.total_patients}</div>
            <div className="stat-label">Total Patients Managed</div>
          </div>
        </div>
        <div className="col-span-3 card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(113, 128, 150, 0.15)', color: '#718096' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{data.total_admissions}</div>
            <div className="stat-label">Total Admissions Logged</div>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid-cols-12">
        <div className="col-span-8 card">
          <div className="card-title">Hospital Readmission Probability Trend (6 Months)</div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.readmission_trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3182ce" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3182ce" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis unit="%" stroke="var(--text-muted)" />
                <Tooltip />
                <Area type="monotone" dataKey="avg_risk" stroke="#3182ce" fillOpacity={1} fill="url(#colorRisk)" name="Avg Risk" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-4 card">
          <div className="card-title">Department Readmission Index</div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.department_analytics} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" unit="%" stroke="var(--text-muted)" />
                <YAxis dataKey="department" type="category" stroke="var(--text-muted)" width={80} style={{ fontSize: '11px' }} />
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
      <div className="grid-cols-12">
        <div className="col-span-4 card">
          <div className="card-title">Race Demographics Distribution</div>
          <div style={{ height: '240px', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.demographics.race}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.demographics.race.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#3182ce', '#319795', '#ed8936', '#9f7aea', '#a0aec0'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-8 card">
          <div className="card-title">Patients Currently Flagged as High-Risk</div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient MRN</th>
                  <th>Gender</th>
                  <th>Race</th>
                  <th>Readmit Probability</th>
                  <th>Risk Tier</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_high_risk.map((pt: any) => (
                  <tr key={pt.patient_id}>
                    <td style={{ fontWeight: 600 }}>{pt.patient_mrn}</td>
                    <td>{pt.gender}</td>
                    <td>{pt.race}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '40px', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pt.probability}%`, height: '100%', backgroundColor: '#e53e3e' }}></div>
                        </div>
                        <span style={{ fontWeight: 'bold', color: '#e53e3e' }}>{pt.probability}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-high">High</span>
                    </td>
                    <td>
                      <button onClick={() => onSelectPatient(pt.patient_id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>
                        Open Case
                      </button>
                    </td>
                  </tr>
                ))}
                {data.recent_high_risk.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                      No patients currently flagged as high risk.
                    </td>
                  </tr>
                )}
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
        setPatients(json.patients);
        setTotal(json.total);
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
    <div className="card">
      <div className="card-title">Patient Records Directory</div>

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '24px' }}>
        <div style={{ flexGrow: 1, minWidth: '240px' }}>
          <div className="search-wrapper">
            <input 
              type="text" 
              placeholder="Search Patient MRN (e.g. MRN-100)..." 
              className="form-input" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>

        <select className="form-input" style={{ width: '150px' }} value={gender} onChange={e => { setGender(e.target.value); setPage(1); }}>
          <option value="">All Genders</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
        </select>

        <select className="form-input" style={{ width: '180px' }} value={race} onChange={e => { setRace(e.target.value); setPage(1); }}>
          <option value="">All Races</option>
          <option value="Caucasian">Caucasian</option>
          <option value="African American">African American</option>
          <option value="Asian">Asian</option>
          <option value="Hispanic">Hispanic</option>
          <option value="Other">Other</option>
        </select>

        <button type="submit" className="btn btn-primary">
          <Search size={16} />
          <span>Apply Filter</span>
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
                    <td style={{ fontWeight: 600 }}>{p.patient_mrn}</td>
                    <td>{p.age}</td>
                    <td>{p.gender}</td>
                    <td>{p.race}</td>
                    <td>{p.latest_admission_date}</td>
                    <td>
                      {p.latest_risk_score !== null ? (
                        <span style={{ fontWeight: 'bold', color: p.latest_risk_score > 60 ? 'var(--danger)' : p.latest_risk_score > 25 ? 'var(--warning)' : 'var(--success)' }}>
                          {p.latest_risk_score}%
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Unassessed</span>
                      )}
                    </td>
                    <td>
                      {p.latest_risk_tier === 'High' && <span className="badge badge-high">High</span>}
                      {p.latest_risk_tier === 'Medium' && <span className="badge badge-medium">Medium</span>}
                      {p.latest_risk_tier === 'Low' && <span className="badge badge-low">Low</span>}
                      {p.latest_risk_tier === 'Unassessed' && <span className="badge" style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}>None</span>}
                    </td>
                    <td>
                      <button onClick={() => onSelectPatient(p.id)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Showing {patients.length} of {total} records
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setPage(p => Math.max(p - 1, 1))} 
                disabled={page === 1}
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => p + 1)} 
                disabled={page * 10 >= total}
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '12px' }}
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


// --- PATIENT DETAILS & RISK ASSESSMENT PAGE ---
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
      if (!res.ok) throw new Error('Failed to compute risk scoring');
      const data = await res.json();
      setAssessmentResult(data);
      addToast('Readmission risk assessment generated successfully!');
      loadDetails(); // reload list
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
      // Find assessment ID
      let assessmentId = assessmentResult?.assessment_id;
      if (!assessmentId) {
        // If not in state, look at patient object history for selected admission
        const selectedAdm = patient.admissions.find((a: any) => a.id === selectedAdmissionId);
        // Risk assessment needs to be triggered or retrieved
        if (!selectedAdm || selectedAdm.risk_score === null) {
          throw new Error('Must run risk assessment before generating report');
        }
        // Since we don't have the assessment ID easily, we run assessment again or fetch it
        // To be safe, we run assessment to get ID
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
      
      // Trigger download
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header back button */}
      <div>
        <button onClick={onBack} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
          ← Back to Patient Directory
        </button>
      </div>

      <div className="grid-cols-12">
        {/* Left Side: Patient File */}
        <div className="col-span-4 card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', background: 'var(--border)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' 
            }}>
              <Users size={32} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Patient File</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>MRN: {patient.patient_mrn}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Gender:</span>
              <span style={{ fontWeight: 600 }}>{patient.gender}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Demographic Race:</span>
              <span style={{ fontWeight: 600 }}>{patient.race}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Date of Birth:</span>
              <span style={{ fontWeight: 600 }}>{patient.dob}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Current Age:</span>
              <span style={{ fontWeight: 600 }}>{patient.age} years</span>
            </div>
          </div>

          {/* Admission Picker */}
          <div style={{ marginTop: '10px' }}>
            <label className="form-label">Select Admission Episode</label>
            <select 
              className="form-input" 
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

          {/* Current Admission Specs */}
          {currentAdmission && (
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
              <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Admission Specs</div>
              <div style={{ marginBottom: '4px' }}><b>Discharge Date:</b> {currentAdmission.discharge_date}</div>
              <div style={{ marginBottom: '4px' }}><b>Disposition:</b> {currentAdmission.discharge_disposition}</div>
              <div style={{ marginBottom: '8px' }}><b>Insurance Coverage:</b> {currentAdmission.insurance}</div>
              
              <div style={{ fontWeight: 700, margin: '10px 0 4px 0' }}>Diagnoses ICD-9</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {currentAdmission.diagnoses.map((d: any) => (
                  <span key={d.code} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                    {d.code} - {d.category}
                  </span>
                ))}
              </div>

              <div style={{ fontWeight: 700, margin: '10px 0 4px 0' }}>Procedures</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {currentAdmission.procedures.map((p: any) => (
                  <span key={p.code} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                    {p.code} ({p.description})
                  </span>
                ))}
                {currentAdmission.procedures.length === 0 && <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None logged</span>}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Risk Scoring panel */}
        <div className="col-span-8 card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Readmission Probability & Explainable AI</h3>
            
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {userRole !== 'Nurse' && (
                <button 
                  onClick={handleAssessRisk} 
                  disabled={assessing || !selectedAdmissionId} 
                  className="btn btn-primary"
                >
                  <RefreshCw size={16} className={assessing ? 'animate-spin' : ''} />
                  <span>{assessing ? 'Calculating...' : 'Run Prediction Engine'}</span>
                </button>
              )}
              
              {activeAssessment && (
                <button 
                  onClick={handleGenerateReport} 
                  disabled={generatingReport} 
                  className="btn btn-secondary"
                >
                  <Download size={16} />
                  <span>{generatingReport ? 'Generating...' : 'Clinical Report PDF'}</span>
                </button>
              )}
            </div>
          </div>

          {!activeAssessment ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', border: '2px dashed var(--border)', borderRadius: '10px', color: 'var(--text-muted)' }}>
              <AlertTriangle size={36} style={{ marginBottom: '12px' }} />
              <p style={{ fontWeight: 600 }}>Risk Assessment Pending</p>
              <p style={{ fontSize: '13px', textAlign: 'center', maxWidth: '340px', marginTop: '4px' }}>
                {userRole === 'Nurse' 
                  ? 'No risk assessment has been logged for this admission yet. Contact the attending physician.'
                  : 'An assessment has not been executed for this admission session yet. Click the button above to calculate.'
                }
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Score panel */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', backgroundColor: 'var(--bg-app)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', alignItems: 'center' }}>
                {/* Visual Circular Gauge */}
                <div style={{ width: '100px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ transform: 'rotate(-90deg)', width: '100px', height: '100px' }}>
                    <circle cx="50" cy="50" r="42" stroke="var(--border)" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      stroke={activeAssessment.risk_tier === 'High' ? 'var(--danger)' : activeAssessment.risk_tier === 'Medium' ? 'var(--warning)' : 'var(--success)'} 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - (activeAssessment.probability || activeAssessment.risk_score) / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{ position: 'absolute', fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>
                    {activeAssessment.probability || activeAssessment.risk_score}%
                  </div>
                </div>

                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>30-Day Readmission Risk:</span>
                    {activeAssessment.risk_tier === 'High' && <span className="badge badge-high">High Risk</span>}
                    {activeAssessment.risk_tier === 'Medium' && <span className="badge badge-medium">Medium Risk</span>}
                    {activeAssessment.risk_tier === 'Low' && <span className="badge badge-low">Low Risk</span>}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Model: {activeAssessment.model_version || 'Active Model'}
                  </p>
                </div>
              </div>

              {/* SHAP Waterfall explanations */}
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>SHAP Explainable AI: Feature Drivers</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeAssessment.shap_waterfall?.map((item: any) => {
                    const isPositive = item.shap_value > 0;
                    // Scale shap value for graphics width (max impact is typically around 0.3-0.4)
                    const percentWidth = Math.min(Math.abs(item.shap_value) * 250, 100);
                    
                    return (
                      <div key={item.feature} style={{ display: 'flex', alignItems: 'center', fontSize: '12px', gap: '10px' }}>
                        <div style={{ width: '150px', fontWeight: 600, color: 'var(--text-main)' }}>{item.display_name}</div>
                        <div style={{ width: '40px', color: 'var(--text-muted)' }}>{item.value}</div>
                        
                        {/* Bar graphics */}
                        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', position: 'relative', height: '20px', backgroundColor: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ 
                            position: 'absolute',
                            left: '50%',
                            transform: isPositive ? 'none' : 'translateX(-100%)',
                            width: `${percentWidth}%`,
                            height: '100%',
                            backgroundColor: isPositive ? 'rgba(229, 62, 62, 0.6)' : 'rgba(49, 151, 149, 0.6)'
                          }}></div>
                          
                          {/* Centered line */}
                          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', backgroundColor: 'var(--border)' }}></div>
                        </div>

                        <div style={{ width: '70px', textAlign: 'right', fontWeight: 'bold', color: isPositive ? 'var(--danger)' : 'var(--success)' }}>
                          {isPositive ? '+' : ''}{(item.shap_value * 100).toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Narrative Text */}
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Clinical Risk Narrative</h4>
                <div style={{ 
                  backgroundColor: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '8px', 
                  padding: '16px', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-line' 
                }}>
                  {activeAssessment.risk_explanation}
                </div>
              </div>

              {/* Recommended transition checklist */}
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Recommended Transition Care Checklist</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
                  {activeAssessment.risk_tier === 'High' ? (
                    <>
                      <li><b>Transitional Care Specialist:</b> Daily follow-up telephone calls starting 24h post-discharge.</li>
                      <li><b>Primary Care Physician:</b> Schedule follow-up clinical encounter within 7 days.</li>
                      <li><b>Medication Reconciliation:</b> Attending pharmacist review of discharge medications.</li>
                    </>
                  ) : activeAssessment.risk_tier === 'Medium' ? (
                    <>
                      <li><b>Attending Follow-up:</b> Nurse outreach telephone check-in at 48h.</li>
                      <li><b>Primary Care Appointment:</b> Clinic visit scheduled in 14 days.</li>
                    </>
                  ) : (
                    <>
                      <li><b>Discharge Care:</b> Standard nurse outreach call at 72h.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// --- FAIRNESS MONITORING TAB ---
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Fairlearn monitoring tracks parity differences to prevent biased clinical decisions across demographics.
        </p>
        <button onClick={handleTriggerAudit} disabled={auditing} className="btn btn-primary">
          <RefreshCw size={16} className={auditing ? 'animate-spin' : ''} />
          <span>{auditing ? 'Re-auditing...' : 'Run Group Fairness Audit'}</span>
        </button>
      </div>

      {/* Sensitive attributes cards */}
      {Object.entries(data).map(([attrName, value]: any) => {
        // Prepare chart data
        // Filter out ALL row for plotting subgroup bars
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
          <div key={attrName} className="card grid-cols-12" style={{ gap: '24px' }}>
            <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{attrName} Audit Overview</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DEMOGRAPHIC PARITY DIFF</div>
                  <div style={{ fontSize: '20px', fontWeight: 700 }}>{(value.demographic_parity_difference * 100).toFixed(2)}%</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Max difference in selection rate</div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>EQUALIZED ODDS DIFF</div>
                  <div style={{ fontSize: '20px', fontWeight: 700 }}>{(value.equalized_odds_difference * 100).toFixed(2)}%</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Max difference in error rates</div>
                </div>
              </div>
            </div>

            <div className="col-span-8">
              <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="group" stroke="var(--text-muted)" />
                    <YAxis unit="%" stroke="var(--text-muted)" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Selection Rate" fill="#3182ce" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="False Positive Rate" fill="#e53e3e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="False Negative Rate" fill="#ed8936" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


// --- MODEL MONITORING & DRIFT TAB ---
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Retrain header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Manage trained classifiers, active deployments, and data drift logs.
        </p>
        {userRole === 'Admin' && (
          <button onClick={handleRetrain} disabled={training} className="btn btn-primary">
            <RefreshCw size={16} className={training ? 'animate-spin' : ''} />
            <span>{training ? 'Training models...' : 'Run ML Training Pipeline'}</span>
          </button>
        )}
      </div>

      <div className="grid-cols-12">
        {/* Model versions table */}
        <div className="col-span-8 card">
          <div className="card-title">Model Registry</div>
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
                    <td style={{ fontWeight: 600 }}>{m.version}</td>
                    <td>{m.name}</td>
                    <td>{m.metrics ? `${(m.metrics.auroc * 100).toFixed(1)}%` : 'N/A'}</td>
                    <td>{m.metrics ? `${(m.metrics.recall * 100).toFixed(1)}%` : 'N/A'}</td>
                    <td>{m.metrics ? `${(m.metrics.f1_score * 100).toFixed(1)}%` : 'N/A'}</td>
                    <td>
                      {m.is_active ? (
                        <span className="badge badge-low" style={{ textTransform: 'capitalize' }}>Active</span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}>Inactive</span>
                      )}
                    </td>
                    <td>
                      {!m.is_active && userRole === 'Admin' ? (
                        <button onClick={() => handleActivateModel(m.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>
                          Activate
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drift logs */}
        <div className="col-span-4 card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-title">Data Drift Logs</div>
          
          <div style={{ backgroundColor: 'var(--bg-app)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Drift Status:</span>
              <span className="badge badge-low" style={{ fontSize: '11px' }}>{data.drift_indicators.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>PSI score (Stability):</span>
              <span style={{ fontWeight: 700, fontSize: '13px' }}>{data.drift_indicators.psi_score}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Last Checked:</span>
              <span style={{ fontSize: '13px' }}>{data.drift_indicators.last_checked}</span>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Data drift alerts trigger automatically when the Population Stability Index (PSI) exceeds 0.2, indicating significant demographic or procedural feature shift.
          </p>
        </div>
      </div>

      {/* Feature Importance & Calibration */}
      <div className="grid-cols-12">
        <div className="col-span-6 card">
          <div className="card-title">Global Feature Importance (Active Model)</div>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.feature_importances} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="feature" stroke="var(--text-muted)" style={{ fontSize: '11px' }} />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip />
                <Bar dataKey="importance" fill="#2b6cb0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-6 card">
          <div className="card-title">Calibration Performance Curve</div>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.calibration_curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="bin" stroke="var(--text-muted)" />
                <YAxis unit="%" stroke="var(--text-muted)" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="observed" stroke="#319795" name="Observed %" strokeWidth={2} activeDot={{ r: 8 }} />
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
      .then(json => { setLogs(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoaderSkeleton />;

  return (
    <div className="card">
      <div className="card-title">Security & Operations Audit Trail (Admin-Only)</div>
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
                <td style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                <td style={{ fontWeight: 600 }}>{log.username}</td>
                <td>
                  <span className="badge" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{log.ip_address}</td>
                <td style={{ fontSize: '13px' }}>{log.details}</td>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div className="skeleton" style={{ height: '40px', width: '30%' }}></div>
      <div className="skeleton" style={{ height: '200px', width: '100%' }}></div>
      <div className="grid-cols-12" style={{ width: '100%' }}>
        <div className="col-span-6 skeleton" style={{ height: '150px' }}></div>
        <div className="col-span-6 skeleton" style={{ height: '150px' }}></div>
      </div>
    </div>
  );
}
