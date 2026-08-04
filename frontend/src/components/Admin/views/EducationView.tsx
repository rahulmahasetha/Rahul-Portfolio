import React, { useState, useEffect } from 'react';
import { GraduationCap, Edit3, Trash2, Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StatsCard } from '../ui/StatsCard';

export interface EducationFormData {
  collegeName: string;
  degreeName: string;
  location: string;
  startYear: string;
  passingOutYear: string;
  percentage: string;
}

export interface EducationRecord extends EducationFormData {
  _id: string;
}

export function EducationView() {
  const [educationItems, setEducationItems] = useState<EducationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EducationFormData>({
    collegeName: '', degreeName: '', location: '', startYear: '', passingOutYear: '', percentage: ''
  });
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchEducationItems();
  }, []);

  const fetchEducationItems = async () => {
    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/education');
      const data = await response.json();
      setEducationItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load education items', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ collegeName: '', degreeName: '', location: '', startYear: '', passingOutYear: '', percentage: '' });
    setEditId(null);
    setMessage(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item: EducationRecord) => {
    setEditId(item._id);
    setFormData({
      collegeName: item.collegeName,
      degreeName: item.degreeName,
      location: item.location,
      startYear: item.startYear,
      passingOutYear: item.passingOutYear,
      percentage: item.percentage
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitEducation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const url = editId ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/education/${editId}` : (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/education';
      const method = editId ? 'PUT' : 'POST';
      const response = await fetch(url, { credentials: 'include', 
        method, 
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Save failed');
      const saved = await response.json();

      setEducationItems(prev => editId ? prev.map(item => (item._id === editId ? saved : item)) : [saved, ...prev]);
      setMessage({ type: 'success', text: editId ? 'Updated successfully.' : 'Added successfully.' });
      setTimeout(() => resetForm(), 1500);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Could not save education record.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteEducation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this education record?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/education/${id}`, { credentials: 'include', method: 'DELETE', headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' } });
      if (response.ok) setEducationItems(prev => prev.filter(e => e._id !== id));
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
              <GraduationCap className="h-6 w-6 text-admin-primary" />
            </div>
            Education
          </h1>
          <p className="mt-2 text-admin-text-secondary">Manage your academic background</p>
        </div>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Education
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard title="Total Degrees" value={educationItems.length} icon={GraduationCap} iconColor="success" />
      </div>

      {!isFormOpen ? (
        <div className="mt-4 space-y-4">
          {educationItems.length === 0 ? (
            <div className="py-12 text-center text-admin-text-secondary border border-dashed border-admin-border rounded-2xl">
              No education records found.
            </div>
          ) : (
            educationItems.map(item => (
              <div key={item._id} className="group flex flex-col md:flex-row gap-6 justify-between overflow-hidden rounded-2xl border border-admin-border bg-admin-card p-6 hover:border-admin-primary/50 transition-colors">
                <div>
                  <h3 className="text-xl font-bold text-white">{item.degreeName}</h3>
                  <p className="text-lg font-medium text-admin-primary">{item.collegeName}</p>
                  <p className="text-sm text-admin-text-secondary mt-1">{item.location}</p>
                  <div className="mt-4 flex gap-4">
                    <span className="inline-flex rounded-full bg-admin-surface px-3 py-1 text-xs font-medium text-admin-text-secondary">
                      {item.startYear} — {item.passingOutYear}
                    </span>
                    <span className="inline-flex rounded-full bg-admin-success/10 px-3 py-1 text-xs font-medium text-admin-success">
                      Score: {item.percentage}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <button onClick={() => handleEdit(item)} className="rounded-lg p-2 text-admin-primary hover:bg-admin-primary/10 transition-colors"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => deleteEducation(item._id)} className="rounded-lg p-2 text-admin-danger hover:bg-admin-danger/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-admin-border bg-admin-card p-6 shadow-sm max-w-3xl">
          <div className="mb-6 flex items-center justify-between border-b border-admin-border pb-4">
            <h2 className="text-xl font-bold text-white">{editId ? 'Update Education' : 'Add Education'}</h2>
            <Button variant="ghost" onClick={resetForm}><X className="h-5 w-5" /></Button>
          </div>

          {message && (
            <div className={`mb-6 rounded-xl p-4 text-sm ${message.type === 'success' ? 'bg-admin-success/10 text-admin-success' : 'bg-admin-danger/10 text-admin-danger'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={submitEducation} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Input label="Degree / Program" name="degreeName" required value={formData.degreeName} onChange={handleInputChange} />
              <Input label="Institution / College" name="collegeName" required value={formData.collegeName} onChange={handleInputChange} />
              <Input label="Location" name="location" required value={formData.location} onChange={handleInputChange} />
              <Input label="Score / Percentage" name="percentage" required value={formData.percentage} onChange={handleInputChange} placeholder="e.g. 8.5 CGPA or 85%" />
              <Input label="Start Year" name="startYear" required value={formData.startYear} onChange={handleInputChange} placeholder="e.g. 2018" />
              <Input label="Passing Out Year" name="passingOutYear" required value={formData.passingOutYear} onChange={handleInputChange} placeholder="e.g. 2022" />
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-admin-border">
              <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Education'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
