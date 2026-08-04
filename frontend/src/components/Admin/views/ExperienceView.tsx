import React, { useState, useEffect, useMemo } from 'react';
import { Briefcase, Search, Edit3, Trash2, Plus, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StatsCard } from '../ui/StatsCard';

export interface ExperienceFormData {
  projectName: string;
  role: string;
  organization: string;
  description: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
}

export interface ExperienceRecord extends ExperienceFormData {
  _id: string;
}

export function ExperienceView() {
  const [experiences, setExperiences] = useState<ExperienceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExperienceFormData>({
    projectName: '', role: '', organization: '', description: '', startDate: '', endDate: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/experience');
      const data = await response.json();
      setExperiences(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load experiences', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExperiences = useMemo(() => {
    return experiences.filter(e => 
      e.projectName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [experiences, searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ projectName: '', role: '', organization: '', description: '', startDate: '', endDate: '' });
    setImageFile(null);
    setEditId(null);
    setMessage(null);
    setIsFormOpen(false);
  };

  const handleEdit = (experience: ExperienceRecord) => {
    setEditId(experience._id);
    setFormData({
      projectName: experience.projectName,
      role: experience.role,
      organization: experience.organization,
      description: experience.description,
      startDate: experience.startDate,
      endDate: experience.endDate,
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitExperience = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload = new FormData();
      payload.append('projectName', formData.projectName);
      payload.append('role', formData.role);
      payload.append('organization', formData.organization);
      payload.append('description', formData.description);
      payload.append('startDate', formData.startDate);
      payload.append('endDate', formData.endDate);
      if (imageFile) payload.append('image', imageFile);

      const url = editId ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/experience/${editId}` : (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/experience';
      const method = editId ? 'PUT' : 'POST';
      const response = await fetch(url, { credentials: 'include', method, body: payload, headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' } });
      if (!response.ok) throw new Error('Save failed');
      const result = await response.json();
      const saved = result.experience ?? result;

      setExperiences(prev => editId ? prev.map(item => (item._id === editId ? saved : item)) : [saved, ...prev]);
      setMessage({ type: 'success', text: editId ? 'Updated successfully.' : 'Added successfully.' });
      setTimeout(() => resetForm(), 1500);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Could not save experience.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteExperience = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/experience/${id}`, { credentials: 'include', method: 'DELETE', headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' } });
      if (response.ok) setExperiences(prev => prev.filter(e => e._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-admin-card rounded-xl border border-admin-border">
              <Briefcase className="h-6 w-6 text-admin-primary" />
            </div>
            Experience
          </h1>
          <p className="mt-2 text-admin-text-secondary">Manage your professional work history</p>
        </div>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Experience
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard title="Total Roles" value={experiences.length} icon={Briefcase} iconColor="primary" />
      </div>

      {!isFormOpen ? (
        <div className="flex flex-col gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-secondary" />
            <input
              type="text"
              placeholder="Search roles or orgs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-admin-border bg-admin-surface pl-9 pr-4 text-sm text-white focus:border-admin-primary focus:outline-none"
            />
          </div>

          <div className="mt-4 space-y-4">
            {filteredExperiences.length === 0 ? (
              <div className="py-12 text-center text-admin-text-secondary border border-dashed border-admin-border rounded-2xl">
                No experience records found.
              </div>
            ) : (
              filteredExperiences.map(experience => (
                <div key={experience._id} className="group flex flex-col md:flex-row gap-6 overflow-hidden rounded-2xl border border-admin-border bg-admin-card p-6 hover:border-admin-primary/50 transition-colors">
                  <div className="shrink-0 h-24 w-24 rounded-xl overflow-hidden bg-admin-surface flex items-center justify-center border border-admin-border">
                    {experience.imageUrl ? (
                      <img src={experience.imageUrl} alt={experience.organization} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-admin-text-secondary" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{experience.role}</h3>
                        <p className="text-lg font-medium text-admin-primary">{experience.organization}</p>
                        <p className="text-sm text-admin-text-secondary mt-1">{experience.projectName}</p>
                        <div className="mt-2 inline-flex rounded-full bg-admin-surface px-3 py-1 text-xs font-medium text-admin-text-secondary">
                          {experience.startDate} — {experience.endDate}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(experience)} className="rounded-lg p-2 text-admin-primary hover:bg-admin-primary/10 transition-colors"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => deleteExperience(experience._id)} className="rounded-lg p-2 text-admin-danger hover:bg-admin-danger/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-admin-text-secondary whitespace-pre-wrap">{experience.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-admin-border bg-admin-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-admin-border pb-4">
            <h2 className="text-xl font-bold text-white">{editId ? 'Update Experience' : 'Add Experience'}</h2>
            <Button variant="ghost" onClick={resetForm}><X className="h-5 w-5" /></Button>
          </div>

          {message && (
            <div className={`mb-6 rounded-xl p-4 text-sm ${message.type === 'success' ? 'bg-admin-success/10 text-admin-success' : 'bg-admin-danger/10 text-admin-danger'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={submitExperience} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <Input label="Role / Title" name="role" required value={formData.role} onChange={handleInputChange} />
                <Input label="Organization / Company" name="organization" required value={formData.organization} onChange={handleInputChange} />
                <Input label="Project Name (Optional)" name="projectName" value={formData.projectName} onChange={handleInputChange} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Start Date" name="startDate" required value={formData.startDate} onChange={handleInputChange} />
                  <Input label="End Date (or 'Present')" name="endDate" required value={formData.endDate} onChange={handleInputChange} />
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-admin-text-secondary">Description</label>
                  <textarea name="description" required value={formData.description} onChange={handleInputChange} className="flex min-h-[150px] w-full rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-sm text-white focus:border-admin-primary focus:outline-none resize-y" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-admin-text-secondary">Company Logo</label>
                  <div className="rounded-xl border-2 border-dashed border-admin-border bg-admin-surface/50 p-6 text-center hover:bg-admin-surface transition-colors cursor-pointer relative flex flex-col items-center justify-center min-h-[120px]">
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {imageFile ? <p className="text-sm font-medium text-white">{imageFile.name}</p> : (
                      <>
                        <ImageIcon className="h-8 w-8 text-admin-text-secondary mb-2" />
                        <p className="text-sm font-medium text-white">Click or drag logo here</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-admin-border">
              <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Experience'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
