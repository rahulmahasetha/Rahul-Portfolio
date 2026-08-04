import React, { useState, useEffect, useMemo } from 'react';
import { 
  Code2, Layers, BarChart2, Star, Search, Filter, 
  Edit3, Trash2, ChevronDown, ChevronUp, Upload,
  Plus, Settings2, Save
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface SkillFormData {
  name: string;
  category: string;
  level: number;
  displayOrder: number;
  description: string;
  iconUrl: string;
}

export interface SkillRecord {
  _id: string;
  name: string;
  category: string;
  level: number;
  displayOrder: number;
  description: string;
  iconUrl: string;
}

export function SkillsView() {
  const [skills, setSkills] = useState<SkillRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SkillFormData>({
    name: '', category: '', level: 75, displayOrder: 100, description: '', iconUrl: ''
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconTab, setIconTab] = useState<'upload' | 'url'>('upload');
  const [customCategory, setCustomCategory] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const formRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/skills');
      const data = await response.json();
      const skillsArray = Array.isArray(data, { credentials: 'include' }) ? data : [];
      setSkills(skillsArray.sort((a, b) => a.displayOrder - b.displayOrder || a.category.localeCompare(b.category)));
      
      // Auto expand all categories initially
      const categories = [...new Set(skillsArray.map(s => s.category))];
      const expandedState: Record<string, boolean> = {};
      categories.forEach(c => expandedState[c as string] = true);
      setExpandedCategories(expandedState);
    } catch (error) {
      console.error('Failed to load skills', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'level' || name === 'displayOrder' ? Number(value) : value }));
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', level: 75, displayOrder: 100, description: '', iconUrl: '' });
    setCustomCategory('');
    setIconFile(null);
    setEditId(null);
    setMessage(null);
  };

  const handleAddClick = () => {
    resetForm();
    setIsFormOpen(true);
    if (window.innerWidth < 1024 && formRef.current) {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleEdit = (skill: SkillRecord) => {
    setEditId(skill._id);
    const defaultCategories = ['Frontend', 'Backend', 'Database', 'Cloud & DevOps', 'Data & Tooling'];
    const isDefault = defaultCategories.includes(skill.category);
    
    setFormData({
      name: skill.name,
      category: isDefault ? skill.category : 'Other',
      level: skill.level,
      displayOrder: skill.displayOrder,
      description: skill.description || '',
      iconUrl: skill.iconUrl || ''
    });
    setCustomCategory(isDefault ? '' : skill.category);
    setIconTab(skill.iconUrl ? 'url' : 'upload');
    setMessage(null);
    setIsFormOpen(true);
    if (window.innerWidth < 1024 && formRef.current) {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const submitSkill = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      
      const finalCategory = formData.category === 'Other' ? customCategory : formData.category;
      payload.append('category', finalCategory);
      payload.append('level', String(formData.level));
      payload.append('displayOrder', String(formData.displayOrder));
      payload.append('description', formData.description);
      if (iconTab === 'url') payload.append('iconUrl', formData.iconUrl || '');
      if (iconTab === 'upload' && iconFile) payload.append('icon', iconFile);

      const url = editId ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/skills/${editId}` : (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/skills';
      const method = editId ? 'PUT' : 'POST';
      const response = await fetch(url, { credentials: 'include', method, body: payload, headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' } });
      if (!response.ok) throw new Error('Save failed');
      const result = await response.json();
      const saved = result.skill ?? result;

      setSkills(prev => {
        const next = editId ? prev.map(item => (item._id === editId ? saved : item)) : [...prev, saved];
        return next.sort((a,b) => a.displayOrder - b.displayOrder);
      });
      setExpandedCategories(prev => ({ ...prev, [saved.category]: true }));
      setMessage({ type: 'success', text: editId ? 'Skill updated successfully!' : 'Skill added successfully!' });
      setTimeout(() => {
        resetForm();
        setIsFormOpen(false);
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save skill. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteSkill = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/skills/${id}`, { credentials: 'include', method: 'DELETE', headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' } });
      if (response.ok) setSkills(prev => prev.filter(s => s._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // Stats calculation
  const categoryCounts = skills.reduce((acc, skill) => {
    acc[skill.category] = (acc[skill.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categoriesCount = Object.keys(categoryCounts).length;
  const topCategory = categoriesCount > 0 
    ? Object.keys(categoryCounts).sort((a,b) => categoryCounts[b] - categoryCounts[a])[0] 
    : 'None';
  const avgProficiency = skills.length ? Math.round(skills.reduce((acc, s) => acc + s.level, 0) / skills.length) : 0;

  // Filtering & Grouping
  const filteredSkills = useMemo(() => {
    return skills.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All Categories' || s.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [skills, searchQuery, filterCategory]);

  const groupedSkills = useMemo(() => {
    return filteredSkills.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, SkillRecord[]>);
  }, [filteredSkills]);

  const getLevelBadge = (level: number) => {
    if (level >= 80) return <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">Advanced</span>;
    if (level >= 50) return <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-500 text-xs font-medium border border-blue-500/20">Intermediate</span>;
    return <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 text-xs font-medium border border-amber-500/20">Beginner</span>;
  };

  const getCategoryColor = (category: string) => {
    const colors = ['bg-purple-500', 'bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500'];
    const index = Object.keys(categoryCounts).indexOf(category);
    return colors[index % colors.length] || 'bg-gray-500';
  };

  return (
    <div className="flex flex-col gap-6 pb-10 min-h-screen bg-[#0b0f19] text-white p-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-4 items-center">
          <div className="h-12 w-12 rounded-xl bg-[#1a1f36] flex items-center justify-center border border-[#2a2f4c]">
            <Code2 className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Skills</h1>
            <p className="text-sm text-gray-400 mt-1">Manage technical and professional skills</p>
          </div>
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          <Plus className="h-4 w-4" /> Add Skill
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Skills */}
        <div className="bg-[#13182b] border border-[#1f2640] rounded-2xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#2a1b4d] flex items-center justify-center shrink-0">
            <Code2 className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Skills</p>
            <p className="text-2xl font-bold text-white leading-tight">{skills.length}</p>
            <p className="text-xs text-gray-500 mt-1">All registered skills</p>
          </div>
        </div>
        
        {/* Categories */}
        <div className="bg-[#13182b] border border-[#1f2640] rounded-2xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#163333] flex items-center justify-center shrink-0">
            <Layers className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Categories</p>
            <p className="text-2xl font-bold text-white leading-tight">{categoriesCount}</p>
            <p className="text-xs text-gray-500 mt-1">Skill categories</p>
          </div>
        </div>

        {/* Avg Proficiency */}
        <div className="bg-[#13182b] border border-[#1f2640] rounded-2xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#1a2942] flex items-center justify-center shrink-0">
            <BarChart2 className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Avg. Proficiency</p>
            <p className="text-2xl font-bold text-white leading-tight">{avgProficiency}%</p>
            <p className="text-xs text-gray-500 mt-1">Average skill level</p>
          </div>
        </div>

        {/* Top Category */}
        <div className="bg-[#13182b] border border-[#1f2640] rounded-2xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#36261c] flex items-center justify-center shrink-0">
            <Star className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Top Category</p>
            <p className="text-xl font-bold text-white leading-tight truncate">{topCategory}</p>
            <p className="text-xs text-gray-500 mt-1">Most skills</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start mt-2">
        {/* Left Col: Skills List */}
        <div className="flex flex-col gap-4">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-white">Skills by Category</h2>
            <p className="text-sm text-gray-400 mt-1">View and manage skills organized by category</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative w-full sm:flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#2a2f4c] bg-[#13182b] pl-9 pr-4 text-sm text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-40">
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="h-10 w-full appearance-none rounded-xl border border-[#2a2f4c] bg-[#13182b] px-4 text-sm text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="All Categories">All Categories</option>
                  {Object.keys(categoryCounts).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative flex-1 sm:w-32">
                <select className="h-10 w-full appearance-none rounded-xl border border-[#2a2f4c] bg-[#13182b] px-4 text-sm text-white focus:border-purple-500 focus:outline-none">
                  <option>All Levels</option>
                  <option>Advanced</option>
                  <option>Intermediate</option>
                  <option>Beginner</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              <button className="h-10 w-10 shrink-0 rounded-xl border border-[#2a2f4c] bg-[#13182b] flex items-center justify-center hover:bg-[#1a1f36] transition-colors">
                <Settings2 className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {Object.keys(groupedSkills).length === 0 ? (
              <div className="py-12 text-center text-gray-500 border border-dashed border-[#2a2f4c] rounded-2xl">
                No skills found matching your criteria.
              </div>
            ) : (
              Object.entries(groupedSkills).map(([category, catSkills]) => {
                const isExpanded = expandedCategories[category];
                const dotColor = getCategoryColor(category);
                
                return (
                  <div key={category} className="bg-[#13182b] border border-[#1f2640] rounded-2xl overflow-hidden">
                    {/* Accordion Header */}
                    <button 
                      onClick={() => toggleCategory(category)}
                      className={`w-full flex items-center justify-between p-4 transition-colors hover:bg-[#1a1f36] ${isExpanded ? 'border-b border-[#1f2640] bg-[#161b2e]' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                        <span className="font-semibold text-white">{category}</span>
                        <span className="text-xs font-medium bg-[#1a1f36] border border-[#2a2f4c] text-purple-400 px-2 py-0.5 rounded-md">
                          {catSkills.length} Skills
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </button>

                    {/* Accordion Content (Table) */}
                    {isExpanded && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#1f2640]">
                            <tr>
                              <th className="px-4 py-2.5">Skill</th>
                              <th className="px-4 py-2.5">Level</th>
                              <th className="px-4 py-2.5 w-1/3">Proficiency</th>
                              <th className="px-4 py-2.5">Order</th>
                              <th className="px-4 py-2.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1f2640]/50">
                            {catSkills.map((skill) => (
                              <tr key={skill._id} className="hover:bg-[#161b2e]/50 transition-colors">
                                <td className="px-4 py-2.5 flex items-center gap-3">
                                  <div className="h-8 w-8 bg-[#0b0f19] border border-[#1f2640] rounded-full flex items-center justify-center p-1.5 shrink-0">
                                    {skill.iconUrl ? (
                                      <img src={skill.iconUrl} alt="" className="max-h-full max-w-full object-contain" />
                                    ) : (
                                      <Code2 className="h-4 w-4 text-gray-500" />
                                    )}
                                  </div>
                                  <span className="font-medium text-gray-200">{skill.name}</span>
                                </td>
                                <td className="px-4 py-2.5">
                                  {getLevelBadge(skill.level)}
                                </td>
                                <td className="px-4 py-2.5">
                                  <div className="flex flex-col gap-1 w-full max-w-[140px]">
                                    <span className="text-xs font-semibold text-gray-300">{skill.level}%</span>
                                    <div className="w-full bg-[#1a1f36] rounded-full h-1.5 overflow-hidden">
                                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${skill.level}%` }}></div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-2.5 text-gray-400 text-xs font-medium">
                                  {skill.displayOrder}
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => handleEdit(skill)} 
                                      className="h-8 w-8 rounded-lg border border-[#2a2f4c] bg-[#13182b] flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => deleteSkill(skill._id)} 
                                      className="h-8 w-8 rounded-lg border border-[#2a2f4c] bg-[#13182b] flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-500/50 transition-colors"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-500">Showing 1 to {Object.keys(groupedSkills).length} of {categoriesCount} categories</span>
            <div className="flex items-center gap-1">
              <button className="h-8 w-8 rounded-lg border border-[#2a2f4c] bg-[#13182b] flex items-center justify-center text-gray-500 hover:text-white disabled:opacity-50">{'<'}</button>
              <button className="h-8 w-8 rounded-lg bg-purple-600 text-white font-medium text-sm flex items-center justify-center">1</button>
              <button className="h-8 w-8 rounded-lg border border-[#2a2f4c] bg-[#13182b] flex items-center justify-center text-gray-500 hover:text-white disabled:opacity-50">{'>'}</button>
            </div>
          </div>
        </div>

        {/* Modal Overlay: Form Panel */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div ref={formRef} className="bg-[#13182b] border border-[#1f2640] rounded-2xl p-6 w-full max-w-[440px] shadow-2xl relative my-auto">
              <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">{editId ? 'Update Skill' : 'Add New Skill'}</h2>
                <p className="text-sm text-gray-400 mt-1">{editId ? 'Modify existing skill details' : 'Add a new skill to your portfolio'}</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="h-8 w-8 rounded-lg border border-[#2a2f4c] bg-[#1a1f36] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                &times;
              </button>
            </div>

            {message && (
            <div className={`mb-6 p-3 rounded-xl border text-sm ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={submitSkill} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                Skill Name <span className="text-red-500">*</span>
              </label>
              <input 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="e.g. TypeScript"
                className="w-full h-11 bg-[#0b0f19] border border-[#2a2f4c] rounded-xl px-4 text-sm text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none transition-colors" 
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select 
                  name="category" 
                  required 
                  value={formData.category} 
                  onChange={handleInputChange} 
                  className="w-full h-11 bg-[#0b0f19] border border-[#2a2f4c] rounded-xl pl-4 pr-10 text-sm text-white appearance-none focus:border-purple-500 focus:outline-none transition-colors"
                >
                  <option value="" disabled>Select category</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Data & Tooling">Data & Tooling</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-4 top-[22px] -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
              {formData.category === 'Other' && (
                <div className="mt-3">
                  <input 
                    name="customCategory" 
                    required 
                    placeholder="Enter custom category name"
                    value={customCategory} 
                    onChange={e => setCustomCategory(e.target.value)} 
                    className="w-full h-11 bg-[#0b0f19] border border-[#2a2f4c] rounded-xl px-4 text-sm text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none transition-colors" 
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                  Level (%) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  name="level" 
                  required 
                  min="0" max="100"
                  value={formData.level} 
                  onChange={handleInputChange} 
                  className="w-full h-11 bg-[#0b0f19] border border-[#2a2f4c] rounded-xl px-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                  Display Order <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  name="displayOrder" 
                  required 
                  value={formData.displayOrder} 
                  onChange={handleInputChange} 
                  className="w-full h-11 bg-[#0b0f19] border border-[#2a2f4c] rounded-xl px-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors" 
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Icon</label>
              <div className="flex w-full mb-3 p-1 bg-[#0b0f19] rounded-xl border border-[#2a2f4c]">
                <button 
                  type="button"
                  onClick={() => setIconTab('upload')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${iconTab === 'upload' ? 'bg-[#2a1b4d] text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Upload Icon
                </button>
                <button 
                  type="button"
                  onClick={() => setIconTab('url')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${iconTab === 'url' ? 'bg-[#2a1b4d] text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Icon URL
                </button>
              </div>

              {iconTab === 'upload' ? (
                <div className="relative w-full h-32 rounded-xl border border-dashed border-[#3a3f5c] bg-[#0b0f19] flex flex-col items-center justify-center hover:bg-[#121626] transition-colors cursor-pointer group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setIconFile(e.target.files?.[0] || null)} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  {iconFile ? (
                    <div className="text-center px-4">
                      <p className="text-sm font-medium text-purple-400 truncate w-40">{iconFile.name}</p>
                      <p className="text-[10px] text-gray-500 mt-1">Ready to upload</p>
                    </div>
                  ) : (
                    <div className="text-center px-4">
                      <div className="w-8 h-8 rounded-full bg-[#1a1f36] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-xs font-medium text-gray-300 mb-1">Upload icon</p>
                      <p className="text-[10px] text-gray-500">PNG, SVG or JPG (Max 1MB)</p>
                    </div>
                  )}
                </div>
              ) : (
                <input 
                  type="text" 
                  name="iconUrl" 
                  value={formData.iconUrl} 
                  onChange={handleInputChange} 
                  placeholder="https://example.com/icon.svg"
                  className="w-full h-11 bg-[#0b0f19] border border-[#2a2f4c] rounded-xl px-4 text-sm text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none transition-colors" 
                />
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="flex-[0.4] h-11 rounded-xl border border-[#2a2f4c] bg-[#0b0f19] text-sm font-medium text-gray-300 hover:bg-[#1a1f36] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 h-11 rounded-xl bg-purple-600 text-sm font-medium text-white hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4" /> Save Skill
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
        )}
      </div>
    </div>
  );
}
