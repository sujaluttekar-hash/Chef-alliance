
import React, { useState, useEffect } from 'react';
import { User, UserRole, Audit, Vendor, Property, VendorAllocation, StatusRule, Training, VillaAudit } from './types';
import { MOCK_USER, MOCK_ADMIN, PROPERTIES as INITIAL_PROPERTIES, DEFAULT_STATUS_RULES } from './constants';
import SupervisorApp from './components/SupervisorApp';
import AdminDashboard from './components/AdminDashboard';
import { ClipboardCheck, LogOut, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'LOGIN' | 'OTP' | 'APP'>('LOGIN');
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('vendor_users');
    return saved ? JSON.parse(saved) : [MOCK_USER, MOCK_ADMIN];
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

  useEffect(() => {
    localStorage.setItem('vendor_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('vendor_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('vendor_list', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('vendor_status_rules', JSON.stringify(statusRules));
  }, [statusRules]);

  useEffect(() => {
    localStorage.setItem('vendor_audits', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('vendor_allocations', JSON.stringify(allocations));
  }, [allocations]);

  useEffect(() => {
    localStorage.setItem('vendor_trainings', JSON.stringify(trainings));
  }, [trainings]);

  useEffect(() => {
    localStorage.setItem('vendor_villa_audits', JSON.stringify(villaAudits));
  }, [villaAudits]);

  const handleSendOtp = () => {
    if (phone.length >= 10) setStep('OTP');
  };

  const handleVerifyOtp = () => {
    const foundUser = users.find(u => u.phone === phone || u.phone.includes(phone));
    if (otp === '123456' || otp === '000000') {
      if (foundUser) {
        setUser(foundUser);
      } else {
        setUser(otp === '123456' ? MOCK_USER : MOCK_ADMIN);
      }
      setIsAuthenticated(true);
      setStep('APP');
    } else {
      alert('Invalid OTP. Use 123456 for Supervisor or 000000 for Admin');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setStep('LOGIN');
    setPhone('');
    setOtp('');
  };

  const addAudit = (audit: Audit) => {
    setAudits(prev => [audit, ...prev]);
  };

  const addAllocation = (allocation: VendorAllocation) => {
    setAllocations(prev => {
      const filtered = prev.filter(a => !(a.vendorId === allocation.vendorId && a.date === allocation.date));
      return [allocation, ...filtered];
    });
  };

  const removeAllocation = (vendorId: string, date: string) => {
    setAllocations(prev => prev.filter(a => !(a.vendorId === vendorId && a.date === date)));
  };

  const addTraining = (training: Training) => {
    setTrainings(prev => [training, ...prev]);
  };

  const editTraining = (updated: Training) => {
    setTrainings(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const addVillaAudit = (vAudit: VillaAudit) => {
    setVillaAudits(prev => [vAudit, ...prev]);
  };

  const updateVillaAudit = (updated: VillaAudit) => {
    setVillaAudits(prev => prev.map(v => v.id === updated.id ? updated : v));
  };

  const addStatusRule = (rule: Omit<StatusRule, 'id'>) => {
    setStatusRules(prev => [...prev, { ...rule, id: `sr_${Date.now()}` }]);
  };

  const editStatusRule = (updated: StatusRule) => {
    setStatusRules(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const deleteStatusRule = (id: string) => {
    setStatusRules(prev => prev.filter(r => r.id !== id));
  };

  const addUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const editUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (user?.id === updatedUser.id) setUser(updatedUser);
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const addProperty = (newProp: Property) => {
    setProperties(prev => [...prev, newProp]);
  };

  const deleteProperty = (propertyId: string) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
    setVendors(prev => prev.filter(v => v.squadId !== propertyId));
  };

  const addVendor = (name: string, email: string, squadId: string, vendorType: string, numberOfTeams: number) => {
    setVendors(prev => [...prev, { id: `v_${Date.now()}`, name, email, squadId, vendorType, numberOfTeams }]);
  };

  const editVendor = (updatedVendor: Vendor) => {
    setVendors(prev => prev.map(v => v.id === updatedVendor.id ? updatedVendor : v));
  };

  const deleteVendor = (vendorId: string) => {
    setVendors(prev => prev.filter(v => v.id !== vendorId));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">VendorAudit Pro</h1>
            <p className="text-slate-500">Compliance & Hygiene Tracking</p>
          </div>

          {step === 'LOGIN' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter your phone"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <button
                onClick={handleSendOtp}
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Send Verification Code
              </button>
            </div>
          )}

          {step === 'OTP' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Enter 6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-center text-2xl tracking-widest"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Verify & Login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ClipboardCheck className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl text-slate-900 hidden sm:inline-block">VendorAudit</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-900">{user?.name}</span>
              <span className="text-xs text-slate-500">{user?.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {user?.role === UserRole.SUPERVISOR || user?.role === UserRole.MANAGER ? (
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
