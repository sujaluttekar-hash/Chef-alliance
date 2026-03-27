import { getAudits } from '../services/sheetsService';

import React, { useState, useMemo, useEffect } from 'react';
import { User, Audit, UserRole, Property, Vendor, VendorAllocation, StatusRule, Training, VillaAudit } from '../types';
import { AUDIT_QUESTIONS, VENDOR_TYPES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Sparkles, Users as UsersIcon, UserPlus, Utensils, Plus, Trash2, ShieldAlert, Edit2, Trophy, Settings2, Check, ClipboardCheck, Map as MapIcon, X, GraduationCap, Calendar, Filter, UserCheck, Clock, MapPin, Eye, ChevronRight, UserCircle, Activity, TrendingUp, Target, BarChart3, Home, Download, FileText, AlertTriangle } from 'lucide-react';
import { getAuditAIInsights } from '../geminiService';

interface Props {
  user: User;
  audits: Audit[];
  users: User[];
  vendors: Vendor[];
  properties: Property[];
  allocations: VendorAllocation[];
  statusRules: StatusRule[];
  trainings: Training[];
  villaAudits: VillaAudit[];
  onAddUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onAddVendor: (name: string, email: string, squadId: string, vendorType: string, numberOfTeams: number) => void;
  onEditVendor: (vendor: Vendor) => void;
  onDeleteVendor: (vendorId: string) => void;
  onAddProperty: (prop: Property) => void;
  onDeleteProperty: (propId: string) => void;
  onAddAllocation: (allocation: VendorAllocation) => void;
  onAddStatusRule: (rule: Omit<StatusRule, 'id'>) => void;
  onEditStatusRule: (rule: StatusRule) => void;
  onDeleteStatusRule: (id: string) => void;
  onAddTraining: (training: Training) => void;
  onAddVillaAudit: (vAudit: VillaAudit) => void;
}

