
import React, { useState, useMemo, useEffect } from 'react';
import { User, Audit, Property, AuditResponse, Vendor, UserRole, VendorAllocation, StatusRule, Training, TrainingPhoto, VillaAudit } from '../types';
import { AUDIT_QUESTIONS } from '../constants';
import { Plus, ChevronRight, Camera, CheckCircle2, AlertCircle, MapPin, Calendar, Hash, Utensils, Users, ListChecks, CalendarClock, ChevronLeft, Edit2, X, Check, RotateCcw, Activity, GraduationCap, Image as ImageIcon, Home, FileText, UploadCloud, ThumbsUp, ThumbsDown, Phone, PieChart } from 'lucide-react';

interface Props {
  user: User;
  audits: Audit[];
  vendors: Vendor[];
  properties: Property[];
  allocations: VendorAllocation[];
  statusRules: StatusRule[];
  trainings: Training[];
  villaAudits: VillaAudit[];
  onAddAudit: (audit: Audit) => void;
  onAddAllocation: (allocation: VendorAllocation) => void;
  onRemoveAllocation: (vendorId: string, date: string) => void;
  onAddTraining: (training: Training) => void;
  onEditTraining: (training: Training) => void;
  onUpdateVillaAudit: (updated: VillaAudit) => void;
}

