import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, FileText, Image as ImageIcon, Upload, Trash2, Edit2, Download, Plus, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';

interface PdfFile {
  name: string;
  url: string;
}

interface AcademicCertificate {
  _id: string;
  title: string;
  category: string;
  images: string[];
  pdfs: PdfFile[];
  createdAt: string;
}

const CATEGORIES = ['Class 10', 'Class 12', 'Engineering', 'Custom'];

export function AcademicCertificatesView() {
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultPassword, setVaultPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const [certificates, setCertificates] = useState<AcademicCertificate[]>([]);
  const [activeTab, setActiveTab] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<AcademicCertificate | null>(null);
  const [formData, setFormData] = useState({ title: '', category: CATEGORIES[0] });
  const [customCategory, setCustomCategory] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedPdfs, setSelectedPdfs] = useState<File[]>([]);
  const [retainedImages, setRetainedImages] = useState<string[]>([]);
  const [retainedPdfs, setRetainedPdfs] = useState<PdfFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/academic-certificates', {
        credentials: 'include',
        headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' }
      });
      if (res.ok) setCertificates(await res.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError('');
    setIsUnlocking(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/vault/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': sessionStorage.getItem('csrfToken') || ''
        },
        body: JSON.stringify({ password: vaultPassword }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsVaultUnlocked(true);
        fetchCerts();
      } else {
        setUnlockError(data.error || 'Incorrect password');
      }
    } catch (err) {
      setUnlockError('Server error');
    }
    setIsUnlocking(false);
  };

  const openModal = (cert: AcademicCertificate | null = null) => {
    setEditingCert(cert);
    if (cert) {
      const isDefault = CATEGORIES.includes(cert.category) && cert.category !== 'Custom';
      setFormData({ title: cert.title, category: isDefault ? cert.category : 'Custom' });
      setCustomCategory(isDefault ? '' : cert.category);
      setRetainedImages(cert.images || []);
      setRetainedPdfs(cert.pdfs || []);
    } else {
      const isDefault = CATEGORIES.includes(activeTab) && activeTab !== 'Custom';
      setFormData({ title: '', category: isDefault ? activeTab : 'Custom' });
      setCustomCategory(isDefault ? '' : activeTab);
      setRetainedImages([]);
      setRetainedPdfs([]);
    }
    setSelectedImages([]);
    setSelectedPdfs([]);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData();
    fd.append('title', formData.title);

    const finalCategory = formData.category === 'Custom' ? customCategory : formData.category;
    fd.append('category', finalCategory);

    retainedImages.forEach(img => fd.append('retainedImages', img));
    fd.append('retainedPdfs', JSON.stringify(retainedPdfs));

    selectedImages.forEach(file => fd.append('images', file));
    selectedPdfs.forEach(file => fd.append('pdfs', file));

    try {
      const url = editingCert
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/academic-certificates/${editingCert._id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/academic-certificates`;

      const res = await fetch(url, {
        method: editingCert ? 'PUT' : 'POST',
        body: fd,
        credentials: 'include',
        headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' }
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchCerts();
      }
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/academic-certificates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' }
      });
      fetchCerts();
    } catch (err) {
      console.error(err);
    }
  };

  const removeRetainedImage = (idx: number) => {
    setRetainedImages(prev => prev.filter((_, i) => i !== idx));
  };
  const removeRetainedPdf = (idx: number) => {
    setRetainedPdfs(prev => prev.filter((_, i) => i !== idx));
  };
  const removeSelectedImage = (idx: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== idx));
  };
  const removeSelectedPdf = (idx: number) => {
    setSelectedPdfs(prev => prev.filter((_, i) => i !== idx));
  };

  if (!isVaultUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-admin-card border border-admin-border rounded-2xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
          <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Secure Vault</h2>
          <p className="text-admin-text-secondary mb-8 text-sm">
            This section is under development. please contact admin to get access.
          </p>
          <form onSubmit={handleUnlock} className="space-y-4 text-left">
            <div>
              <input
                type="password"
                value={vaultPassword}
                onChange={e => setVaultPassword(e.target.value)}
                placeholder="Vault Password"
                className="w-full bg-admin-surface border border-admin-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>
            {unlockError && <p className="text-red-500 text-sm">{unlockError}</p>}
            <button
              type="submit"
              disabled={isUnlocking}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUnlocking ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Unlock Vault'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredCerts = certificates.filter(c => c.category === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lock className="h-6 w-6 text-red-500" />
            Academic Vault
          </h2>
          <p className="text-admin-text-secondary mt-1">Manage private academic certificates and transcripts.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-admin-primary hover:bg-admin-primary/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-lg shadow-admin-primary/20"
        >
          <Plus className="h-5 w-5" /> Add Certificate
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from(new Set([...CATEGORIES.filter(c => c !== 'Custom'), ...certificates.map(c => c.category)])).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === cat
                ? 'bg-admin-surface border border-admin-border text-white shadow-md'
                : 'text-admin-text-secondary hover:text-white hover:bg-admin-surface/50'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-primary border-t-transparent" /></div>
      ) : filteredCerts.length === 0 ? (
        <div className="text-center py-20 bg-admin-card rounded-2xl border border-admin-border">
          <FileText className="h-12 w-12 text-admin-text-secondary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white mb-2">No certificates found</h3>
          <p className="text-admin-text-secondary">Click 'Add Certificate' to upload records for {activeTab}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCerts.map((cert) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={cert._id}
              className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden group hover:border-admin-primary/50 transition-colors"
            >
              {cert.images.length > 0 ? (
                <div className="relative h-48 bg-admin-surface overflow-hidden">
                  <img
                    src={(import.meta.env.VITE_API_URL || 'http://localhost:5001') + cert.images[0]}
                    alt={cert.title}
                    className="w-full h-full object-cover"
                  />
                  {cert.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-xs text-white font-medium flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" /> +{cert.images.length - 1}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => setPreviewImage(cert.images[0])} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors" title="Preview">
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-admin-surface flex items-center justify-center border-b border-admin-border">
                  <FileText className="h-12 w-12 text-admin-border" />
                </div>
              )}

              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-2">{cert.title}</h3>

                {cert.pdfs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs font-semibold text-admin-text-secondary uppercase tracking-wider">PDF Documents</h4>
                    {cert.pdfs.map((pdf, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-admin-surface border border-admin-border">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-4 w-4 text-red-400 shrink-0" />
                          <span className="text-sm text-admin-text truncate" title={pdf.name}>{pdf.name}</span>
                        </div>
                        <a
                          href={(import.meta.env.VITE_API_URL || 'http://localhost:5001') + pdf.url}
                          target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-admin-text-secondary hover:text-white hover:bg-admin-card rounded-md transition-colors shrink-0"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => openModal(cert)}
                    className="flex-1 py-2 bg-admin-surface text-white rounded-lg text-sm font-medium hover:bg-admin-border transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cert._id)}
                    className="flex-1 py-2 bg-admin-danger/10 text-admin-danger rounded-lg text-sm font-medium hover:bg-admin-danger hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-admin-card rounded-2xl border border-admin-border p-6 shadow-2xl my-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editingCert ? 'Edit Certificate' : 'Add Certificate'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-admin-text-secondary hover:text-white"><X className="h-6 w-6" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-admin-text-secondary mb-1">Title</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-admin-surface border border-admin-border rounded-xl px-4 py-2.5 text-white focus:border-admin-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-text-secondary mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-admin-surface border border-admin-border rounded-xl px-4 py-2.5 text-white focus:border-admin-primary focus:outline-none mb-2">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {formData.category === 'Custom' && (
                    <input
                      type="text"
                      required
                      placeholder="Enter custom category name"
                      value={customCategory}
                      onChange={e => setCustomCategory(e.target.value)}
                      className="w-full bg-admin-surface border border-admin-border rounded-xl px-4 py-2.5 text-white focus:border-admin-primary focus:outline-none"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-text-secondary mb-2">Images</label>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {retainedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-admin-border">
                      <img src={(import.meta.env.VITE_API_URL || 'http://localhost:5001') + img} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeRetainedImage(idx)} className="absolute top-1 right-1 bg-black/60 p-1 rounded hover:bg-red-500 text-white"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  {selectedImages.map((file, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-admin-primary border-dashed p-1">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded" />
                      <button type="button" onClick={() => removeSelectedImage(idx)} className="absolute top-2 right-2 bg-black/60 p-1 rounded hover:bg-red-500 text-white"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-admin-border hover:border-admin-primary flex flex-col items-center justify-center text-admin-text-secondary hover:text-admin-primary transition-colors bg-admin-surface">
                    <Plus className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">Add Image</span>
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={e => e.target.files && setSelectedImages([...selectedImages, ...Array.from(e.target.files)])} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-text-secondary mb-2">PDF Documents</label>
                <div className="space-y-2 mb-3">
                  {retainedPdfs.map((pdf, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-admin-surface border border-admin-border">
                      <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-red-400" /><span className="text-sm text-white">{pdf.name}</span></div>
                      <button type="button" onClick={() => removeRetainedPdf(idx)} className="text-admin-text-secondary hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  {selectedPdfs.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-admin-surface border border-admin-primary border-dashed">
                      <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-admin-primary" /><span className="text-sm text-white">{file.name}</span></div>
                      <button type="button" onClick={() => removeSelectedPdf(idx)} className="text-admin-text-secondary hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => pdfInputRef.current?.click()} className="w-full py-3 rounded-xl border-2 border-dashed border-admin-border hover:border-admin-primary flex items-center justify-center gap-2 text-admin-text-secondary hover:text-admin-primary transition-colors">
                  <Upload className="h-5 w-5" />
                  <span className="font-medium">Upload PDF Files</span>
                </button>
                <input type="file" ref={pdfInputRef} className="hidden" multiple accept="application/pdf" onChange={e => e.target.files && setSelectedPdfs([...selectedPdfs, ...Array.from(e.target.files)])} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-admin-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-admin-text-secondary hover:text-white">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-xl text-sm font-medium bg-admin-primary text-white hover:bg-admin-primary/90 disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Certificate'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Image Preview Overlay */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300"><X className="h-8 w-8" /></button>
          <img src={(import.meta.env.VITE_API_URL || 'http://localhost:5001') + previewImage} className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