const AdminDashboard: React.FC<Props> = ({ 
  user, audits, users, vendors, properties, allocations, statusRules, trainings, villaAudits,
  onAddUser, onEditUser, onDeleteUser, 
  onAddVendor, onEditVendor, onDeleteVendor, 
  onAddProperty, onDeleteProperty,
  onAddAllocation,
  onAddStatusRule, onEditStatusRule, onDeleteStatusRule,
  onAddTraining, onAddVillaAudit
}) => {
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'SUPERVISOR' | 'TRAINING' | 'VILLA_AUDIT' | 'MANAGEMENT'>('AUDIT');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [selectedLog, setSelectedLog] = useState<{ type: 'AUDIT' | 'TRAINING' | 'VILLA_AUDIT', data: any } | null>(null);
  
  // Modal Visibility States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddSquadModal, setShowAddSquadModal] = useState(false);
  const [showAllocateTrainingModal, setShowAllocateTrainingModal] = useState(false);
  const [showAllocateVillaAuditModal, setShowAllocateVillaAuditModal] = useState(false);
  
  const [editUserTarget, setEditUserTarget] = useState<User | null>(null);
  const [editVendorTarget, setEditVendorTarget] = useState<Vendor | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'USER' | 'SQUAD' | 'VENDOR' | 'RULE', name: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');

  // Form Field States
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>(UserRole.SUPERVISOR);
  const [formAssignedSquads, setFormAssignedSquads] = useState<string[]>([]);
  const [formSquadId, setFormSquadId] = useState('');
  const [formVendorType, setFormVendorType] = useState('');
  const [formTeams, setFormTeams] = useState<number>(1);
  const [newSquadName, setNewSquadName] = useState('');
  const [newSquadCity, setNewSquadCity] = useState('');

  // Allocation Field States
  const [allocTrainingName, setAllocTrainingName] = useState('');
  const [allocSquadId, setAllocSquadId] = useState('');
  const [allocSupervisorId, setAllocSupervisorId] = useState('');
  const [allocDate, setAllocDate] = useState('');

  const [vPropName, setVPropName] = useState('');
  const [vAkaName, setVAkaName] = useState('');
  const [vSquadId, setVSquadId] = useState('');
  const [vVistaShare, setVVistaShare] = useState('');
  const [vOwnerShare, setVOwnerShare] = useState('');
  const [vPocName, setVPocName] = useState('');
  const [vPocContact, setVPocContact] = useState('');
  const [vSupervisorId, setVSupervisorId] = useState('');

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fieldUsers = useMemo(() => {
    return users.filter(u => u.role === UserRole.SUPERVISOR || u.role === UserRole.MANAGER);
  }, [users]);

  const performanceData = useMemo(() => {
    const monthlyAudits = audits.filter(a => {
      const d = new Date(a.datetime);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const monthlyTrainings = trainings.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const completedTrainings = monthlyTrainings.filter(t => t.status === 'COMPLETED');
    const trainingCompRate = monthlyTrainings.length > 0 ? Math.round((completedTrainings.length / monthlyTrainings.length) * 100) : 0;

    const avgCompliance = monthlyAudits.length > 0 
      ? Math.round(monthlyAudits.reduce((acc, curr) => acc + curr.complianceScore, 0) / monthlyAudits.length) 
      : 0;

    const dailyTrend = Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      count: monthlyAudits.filter(a => new Date(a.datetime).getDate() === i + 1).length
    }));

    const leadStats = fieldUsers.map(s => {
      const sAudits = monthlyAudits.filter(a => a.supervisorId === s.id);
      const sTrainings = monthlyTrainings.filter(t => t.supervisorId === s.id);
      const sCompTrainings = sTrainings.filter(t => t.status === 'COMPLETED');
      return {
        id: s.id,
        name: s.name,
        role: s.role,
        auditsCount: sAudits.length,
        avgScore: sAudits.length > 0 ? Math.round(sAudits.reduce((acc, curr) => acc + curr.complianceScore, 0) / sAudits.length) : 0,
        completionRate: sTrainings.length > 0 ? Math.round((sCompTrainings.length / sTrainings.length) * 100) : 0
      };
    }).sort((a, b) => b.auditsCount - a.auditsCount);

    return { auditsCount: monthlyAudits.length, avgCompliance, trainingCompRate, dailyTrend, leadStats };
  }, [audits, trainings, allocations, vendors, fieldUsers, selectedMonth, selectedYear]);

  const chartData = useMemo(() => {
    return properties.map(p => {
      const propertyAudits = audits.filter(a => a.propertyId === p.id);
      const avg = propertyAudits.length > 0 ? Math.round(propertyAudits.reduce((acc, curr) => acc + curr.complianceScore, 0) / propertyAudits.length) : 0;
      return { name: p.name, score: avg };
    });
  }, [audits, properties]);

  const handleAiInsight = async () => { 
    setIsGeneratingAi(true); 
    try { 
      const result = await getAuditAIInsights(audits); 
      setAiInsight(result || "No data for analysis."); 
    } catch (e) { 
      setAiInsight("AI currently unavailable."); 
    } finally { 
      setIsGeneratingAi(false); 
    } 
  };
  
  const resetForms = () => { 
    setFormName(''); setFormEmail(''); setFormPhone(''); setFormRole(UserRole.SUPERVISOR); setFormAssignedSquads([]); 
    setFormSquadId(''); setFormVendorType(''); setFormTeams(1); 
    setNewSquadName(''); setNewSquadCity('');
    setAllocTrainingName(''); setAllocSquadId(''); setAllocDate(''); setAllocSupervisorId('');
    setVPropName(''); setVAkaName(''); setVSquadId(''); setVVistaShare(''); setVOwnerShare(''); setVPocName(''); setVPocContact(''); setVSupervisorId('');
  };

  const handleAllocateTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocTrainingName || !allocSquadId || !allocSupervisorId || !allocDate) {
      alert("Please fill all mandatory training fields.");
      return;
    }
    onAddTraining({ 
      id: `train_${Date.now()}`, 
      squadId: allocSquadId, 
      supervisorId: allocSupervisorId, 
      trainingName: allocTrainingName, 
      attendees: '', 
      date: new Date(allocDate).toISOString(), 
      photos: [], 
      status: 'PENDING' 
    });
    setSuccessMessage("Training Allocated Successfully!"); 
    setShowAllocateTrainingModal(false); 
    resetForms();
  };

  const handleAllocateVillaAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vPropName || !vSquadId || !vSupervisorId) {
      alert("Property Name, Squad and Supervisor are required.");
      return;
    }
    onAddVillaAudit({ 
      id: `v_aud_${Date.now()}`, 
      propertyName: vPropName, 
      akaName: vAkaName, 
      squadId: vSquadId, 
      vistaShare: vVistaShare, 
      ownerShare: vOwnerShare, 
      pocName: vPocName, 
      pocContact: vPocContact, 
      supervisorId: vSupervisorId, 
      status: 'PENDING', 
      dateAssigned: new Date().toISOString() 
    });
    setSuccessMessage("Villa Audit Allocated!"); 
    setShowAllocateVillaAuditModal(false); 
    resetForms();
  };

  const startEditUser = (u: User) => { 
    setEditUserTarget(u); 
    setFormName(u.name); 
    setFormPhone(u.phone); 
    setFormRole(u.role); 
    setFormAssignedSquads(u.assignedSquadIds || []); 
    setShowAddUserModal(true); 
  };

  const startEditVendor = (v: Vendor) => { 
    setEditVendorTarget(v); 
    setFormName(v.name); 
    setFormEmail(v.email); 
    setFormSquadId(v.squadId); 
    setFormVendorType(v.vendorType); 
    setFormTeams(v.numberOfTeams); 
    setShowAddVendorModal(true); 
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({ id: `u_${Date.now()}`, name: formName, phone: formPhone, role: formRole, assignedSquadIds: formAssignedSquads });
    setSuccessMessage(`${formName} added!`); 
    resetForms(); 
    setShowAddUserModal(false);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editUserTarget) {
      onEditUser({ ...editUserTarget, name: formName, phone: formPhone, role: formRole, assignedSquadIds: formAssignedSquads });
      setSuccessMessage(`${formName} updated!`); 
      resetForms(); 
      setEditUserTarget(null); 
      setShowAddUserModal(false);
    }
  };

  const handleAddVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddVendor(formName, formEmail, formSquadId, formVendorType, formTeams);
    setSuccessMessage(`${formName} created!`); 
    resetForms(); 
    setShowAddVendorModal(false);
  };

  const handleEditVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editVendorTarget) {
      onEditVendor({ ...editVendorTarget, name: formName, email: formEmail, squadId: formSquadId, vendorType: formVendorType, numberOfTeams: formTeams });
      setSuccessMessage(`${formName} updated!`); 
      resetForms(); 
      setEditVendorTarget(null); 
      setShowAddVendorModal(false);
    }
  };

  const handleAddSquadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProperty({ id: `sq_${Date.now()}`, name: newSquadName, city: newSquadCity });
    setSuccessMessage(`Squad ${newSquadName} added!`); 
    resetForms(); 
    setShowAddSquadModal(false);
  };

  const confirmDelete = () => {
    if (verifyCode !== '000000') { alert("Invalid PIN"); return; }
    if (!deleteTarget) return;
    if (deleteTarget.type === 'USER') onDeleteUser(deleteTarget.id);
    else if (deleteTarget.type === 'SQUAD') onDeleteProperty(deleteTarget.id);
    else if (deleteTarget.type === 'VENDOR') onDeleteVendor(deleteTarget.id);
    setSuccessMessage(`${deleteTarget.type} removed!`); 
    setDeleteTarget(null); 
    setVerifyCode('');
  };

  const toggleUserSquad = (id: string) => {
    setFormAssignedSquads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20 relative animate-in fade-in duration-700">
      {successMessage && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-indigo-600 text-white px-8 py-4 rounded-full shadow-2xl animate-bounce"><span className="font-bold text-sm uppercase tracking-widest">{successMessage}</span></div>}

      {/* Tabs */}
      <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit overflow-x-auto">
        <button onClick={() => setActiveTab('AUDIT')} className={`flex-shrink-0 flex items-center space-x-2 px-6 py-2.5 font-bold text-xs uppercase tracking-widest rounded-xl transition-all ${activeTab === 'AUDIT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}><ClipboardCheck size={16} /><span>Quality Audits</span></button>
        <button onClick={() => setActiveTab('SUPERVISOR')} className={`flex-shrink-0 flex items-center space-x-2 px-6 py-2.5 font-bold text-xs uppercase tracking-widest rounded-xl transition-all ${activeTab === 'SUPERVISOR' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}><Trophy size={16} /><span>Performance</span></button>
        <button onClick={() => setActiveTab('TRAINING')} className={`flex-shrink-0 flex items-center space-x-2 px-6 py-2.5 font-bold text-xs uppercase tracking-widest rounded-xl transition-all ${activeTab === 'TRAINING' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}><GraduationCap size={16} /><span>Training</span></button>
        <button onClick={() => setActiveTab('VILLA_AUDIT')} className={`flex-shrink-0 flex items-center space-x-2 px-6 py-2.5 font-bold text-xs uppercase tracking-widest rounded-xl transition-all ${activeTab === 'VILLA_AUDIT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}><Home size={16} /><span>Villa Audits</span></button>
        <button onClick={() => setActiveTab('MANAGEMENT')} className={`flex-shrink-0 flex items-center space-x-2 px-6 py-2.5 font-bold text-xs uppercase tracking-widest rounded-xl transition-all ${activeTab === 'MANAGEMENT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}><Settings2 size={16} /><span>Management</span></button>
      </div>

      {activeTab === 'AUDIT' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KpiCard title="Audits Today" value={audits.filter(a => new Date(a.datetime).toDateString() === new Date().toDateString()).length} subtext="Entries" color="indigo" />
            <KpiCard title="Avg Score" value={`${performanceData.avgCompliance}%`} subtext="Compliance" color="green" />
            <KpiCard title="Villa Tasks" value={villaAudits.filter(v => v.status === 'PENDING').length} subtext="Pending" color="amber" />
            <div className="bg-slate-900 rounded-[40px] p-6 text-white flex flex-col justify-center"><p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p><h3 className="text-2xl font-black">Operational</h3></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <h3 className="font-black text-black mb-8 uppercase tracking-widest text-sm">Squad Quality Index</h3>
              <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="score" radius={[8, 8, 0, 0]}>{chartData.map((e, i) => (<Cell key={i} fill={e.score >= 80 ? '#10b981' : '#f59e0b'} />))}</Bar></BarChart></ResponsiveContainer></div>
            </div>
            <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl overflow-hidden relative"><h3 className="text-xl font-black flex items-center mb-6"><Sparkles size={24} className="mr-3 text-indigo-400" /> Executive AI Summary</h3><button onClick={handleAiInsight} disabled={isGeneratingAi} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase shadow-xl">{isGeneratingAi ? 'Processing...' : 'Generate New Trends'}</button>{aiInsight && <div className="mt-8 text-xs text-slate-400 leading-relaxed max-h-96 overflow-y-auto custom-scrollbar" dangerouslySetInnerHTML={{ __html: aiInsight }} />}</div>
          </div>
        </div>
      )}

      {activeTab === 'SUPERVISOR' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-5">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-[20px] flex items-center justify-center shadow-lg shadow-indigo-50"><TrendingUp size={32} /></div>
              <div><h2 className="text-2xl font-black text-slate-900">Operational Analytics</h2><p className="text-sm text-slate-500 font-bold uppercase tracking-tight">Monthly Performance Review</p></div>
            </div>
            <div className="flex items-center gap-3">
              <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-xs uppercase text-black focus:ring-4 focus:ring-indigo-50 transition-all outline-none">
                {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-xs uppercase text-black focus:ring-4 focus:ring-indigo-50 transition-all outline-none">
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard title="Monthly Quality Audits" value={performanceData.auditsCount} subtext="Total" color="indigo" />
            <KpiCard title="Training Success" value={`${performanceData.trainingCompRate}%`} subtext="Completion" color="green" />
            <KpiCard title="Avg Compliance" value={`${performanceData.avgCompliance}%`} subtext="Score" color="amber" />
            <KpiCard title="Active Leads" value={fieldUsers.length} subtext="Staff" color="slate" />
          </div>
        </div>
      )}

      {activeTab === 'TRAINING' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-5">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center"><GraduationCap size={24} /></div>
              <div><h2 className="text-xl font-black text-slate-900">Training Logs</h2><p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Education tracking</p></div>
            </div>
            <button onClick={() => { resetForms(); setShowAllocateTrainingModal(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:-translate-y-0.5 transition-all"><Plus size={16} /> Allocate Training</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainings.map(t => (
              <div key={t.id} onClick={() => t.status === 'COMPLETED' && setSelectedLog({type: 'TRAINING', data: t})} className={`bg-white p-6 rounded-[32px] border border-slate-100 transition-all ${t.status === 'COMPLETED' ? 'cursor-pointer hover:shadow-xl hover:border-indigo-100' : 'opacity-70'}`}>
                <div className="flex justify-between items-start mb-4"><div className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${t.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{t.status}</div><p className="text-[9px] font-bold text-slate-400">{new Date(t.date).toLocaleDateString()}</p></div>
                <h4 className="font-black text-slate-900 mb-4">{t.trainingName}</h4>
                <div className="flex items-center gap-2"><div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500">{users.find(u => u.id === t.supervisorId)?.name.charAt(0)}</div><p className="text-[10px] font-bold text-slate-600">{users.find(u => u.id === t.supervisorId)?.name}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'VILLA_AUDIT' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-5">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center"><Home size={24} /></div>
              <div><h2 className="text-xl font-black text-slate-900">Villa Audit Directory</h2><p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Property setup checks</p></div>
            </div>
            <button onClick={() => { resetForms(); setShowAllocateVillaAuditModal(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:-translate-y-0.5 transition-all"><Plus size={16} /> New Villa Audit</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {villaAudits.map(v => (
              <div key={v.id} onClick={() => setSelectedLog({type: 'VILLA_AUDIT', data: v})} className={`bg-white p-6 rounded-[32px] border border-slate-100 transition-all cursor-pointer hover:shadow-xl hover:border-indigo-100 ${v.status === 'PENDING' ? 'opacity-90 border-amber-100' : ''}`}>
                <div className="flex justify-between items-start mb-4"><div className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${v.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{v.status}</div><p className="text-[9px] font-bold text-slate-400">{new Date(v.dateAssigned).toLocaleDateString()}</p></div>
                <h4 className="font-black text-slate-900">{v.propertyName}</h4>
                <p className="text-xs text-slate-400 font-bold mb-4">AKA: {v.akaName || '-'}</p>
                <div className="flex items-center gap-2"><div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500">{users.find(u => u.id === v.supervisorId)?.name.charAt(0)}</div><p className="text-[10px] font-bold text-slate-600">{users.find(u => u.id === v.supervisorId)?.name}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'MANAGEMENT' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-6">
          <div className="space-y-8">
             <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between"><div><h2 className="text-xl font-black flex items-center"><UsersIcon className="mr-3 text-indigo-500" /> Field Directory</h2><p className="text-xs text-slate-500 font-medium">Manage accounts</p></div><button onClick={() => { resetForms(); setShowAddUserModal(true); }} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><UserPlus size={20} /></button></div>
                <div className="grid gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">{users.map(u => (<div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">{u.name.charAt(0)}</div><div><p className="font-black text-black text-sm">{u.name}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{u.role}</p></div></div><div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => startEditUser(u)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button><button disabled={u.id === user.id} onClick={() => setDeleteTarget({ id: u.id, type: 'USER', name: u.name })} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></div></div>))}</div>
             </div>
             <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between"><div><h2 className="text-xl font-black flex items-center"><Utensils className="mr-3 text-indigo-500" /> Vendor Registry</h2><p className="text-xs text-slate-500 font-medium">Chef partners</p></div><button onClick={() => { resetForms(); setShowAddVendorModal(true); }} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Plus size={20} /></button></div>
                <div className="grid gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">{vendors.map(v => (<div key={v.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center"><Utensils size={18} /></div><div><p className="font-black text-black text-sm">{v.name}</p><p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tight">{v.vendorType}</p></div></div><div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => startEditVendor(v)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button><button onClick={() => setDeleteTarget({ id: v.id, type: 'VENDOR', name: v.name })} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button></div></div>))}</div>
             </div>
          </div>
          <div className="space-y-8">
             <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between"><div><h2 className="text-xl font-black flex items-center"><MapIcon className="mr-3 text-indigo-500" /> Squad Directory</h2><p className="text-xs text-slate-500 font-medium">Clusters</p></div><button onClick={() => { resetForms(); setShowAddSquadModal(true); }} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Plus size={20} /></button></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">{properties.map(p => (<div key={p.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-start group hover:border-indigo-100 transition-all"><div><p className="font-black text-black">{p.name}</p><p className="text-[9px] font-bold text-slate-400 uppercase">{p.city}</p></div><button onClick={() => setDeleteTarget({ id: p.id, type: 'SQUAD', name: p.name })} className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button></div>))}</div>
             </div>
          </div>
        </div>
      )}

      {/* --- ALLOCATION MODALS --- */}

      {/* Allocate Training Modal */}
      {showAllocateTrainingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-8 space-y-6 shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-black flex items-center gap-3"><GraduationCap className="text-indigo-600" /> Allocate Training</h3>
              <button onClick={() => setShowAllocateTrainingModal(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            {properties.length === 0 || fieldUsers.length === 0 ? (
               <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100 text-center space-y-4">
                  <AlertTriangle className="mx-auto text-amber-500" size={48} />
                  <p className="text-sm font-black text-amber-700 uppercase">Setup Required</p>
                  <p className="text-xs text-amber-600">You must have at least one Squad and one Supervisor before allocating training.</p>
               </div>
            ) : (
            <form onSubmit={handleAllocateTraining} className="space-y-4">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Training Program Name</label><input required type="text" placeholder="Hygiene 101" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={allocTrainingName} onChange={e => setAllocTrainingName(e.target.value)} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Squad</label><select required className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={allocSquadId} onChange={e => setAllocSquadId(e.target.value)}><option value="">Select Squad</option>{properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instructor (Supervisor)</label><select required className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={allocSupervisorId} onChange={e => setAllocSupervisorId(e.target.value)}><option value="">Select Supervisor</option>{fieldUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Date</label><input required type="date" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={allocDate} onChange={e => setAllocDate(e.target.value)} /></div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase shadow-xl mt-4">Confirm Allocation</button>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Allocate Villa Audit Modal */}
      {showAllocateVillaAuditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-8 space-y-6 shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-black flex items-center gap-3"><Home className="text-indigo-600" /> New Villa Audit</h3>
              <button onClick={() => setShowAllocateVillaAuditModal(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            {properties.length === 0 || fieldUsers.length === 0 ? (
               <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100 text-center space-y-4">
                  <AlertTriangle className="mx-auto text-amber-500" size={48} />
                  <p className="text-sm font-black text-amber-700 uppercase">Setup Required</p>
                  <p className="text-xs text-amber-600">You must have at least one Squad and one Supervisor before allocating audits.</p>
               </div>
            ) : (
            <form onSubmit={handleAllocateVillaAudit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Property Name</label><input required type="text" placeholder="Villa Horizon" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={vPropName} onChange={e => setVPropName(e.target.value)} /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AKA Name</label><input type="text" placeholder="The Cliff House" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={vAkaName} onChange={e => setVAkaName(e.target.value)} /></div>
              </div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Squad</label><select required className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={vSquadId} onChange={e => setVSquadId(e.target.value)}><option value="">Select Squad</option>{properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vista Share</label><input type="text" placeholder="60%" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={vVistaShare} onChange={e => setVVistaShare(e.target.value)} /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Owner Share</label><input type="text" placeholder="40%" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={vOwnerShare} onChange={e => setVOwnerShare(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">POC Name</label><input type="text" placeholder="Rohit" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={vPocName} onChange={e => setVPocName(e.target.value)} /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">POC Contact</label><input type="tel" placeholder="+91" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={vPocContact} onChange={e => setVPocContact(e.target.value)} /></div>
              </div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Supervisor</label><select required className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={vSupervisorId} onChange={e => setVSupervisorId(e.target.value)}><option value="">Select Supervisor</option>{fieldUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase shadow-xl mt-4">Confirm Allocation</button>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Villa Detail Modal */}
      {selectedLog && selectedLog.type === 'VILLA_AUDIT' && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[400] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[60px] overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                 <div className="space-y-3">
                    <div className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">VILLA_AUDIT DETAILS</div>
                    <h3 className="text-4xl font-black text-slate-900 leading-none">{selectedLog.data.propertyName}</h3>
                 </div>
                 <button onClick={() => setSelectedLog(null)} className="p-5 bg-slate-50 text-slate-400 rounded-3xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"><X size={28} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                 <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                    <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Supervisor</p>
                      <p className="text-lg font-black text-slate-900">{users.find(u => u.id === selectedLog.data.supervisorId)?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
                      <p className={`text-lg font-black uppercase ${selectedLog.data.status === 'COMPLETED' ? 'text-green-600' : 'text-amber-500'}`}>{selectedLog.data.status}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Date {selectedLog.data.status === 'COMPLETED' ? 'Completed' : 'Assigned'}</p>
                      <p className="text-lg font-black text-slate-900">{new Date(selectedLog.data.completionDate || selectedLog.data.dateAssigned).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Type</p>
                      <p className="text-lg font-black text-slate-900">{selectedLog.data.serviceType || 'Pending Setup'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Inventory File</p>
                      {selectedLog.data.inventoryFileUrl ? (
                        <div className="flex flex-col space-y-2">
                          <p className="text-lg font-black text-slate-900 truncate" title={selectedLog.data.inventoryFileName}>{selectedLog.data.inventoryFileName}</p>
                          <div className="flex items-center gap-3">
                             <a href={selectedLog.data.inventoryFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-all">
                               <Eye size={16} /> View PDF
                             </a>
                             <a href={selectedLog.data.inventoryFileUrl} download={selectedLog.data.inventoryFileName} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all">
                               <Download size={16} /> Download
                             </a>
                          </div>
                        </div>
                      ) : (
                        <p className="text-lg font-black text-slate-400 italic">No File Uploaded Yet</p>
                      )}
                    </div>
                 </div>

                 {selectedLog.data.status === 'COMPLETED' && (
                 <div className="space-y-6 pt-4 border-t border-slate-100">
                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Kitchen Proof</h5>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar-horizontal">
                       {selectedLog.data.kitchenPhotos?.map((url: string, i: number) => (
                         <div key={i} className="flex-shrink-0 w-64 h-64 rounded-[40px] overflow-hidden border-4 border-white shadow-xl">
                           <img src={url} className="w-full h-full object-cover" alt="Proof" />
                         </div>
                       ))}
                       {(!selectedLog.data.kitchenPhotos || selectedLog.data.kitchenPhotos.length === 0) && (
                         <div className="w-full py-12 text-center bg-slate-50 rounded-3xl text-slate-400 font-bold italic">No Photos Available</div>
                       )}
                    </div>
                 </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Other Modals (Add User, Vendor, Squad, Delete) */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 space-y-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-black flex items-center gap-3">{editUserTarget ? <Edit2 /> : <UserPlus />} Staff Account</h3>
            <form onSubmit={editUserTarget ? handleEditUserSubmit : handleAddUserSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label><input required type="text" placeholder="Rahul Sharma" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={formName} onChange={e => setFormName(e.target.value)} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label><input required type="tel" placeholder="+91 00000 00000" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={formPhone} onChange={e => setFormPhone(e.target.value)} /></div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                <div className="grid grid-cols-3 gap-2">{[UserRole.SUPERVISOR, UserRole.MANAGER, UserRole.ADMIN].map(role => (<button key={role} type="button" onClick={() => setFormRole(role)} className={`py-3 rounded-2xl text-[10px] font-black uppercase border transition-all ${formRole === role ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{role}</button>))}</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Squad Access</label>
                <div className="grid grid-cols-1 gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 max-h-48 overflow-y-auto custom-scrollbar">
                  {properties.map(p => { const isSelected = formAssignedSquads.includes(p.id); return (<button key={p.id} type="button" onClick={() => toggleUserSquad(p.id)} className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-100'}`}><span>{p.name}</span>{isSelected && <Check size={14} />}</button>); })}
                </div>
              </div>
              <div className="pt-2 flex flex-col gap-2"><button type="submit" disabled={!formName || !formPhone} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase shadow-xl disabled:opacity-30 transition-all">Save Profile</button><button type="button" onClick={() => { setShowAddUserModal(false); setEditUserTarget(null); resetForms(); }} className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase">Cancel</button></div>
            </form>
          </div>
        </div>
      )}

      {showAddVendorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 space-y-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-black flex items-center gap-3">{editVendorTarget ? <Edit2 /> : <Plus />} Vendor Partner</h3>
            <form onSubmit={editVendorTarget ? handleEditVendorSubmit : handleAddVendorSubmit} className="space-y-5">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label><input required type="text" placeholder="Master Chef" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={formName} onChange={e => setFormName(e.target.value)} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label><input required type="email" placeholder="vendor@example.com" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={formEmail} onChange={e => setFormEmail(e.target.value)} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Squad</label><select required className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={formSquadId} onChange={e => setFormSquadId(e.target.value)}><option value="">Select Squad</option>{properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label><select className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={formVendorType} onChange={e => setFormVendorType(e.target.value)}><option value="">Select</option>{VENDOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teams</label><input type="number" min="1" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={formTeams} onChange={e => setFormTeams(parseInt(e.target.value) || 1)} /></div>
              </div>
              <button type="submit" disabled={!formName || !formEmail || !formSquadId} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase shadow-xl disabled:opacity-30">Save Partner</button>
            </form>
          </div>
        </div>
      )}

      {showAddSquadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 space-y-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-black flex items-center gap-3"><MapIcon className="text-indigo-600" /> New Squad</h3>
            <form onSubmit={handleAddSquadSubmit} className="space-y-5">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label><input required type="text" placeholder="Lonavala Cluster" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={newSquadName} onChange={e => setNewSquadName(e.target.value)} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City/Region</label><input required type="text" placeholder="Maharashtra" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-100" value={newSquadCity} onChange={e => setNewSquadCity(e.target.value)} /></div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase shadow-xl">Save Squad</button>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-lg z-[300] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 space-y-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center animate-pulse"><ShieldAlert size={40} /></div>
              <div><h3 className="text-2xl font-black text-black">Confirm Delete</h3><p className="text-sm text-slate-500">Permanently remove <span className="font-black text-red-600">{deleteTarget.name}</span>?</p></div>
            </div>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Enter Admin PIN (000000)</label>
                <input type="password" maxLength={6} placeholder="••••••" className="w-full p-5 border-2 border-slate-100 rounded-3xl text-center text-3xl font-black tracking-widest outline-none bg-slate-50 focus:border-red-500 text-black" value={verifyCode} onChange={e => setVerifyCode(e.target.value)} />
              </div>
              <button onClick={confirmDelete} disabled={verifyCode !== '000000'} className="w-full bg-red-600 text-white py-5 rounded-3xl font-black uppercase shadow-2xl disabled:opacity-20 transition-all">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const KpiCard = ({ title, value, subtext, color }: { title: string, value: string | number, subtext: string, color: 'indigo' | 'slate' | 'green' | 'amber' | 'red' }) => {
  const colors = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600 shadow-indigo-50/50',
    slate: 'bg-slate-50 border-slate-100 text-slate-600 shadow-slate-50/50',
    green: 'bg-green-50 border-green-100 text-green-600 shadow-green-50/50',
    amber: 'bg-amber-50 border-amber-100 text-amber-600 shadow-amber-50/50',
    red: 'bg-red-50 border-red-100 text-red-600 shadow-red-50/50',
  };
  return (<div className={`p-8 rounded-[40px] border shadow-lg transition-all hover:-translate-y-1 group ${colors[color]}`}><p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 leading-none">{title}</p><div className="flex items-baseline gap-2"><p className="text-4xl font-black tracking-tighter text-black">{value}</p><p className="text-[10px] font-black opacity-40 uppercase text-black tracking-tight">{subtext}</p></div></div>);
};

export default AdminDashboard;