const SupervisorApp: React.FC<Props> = ({ 
  user, audits, vendors, properties, allocations, statusRules, trainings, villaAudits,
  onAddAudit, onAddAllocation, onRemoveAllocation, onAddTraining, onEditTraining, onUpdateVillaAudit
}) => {
  const [activeTab, setActiveTab] = useState<'AUDITS' | 'ALLOCATION' | 'TRAINING' | 'VILLA_AUDIT'>('AUDITS');
  const [view, setView] = useState<'LIST' | 'SETUP' | 'CHECKLIST' | 'REVIEW' | 'TRAINING_FORM' | 'VILLA_AUDIT_FORM'>('LIST');
  const [currentAudit, setCurrentAudit] = useState<Partial<Audit>>({});
  const [responses, setResponses] = useState<AuditResponse[]>([]);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Villa Audit Form State
  const [selectedVAudit, setSelectedVAudit] = useState<VillaAudit | null>(null);
  const [vServiceType, setVServiceType] = useState<'COOKING' | 'DELIVERY' | undefined>(undefined);
  const [vInventoryFile, setVInventoryFile] = useState<{name: string, url: string} | null>(null);
  const [vKitchenPhotos, setVKitchenPhotos] = useState<string[]>([]);

  // Training Form State
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [trainingAttendees, setTrainingAttendees] = useState('');
  const [trainingPhotos, setTrainingPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const startNewAudit = () => {
    const initialSquadId = (user.assignedSquadIds && user.assignedSquadIds.length > 0) 
      ? user.assignedSquadIds[0] 
      : '';
    setCurrentAudit({ 
      id: `aud_${Date.now()}`, 
      bookingId: '', 
      propertyId: initialSquadId, 
      supervisorId: user.id, 
      vendorName: '', 
      datetime: new Date().toISOString(), 
      status: 'DRAFT', 
      responses: [], 
      activeTeamsCount: 1 
    });
    setResponses(AUDIT_QUESTIONS.map(q => ({ questionId: q.id, answer: true })));
    setView('SETUP');
  };

  const calculateScore = (res: AuditResponse[]) => {
    if (res.length === 0) return 0;
    const yesCount = res.filter(r => r.answer).length;
    return Math.round((yesCount / res.length) * 100);
  };

  const handleResponseChange = (qId: string, answer: boolean) => {
    setResponses(prev => prev.map(r => r.questionId === qId ? { ...r, answer } : r));
  };

  const handlePhotoUpload = (qId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setResponses(prev => prev.map(r => r.questionId === qId ? { 
        ...r, 
        photoUrl: reader.result as string,
        photoMetadata: {
          timestamp: new Date().toISOString(),
          lat: location?.lat || 0,
          lng: location?.lng || 0
        }
      } : r));
    };
    reader.readAsDataURL(file);
  };

  const submitAudit = () => {
    const score = calculateScore(responses);
    onAddAudit({
      ...currentAudit as Audit,
      responses,
      complianceScore: score,
      status: 'SUBMITTED',
      lat: location?.lat || 0,
      lng: location?.lng || 0
    });
    setView('LIST');
  };

  const handleStartVAudit = (v: VillaAudit) => {
    setSelectedVAudit(v);
    setVServiceType(undefined);
    setVInventoryFile(null);
    setVKitchenPhotos([]);
    setView('VILLA_AUDIT_FORM');
  };

  const handleInventoryUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setVInventoryFile({ name: file.name, url: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const submitVillaAudit = () => {
    if (selectedVAudit && vServiceType && vInventoryFile && vKitchenPhotos.length === 3) {
      onUpdateVillaAudit({
        ...selectedVAudit,
        status: 'COMPLETED',
        serviceType: vServiceType,
        inventoryFileName: vInventoryFile.name,
        inventoryFileUrl: vInventoryFile.url,
        kitchenPhotos: vKitchenPhotos,
        completionDate: new Date().toISOString()
      });
      setView('LIST');
      setSelectedVAudit(null);
    }
  };

  const handleTrainingSubmit = () => {
    if (selectedTraining && trainingAttendees && trainingPhotos.length > 0) {
      onEditTraining({
        ...selectedTraining,
        attendees: trainingAttendees,
        status: 'COMPLETED',
        photos: trainingPhotos.map(url => ({
          url,
          timestamp: new Date().toISOString(),
          lat: location?.lat || 0,
          lng: location?.lng || 0
        }))
      });
      setView('LIST');
      setSelectedTraining(null);
    }
  };

  const availableSquads = useMemo(() => properties.filter(p => user.assignedSquadIds?.includes(p.id)), [user, properties]);
  const availableVendors = vendors.filter(v => availableSquads.some(s => s.id === v.squadId));
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAllocations = allocations.filter(a => a.date === todayStr);

  const myVillaAudits = useMemo(() => villaAudits.filter(v => v.supervisorId === user.id), [villaAudits, user]);
  const myTrainings = useMemo(() => trainings.filter(t => t.supervisorId === user.id), [trainings, user]);

  if (view === 'LIST') {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
        <div className="flex bg-slate-100 p-1.5 rounded-[20px] shadow-inner overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('AUDITS')} className={`flex-shrink-0 flex-1 px-4 py-3 rounded-xl font-bold text-[10px] uppercase flex items-center justify-center space-x-1.5 transition-all ${activeTab === 'AUDITS' ? 'bg-white text-indigo-600 shadow-sm scale-105' : 'text-slate-500'}`}><ListChecks size={14} /><span>Audits</span></button>
          <button onClick={() => setActiveTab('ALLOCATION')} className={`flex-shrink-0 flex-1 px-4 py-3 rounded-xl font-bold text-[10px] uppercase flex items-center justify-center space-x-1.5 transition-all ${activeTab === 'ALLOCATION' ? 'bg-white text-indigo-600 shadow-sm scale-105' : 'text-slate-500'}`}><CalendarClock size={14} /><span>Sync</span></button>
          <button onClick={() => setActiveTab('TRAINING')} className={`flex-shrink-0 flex-1 px-4 py-3 rounded-xl font-bold text-[10px] uppercase flex items-center justify-center space-x-1.5 transition-all ${activeTab === 'TRAINING' ? 'bg-white text-indigo-600 shadow-sm scale-105' : 'text-slate-500'}`}><GraduationCap size={14} /><span>Train</span></button>
          <button onClick={() => setActiveTab('VILLA_AUDIT')} className={`flex-shrink-0 flex-1 px-4 py-3 rounded-xl font-bold text-[10px] uppercase flex items-center justify-center space-x-1.5 transition-all ${activeTab === 'VILLA_AUDIT' ? 'bg-white text-indigo-600 shadow-sm scale-105' : 'text-slate-500'}`}><Home size={14} /><span>Villa</span></button>
        </div>

        {activeTab === 'AUDITS' && (
           <div className="space-y-6 animate-in fade-in">
             <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold text-slate-900">Quality Audits</h2>
               <button onClick={startNewAudit} className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all"><Plus size={18} /><span>New</span></button>
             </div>
             <div className="space-y-3">
               {audits.length === 0 ? (
                 <div className="py-12 text-center text-slate-400 font-medium bg-white rounded-3xl border-2 border-dashed border-slate-100">No Audits Completed</div>
               ) : audits.map(audit => (
                 <div key={audit.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group active:bg-slate-50 transition-all">
                   <div className="space-y-1">
                     <p className="font-bold text-slate-900">{properties.find(p => p.id === audit.propertyId)?.name}</p>
                     <p className="text-xs text-slate-500 font-medium">{audit.vendorName}</p>
                     <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase bg-green-50 text-green-600 border border-green-100 inline-block">{audit.complianceScore}% Score</span>
                   </div>
                   <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                 </div>
               ))}
             </div>
           </div>
        )}

        {activeTab === 'ALLOCATION' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Vendor Sync</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Today's Presence & Status</p>
            </div>
            <div className="space-y-4">
              {availableVendors.map(vendor => {
                const allocation = todaysAllocations.find(a => a.vendorId === vendor.id);
                return (
                  <div key={vendor.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">V</div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none">{vendor.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{vendor.vendorType}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${allocation ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        {allocation ? allocation.type : 'Unassigned'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {statusRules.filter(r => r.isUtilized).map(rule => (
                        <button 
                          key={rule.id}
                          onClick={() => onAddAllocation({ id: `all_${Date.now()}`, vendorId: vendor.id, squadId: vendor.squadId, supervisorId: user.id, date: todayStr, type: rule.status, timestamp: new Date().toISOString() })}
                          className={`py-3 rounded-2xl text-[9px] font-black uppercase transition-all border ${allocation?.type === rule.status ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                        >
                          {rule.status}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'TRAINING' && (
          <div className="space-y-6 animate-in fade-in">
             <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Training Sessions</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Scheduled learning tasks</p>
            </div>
            <div className="space-y-4">
              {myTrainings.filter(t => t.status === 'PENDING').length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium bg-white rounded-3xl border-2 border-dashed border-slate-100">No Pending Trainings</div>
              ) : myTrainings.filter(t => t.status === 'PENDING').map(t => (
                <div key={t.id} onClick={() => { setSelectedTraining(t); setTrainingPhotos([]); setTrainingAttendees(''); setView('TRAINING_FORM'); }} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 space-y-4 active:scale-95 transition-all">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{properties.find(p => p.id === t.squadId)?.name}</p>
                    <div className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">Required</div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{t.trainingName}</h3>
                  <button className="w-full py-3 bg-slate-900 text-white font-black text-[10px] uppercase rounded-xl">Execute Session</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'VILLA_AUDIT' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Villa Audits</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Property inspections</p>
            </div>
            <div className="space-y-4">
              {myVillaAudits.filter(v => v.status === 'PENDING').length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-sm font-medium">No pending villa audits.</div>
              ) : myVillaAudits.filter(v => v.status === 'PENDING').map(v => (
                <div key={v.id} onClick={() => handleStartVAudit(v)} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-5 group active:shadow-md transition-all">
                  <div>
                    <h3 className="font-black text-slate-900 text-xl leading-none">{v.propertyName}</h3>
                    {v.akaName && <p className="text-xs font-bold text-indigo-600 mt-2 uppercase tracking-wide flex items-center gap-1.5"><MapPin size={12}/> AKA: {v.akaName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">POC Details</p>
                       <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Users size={12}/> {v.pocName}</p>
                       <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><Phone size={12}/> {v.pocContact}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Service Share</p>
                       <div className="flex items-center gap-3">
                         <div>
                           <p className="text-[9px] font-bold text-slate-400">VISTA</p>
                           <p className="text-xs font-black text-indigo-600">{v.vistaShare || '0%'}</p>
                         </div>
                         <div className="w-[1px] h-6 bg-slate-100" />
                         <div>
                           <p className="text-[9px] font-bold text-slate-400">OWNER</p>
                           <p className="text-xs font-black text-slate-700">{v.ownerShare || '0%'}</p>
                         </div>
                       </div>
                    </div>
                  </div>

                  <button className="w-full py-4 bg-indigo-600 text-white font-black text-xs uppercase rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">Start Villa Audit</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // AUDIT SETUP VIEW
  if (view === 'SETUP') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-8 animate-in slide-in-from-right">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('LIST')} className="p-2 bg-white rounded-full text-slate-400 shadow-sm"><ChevronLeft size={20} /></button>
          <h2 className="text-2xl font-black text-slate-900">New Audit</h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setView('CHECKLIST'); }} className="bg-white p-8 rounded-[40px] shadow-xl space-y-6 border border-slate-100">
           <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Squad Location</label><select required className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-50" value={currentAudit.propertyId} onChange={e => setCurrentAudit({...currentAudit, propertyId: e.target.value})}><option value="">Select Squad</option>{availableSquads.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
           <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Booking ID</label><input required type="text" placeholder="B-12345" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-50" value={currentAudit.bookingId} onChange={e => setCurrentAudit({...currentAudit, bookingId: e.target.value})} /></div>
           <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vendor/Chef Name</label><select required className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-50" value={currentAudit.vendorName} onChange={e => setCurrentAudit({...currentAudit, vendorName: e.target.value})}><option value="">Select Vendor</option>{availableVendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}</select></div>
           <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Active Teams Count</label><input required type="number" min="1" className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-50" value={currentAudit.activeTeamsCount} onChange={e => setCurrentAudit({...currentAudit, activeTeamsCount: parseInt(e.target.value)})} /></div>
           <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-3xl shadow-xl uppercase tracking-widest text-xs">Start Checklist</button>
        </form>
      </div>
    );
  }

  // AUDIT CHECKLIST VIEW
  if (view === 'CHECKLIST') {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6 pb-24 animate-in slide-in-from-right">
        <div className="flex items-center justify-between">
           <button onClick={() => setView('SETUP')} className="p-2 text-slate-400"><ChevronLeft size={24} /></button>
           <div className="text-center"><h2 className="text-xl font-black text-slate-900">Compliance Check</h2><p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{currentAudit.vendorName}</p></div>
           <div className="w-10" />
        </div>
        <div className="space-y-4">
          {AUDIT_QUESTIONS.map((q, idx) => {
            const resp = responses.find(r => r.questionId === q.id);
            return (
              <div key={q.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-xs">{idx + 1}</div>
                  <p className="text-sm font-bold text-slate-800 leading-tight">{q.text}</p>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => handleResponseChange(q.id, true)} className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 border-2 transition-all ${resp?.answer ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-100' : 'bg-slate-50 border-slate-100 text-slate-400'}`}><ThumbsUp size={14}/> Yes</button>
                   <button onClick={() => handleResponseChange(q.id, false)} className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 border-2 transition-all ${resp?.answer === false ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-100' : 'bg-slate-50 border-slate-100 text-slate-400'}`}><ThumbsDown size={14}/> No</button>
                </div>
                <div className="flex items-center gap-4 pt-2">
                   <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-[9px] font-black text-slate-500 uppercase cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files && handlePhotoUpload(q.id, e.target.files[0])} />
                      <Camera size={14}/> {resp?.photoUrl ? 'Retake Photo' : 'Add Proof'}
                   </label>
                   {resp?.photoUrl && <div className="w-10 h-10 rounded-lg overflow-hidden border border-indigo-200"><img src={resp.photoUrl} className="w-full h-full object-cover" /></div>}
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={() => setView('REVIEW')} className="fixed bottom-6 left-4 right-4 bg-indigo-600 text-white font-black py-5 rounded-[24px] shadow-2xl uppercase tracking-widest text-xs z-50">Review Submission</button>
      </div>
    );
  }

  // AUDIT REVIEW VIEW
  if (view === 'REVIEW') {
    const score = calculateScore(responses);
    return (
      <div className="max-w-md mx-auto p-6 space-y-8 animate-in slide-in-from-right">
        <div className="flex items-center gap-4">
           <button onClick={() => setView('CHECKLIST')} className="p-2 bg-white rounded-full text-slate-400 shadow-sm"><ChevronLeft size={20} /></button>
           <h2 className="text-2xl font-black text-slate-900">Review Audit</h2>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 space-y-8">
           <div className="text-center space-y-2">
              <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center font-black text-3xl border-8 ${score >= 80 ? 'border-green-100 text-green-600' : 'border-amber-100 text-amber-600'}`}>{score}%</div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Score</p>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Squad</p><p className="text-xs font-black">{properties.find(p => p.id === currentAudit.propertyId)?.name}</p></div>
              <div className="p-4 bg-slate-50 rounded-2xl"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Vendor</p><p className="text-xs font-black">{currentAudit.vendorName}</p></div>
           </div>
           <div className="space-y-4">
              <div className="flex items-center justify-between text-[11px] font-black uppercase"><span className="text-slate-400">Total Questions</span><span className="text-slate-900">{AUDIT_QUESTIONS.length}</span></div>
              <div className="flex items-center justify-between text-[11px] font-black uppercase"><span className="text-slate-400">Passed Checks</span><span className="text-green-600">{responses.filter(r => r.answer).length}</span></div>
              <div className="flex items-center justify-between text-[11px] font-black uppercase"><span className="text-slate-400">Failed Checks</span><span className="text-red-500">{responses.filter(r => !r.answer).length}</span></div>
           </div>
           <button onClick={submitAudit} className="w-full bg-indigo-600 text-white font-black py-5 rounded-3xl shadow-xl uppercase tracking-widest text-xs">Confirm & Submit Audit</button>
        </div>
      </div>
    );
  }

  if (view === 'TRAINING_FORM' && selectedTraining) {
    return (
      <div className="max-w-md mx-auto p-4 pb-20 space-y-6 animate-in slide-in-from-right">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('LIST')} className="p-2 -ml-2 text-slate-400"><ChevronLeft size={24} /></button>
          <div className="text-center"><h2 className="text-xl font-black text-slate-900">Training Record</h2><p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{selectedTraining.trainingName}</p></div>
          <div className="w-10" />
        </div>
        <div className="bg-white rounded-[40px] shadow-2xl p-8 border border-slate-100 space-y-8">
          <div className="space-y-6">
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attendee Names</label><textarea placeholder="List staff present..." className="w-full p-4 border border-slate-200 rounded-3xl font-bold bg-slate-50 text-black outline-none focus:ring-4 focus:ring-indigo-50 min-h-[100px]" value={trainingAttendees} onChange={e => setTrainingAttendees(e.target.value)} /></div>
            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Training Proof (Photos)</label><span className="text-[10px] font-black text-indigo-600">{trainingPhotos.length} Total</span></div>
              <div className="grid grid-cols-3 gap-3">
                {trainingPhotos.map((p, idx) => (<div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-200"><img src={p} className="w-full h-full object-cover" /></div>))}
                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100"><input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => {const file = e.target.files?.[0]; if (file) {const reader = new FileReader(); reader.onloadend = () => setTrainingPhotos(prev => [...prev, reader.result as string]); reader.readAsDataURL(file);}}} /><Camera className="text-slate-300" size={24} /></label>
              </div>
            </div>
          </div>
          <button disabled={!trainingAttendees || trainingPhotos.length === 0} onClick={handleTrainingSubmit} className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-2xl disabled:opacity-20 uppercase tracking-widest text-xs">Submit Training Record</button>
        </div>
      </div>
    );
  }

  if (view === 'VILLA_AUDIT_FORM' && selectedVAudit) {
    return (
      <div className="max-w-md mx-auto p-4 pb-20 space-y-6 animate-in slide-in-from-right">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('LIST')} className="p-2 -ml-2 text-slate-400"><ChevronLeft size={24} /></button>
          <div className="text-center"><h2 className="text-xl font-black text-slate-900">Villa Sync</h2><p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{selectedVAudit.propertyName}</p></div>
          <div className="w-10" />
        </div>
        <div className="bg-white rounded-[40px] shadow-2xl p-8 border border-slate-100 space-y-8">
          <div className="space-y-6">
            <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Cooking or delivery will be done at the villa?</label><div className="grid grid-cols-2 gap-3"><button onClick={() => setVServiceType('COOKING')} className={`py-4 rounded-2xl text-[11px] font-black uppercase border-2 transition-all ${vServiceType === 'COOKING' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>Cooking</button><button onClick={() => setVServiceType('DELIVERY')} className={`py-4 rounded-2xl text-[11px] font-black uppercase border-2 transition-all ${vServiceType === 'DELIVERY' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>Delivery</button></div></div>
            <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Kitchen inventory upload (PDF)</label><label className="w-full flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 cursor-pointer hover:bg-slate-100 transition-all"><input type="file" accept=".pdf" className="hidden" onChange={e => e.target.files && handleInventoryUpload(e.target.files[0])} /><div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><FileText size={24}/></div><div className="flex-1 overflow-hidden"><p className="text-xs font-black text-slate-900 truncate">{vInventoryFile ? vInventoryFile.name : 'Choose PDF File'}</p><p className="text-[9px] font-bold text-slate-400 uppercase">Mandatory upload</p></div>{vInventoryFile && <CheckCircle2 className="text-green-500" size={20}/>}</label></div>
            <div className="space-y-3"><div className="flex justify-between items-center ml-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3. Kitchen Photos (Exactly 3)</label><span className={`text-[10px] font-black ${vKitchenPhotos.length === 3 ? 'text-green-600' : 'text-amber-500'}`}>{vKitchenPhotos.length}/3</span></div><div className="grid grid-cols-3 gap-3">{vKitchenPhotos.map((p, idx) => (<div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 relative"><img src={p} className="w-full h-full object-cover" /></div>))}{vKitchenPhotos.length < 3 && (<label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100"><input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => {const file = e.target.files?.[0]; if (file) {const reader = new FileReader(); reader.onloadend = () => setVKitchenPhotos(prev => [...prev, reader.result as string]); reader.readAsDataURL(file);}}} /><Camera className="text-slate-300" size={24} /></label>)}</div></div>
          </div>
          <button disabled={!vServiceType || !vInventoryFile || vKitchenPhotos.length !== 3} onClick={submitVillaAudit} className="w-full bg-indigo-600 text-white font-black py-5 rounded-3xl shadow-2xl disabled:opacity-20 uppercase tracking-widest text-xs">Complete Villa Audit</button>
        </div>
      </div>
    );
  }

  return null;
};

export default SupervisorApp;
