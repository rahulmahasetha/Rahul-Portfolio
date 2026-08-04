import { resolveMediaUrl } from '../../../utils/url';
import React, { useState, useEffect, useMemo } from 'react';
import { Briefcase, Search, Filter, Edit3, Trash2, Plus, ExternalLink, Image as ImageIcon, X } from 'lucide-react';
import { FiGithub as Github } from 'react-icons/fi';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StatsCard } from '../ui/StatsCard';

export interface ProjectFormData {
  title: string;
  imageUrl: string;
  images: string[];
  problem: string;
  features: string[];
  tech: string;
  github: string;
  demo: string;
  description: string;
  order: number;
}

export interface ProjectRecord extends ProjectFormData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export function ProjectsView() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '', imageUrl: '', images: [], problem: '', features: [''], tech: '', github: '', demo: '', description: '', order: 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/projects');
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load projects', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.tech.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'order' ? Number(value) : value }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const resetForm = () => {
    setFormData({ title: '', imageUrl: '', images: [], problem: '', features: [''], tech: '', github: '', demo: '', description: '', order: 0 });
    setImageFile(null);
    setGalleryFiles([]);
    setExistingImages([]);
    setEditId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (project: ProjectRecord) => {
    setEditId(project._id);
    setFormData({
      title: project.title,
      imageUrl: project.imageUrl,
      images: project.images || [],
      problem: project.problem || '',
      features: Array.isArray(project.features) && project.features.length > 0 ? project.features : [''],
      tech: Array.isArray(project.tech) ? project.tech.join(', ') : (project.tech || ''),
      github: project.github || '',
      demo: project.demo || '',
      description: project.description || '',
      order: project.order || 0
    });
    setExistingImages(project.images || []);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('problem', formData.problem);
      payload.append('tech', formData.tech);
      payload.append('github', formData.github);
      payload.append('demo', formData.demo);
      payload.append('description', formData.description);
      payload.append('order', String(formData.order));
      formData.features.forEach((feature, index) => {
        if (feature.trim()) payload.append(`features[${index}]`, feature);
      });
      if (imageFile) payload.append('image', imageFile);
      
      galleryFiles.forEach(file => {
        payload.append('gallery', file);
      });
      if (editId) {
        payload.append('existingImages', JSON.stringify(existingImages));
      }

      const url = editId ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${editId}` : (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/projects';
      const method = editId ? 'PUT' : 'POST';
      const response = await fetch(url, { credentials: 'include', method, body: payload, headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' } });
      if (!response.ok) throw new Error('Save failed');
      const result = await response.json();
      const saved = result.project ?? result;

      setProjects(prev => editId ? prev.map(item => (item._id === editId ? saved : item)) : [...prev, saved].sort((a,b) => a.order - b.order));
      setMessage({ type: 'success', text: editId ? 'Updated successfully.' : 'Added successfully.' });
      setTimeout(() => resetForm(), 1500);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Could not save project.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects/${id}`, { credentials: 'include', method: 'DELETE', headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' } });
      if (response.ok) setProjects(prev => prev.filter(p => p._id !== id));
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
            Projects
          </h1>
          <p className="mt-2 text-admin-text-secondary">Manage your portfolio projects</p>
        </div>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <StatsCard title="Total Projects" value={projects.length} icon={Briefcase} iconColor="primary" />
        <StatsCard title="Featured" value={projects.filter(p => p.order < 5).length} icon={Briefcase} iconColor="accent" />
        <StatsCard title="Live Demos" value={projects.filter(p => p.demo).length} icon={ExternalLink} iconColor="success" />
        <StatsCard title="Open Source" value={projects.filter(p => p.github).length} icon={Github} iconColor="warning" />
      </div>

      {!isFormOpen ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-secondary" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-admin-border bg-admin-surface pl-9 pr-4 text-sm text-white focus:border-admin-primary focus:outline-none"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full py-12 text-center text-admin-text-secondary border border-dashed border-admin-border rounded-2xl">
                No projects found. Create one to get started.
              </div>
            ) : (
              filteredProjects.map(project => (
                <div key={project._id} className="group flex flex-col overflow-hidden rounded-2xl border border-admin-border bg-admin-card hover:border-admin-primary/50 transition-colors">
                  <div className="relative aspect-video w-full overflow-hidden bg-admin-surface flex items-center justify-center">
                    {project.imageUrl ? (
                      <img src={project.imageUrl} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-admin-text-secondary" />
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button onClick={() => handleEdit(project)} className="rounded-lg bg-black/50 p-2 text-white backdrop-blur-md hover:bg-admin-primary transition-colors"><Edit3 className="h-4 w-4" /></button>
                      <button onClick={() => deleteProject(project._id)} className="rounded-lg bg-black/50 p-2 text-white backdrop-blur-md hover:bg-admin-danger transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-white line-clamp-1">{project.title}</h3>
                      {project.order < 5 && <span className="shrink-0 rounded-full bg-admin-accent/10 px-2 py-0.5 text-[10px] font-bold text-admin-accent uppercase">Featured</span>}
                    </div>
                    <p className="text-sm text-admin-text-secondary line-clamp-2 mb-4 flex-1">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {Array.isArray(project.tech) ? project.tech.slice(0, 3).map((t, i) => (
                        <span key={i} className="rounded-md bg-admin-surface px-2 py-1 text-xs text-admin-text-secondary">{t}</span>
                      )) : project.tech?.split(',').slice(0,3).map((t, i) => (
                        <span key={i} className="rounded-md bg-admin-surface px-2 py-1 text-xs text-admin-text-secondary">{t.trim()}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-admin-border">
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-admin-text-secondary hover:text-white transition-colors">
                          <Github className="h-3.5 w-3.5" /> Source
                        </a>
                      )}
                      {project.demo && (
                        <a href={project.demo} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-admin-text-secondary hover:text-white transition-colors">
                          <ExternalLink className="h-3.5 w-3.5" /> Live Demo
                        </a>
                      )}
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
            <div>
              <h2 className="text-xl font-bold text-white">{editId ? 'Update Project' : 'Create New Project'}</h2>
              <p className="text-sm text-admin-text-secondary">Fill in the details for your project showcase.</p>
            </div>
            <Button variant="ghost" onClick={resetForm}><X className="h-5 w-5" /></Button>
          </div>

          {message && (
            <div className={`mb-6 rounded-xl p-4 text-sm ${message.type === 'success' ? 'bg-admin-success/10 text-admin-success' : 'bg-admin-danger/10 text-admin-danger'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={submitProject} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <Input label="Project Title" name="title" required value={formData.title} onChange={handleInputChange} />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-admin-text-secondary">Short Description</label>
                  <textarea name="description" required value={formData.description} onChange={handleInputChange} className="flex min-h-[100px] w-full rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-sm text-white focus:border-admin-primary focus:outline-none resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-admin-text-secondary">Problem Solved</label>
                  <textarea name="problem" value={formData.problem} onChange={handleInputChange} className="flex min-h-[100px] w-full rounded-xl border border-admin-border bg-admin-surface px-3 py-2 text-sm text-white focus:border-admin-primary focus:outline-none resize-none" />
                </div>
                <Input label="Technologies (comma separated)" name="tech" value={formData.tech} onChange={handleInputChange} />
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-admin-text-secondary">Project Screenshot (Cover)</label>
                  <div className="rounded-xl border-2 border-dashed border-admin-border bg-admin-surface/50 p-6 text-center hover:bg-admin-surface transition-colors cursor-pointer relative flex flex-col items-center justify-center min-h-[150px]">
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {imageFile ? (
                      <p className="text-sm font-medium text-white">{imageFile.name}</p>
                    ) : formData.imageUrl ? (
                      <>
                        <img src={formData.imageUrl.startsWith('http') ? formData.imageUrl : resolveMediaUrl(formData.imageUrl)} alt="cover" className="h-20 w-full object-cover rounded-lg mb-2" />
                        <p className="text-xs text-admin-text-secondary">Click to replace cover image</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-admin-text-secondary mb-2" />
                        <p className="text-sm font-medium text-white">Drop screenshot here or click to upload</p>
                        <p className="text-xs text-admin-text-secondary mt-1">16:9 ratio recommended</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-admin-text-secondary">Gallery Images (up to 10)</label>
                  <div className="rounded-xl border-2 border-dashed border-admin-border bg-admin-surface/50 p-6 text-center hover:bg-admin-surface transition-colors cursor-pointer relative flex flex-col items-center justify-center min-h-[120px]">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setGalleryFiles(prev => [...prev, ...files].slice(0, 10));
                        e.target.value = '';
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <ImageIcon className="h-8 w-8 text-admin-text-secondary mb-2" />
                    <p className="text-sm font-medium text-white">Click to add gallery images</p>
                    <p className="text-xs text-admin-text-secondary mt-1">Max 10 images · JPEG, PNG, WebP</p>
                  </div>

                  {/* Existing gallery images (when editing) */}
                  {existingImages.length > 0 && (
                    <div>
                      <p className="text-xs text-admin-text-secondary mb-2">Saved images (click × to remove):</p>
                      <div className="flex flex-wrap gap-2">
                        {existingImages.map((img, i) => (
                          <div key={i} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-admin-border">
                            <img src={img.startsWith('http') ? img : resolveMediaUrl(img)} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute top-0.5 right-0.5 bg-admin-danger rounded-full w-4 h-4 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Newly selected files preview */}
                  {galleryFiles.length > 0 && (
                    <div>
                      <p className="text-xs text-admin-text-secondary mb-2">New files to upload:</p>
                      <div className="flex flex-wrap gap-2">
                        {galleryFiles.map((file, i) => (
                          <div key={i} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-admin-border bg-admin-surface flex items-center justify-center">
                            <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setGalleryFiles(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute top-0.5 right-0.5 bg-admin-danger rounded-full w-4 h-4 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="GitHub URL" name="github" value={formData.github} onChange={handleInputChange} icon={<Github className="h-4 w-4" />} />
                  <Input label="Live Demo URL" name="demo" value={formData.demo} onChange={handleInputChange} icon={<ExternalLink className="h-4 w-4" />} />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-admin-text-secondary flex justify-between">
                    Key Features
                    <button type="button" onClick={addFeature} className="text-admin-primary hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Add Feature</button>
                  </label>
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} placeholder={`Feature ${index + 1}`} className="flex-1" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)} disabled={formData.features.length === 1} className="text-admin-danger hover:bg-admin-danger/10"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>

                <Input label="Display Order (lower is higher)" type="number" name="order" value={formData.order} onChange={handleInputChange} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-admin-border">
              <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Project'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
