import React, { useState, useRef } from 'react';
import { User, VendorAuditPost, ChefVillaAuditRecord, Property } from '../types';
import { Camera, Plus, Trash2, Send, ChevronLeft, Image, FileText, Clock, CheckCircle, Home, ListChecks, MapPin } from 'lucide-react';
import ChefVillaAudit from './ChefVillaAudit';

interface VendorAuditPageProps {
  user: User;
  posts: VendorAuditPost[];
  onAddPost: (post: VendorAuditPost) => void;
  properties: Property[];
  chefVillaAudits: ChefVillaAuditRecord[];
  onSubmitVillaAudit: (audit: ChefVillaAuditRecord) => void;
}

// 🔥 Vendor + Location Mapping
const vendorLocations: Record<string, string> = {
  sujal: "Mumbai",
  prathamesh: "Lonavala",
  dhanesh: "Lonavala",
  kunal: "Karjat",
};

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

  const getVendorLocation = (name: string) => {
    return vendorLocations[name.toLowerCase()] || "Unknown";
  };

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
      setTitle('');
      setDescription('');
      setPhotos([]);
      setSubmitting(false);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setView('feed');
      }, 1500);
    }, 600);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  // ── New Post Form ─────────────────────────────────────────
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
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <FileText size={14} className="inline mr-1 text-indigo-500" />
              Audit Title *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2.5 rounded-lg border"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <textarea
              placeholder="Describe what you observed..."
              className="w-full px-3 py-2.5 rounded-lg border"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex space-x-2">
              <button onClick={() => cameraInputRef.current?.click()} className="flex-1 border py-3">Camera</button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 border py-3">Gallery</button>
            </div>

            <input ref={cameraInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
          </div>
        </div>

        <div className="fixed bottom-0 w-full bg-white p-4">
          <button onClick={handleSubmit} className="w-full bg-indigo-600 text-white py-3 rounded-xl">
            Submit
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN VIEW ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Tabs */}
      <div className="bg-white border-b flex">
        <button onClick={() => setTab('VILLA')} className="flex-1 py-4 font-bold">Villa Audit</button>
        <button onClick={() => setTab('POSTS')} className="flex-1 py-4 font-bold">Audit Posts</button>
      </div>

      {/* Villa */}
      {tab === 'VILLA' && (
        <ChefVillaAudit
          user={user}
          properties={properties}
          chefVillaAudits={chefVillaAudits}
          onSubmitAudit={onSubmitVillaAudit}
        />
      )}

      {/* Posts */}
      {tab === 'POSTS' && (
        <div className="max-w-xl mx-auto p-4 space-y-4 pb-28">

          {myPosts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl p-4 shadow">

              {/* 🔥 Vendor + Location */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">{post.vendorName}</h3>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin size={12} className="mr-1" />
                  {getVendorLocation(post.vendorName)}
                </div>
              </div>

              <h4 className="font-semibold">{post.title}</h4>

              <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>

              {post.description && (
                <p className="text-sm mt-2">{post.description}</p>
              )}
            </div>
          ))}

          {/* FAB */}
          <button
            onClick={() => setView('new')}
            className="fixed bottom-6 right-6 bg-indigo-600 text-white px-5 py-3 rounded-full"
          >
            + New Post
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorAuditPage;
