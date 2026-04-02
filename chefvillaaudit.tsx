import React, { useState, useRef, useEffect } from 'react';
import { User, Property, ChefVillaAuditRecord, ChefRoomAudit } from '../types';
import {
  Camera, ChevronLeft, ChevronRight, CheckCircle2, Home,
  Plus, Trash2, MapPin, Clock, Image, Send, AlertCircle,
  Utensils, Sofa, BedDouble, Bath, Wind, ChefHat, X
} from 'lucide-react';

interface Props {
  user: User;
  properties: Property[];
  chefVillaAudits: ChefVillaAuditRecord[];
  onSubmitAudit: (audit: ChefVillaAuditRecord) => void;
}

const ROOMS = [
  { id: 'kitchen',   label: 'Kitchen',      icon: Utensils,  color: 'bg-orange-100 text-orange-600',  required: true },
  { id: 'living',    label: 'Living Area',  icon: Sofa,      color: 'bg-blue-100 text-blue-600',      required: true },
  { id: 'bedroom',   label: 'Bedroom',      icon: BedDouble, color: 'bg-purple-100 text-purple-600',  required: false },
  { id: 'bathroom',  label: 'Bathroom',     icon: Bath,      color: 'bg-teal-100 text-teal-600',      required: false },
  { id: 'balcony',   label: 'Balcony/Outdoor', icon: Wind,   color: 'bg-green-100 text-green-600',    required: false },
  { id: 'other',     label: 'Other Area',   icon: Home,      color: 'bg-slate-100 text-slate-600',    required: false },
];

const AUDIT_ITEMS = {
  kitchen: ['Stove & burners clean', 'Utensils sanitized', 'Refrigerator clean', 'Countertops wiped', 'Branded ingredients present', 'Staff in uniform'],
  living:  ['Furniture dust-free', 'Floor clean', 'AC/fan working', 'Windows clean', 'Decor in place'],
  bedroom: ['Bedding fresh', 'Floor clean', 'AC working', 'Wardrobe tidy'],
  bathroom:['Tiles clean', 'Towels fresh', 'Toiletries stocked', 'Drain clear'],
  balcony: ['Floor swept', 'Furniture clean', 'No clutter'],
  other:   ['Area clean', 'No damage observed'],
};

type View = 'LIST' | 'SELECT_VILLA' | 'ROOMS' | 'ROOM_DETAIL' | 'REVIEW' | 'SUCCESS';

