import React, { useState, useEffect, useMemo } from 'react';
import { User, Edit3, Trash2, Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StatsCard } from '../ui/StatsCard';

export interface AboutFormData {
  title: string;
  content: string;
  order: number;
}

export interface AboutRecord extends AboutFormData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export function AboutView() {
  const [aboutItems, setAboutItems] = useState<AboutRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AboutFormData>({
    title: '', content: '', order: 0
  });
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchAboutItems();
  }, []);

  const fetchAboutItems = async () => {
    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/about');
      const data = await response.json();
      setAboutItems(Array.isArray(data, { credentials: 'include' }) ? data.sort((a,b) => a.order - b.order) : []);
    } catch (error) {
      console.error('Failed to load about items', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'order' ? Number(value) : value }));
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', order: 0 });
    setEditId(null);
    setMessage(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item: AboutRecord) => {
    setEditId(item._id);
    setFormData({
      title: item.title,
      content: item.content,
      order: item.order || 0
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitAbout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const url = editId ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/about/${editId}` : (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/about';
      const method = editId ? 'PUT' : 'POST';
      const response = await fetch(url, { credentials: 'include', 
        method, 
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Save failed');
      const saved = await response.json();

      setAboutItems(prev => {
        const next = editId ? prev.map(item => (item._id === editId ? saved : item)) : [...prev, saved];
        return next.sort((a,b) => a.order - b.order);
      });
      setMessage({ type: 'success', text: editId ? 'Updated successfully.' : 'Added successfully.' });
      setTimeout(() => resetForm(), 1500);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Could not save about item.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteAbout = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/about/${id}`, { credentials: 'include', method: 'DELETE', headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' } });
      if (response.ok) setAboutItems(prev => prev.filter(a => a._id !== id));
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
              <User className="h-6 w-6 text-admin-primary" />
            </div>
            About Section
          </h1>
          <p className="mt-2 text-admin-text-secondary">Manage the content of your About page</p>
        </div>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New Section
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard title="About Sections" value={aboutItems.length} icon={User} iconColor="success" />
      </div>

      {!isFormOpen ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-6 sm:grid-cols-2 mt-4">
            {aboutItems.length === 0 ? (
              <div className="col-span-full py-12 text-center text-admin-text-secondary border border-dashed border-admin-border rounded-2xl">
                No about sections found.
              </div>
            ) : (
              aboutItems.map(item => (
                <div key={item._id} className="group flex flex-col rounded-2xl border border-admin-border bg-admin-card p-6 hover:border-admin-primary/50 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <span className="shrink-0 rounded-full bg-admin-surface px-2 py-1 text-xs font-medium text-admin-text-secondary">Order: {item.order}</span>
                  </div>
                  <p className="text-sm text-admin-text-secondary whitespace-pre-wrap flex-1 mb-6">{item.content}</p>
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-admin-border">
                    <button onClick={() => handleEdit(item)} className="rounded-lg p-2 text-admin-primary hover:bg-admin-primary/10 transition-colors"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => deleteAbout(item._id)} className="rounded-lg p-2 text-admin-danger hover:bg-admin-danger/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-admin-border bg-admin-card p-6 shadow-sm max-w-2xl">
          <div className="mb-6 flex items-center justify-between border-b border-admin-border pb-4">
            <h2 className="text-xl font-bold text-white">{editId ? 'Update Section' : 'Add Section'}</h2>
            <Button variant="ghost" onClick={resetForm}><X className="h-5 w-5" /></Button>
          </div>

          {message && (
            <div className={`mb-6 rounded-xl p-4 text-sm ${message.type === 'success' ? 'bg-admin-success/10 text-admin-success' : 'bg-admin-danger/10 text-admin-danger'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={submitAbout} className="space-y-6">
            <Input label="Section Title" name="title" required value={formData.title} onChange={handleInputChange} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-admin-text-secondary">Content (Markdown supported)</label>
              <textarea name="content" required value={formData.content} onChange={handleInputChange} className="flex min-h-[200px] w-full rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-sm text-white focus:border-admin-primary focus:outline-none resize-y" />
            </div>
            <Input label="Display Order" type="number" name="order" value={formData.order} onChange={handleInputChange} className="w-1/2" />
            
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-admin-border">
              <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Section'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
