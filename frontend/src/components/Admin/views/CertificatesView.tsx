import React, { useState, useEffect, useMemo } from 'react';
import { Award, ShieldCheck, Grid, Search, Filter, Eye, Edit3, Trash2, Link, Image as ImageIcon, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StatsCard } from '../ui/StatsCard';

export interface CertificateFormData {
  title: string;
  category: string;
  certificateType: string;
  organization: string;
  issueDate: string;
  certificateId: string;
  description: string;
  imageUrl: string;
  pdfUrl: string;
}

export interface CertificateRecord extends CertificateFormData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export function CertificatesView() {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CertificateFormData>({
    title: '', category: '', certificateType: '', organization: '', issueDate: '', certificateId: '', description: '', imageUrl: '', pdfUrl: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/certificates');
      const data = await response.json();
      setCertificates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load certificates', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = useMemo(() => {
    return certificates.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.organization.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [certificates, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCertificates.length / pageSize));
  const visibleCertificates = useMemo(
    () => filteredCertificates.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredCertificates, currentPage]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '', category: '', certificateType: '', organization: '', issueDate: '', certificateId: '', description: '', imageUrl: '', pdfUrl: ''
    });
    setImageFile(null);
    setPdfFile(null);
    setEditId(null);
    setMessage(null);
  };

  const handleEdit = (cert: CertificateRecord) => {
    setEditId(cert._id);
    setFormData({
      title: cert.title,
      category: cert.category,
      certificateType: cert.certificateType,
      organization: cert.organization,
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
      certificateId: cert.certificateId || '',
      description: cert.description || '',
      imageUrl: cert.imageUrl || '',
      pdfUrl: cert.pdfUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitCertificate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });
      if (imageFile) payload.append('image', imageFile);
      if (pdfFile) payload.append('pdf', pdfFile);

      const url = editId ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/certificates/${editId}` : (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/certificates';
      const method = editId ? 'PUT' : 'POST';
      const response = await fetch(url, { credentials: 'include', method, body: payload, headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' } });
      if (!response.ok) throw new Error('Save failed');
      const result = await response.json();
      const saved = result.certificate ?? result;

      setCertificates(prev => editId ? prev.map(item => (item._id === editId ? saved : item)) : [saved, ...prev]);
      setMessage({ type: 'success', text: editId ? 'Updated successfully.' : 'Added successfully.' });
      resetForm();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Could not save certificate.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteCertificate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/certificates/${id}`, { credentials: 'include', method: 'DELETE', headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' } });
      if (response.ok) {
        setCertificates(prev => prev.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const activeCount = certificates.length; 
  const categoriesCount = new Set(certificates.map(c => c.category)).size;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-admin-card rounded-xl border border-admin-border">
            <Award className="h-6 w-6 text-admin-primary" />
          </div>
          Certificates
        </h1>
        <p className="mt-2 text-admin-text-secondary">Manage and organize all your certificates</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard title="Total Certificates" value={certificates.length} description="All certificates" icon={Award} iconColor="primary" />
        <StatsCard title="Active Certificates" value={activeCount} description="Currently active" icon={ShieldCheck} iconColor="success" />
        <StatsCard title="Categories" value={categoriesCount} description="Different categories" icon={Grid} iconColor="warning" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px] items-start">
        <div className="flex flex-col gap-4 rounded-2xl border border-admin-border bg-admin-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">All Certificates</h2>
              <p className="text-sm text-admin-text-secondary">View, edit, or delete certificates</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-secondary" />
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-xl border border-admin-border bg-admin-surface pl-9 pr-4 text-sm text-white placeholder:text-admin-text-secondary focus:border-admin-primary focus:outline-none focus:ring-1 focus:ring-admin-primary"
                />
              </div>
              <Button variant="outline" className="h-10 w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-admin-border bg-admin-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-admin-border bg-admin-card text-xs font-semibold uppercase text-admin-text-secondary">
                <tr>
                  <th className="px-4 py-3">Certificate</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Issued</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {visibleCertificates.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-admin-text-secondary">No certificates found.</td></tr>
                ) : (
                  visibleCertificates.map((cert) => (
                    <tr key={cert._id} className="hover:bg-admin-card/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-14 overflow-hidden rounded border border-admin-border bg-admin-bg shrink-0 flex items-center justify-center">
                            {cert.imageUrl ? <img src={cert.imageUrl} alt={cert.title} className="h-full w-full object-cover" /> : <ImageIcon className="h-4 w-4 text-admin-text-secondary" />}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{cert.title}</p>
                            <p className="text-xs text-admin-text-secondary">{cert.organization}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="h-1.5 w-1.5 rounded-full bg-admin-primary"></div>
                          {cert.category}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-admin-text-secondary">{cert.certificateType}</td>
                      <td className="px-4 py-3 text-admin-text-secondary">{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-admin-success/10 px-2 py-1 text-xs font-medium text-admin-success">
                          <div className="h-1.5 w-1.5 rounded-full bg-admin-success"></div> Active
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="rounded-lg p-2 text-admin-text-secondary hover:bg-admin-surface hover:text-white transition-colors" title="View"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => handleEdit(cert)} className="rounded-lg bg-admin-primary/10 p-2 text-admin-primary hover:bg-admin-primary/20 transition-colors" title="Edit"><Edit3 className="h-4 w-4" /></button>
                          <button onClick={() => deleteCertificate(cert._id)} className="rounded-lg bg-admin-danger/10 p-2 text-admin-danger hover:bg-admin-danger/20 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-admin-text-secondary">
            <span>Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredCertificates.length)} of {filteredCertificates.length} certificates</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
            </div>
          </div>
        </div>

        {/* Create Form */}
        <div className="rounded-2xl border border-admin-border bg-admin-card p-5 shadow-sm sticky top-24">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-white">{editId ? 'Update Certificate' : 'Create New Certificate'}</h2>
            <p className="text-sm text-admin-text-secondary">Add a new certificate to your portfolio</p>
          </div>

          {message && (
            <div className={`mb-4 rounded-xl p-3 text-sm ${message.type === 'success' ? 'bg-admin-success/10 text-admin-success border border-admin-success/20' : 'bg-admin-danger/10 text-admin-danger border border-admin-danger/20'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={submitCertificate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Title" name="title" required value={formData.title} onChange={handleInputChange} placeholder="Certificate title" />
              <div className="space-y-2">
                <label className="text-sm font-medium text-admin-text-secondary">Category <span className="text-admin-danger">*</span></label>
                <select name="category" required value={formData.category} onChange={handleInputChange} className="flex h-10 w-full rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-sm text-white focus:border-admin-primary focus:outline-none focus:ring-1 focus:ring-admin-primary">
                  <option value="">Select category</option>
                  <option value="Academic Certificates">Academic Certificates</option>
                  <option value="Technical Certificates">Technical Certificates</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Input label="Type" name="certificateType" required value={formData.certificateType} onChange={handleInputChange} placeholder="Select type" />
              <Input label="Organization" name="organization" required value={formData.organization} onChange={handleInputChange} placeholder="Issuing organization" />
              <Input label="Issue Date" type="date" name="issueDate" required value={formData.issueDate} onChange={handleInputChange} />
              <Input label="Certificate ID" name="certificateId" value={formData.certificateId} onChange={handleInputChange} placeholder="Optional ID" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-admin-text-secondary">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Certificate description" className="flex min-h-[80px] w-full rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-sm text-white placeholder:text-admin-text-secondary focus:border-admin-primary focus:outline-none focus:ring-1 focus:ring-admin-primary resize-y" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Image URL" name="imageUrl" icon={<Link className="h-4 w-4" />} value={formData.imageUrl} onChange={handleInputChange} placeholder="Optional image URL" />
              <Input label="PDF URL" name="pdfUrl" icon={<Link className="h-4 w-4" />} value={formData.pdfUrl} onChange={handleInputChange} placeholder="Optional PDF URL" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-dashed border-admin-border bg-admin-surface/50 p-4 text-center hover:bg-admin-surface transition-colors cursor-pointer relative">
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <ImageIcon className="mx-auto h-6 w-6 text-admin-text-secondary mb-2" />
                <p className="text-sm font-medium text-white">{imageFile ? imageFile.name : 'Choose image file'}</p>
                <p className="text-xs text-admin-text-secondary mt-1">JPG, PNG or WEBP (Max. 5MB)</p>
              </div>
              <div className="rounded-xl border border-dashed border-admin-border bg-admin-surface/50 p-4 text-center hover:bg-admin-surface transition-colors cursor-pointer relative">
                <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <FileText className="mx-auto h-6 w-6 text-admin-text-secondary mb-2" />
                <p className="text-sm font-medium text-white">{pdfFile ? pdfFile.name : 'Choose PDF file'}</p>
                <p className="text-xs text-admin-text-secondary mt-1">PDF (Max. 10MB)</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="button" variant="outline" className="w-full" onClick={resetForm}>Reset</Button>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : (editId ? 'Update Certificate' : 'Create Certificate')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