const ChefVillaAudit: React.FC<Props> = ({ user, properties, chefVillaAudits, onSubmitAudit }) => {
  const [view, setView] = useState<View>('LIST');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [roomAudits, setRoomAudits] = useState<ChefRoomAudit[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [overallNotes, setOverallNotes] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos =>
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      );
    }
  }, []);

  const myAudits = chefVillaAudits.filter(a => a.chefId === user.id);

  const startNewAudit = () => {
    setSelectedProperty(null);
    setRoomAudits([]);
    setOverallNotes('');
    setView('SELECT_VILLA');
  };

  const handleSelectVilla = (property: Property) => {
    setSelectedProperty(property);
    // Initialize room audits
    setRoomAudits(ROOMS.map(r => ({
      roomId: r.id,
      label: r.label,
      photos: [],
      notes: '',
      checklist: AUDIT_ITEMS[r.id as keyof typeof AUDIT_ITEMS].map(item => ({ item, checked: false })),
      completed: false,
    })));
    setView('ROOMS');
  };

  const openRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    setView('ROOM_DETAIL');
  };

  const getRoomAudit = (roomId: string) => roomAudits.find(r => r.roomId === roomId)!;

  const updateRoom = (roomId: string, updates: Partial<ChefRoomAudit>) => {
    setRoomAudits(prev => prev.map(r => r.roomId === roomId ? { ...r, ...updates } : r));
  };

  const addPhotoToRoom = (roomId: string, dataUrl: string) => {
    const room = getRoomAudit(roomId);
    updateRoom(roomId, { photos: [...room.photos, dataUrl] });
  };

  const removePhotoFromRoom = (roomId: string, idx: number) => {
    const room = getRoomAudit(roomId);
    updateRoom(roomId, { photos: room.photos.filter((_, i) => i !== idx) });
  };

  const toggleChecklistItem = (roomId: string, itemIdx: number) => {
    const room = getRoomAudit(roomId);
    const updated = room.checklist.map((c, i) => i === itemIdx ? { ...c, checked: !c.checked } : c);
    updateRoom(roomId, { checklist: updated });
  };

  const markRoomComplete = (roomId: string) => {
    const room = getRoomAudit(roomId);
    if (room.photos.length === 0) {
      alert('Please take at least 1 photo for this room before marking complete.');
      return;
    }
    updateRoom(roomId, { completed: true });
    setView('ROOMS');
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>, roomId: string) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        if (ev.target?.result) addPhotoToRoom(roomId, ev.target.result as string);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const completedRooms = roomAudits.filter(r => r.completed).length;
  const requiredRooms = ROOMS.filter(r => r.required);
  const requiredComplete = requiredRooms.every(r => roomAudits.find(ra => ra.roomId === r.id)?.completed);
  const totalPhotos = roomAudits.reduce((sum, r) => sum + r.photos.length, 0);

  const submitAudit = () => {
    if (!selectedProperty || !requiredComplete) return;
    setSubmitting(true);
    setTimeout(() => {
      const audit: ChefVillaAuditRecord = {
        id: `cva_${Date.now()}`,
        chefId: user.id,
        chefName: user.name,
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.name,
        roomAudits,
        overallNotes,
        totalPhotos,
        completedRooms,
        lat: location?.lat || 0,
        lng: location?.lng || 0,
        submittedAt: new Date().toISOString(),
        status: 'SUBMITTED',
      };
      onSubmitAudit(audit);
      setSubmitting(false);
      setView('SUCCESS');
      setTimeout(() => setView('LIST'), 2200);
    }, 700);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  // ── SUCCESS ────────────────────────────────────────────────────────────────
  if (view === 'SUCCESS') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 className="text-green-500" size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Audit Submitted!</h2>
        <p className="text-slate-500 text-sm text-center">Your villa audit has been recorded with {totalPhotos} photos.</p>
      </div>
    );
  }

  // ── LIST ───────────────────────────────────────────────────────────────────
  if (view === 'LIST') {
    return (
      <div className="max-w-md mx-auto p-4 pb-28 space-y-4">
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-xl font-black text-slate-900">Villa Audits</h2>
            <p className="text-xs text-slate-400 font-medium">Room-by-room inspection</p>
          </div>
          <button
            onClick={startNewAudit}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-indigo-200"
          >
            <Plus size={16} /><span>New</span>
          </button>
        </div>

        {myAudits.length === 0 ? (
          <div className="mt-8 text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <Home size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="font-bold text-slate-400">No villa audits yet</p>
            <p className="text-xs text-slate-300 mt-1">Tap "New" to start your first audit</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myAudits.map(audit => (
              <div key={audit.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-slate-900">{audit.propertyName}</h3>
                      <div className="flex items-center space-x-1 text-xs text-slate-400 mt-1">
                        <Clock size={11} /><span>{formatDate(audit.submittedAt)}</span>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-600 text-[10px] font-black uppercase px-2 py-1 rounded-full">
                      Submitted
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-slate-50">
                    <div className="text-center">
                      <p className="text-lg font-black text-indigo-600">{audit.completedRooms}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Rooms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-indigo-600">{audit.totalPhotos}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Photos</p>
                    </div>
                    {audit.lat !== 0 && (
                      <div className="flex items-center text-xs text-slate-400">
                        <MapPin size={11} className="mr-1" />
                        <span>Location tagged</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Photo strip */}
                {audit.totalPhotos > 0 && (
                  <div className="flex space-x-1 px-4 pb-4 overflow-x-auto">
                    {audit.roomAudits.flatMap(r => r.photos).slice(0, 6).map((photo, idx) => (
                      <div key={idx} className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-slate-100">
                        <img src={photo} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                    {audit.totalPhotos > 6 && (
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
                        <span className="text-xs font-black text-slate-400">+{audit.totalPhotos - 6}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── SELECT VILLA ───────────────────────────────────────────────────────────
  if (view === 'SELECT_VILLA') {
    return (
      <div className="max-w-md mx-auto p-4 pb-10 space-y-4">
        <div className="flex items-center space-x-3 pt-2">
          <button onClick={() => setView('LIST')} className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900">Select Villa</h2>
            <p className="text-xs text-slate-400">Which property are you auditing?</p>
          </div>
        </div>

        <div className="space-y-3">
          {properties.map(p => (
            <button
              key={p.id}
              onClick={() => handleSelectVilla(p)}
              className="w-full flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:bg-indigo-50 active:scale-95 transition-all text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Home className="text-indigo-600" size={22} />
                </div>
                <div>
                  <p className="font-black text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.city}</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300" size={20} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── ROOMS OVERVIEW ─────────────────────────────────────────────────────────
  if (view === 'ROOMS') {
    return (
      <div className="max-w-md mx-auto p-4 pb-28 space-y-4">
        <div className="flex items-center space-x-3 pt-2">
          <button onClick={() => setView('SELECT_VILLA')} className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-black text-slate-900">{selectedProperty?.name}</h2>
            <p className="text-xs text-slate-400">{completedRooms} of {ROOMS.length} rooms done · {totalPhotos} photos</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
            <span>Progress</span>
            <span className="text-indigo-600">{Math.round((completedRooms / ROOMS.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedRooms / ROOMS.length) * 100}%` }}
            />
          </div>
          {!requiredComplete && (
            <p className="text-[10px] text-amber-600 font-bold mt-2 flex items-center gap-1">
              <AlertCircle size={11} /> Kitchen & Living Area are required
            </p>
          )}
        </div>

        {/* Room cards */}
        <div className="grid grid-cols-2 gap-3">
          {ROOMS.map(room => {
            const ra = getRoomAudit(room.id);
            const Icon = room.icon;
            return (
              <button
                key={room.id}
                onClick={() => openRoom(room.id)}
                className={`relative flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                  ra.completed
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                {room.required && !ra.completed && (
                  <span className="absolute top-2 right-2 text-[8px] font-black text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full uppercase">Required</span>
                )}
                {ra.completed && (
                  <CheckCircle2 className="absolute top-2 right-2 text-white opacity-80" size={16} />
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${ra.completed ? 'bg-white/20' : room.color}`}>
                  <Icon size={20} className={ra.completed ? 'text-white' : ''} />
                </div>
                <p className={`font-black text-sm ${ra.completed ? 'text-white' : 'text-slate-800'}`}>{room.label}</p>
                <p className={`text-[10px] mt-0.5 font-bold ${ra.completed ? 'text-white/70' : 'text-slate-400'}`}>
                  {ra.photos.length} photo{ra.photos.length !== 1 ? 's' : ''}
                </p>
              </button>
            );
          })}
        </div>

        {/* Overall notes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Overall Notes (optional)</label>
          <textarea
            placeholder="Any general observations about the villa..."
            rows={3}
            className="w-full text-sm text-slate-700 outline-none resize-none placeholder-slate-300"
            value={overallNotes}
            onChange={e => setOverallNotes(e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4">
          <div className="max-w-md mx-auto">
            <button
              onClick={submitAudit}
              disabled={!requiredComplete || submitting}
              className={`w-full flex items-center justify-center space-x-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                requiredComplete
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700'
                  : 'bg-slate-100 text-slate-300'
              }`}
            >
              <Send size={16} />
              <span>{submitting ? 'Submitting...' : `Submit Audit · ${totalPhotos} Photos`}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ROOM DETAIL ────────────────────────────────────────────────────────────
  if (view === 'ROOM_DETAIL' && activeRoomId) {
    const room = ROOMS.find(r => r.id === activeRoomId)!;
    const ra = getRoomAudit(activeRoomId);
    const Icon = room.icon;

    return (
      <div className="max-w-md mx-auto pb-28">
        {/* Header */}
        <div className={`px-4 pt-4 pb-6 ${room.color.split(' ')[0]}`}>
          <div className="flex items-center space-x-3 mb-4">
            <button onClick={() => setView('ROOMS')} className="p-2 bg-white/60 rounded-xl text-slate-600">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <Icon size={20} />
              <h2 className="text-xl font-black text-slate-900">{room.label}</h2>
            </div>
          </div>
          <p className="text-xs font-bold text-slate-600">{ra.photos.length} photo{ra.photos.length !== 1 ? 's' : ''} taken</p>
        </div>

        <div className="p-4 space-y-5">
          {/* Camera Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200"
            >
              <Camera size={18} /><span>Take Photo</span>
            </button>
            <button
              onClick={() => galleryRef.current?.click()}
              className="flex-1 flex items-center justify-center space-x-2 bg-slate-100 text-slate-600 py-3.5 rounded-2xl font-bold text-sm"
            >
              <Image size={18} /><span>Gallery</span>
            </button>
          </div>

          {/* Hidden inputs */}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" multiple onChange={e => handlePhotoCapture(e, activeRoomId)} />
          <input ref={galleryRef} type="file" accept="image/*" className="hidden" multiple onChange={e => handlePhotoCapture(e, activeRoomId)} />

          {/* Photos grid */}
          {ra.photos.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Photos</p>
              <div className="grid grid-cols-3 gap-2">
                {ra.photos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group">
                    <img src={photo} className="w-full h-full object-cover" alt="" />
                    <button
                      onClick={() => removePhotoFromRoom(activeRoomId, idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checklist */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Checklist</p>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
              {ra.checklist.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleChecklistItem(activeRoomId, idx)}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 text-left active:bg-slate-50 transition-colors"
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    item.checked ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'
                  }`}>
                    {item.checked && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <span className={`text-sm font-medium ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {item.item}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes for room */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Room Notes</p>
            <textarea
              placeholder={`Observations about the ${room.label.toLowerCase()}...`}
              rows={3}
              className="w-full text-sm text-slate-700 outline-none resize-none placeholder-slate-300"
              value={ra.notes}
              onChange={e => updateRoom(activeRoomId, { notes: e.target.value })}
            />
          </div>
        </div>

        {/* Fixed bottom: Done button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => markRoomComplete(activeRoomId)}
              disabled={ra.photos.length === 0}
              className={`w-full flex items-center justify-center space-x-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                ra.photos.length > 0
                  ? 'bg-slate-900 text-white shadow-lg hover:bg-slate-800'
                  : 'bg-slate-100 text-slate-300'
              }`}
            >
              <CheckCircle2 size={16} />
              <span>{ra.photos.length === 0 ? 'Take at least 1 photo' : 'Mark Room Complete'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ChefVillaAudit;
