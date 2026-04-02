import React, { useState, useEffect } from 'react';
import { User, UserRole, Audit, Vendor, Property, VendorAllocation, StatusRule, Training, VillaAudit, VendorAuditPost, ChefVillaAuditRecord } from './types';
import { MOCK_USER, MOCK_ADMIN, PROPERTIES as INITIAL_PROPERTIES, DEFAULT_STATUS_RULES } from './constants';
import SupervisorApp from './components/SupervisorApp';
import AdminDashboard from './components/AdminDashboard';
import VendorAuditPage from './components/VendorAuditPage';
import { ClipboardCheck, LogOut, ChefHat, ShieldCheck, Users, ArrowLeft } from 'lucide-react';

// ─── Mock vendor user ─────────────────────────────────────────────────────────
const MOCK_VENDOR: User = {
  id: 'ven_001',
  name: 'Chef Rajesh',
  role: UserRole.VENDOR,
  phone: '+15551111',
  assignedSquadIds: ['lonavala'],
};

// Role card config
const ROLE_OPTIONS = [
  {
    role: 'vendor',
    label: 'Vendor / Chef',
    subtitle: 'Post audits & field updates',
    icon: ChefHat,
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    ring: 'ring-orange-400',
    text: 'text-orange-600',
    otp: '111111',
    hint: 'Use OTP: 111111',
  },
  {
    role: 'supervisor',
    label: 'Supervisor / Manager',
    subtitle: 'Track compliance & audits',
    icon: Users,
    color: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    ring: 'ring-indigo-400',
    text: 'text-indigo-600',
    otp: '123456',
    hint: 'Use OTP: 123456',
  },
  {
    role: 'admin',
    label: 'Admin',
    subtitle: 'Manage users, vendors & settings',
    icon: ShieldCheck,
    color: 'from-slate-600 to-slate-800',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    ring: 'ring-slate-400',
    text: 'text-slate-600',
    otp: '000000',
    hint: 'Use OTP: 000000',
  },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Login state
  const [loginStep, setLoginStep] = useState<'ROLE' | 'PHONE' | 'OTP'>('ROLE');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // App data
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('vendor_users');
    return saved ? JSON.parse(saved) : [MOCK_USER, MOCK_ADMIN, MOCK_VENDOR];
  });

  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('vendor_properties');
    return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('vendor_list');
    return saved ? JSON.parse(saved) : [
      { id: 'v1', name: 'Chef Rajesh', email: 'rajesh@chef.com', squadId: 'lonavala', vendorType: 'In House Chef', numberOfTeams: 1 },
      { id: 'v2', name: 'Chef Sunita', email: 'sunita@chef.com', squadId: 'karjat', vendorType: 'Stand Alone', numberOfTeams: 2 }
    ];
  });

  const [statusRules, setStatusRules] = useState<StatusRule[]>(() => {
    const saved = localStorage.getItem('vendor_status_rules');
    return saved ? JSON.parse(saved) : DEFAULT_STATUS_RULES;
  });

  const [audits, setAudits] = useState<Audit[]>(() => {
    const saved = localStorage.getItem('vendor_audits');
    return saved ? JSON.parse(saved) : [];
  });

  const [allocations, setAllocations] = useState<VendorAllocation[]>(() => {
    const saved = localStorage.getItem('vendor_allocations');
    return saved ? JSON.parse(saved) : [];
  });

  const [trainings, setTrainings] = useState<Training[]>(() => {
    const saved = localStorage.getItem('vendor_trainings');
    return saved ? JSON.parse(saved) : [];
  });

  const [villaAudits, setVillaAudits] = useState<VillaAudit[]>(() => {
    const saved = localStorage.getItem('vendor_villa_audits');
    return saved ? JSON.parse(saved) : [];
  });

  const [vendorAuditPosts, setVendorAuditPosts] = useState<VendorAuditPost[]>(() => {
    const saved = localStorage.getItem('vendor_audit_posts');
    return saved ? JSON.parse(saved) : [];
  });

  const [chefVillaAudits, setChefVillaAudits] = useState<ChefVillaAuditRecord[]>(() => {
    const saved = localStorage.getItem('chef_villa_audits');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist all state
  useEffect(() => { localStorage.setItem('vendor_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('vendor_properties', JSON.stringify(properties)); }, [properties]);
  useEffect(() => { localStorage.setItem('vendor_list', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem('vendor_status_rules', JSON.stringify(statusRules)); }, [statusRules]);
  useEffect(() => { localStorage.setItem('vendor_audits', JSON.stringify(audits)); }, [audits]);
  useEffect(() => { localStorage.setItem('vendor_allocations', JSON.stringify(allocations)); }, [allocations]);
  useEffect(() => { localStorage.setItem('vendor_trainings', JSON.stringify(trainings)); }, [trainings]);
  useEffect(() => { localStorage.setItem('vendor_villa_audits', JSON.stringify(villaAudits)); }, [villaAudits]);
  useEffect(() => { localStorage.setItem('vendor_audit_posts', JSON.stringify(vendorAuditPosts)); }, [vendorAuditPosts]);
  useEffect(() => { localStorage.setItem('chef_villa_audits', JSON.stringify(chefVillaAudits)); }, [chefVillaAudits]);

  // ── Login handlers ────────────────────────────────────────────────────────
  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setLoginStep('PHONE');
  };

  const handleSendOtp = () => {
    if (phone.trim().length >= 6) {
      setLoginStep('OTP');
    }
  };

  const handleVerifyOtp = () => {
    setOtpError('');
    const roleConfig = ROLE_OPTIONS.find(r => r.role === selectedRole);
    if (!roleConfig) return;

    if (otp === roleConfig.otp || otp === '123456' || otp === '000000' || otp === '111111') {
      let loggedInUser: User;

      if (otp === '000000' || selectedRole === 'admin') {
        loggedInUser = users.find(u => u.role === UserRole.ADMIN) || MOCK_ADMIN;
      } else if (otp === '111111' || selectedRole === 'vendor') {
        const foundVendor = users.find(u => u.role === UserRole.VENDOR && u.phone === phone);
        loggedInUser = foundVendor || MOCK_VENDOR;
      } else {
        const found = users.find(u => u.phone === phone);
        loggedInUser = found || MOCK_USER;
      }

      setUser(loggedInUser);
      setIsAuthenticated(true);
    } else {
      setOtpError(`Invalid OTP. ${roleConfig.hint}`);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setLoginStep('ROLE');
    setSelectedRole(null);
    setPhone('');
    setOtp('');
    setOtpError('');
  };

  // ── Data handlers ─────────────────────────────────────────────────────────
  const addAudit = (audit: Audit) => setAudits(prev => [audit, ...prev]);
  const addAllocation = (allocation: VendorAllocation) => {
    setAllocations(prev => {
      const filtered = prev.filter(a => !(a.vendorId === allocation.vendorId && a.date === allocation.date));
      return [allocation, ...filtered];
    });
  };
  const removeAllocation = (vendorId: string, date: string) =>
    setAllocations(prev => prev.filter(a => !(a.vendorId === vendorId && a.date === date)));
  const addTraining = (training: Training) => setTrainings(prev => [training, ...prev]);
  const editTraining = (updated: Training) => setTrainings(prev => prev.map(t => t.id === updated.id ? updated : t));
  const addVillaAudit = (vAudit: VillaAudit) => setVillaAudits(prev => [vAudit, ...prev]);
  const updateVillaAudit = (updated: VillaAudit) => setVillaAudits(prev => prev.map(v => v.id === updated.id ? updated : v));
  const addStatusRule = (rule: Omit<StatusRule, 'id'>) => setStatusRules(prev => [...prev, { ...rule, id: `sr_${Date.now()}` }]);
  const editStatusRule = (updated: StatusRule) => setStatusRules(prev => prev.map(r => r.id === updated.id ? updated : r));
  const deleteStatusRule = (id: string) => setStatusRules(prev => prev.filter(r => r.id !== id));
  const addUser = (newUser: User) => setUsers(prev => [...prev, newUser]);
  const editUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (user?.id === updatedUser.id) setUser(updatedUser);
  };
  const deleteUser = (userId: string) => setUsers(prev => prev.filter(u => u.id !== userId));
  const addProperty = (newProp: Property) => setProperties(prev => [...prev, newProp]);
  const deleteProperty = (propertyId: string) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
    setVendors(prev => prev.filter(v => v.squadId !== propertyId));
  };
  const addVendor = (name: string, email: string, squadId: string, vendorType: string, numberOfTeams: number) =>
    setVendors(prev => [...prev, { id: `v_${Date.now()}`, name, email, squadId, vendorType, numberOfTeams }]);
  const editVendor = (updatedVendor: Vendor) => setVendors(prev => prev.map(v => v.id === updatedVendor.id ? updatedVendor : v));
  const deleteVendor = (vendorId: string) => setVendors(prev => prev.filter(v => v.id !== vendorId));
  const addVendorAuditPost = (post: VendorAuditPost) => setVendorAuditPosts(prev => [post, ...prev]);
  const addChefVillaAudit = (audit: ChefVillaAuditRecord) => setChefVillaAudits(prev => [audit, ...prev]);

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    const roleConfig = ROLE_OPTIONS.find(r => r.role === selectedRole);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 p-4">
        <div className="w-full max-w-sm">

          {/* Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
              <ClipboardCheck className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Chef Alliance</h1>
            <p className="text-slate-500 text-sm mt-1">Vendor & Audit Management</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 space-y-5">

            {/* STEP 1: Role Selection */}
            {loginStep === 'ROLE' && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Sign In</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Choose your role to continue</p>
                </div>
                <div className="space-y-3">
                  {ROLE_OPTIONS.map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.role}
                        onClick={() => handleRoleSelect(option.role)}
                        className={`w-full flex items-center space-x-4 p-4 rounded-2xl border-2 ${option.bg} ${option.border} hover:scale-[1.02] active:scale-[0.98] transition-transform`}
                      >
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${option.color} shadow-md`}>
                          <Icon size={20} className="text-white" />
                        </div>
                        <div className="text-left">
                          <div className={`font-bold text-sm ${option.text}`}>{option.label}</div>
                          <div className="text-xs text-slate-500">{option.subtitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* STEP 2: Phone */}
            {loginStep === 'PHONE' && roleConfig && (
              <>
                <button
                  onClick={() => { setLoginStep('ROLE'); setPhone(''); }}
                  className="flex items-center space-x-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <div>
                  <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold ${roleConfig.bg} ${roleConfig.text} mb-3`}>
                    <roleConfig.icon size={12} />
                    <span>{roleConfig.label}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Enter your phone</h2>
                  <p className="text-sm text-slate-500 mt-0.5">We'll send a verification code</p>
                </div>
                <div className="space-y-3">
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none text-slate-800 transition-all"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                  />
                  <button
                    onClick={handleSendOtp}
                    disabled={phone.trim().length < 6}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send OTP
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: OTP */}
            {loginStep === 'OTP' && roleConfig && (
              <>
                <button
                  onClick={() => { setLoginStep('PHONE'); setOtp(''); setOtpError(''); }}
                  className="flex items-center space-x-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Enter OTP</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Sent to {phone}</p>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    className={`w-full px-4 py-3 rounded-xl border text-center text-2xl tracking-widest font-mono outline-none transition-all ${
                      otpError
                        ? 'border-red-400 ring-2 ring-red-200 text-red-600'
                        : 'border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-slate-800'
                    }`}
                    value={otp}
                    onChange={e => { setOtp(e.target.value); setOtpError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                    autoFocus
                  />
                  {otpError && (
                    <p className="text-xs text-red-500 text-center">{otpError}</p>
                  )}
                  <p className="text-xs text-slate-400 text-center">{roleConfig.hint}</p>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otp.length < 6}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Verify & Login
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    );
  }

  // ── AUTHENTICATED APP ─────────────────────────────────────────────────────
  const getRoleBadgeColor = (role: UserRole) => {
    if (role === UserRole.ADMIN) return 'bg-slate-100 text-slate-600';
    if (role === UserRole.VENDOR) return 'bg-orange-100 text-orange-600';
    return 'bg-indigo-100 text-indigo-600';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ClipboardCheck className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl text-slate-900 hidden sm:inline-block">Chef Alliance</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-900">{user?.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${getRoleBadgeColor(user!.role)}`}>
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {user?.role === UserRole.VENDOR ? (
        <VendorAuditPage
            user={user}
            posts={vendorAuditPosts}
            onAddPost={addVendorAuditPost}
            properties={properties}
            chefVillaAudits={chefVillaAudits}
            onSubmitVillaAudit={addChefVillaAudit}
          />
        ) : user?.role === UserRole.SUPERVISOR || user?.role === UserRole.MANAGER ? (
          <SupervisorApp
            user={user}
            audits={audits}
            vendors={vendors}
            properties={properties}
            allocations={allocations}
            statusRules={statusRules}
            trainings={trainings}
            villaAudits={villaAudits}
            onAddAudit={addAudit}
            onAddAllocation={addAllocation}
            onRemoveAllocation={removeAllocation}
            onAddTraining={addTraining}
            onEditTraining={editTraining}
            onUpdateVillaAudit={updateVillaAudit}
          />
        ) : (
          <AdminDashboard
            user={user!}
            audits={audits}
            users={users}
            vendors={vendors}
            properties={properties}
            allocations={allocations}
            statusRules={statusRules}
            trainings={trainings}
            villaAudits={villaAudits}
            onAddUser={addUser}
            onEditUser={editUser}
            onDeleteUser={deleteUser}
            onAddVendor={addVendor}
            onEditVendor={editVendor}
            onDeleteVendor={deleteVendor}
            onAddProperty={addProperty}
            onDeleteProperty={deleteProperty}
            onAddAllocation={addAllocation}
            onAddStatusRule={addStatusRule}
            onEditStatusRule={editStatusRule}
            onDeleteStatusRule={deleteStatusRule}
            onAddTraining={addTraining}
            onAddVillaAudit={addVillaAudit}
          />
        )}
      </main>
    </div>
  );
};

export default App;
