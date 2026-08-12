import React, { useState, useEffect, useMemo } from 'react';
import { Award, Search, Edit3, Trash2, Plus, Image as ImageIcon, X } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StatsCard } from '../ui/StatsCard';

export interface AchievementFormData {
  title: string;
  description: string;
  icon: string;
  color: string;
  imageUrl?: string;
}

export interface AchievementRecord extends AchievementFormData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export function AchievementsView() {
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AchievementFormData>({
    title: '', description: '', icon: '', color: 'blue'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/achievements');
      const data = await response.json();
      setAchievements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load achievements', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = useMemo(() => {
    return achievements.filter(a => 
      a.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [achievements, searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', icon: '', color: 'blue' });
    setImageFile(null);
    setEditId(null);
    setMessage(null);
    setIsFormOpen(false);
  };

  const handleEdit = (achievement: AchievementRecord) => {
    setEditId(achievement._id);
    setFormData({
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      color: achievement.color || 'blue'
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitAchievement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('icon', formData.icon);
      payload.append('color', formData.color);
      if (imageFile) payload.append('image', imageFile);

      const url = editId ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/achievements/${editId}` : (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/achievements';
      const method = editId ? 'PUT' : 'POST';
      const response = await fetch(url, { credentials: 'include', method, body: payload, headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' } });
      if (!response.ok) throw new Error('Save failed');
      const result = await response.json();
      const saved = result.achievement ?? result;

      setAchievements(prev => editId ? prev.map(item => (item._id === editId ? saved : item)) : [saved, ...prev]);
      setMessage({ type: 'success', text: editId ? 'Updated successfully.' : 'Added successfully.' });
      setTimeout(() => resetForm(), 1500);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Could not save achievement.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteAchievement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/achievements/${id}`, { credentials: 'include', method: 'DELETE', headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' } });
      if (response.ok) setAchievements(prev => prev.filter(a => a._id !== id));
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
              <Award className="h-6 w-6 text-admin-primary" />
            </div>
            Achievements
          </h1>
          <p className="mt-2 text-admin-text-secondary">Manage honors and awards</p>
        </div>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New Achievement
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard title="Total Achievements" value={achievements.length} icon={Award} iconColor="warning" />
      </div>

      {!isFormOpen ? (
        <div className="flex flex-col gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-secondary" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-admin-border bg-admin-surface pl-9 pr-4 text-sm text-white focus:border-admin-primary focus:outline-none"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            {filteredAchievements.length === 0 ? (
              <div className="col-span-full py-12 text-center text-admin-text-secondary border border-dashed border-admin-border rounded-2xl">
                No achievements found.
              </div>
            ) : (
              filteredAchievements.map(achievement => (
                <div key={achievement._id} className="group flex flex-col overflow-hidden rounded-2xl border border-admin-border bg-admin-card hover:border-admin-primary/50 transition-colors">
                  {achievement.imageUrl && (
                    <div className="relative h-48 w-full overflow-hidden bg-admin-surface flex items-center justify-center">
                      <img src={achievement.imageUrl} alt={achievement.title} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(achievement.icon) }} className="w-5 h-5 flex items-center justify-center" />
                        {achievement.title}
                      </h3>
                    </div>
                    <p className="text-sm text-admin-text-secondary line-clamp-3 mb-4 flex-1">{achievement.description}</p>
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-admin-border">
                      <button onClick={() => handleEdit(achievement)} className="rounded-lg p-2 text-admin-primary hover:bg-admin-primary/10 transition-colors"><Edit3 className="h-4 w-4" /></button>
                      <button onClick={() => deleteAchievement(achievement._id)} className="rounded-lg p-2 text-admin-danger hover:bg-admin-danger/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-admin-border bg-admin-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-admin-border pb-4">
            <h2 className="text-xl font-bold text-white">{editId ? 'Update Achievement' : 'Add Achievement'}</h2>
            <Button variant="ghost" onClick={resetForm}><X className="h-5 w-5" /></Button>
          </div>

          {message && (
            <div className={`mb-6 rounded-xl p-4 text-sm ${message.type === 'success' ? 'bg-admin-success/10 text-admin-success' : 'bg-admin-danger/10 text-admin-danger'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={submitAchievement} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <Input label="Title" name="title" required value={formData.title} onChange={handleInputChange} />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-admin-text-secondary">Description</label>
                  <textarea name="description" required value={formData.description} onChange={handleInputChange} className="flex min-h-[100px] w-full rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-sm text-white focus:border-admin-primary focus:outline-none resize-none" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Icon (SVG string)" name="icon" value={formData.icon} onChange={handleInputChange} />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-admin-text-secondary">Color Theme</label>
                    <select name="color" value={formData.color} onChange={handleInputChange} className="flex h-10 w-full rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-sm text-white focus:border-admin-primary focus:outline-none">
                      <option value="blue">Blue</option>
                      <option value="purple">Purple</option>
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                      <option value="red">Red</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-admin-text-secondary">Image Upload</label>
                <div className="rounded-xl border-2 border-dashed border-admin-border bg-admin-surface/50 p-6 text-center hover:bg-admin-surface transition-colors cursor-pointer relative flex flex-col items-center justify-center min-h-[150px]">
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {imageFile ? <p className="text-sm font-medium text-white">{imageFile.name}</p> : (
                    <>
                      <ImageIcon className="h-8 w-8 text-admin-text-secondary mb-2" />
                      <p className="text-sm font-medium text-white">Click or drag image here</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-admin-border">
              <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Achievement'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
