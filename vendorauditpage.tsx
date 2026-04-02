import React, { useState, useRef } from 'react';
import { User, VendorAuditPost, ChefVillaAuditRecord, Property } from '../types';
import { Camera, Plus, Trash2, Send, ChevronLeft, Image, FileText, Clock, CheckCircle, Home, ListChecks } from 'lucide-react';
import ChefVillaAudit from './ChefVillaAudit';

interface VendorAuditPageProps {
  user: User;
  posts: VendorAuditPost[];
  onAddPost: (post: VendorAuditPost) => void;
  properties: Property[];
  chefVillaAudits: ChefVillaAuditRecord[];
  onSubmitVillaAudit: (audit: ChefVillaAuditRecord) => void;
}

const VendorAuditPage: React.FC<VendorAuditPageProps> = ({
  user, posts, onAddPost, properties, chefVillaAudits, onSubmitVillaAudit
}) => {
  const [tab, setTab] = useState<'POSTS' | 'VILLA'>('VILLA');
  const [view, setView] = useState<'feed' | 'new'>('feed');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const myPosts = posts.filter(p => p.vendorId === user.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setPhotos(prev => [...prev, ev.target!.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (index: number) => setPhotos(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = () => {
    if (!title.trim()) return alert('Please add a title');
    if (photos.length === 0) return alert('Please add at least one photo');
    setSubmitting(true);
    const post: VendorAuditPost = {
      id: `vap_${Date.now()}`,
      vendorId: user.id,
      vendorName: user.name,
      title: title.trim(),
      description: description.trim(),
      photos,
      createdAt: new Date().toISOString(),
    };
    setTimeout(() => {
      onAddPost(post);
      setTitle(''); setDescription(''); setPhotos([]);
      setSubmitting(false); setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setView('feed'); }, 1500);
    }, 600);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // ── New Post Form ──────────────────────────────────────────────────────────
  if (tab === 'POSTS' && view === 'new') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center space-x-3">
          <button onClick={() => { setView('feed'); setTitle(''); setDescription(''); setPhotos([]); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold text-slate-900">New Audit Post</h2>
            <p className="text-xs text-slate-500">Add photos and notes from your visit</p>
          </div>
        </div>

        <div className="max-w-xl mx-auto p-4 space-y-5 pb-28">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <label className="block text-sm font-semibold text-slate-700 mb-2"><FileText size={14} className="inline mr-1 text-indigo-500" />Audit Title *</label>
            <input type="text" placeholder="e.g. Kitchen Hygiene Check – Lonavala" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <label className="block text-sm font-semibold text-slate-700 mb-2"><FileText size={14} className="inline mr-1 text-indigo-500" />Notes / Observations</label>
            <textarea placeholder="Describe what you observed..." rows={4} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-400 outline-none resize-none" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <label className="block text-sm font-semibold text-slate-700 mb-3"><Camera size={14} className="inline mr-1 text-indigo-500" />Photos * ({photos.length} added)</label>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removePhoto(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex space-x-2">
              <button onClick={() => cameraInputRef.current?.click()} className="flex-1 flex items-center justify-center space-x-2 border-2 border-dashed border-indigo-300 rounded-xl py-3 text-indigo-600 text-sm font-medium hover:bg-indigo-50"><Camera size={18} /><span>Camera</span></button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center space-x-2 border-2 border-dashed border-slate-300 rounded-xl py-3 text-slate-600 text-sm font-medium hover:bg-slate-50"><Image size={18} /><span>Gallery</span></button>
            </div>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" multiple onChange={handleFileChange} />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" multiple onChange={handleFileChange} />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
          <div className="max-w-xl mx-auto">
            <button onClick={handleSubmit} disabled={submitting || submitted} className={`w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all shadow-lg ${submitted ? 'bg-green-500' : submitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}>
              {submitted ? <><CheckCircle size={18} /><span>Posted!</span></> : submitting ? <span>Posting...</span> : <><Send size={18} /><span>Submit Post</span></>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Tab bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex">
          <button
            onClick={() => setTab('VILLA')}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-bold border-b-2 transition-colors ${tab === 'VILLA' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
          >
            <Home size={16} /><span>Villa Audit</span>
          </button>
          <button
            onClick={() => setTab('POSTS')}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-bold border-b-2 transition-colors ${tab === 'POSTS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
          >
            <ListChecks size={16} /><span>Audit Posts</span>
          </button>
        </div>
      </div>

      {/* VILLA AUDIT TAB */}
      {tab === 'VILLA' && (
        <ChefVillaAudit
          user={user}
          properties={properties}
          chefVillaAudits={chefVillaAudits}
          onSubmitAudit={onSubmitVillaAudit}
        />
      )}

      {/* POSTS TAB */}
      {tab === 'POSTS' && (
        <div className="max-w-xl mx-auto p-4 space-y-4 pb-28">
          {myPosts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Camera size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No audit posts yet</p>
              <p className="text-sm mt-1">Tap the button below to create your first post</p>
            </div>
          ) : (
            myPosts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                  <h3 className="font-bold text-slate-900">{post.title}</h3>
                  <div className="flex items-center space-x-1 mt-1 text-xs text-slate-400"><Clock size={11} /><span>{formatDate(post.createdAt)}</span></div>
                </div>
                {post.photos.length > 0 && (
                  <div className={`grid gap-1 px-4 ${post.photos.length === 1 ? 'grid-cols-1' : post.photos.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {post.photos.map((photo, idx) => (
                      <div key={idx} className={`overflow-hidden rounded-lg ${post.photos.length === 1 ? 'aspect-video' : 'aspect-square'}`}>
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                {post.description && <div className="px-4 pt-3 pb-4"><p className="text-sm text-slate-600 leading-relaxed">{post.description}</p></div>}
                {!post.description && <div className="pb-2" />}
              </div>
            ))
          )}

          <div className="fixed bottom-6 right-6">
            <button onClick={() => setView('new')} className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-3.5 rounded-full shadow-xl shadow-indigo-300 hover:bg-indigo-700 font-semibold text-sm">
              <Plus size={18} /><span>New Post</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorAuditPage;
