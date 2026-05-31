import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Eye, Edit3, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

interface CertificateFormData {
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

interface CertificateRecord extends CertificateFormData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

interface SkillFormData {
  name: string;
  category: string;
  customCategory: string;
  level: number;
  displayOrder: number;
  description: string;
  iconUrl: string;
}

interface SkillRecord {
  _id: string;
  name: string;
  category: string;
  level: number;
  displayOrder: number;
  description: string;
  iconUrl: string;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectFormData {
  title: string;
  imageUrl: string;
  problem: string;
  features: string[];
  tech: string;
  github: string;
  demo: string;
  description: string;
}

interface ProjectRecord {
  _id: string;
  title: string;
  imageUrl: string;
  problem: string;
  features: string[];
  tech: string[];
  github: string;
  demo: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface AchievementFormData {
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface AchievementRecord extends AchievementFormData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

interface AboutFormData {
  title: string;
  content: string;
  order: number;
}

interface AboutRecord extends AboutFormData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

interface NavFormData {
  name: string;
  href: string;
  order: number;
  visible: boolean;
}

interface NavRecord extends NavFormData {
  _id: string;
}

interface TimelineFormData {
  date: string;
  title: string;
  location: string;
  description: string;
  type: string;
  iconUrl: string;
  order: number;
}

interface TimelineRecord extends TimelineFormData {
  _id: string;
}

interface ResumeRecord {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  createdAt: string;
}

export default function Admin({ isAdminPath }: { isAdminPath?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [skills, setSkills] = useState<SkillRecord[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);
  const [aboutItems, setAboutItems] = useState<AboutRecord[]>([]);
  const [resumeRecord, setResumeRecord] = useState<ResumeRecord | null>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineRecord[]>([]);
  const [activeSection, setActiveSection] = useState<'certificates' | 'skills' | 'projects' | 'achievements' | 'about' | 'resume' | 'timeline'>('certificates');
  const [skillViewMode, setSkillViewMode] = useState<'table' | 'card'>('table');
  const [showDeletedSkills, setShowDeletedSkills] = useState(false);
  const [skillDeleteTarget, setSkillDeleteTarget] = useState<SkillRecord | null>(null);
  const [skillIconFile, setSkillIconFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<CertificateFormData>({
    title: '',
    category: '',
    certificateType: '',
    organization: '',
    issueDate: '',
    certificateId: '',
    description: '',
    imageUrl: '',
    pdfUrl: ''
  });
  const [skillForm, setSkillForm] = useState<SkillFormData>({
    name: '',
    category: '',
    customCategory: '',
    level: 75,
    displayOrder: 100,
    description: '',
    iconUrl: ''
  });
  const [projectForm, setProjectForm] = useState<ProjectFormData>({
    title: '',
    imageUrl: '',
    problem: '',
    features: [''],
    tech: '',
    github: '',
    demo: '',
    description: ''
  });
  const [navForm, setNavForm] = useState<NavFormData>({
    name: '', href: '', order: 100, visible: true
  });
  const [timelineForm, setTimelineForm] = useState<TimelineFormData>({
    date: '', title: '', location: '', description: '', type: 'work', iconUrl: '', order: 100
  });
  const [navEditId, setNavEditId] = useState<string | null>(null);
  const [timelineEditId, setTimelineEditId] = useState<string | null>(null);
  const [achievementForm, setAchievementForm] = useState<AchievementFormData>({
    title: '',
    description: '',
    icon: 'Star',
    color: 'from-blue-500 to-indigo-600'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [skillEditId, setSkillEditId] = useState<string | null>(null);
  const [projectEditId, setProjectEditId] = useState<string | null>(null);
  const [achievementEditId, setAchievementEditId] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateRecord | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillRecord | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CertificateRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [aboutEditId, setAboutEditId] = useState<string | null>(null);
  const [selectedAbout, setSelectedAbout] = useState<AboutRecord | null>(null);

  // About section state
  const [aboutForm, setAboutForm] = useState<AboutFormData>({ title: '', content: '', order: 0 });

  const ADMIN_PASSWORD = 'adminRahul@123';
  const pageSize = 6;

  const totalPages = Math.max(1, Math.ceil(certificates.length / pageSize));
  const visibleCertificates = useMemo(
    () => certificates.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [certificates, currentPage]
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchCertificates();
      fetchSkills();
      fetchProjects();
      fetchAchievements();
      fetchAboutItems();
      fetchResume();
      fetchTimelineItems();
    }
  }, [isAuthenticated]);

  const fetchResume = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/resume');
      if (!res.ok) return;
      setResumeRecord(await res.json());
    } catch (err) { console.error(err); }
  };

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const fetchTimelineItems = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/timeline');
      if (!res.ok) return;
      setTimelineItems(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchAboutItems = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/about');
      if (!res.ok) return;
      const data = await res.json();
      setAboutItems(data);
    } catch (err) {
      console.error('Failed to load about items', err);
    }
  };

  const submitAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const url = aboutEditId ? `http://localhost:5000/api/about/${aboutEditId}` : 'http://localhost:5000/api/about';
      const method = aboutEditId ? 'PUT' : 'POST';
      const payload = { title: aboutForm.title, content: aboutForm.content, order: aboutForm.order };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Save failed');
      setMessage({ type: 'success', text: aboutEditId ? 'About item updated.' : 'About item created.' });
      resetAboutForm();
      fetchAboutItems();
    } catch (err) {
      console.error('Failed to save about item', err);
      setMessage({ type: 'error', text: 'Failed to save about item.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteAbout = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this about item?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/about/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setMessage({ type: 'success', text: 'About item deleted.' });
      fetchAboutItems();
    } catch (err) {
      console.error('Failed to delete about item', err);
      setMessage({ type: 'error', text: 'Failed to delete about item.' });
    }
  };

  const editAbout = (item: AboutRecord) => {
    setAboutEditId(item._id);
    setAboutForm({ title: item.title, content: item.content, order: item.order });
    setActiveSection('about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAboutForm = () => {
    setAboutForm({ title: '', content: '', order: 0 });
    setAboutEditId(null);
  };
  const submitResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) return;
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const res = await fetch('http://localhost:5000/api/resume', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      setMessage({ type: 'success', text: 'Resume uploaded successfully.' });
      setResumeFile(null);
      fetchResume();
    } catch (err) {
      console.error('Failed to upload resume', err);
      setMessage({ type: 'error', text: 'Failed to upload resume.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete the resume?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/resume/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setMessage({ type: 'success', text: 'Resume deleted.' });
      setResumeRecord(null);
    } catch (err) {
      console.error('Failed to delete resume', err);
      setMessage({ type: 'error', text: 'Failed to delete resume.' });
    }
  };

  const submitTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const url = timelineEditId ? `http://localhost:5000/api/timeline/${timelineEditId}` : 'http://localhost:5000/api/timeline';
      const method = timelineEditId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(timelineForm) });
      if (!res.ok) throw new Error('Save failed');
      setMessage({ type: 'success', text: timelineEditId ? 'Timeline entry updated.' : 'Timeline entry created.' });
      resetTimelineForm();
      fetchTimelineItems();
    } catch (err) {
      console.error('Failed to save timeline entry', err);
      setMessage({ type: 'error', text: 'Failed to save timeline entry.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteTimeline = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this timeline entry?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/timeline/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setMessage({ type: 'success', text: 'Timeline entry deleted.' });
      fetchTimelineItems();
    } catch (err) {
      console.error('Failed to delete timeline entry', err);
      setMessage({ type: 'error', text: 'Failed to delete timeline entry.' });
    }
  };

  const editTimeline = (item: TimelineRecord) => {
    setTimelineEditId(item._id);
    setTimelineForm({ 
      date: item.date, title: item.title, location: item.location, 
      description: item.description, type: item.type, iconUrl: item.iconUrl, order: item.order 
    });
    setActiveSection('timeline');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetTimelineForm = () => {
    setTimelineForm({ date: '', title: '', location: '', description: '', type: 'work', iconUrl: '', order: 100 });
    setTimelineEditId(null);
  };


  useEffect(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
    if (path === '/adminportal' || path === '/adminportal/' || isAdminPath) {
      setIsOpen(true);
    }
  }, [isAdminPath]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      certificateType: '',
      organization: '',
      issueDate: '',
      certificateId: '',
      description: '',
      imageUrl: '',
      pdfUrl: ''
    });
    setImageFile(null);
    setPdfFile(null);
    setEditId(null);
    setMessage(null);
  };

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
      setMessage(null);
    } else {
      setMessage({ type: 'error', text: 'Incorrect password' });
      setPassword('');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const handlePdfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPdfFile(event.target.files[0]);
    }
  };

  const fetchCertificates = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/certificates');
      const data = await response.json();
      setCertificates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load certificates', error);
      setMessage({ type: 'error', text: 'Unable to load certificates. Please refresh.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async (includeDeleted = false) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`http://localhost:5000/api/skills${includeDeleted ? '?includeDeleted=true' : ''}`);
      const data = await response.json();
      const skillsArray = Array.isArray(data) ? data : [];
      setSkills(skillsArray.sort((a: SkillRecord, b: SkillRecord) => a.displayOrder - b.displayOrder || a.category.localeCompare(b.category) || a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Failed to load skills', error);
      setMessage({ type: 'error', text: 'Unable to load skills. Please refresh.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/projects');
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load projects', error);
      setMessage({ type: 'error', text: 'Unable to load projects. Please refresh.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/achievements');
      const data = await response.json();
      setAchievements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load achievements', error);
      setMessage({ type: 'error', text: 'Unable to load achievements. Please refresh.' });
    } finally {
      setLoading(false);
    }
  };

  const resetSkillForm = () => {
    setSkillForm({ name: '', category: '', customCategory: '', level: 75, displayOrder: 100, description: '', iconUrl: '' });
    setSkillEditId(null);
    setSelectedSkill(null);
    setSkillIconFile(null);
    setMessage(null);
  };

  const resetProjectForm = () => {
    setProjectForm({ title: '', imageUrl: '', problem: '', features: [''], tech: '', github: '', demo: '', description: '' });
    setProjectEditId(null);
    setSelectedProject(null);
    setImageFile(null);
    setMessage(null);
  };

  const resetAchievementForm = () => {
    setAchievementForm({ title: '', description: '', icon: 'Star', color: 'from-blue-500 to-indigo-600' });
    setAchievementEditId(null);
    setSelectedAchievement(null);
    setMessage(null);
  };

  const handleSkillInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setSkillForm((prev) => ({
      ...prev,
      [name]: name === 'level' || name === 'displayOrder' ? Number(value) : value
    }));
  };

  const handleSkillIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSkillIconFile(event.target.files[0]);
    }
  };

  const handleProjectInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setProjectForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...projectForm.features];
    newFeatures[index] = value;
    setProjectForm({ ...projectForm, features: newFeatures });
  };

  const addFeature = () => {
    setProjectForm({ ...projectForm, features: [...projectForm.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = projectForm.features.filter((_, i) => i !== index);
    setProjectForm({ ...projectForm, features: newFeatures });
  };

  const handleAchievementInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setAchievementForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const submitCertificate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('category', formData.category);
      payload.append('certificateType', formData.certificateType);
      payload.append('organization', formData.organization);
      payload.append('issueDate', formData.issueDate);
      payload.append('certificateId', formData.certificateId);
      payload.append('description', formData.description);
      payload.append('imageUrl', formData.imageUrl);
      payload.append('pdfUrl', formData.pdfUrl);

      if (imageFile) payload.append('image', imageFile);
      if (pdfFile) payload.append('pdf', pdfFile);

      const url = editId ? `http://localhost:5000/api/certificates/${editId}` : 'http://localhost:5000/api/certificates';
      const method = editId ? 'PUT' : 'POST';
      const response = await fetch(url, { method, body: payload });

      if (!response.ok) {
        throw new Error('Save failed');
      }

      const result = await response.json();
      const saved = result.certificate ?? result;

      setCertificates((prev) => {
        if (editId) {
          return prev.map((item) => (item._id === editId ? saved : item));
        }
        return [saved, ...prev];
      });

      setMessage({ type: 'success', text: editId ? 'Certificate updated successfully.' : 'Certificate added successfully.' });
      resetForm();
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to save certificate', error);
      setMessage({ type: 'error', text: 'Could not save certificate. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const submitSkill = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const url = skillEditId ? `http://localhost:5000/api/skills/${skillEditId}` : 'http://localhost:5000/api/skills';
      const method = skillEditId ? 'PUT' : 'POST';
      const payload = new FormData();
      const selectedCategory = skillForm.category === 'Custom' ? skillForm.customCategory : skillForm.category;

      payload.append('name', skillForm.name);
      payload.append('category', selectedCategory);
      payload.append('level', String(skillForm.level));
      payload.append('displayOrder', String(skillForm.displayOrder));
      payload.append('description', skillForm.description);
      payload.append('iconUrl', skillForm.iconUrl || '');
      if (skillIconFile) {
        payload.append('icon', skillIconFile);
      }

      const response = await fetch(url, {
        method,
        body: payload
      });

      if (!response.ok) throw new Error('Skill save failed');
      const result = await response.json();
      const saved = result.skill ?? result;

      setSkills((prev) => {
        if (skillEditId) {
          return prev.map((item) => (item._id === skillEditId ? saved : item));
        }
        return [saved, ...prev];
      });

      setMessage({ type: 'success', text: skillEditId ? 'Skill updated successfully.' : 'Skill added successfully.' });
      resetSkillForm();
    } catch (error) {
      console.error('Failed to save skill', error);
      setMessage({ type: 'error', text: 'Could not save skill. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const submitProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = new FormData();
      payload.append('title', projectForm.title);
      payload.append('imageUrl', projectForm.imageUrl);
      payload.append('problem', projectForm.problem);
      payload.append('features', JSON.stringify(projectForm.features.filter(f => f.trim() !== '')));
      payload.append('tech', projectForm.tech);
      payload.append('github', projectForm.github);
      payload.append('demo', projectForm.demo);
      payload.append('description', projectForm.description);

      if (imageFile) {
        payload.append('image', imageFile);
      }

      const url = projectEditId ? `http://localhost:5000/api/projects/${projectEditId}` : 'http://localhost:5000/api/projects';
      const method = projectEditId ? 'PUT' : 'POST';
      const response = await fetch(url, { method, body: payload });

      if (!response.ok) throw new Error('Project save failed');
      const result = await response.json();
      const saved = result.project ?? result;

      setProjects((prev) => {
        if (projectEditId) {
          return prev.map((item) => (item._id === projectEditId ? saved : item));
        }
        return [saved, ...prev];
      });

      setMessage({ type: 'success', text: projectEditId ? 'Project updated successfully.' : 'Project added successfully.' });
      resetProjectForm();
    } catch (error) {
      console.error('Failed to save project', error);
      setMessage({ type: 'error', text: 'Could not save project. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const submitAchievement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const url = achievementEditId ? `http://localhost:5000/api/achievements/${achievementEditId}` : 'http://localhost:5000/api/achievements';
      const method = achievementEditId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achievementForm)
      });

      if (!response.ok) throw new Error('Achievement save failed');
      const result = await response.json();
      const saved = result.achievement ?? result;

      setAchievements((prev) => {
        if (achievementEditId) {
          return prev.map((item) => (item._id === achievementEditId ? saved : item));
        }
        return [saved, ...prev];
      });

      setMessage({ type: 'success', text: achievementEditId ? 'Achievement updated successfully.' : 'Achievement added successfully.' });
      resetAchievementForm();
    } catch (error) {
      console.error('Failed to save achievement', error);
      setMessage({ type: 'error', text: 'Could not save achievement. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const knownSkillCategories = ['Frontend', 'Backend', 'Database', 'Tools', 'Cloud'];

  const handleSkillEdit = (skill: SkillRecord) => {
    setSkillEditId(skill._id);
    setSkillForm({
      name: skill.name,
      category: knownSkillCategories.includes(skill.category) ? skill.category : 'Custom',
      customCategory: knownSkillCategories.includes(skill.category) ? '' : skill.category,
      level: skill.level,
      displayOrder: skill.displayOrder ?? 100,
      description: skill.description,
      iconUrl: skill.iconUrl || ''
    });
    setSkillIconFile(null);
    setSelectedSkill(null);
    setMessage(null);
  };

  const handleProjectEdit = (project: ProjectRecord) => {
    setProjectEditId(project._id);
    setProjectForm({
      title: project.title,
      imageUrl: project.imageUrl,
      problem: project.problem,
      features: project.features.length > 0 ? [...project.features] : [''],
      tech: project.tech.join(', '),
      github: project.github,
      demo: project.demo,
      description: project.description
    });
    setSelectedProject(null);
    setImageFile(null);
    setMessage(null);
  };

  const handleAchievementEdit = (achievement: AchievementRecord) => {
    setAchievementEditId(achievement._id);
    setAchievementForm({
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon || 'Star',
      color: achievement.color || 'from-blue-500 to-indigo-600'
    });
    setSelectedAchievement(null);
    setMessage(null);
  };

  const handleSkillDelete = (skill: SkillRecord) => {
    setSkillDeleteTarget(skill);
    setMessage(null);
  };

  const handleConfirmSkillDelete = async () => {
    if (!skillDeleteTarget) return;
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`http://localhost:5000/api/skills/${skillDeleteTarget._id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      setSkills((prev) => prev.filter((item) => item._id !== skillDeleteTarget._id));
      setMessage({ type: 'success', text: 'Skill deleted successfully.' });
      setSkillDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete skill', error);
      setMessage({ type: 'error', text: 'Could not delete skill. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreSkill = async (skill: SkillRecord) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`http://localhost:5000/api/skills/${skill._id}/restore`, { method: 'POST' });
      if (!response.ok) throw new Error('Restore failed');
      await fetchSkills(showDeletedSkills);
      setMessage({ type: 'success', text: 'Skill restored successfully.' });
    } catch (error) {
      console.error('Failed to restore skill', error);
      setMessage({ type: 'error', text: 'Could not restore skill. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectDelete = async (project: ProjectRecord) => {
    if (!window.confirm(`Delete project “${project.title}”?`)) return;
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`http://localhost:5000/api/projects/${project._id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      setProjects((prev) => prev.filter((item) => item._id !== project._id));
      setMessage({ type: 'success', text: 'Project deleted successfully.' });
    } catch (error) {
      console.error('Failed to delete project', error);
      setMessage({ type: 'error', text: 'Could not delete project. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAchievementDelete = async (achievement: AchievementRecord) => {
    if (!window.confirm(`Delete achievement “${achievement.title}”?`)) return;
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`http://localhost:5000/api/achievements/${achievement._id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      setAchievements((prev) => prev.filter((item) => item._id !== achievement._id));
      setMessage({ type: 'success', text: 'Achievement deleted successfully.' });
    } catch (error) {
      console.error('Failed to delete achievement', error);
      setMessage({ type: 'error', text: 'Could not delete achievement. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSkillView = (skill: SkillRecord) => {
    setSelectedSkill(skill);
  };

  const toggleSkillViewMode = (mode: 'table' | 'card') => {
    setSkillViewMode(mode);
  };

  const toggleShowDeletedSkills = () => {
    const nextValue = !showDeletedSkills;
    setShowDeletedSkills(nextValue);
    fetchSkills(nextValue);
  };

  const handleProjectView = (project: ProjectRecord) => {
    setSelectedProject(project);
  };

  const handleAchievementView = (achievement: AchievementRecord) => {
    setSelectedAchievement(achievement);
  };

  const handleEdit = (certificate: CertificateRecord) => {
    setEditId(certificate._id);
    setFormData({
      title: certificate.title,
      category: certificate.category,
      certificateType: certificate.certificateType,
      organization: certificate.organization,
      issueDate: certificate.issueDate.split('T')[0],
      certificateId: certificate.certificateId,
      description: certificate.description,
      imageUrl: certificate.imageUrl,
      pdfUrl: certificate.pdfUrl ?? ''
    });
    setImageFile(null);
    setPdfFile(null);
    setMessage(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`http://localhost:5000/api/certificates/${deleteTarget._id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');

      setCertificates((prev) => prev.filter((item) => item._id !== deleteTarget._id));
      setMessage({ type: 'success', text: 'Certificate deleted successfully.' });
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete certificate', error);
      setMessage({ type: 'error', text: 'Could not delete certificate. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (certificate: CertificateRecord) => {
    setSelectedCertificate(certificate);
  };

  const closeAdminPanel = () => {
    if (isAdminPath && typeof window !== 'undefined') {
      window.location.pathname = '/';
      return;
    }

    setIsOpen(false);
    setIsAuthenticated(false);
    resetForm();
    setSelectedCertificate(null);
    setDeleteTarget(null);
  };

  return (
    <>
      {!isAdminPath && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Admin Panel"
        >
          <Upload className="w-6 h-6" />
        </motion.button>
      )}

      {(isOpen || isAdminPath) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`${isAdminPath ? 'bg-gray-950 p-4 min-h-screen' : 'fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4'}`}
          onClick={isAdminPath ? undefined : () => !isAuthenticated && setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            className={`${isAdminPath ? 'min-h-screen' : 'w-full max-w-6xl max-h-[90vh]'} bg-gray-900 rounded-2xl w-full overflow-hidden shadow-2xl border border-gray-800`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 p-6 border-b border-gray-800 bg-gray-900">
              <div>
                <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
                <p className="text-sm text-gray-400">Manage certificates with stable CRUD actions.</p>
              </div>
              <div className="flex items-center gap-3">
                {isAuthenticated && (
                  <motion.button
                    onClick={closeAdminPanel}
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white transition-all hover:border-primary"
                  >
                    Close
                  </motion.button>
                )}
                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Close panel"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            <div className="overflow-y-auto px-6 py-6 h-full w-full flex flex-col gap-6">
              {!isAuthenticated ? (
                <motion.form
                  onSubmit={handlePasswordSubmit}
                  className="space-y-6 rounded-3xl border border-gray-800 bg-gray-950 p-6 shadow-lg"
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">Admin Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter admin password"
                      className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>

                  {message && (
                    <div
                      className={`rounded-2xl p-4 text-sm ${
                        message.type === 'error'
                          ? 'bg-red-500/15 border border-red-500 text-red-300'
                          : 'bg-emerald-500/15 border border-emerald-500 text-emerald-300'
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
                  >
                    Authenticate
                  </button>
                </motion.form>
              ) : (
                <>
                  <div className="mb-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Admin Portal</h3>
                        <p className="text-sm text-gray-400">Manage Certificates, Skills, Projects and Honors & Achievements.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['certificates', 'skills', 'projects', 'achievements', 'about', 'resume', 'timeline'].map((section) => (
                          <button
                            key={section}
                            type="button"
                            onClick={() => setActiveSection(section as any)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                              activeSection === section
                                ? 'bg-primary text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {activeSection === 'certificates' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr] w-full">
                      <section className="rounded-3xl border border-gray-800 bg-gray-950 p-5 shadow-lg flex flex-col">
                        <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Certificates</h3>
                        <p className="text-sm text-gray-400">View, edit, or delete certificates without layout shifts.</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{certificates.length} total</span>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900">
                      <table className="min-w-full table-fixed border-separate border-spacing-0 text-left text-sm text-gray-300">
                        <thead className="bg-gray-950 text-xs uppercase text-gray-500">
                          <tr>
                            <th className="w-[24%] px-4 py-3">Title</th>
                            <th className="w-[18%] px-4 py-3">Category</th>
                            <th className="w-[18%] px-4 py-3">Type</th>
                            <th className="w-[16%] px-4 py-3">Issued</th>
                            <th className="w-[12%] px-4 py-3">Status</th>
                            <th className="w-[12%] px-4 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 bg-gray-900">
                          {visibleCertificates.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                                No certificates available yet.
                              </td>
                            </tr>
                          ) : (
                            visibleCertificates.map((item) => (
                              <tr key={item._id} className="hover:bg-gray-800 transition-colors">
                                <td className="max-w-[220px] px-4 py-4 align-top text-sm text-white">
                                  <div className="truncate font-medium">{item.title}</div>
                                  <div className="text-xs text-gray-500">{item.organization}</div>
                                </td>
                                <td className="px-4 py-4 align-top truncate">{item.category}</td>
                                <td className="px-4 py-4 align-top truncate">{item.certificateType}</td>
                                <td className="px-4 py-4 align-top text-sm text-gray-400">{new Date(item.issueDate).toLocaleDateString()}</td>
                                <td className="px-4 py-4 align-top text-sm text-emerald-300">Active</td>
                                <td className="px-4 py-4 align-top">
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleView(item)}
                                      className="inline-flex items-center gap-1 rounded-2xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300 transition-all hover:border-primary"
                                    >
                                      <Eye className="w-3.5 h-3.5" /> View
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleEdit(item)}
                                      className="inline-flex items-center gap-1 rounded-2xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300 transition-all hover:border-primary"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteTarget(item)}
                                      className="inline-flex items-center gap-1 rounded-2xl border border-red-700 bg-red-800/70 px-3 py-2 text-xs text-red-100 transition-all hover:bg-red-700"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-gray-300">
                      <span>Page {currentPage} of {totalPages}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          className="inline-flex items-center gap-1 rounded-2xl border border-gray-700 bg-gray-800 px-3 py-2 transition-all hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ArrowLeft className="w-4 h-4" /> Prev
                        </button>
                        <button
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          className="inline-flex items-center gap-1 rounded-2xl border border-gray-700 bg-gray-800 px-3 py-2 transition-all hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Next <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </section>

                      <section className="rounded-3xl border border-gray-800 bg-gray-950 p-5 shadow-lg h-fit">
                        <div className="mb-5">
                          <h3 className="text-lg font-semibold text-white">{editId ? 'Update Certificate' : 'Create Certificate'}</h3>
                      <p className="text-sm text-gray-400">This section preserves layout while you add or edit records.</p>
                    </div>

                    {message && (
                      <div
                        className={`rounded-2xl p-4 mb-4 text-sm ${
                          message.type === 'error'
                            ? 'bg-red-500/15 border border-red-500 text-red-300'
                            : 'bg-emerald-500/15 border border-emerald-500 text-emerald-300'
                        }`}
                      >
                        {message.text}
                      </div>
                    )}

                    <form onSubmit={submitCertificate} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="block text-sm text-gray-300">
                          <span className="mb-2 block font-medium">Title</span>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Certificate title"
                            className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                            required
                          />
                        </label>
                        <label className="block text-sm text-gray-300">
                          <span className="mb-2 block font-medium">Category</span>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                            required
                          >
                            <option value="">Select category</option>
                            <option value="Academic Certificates">Academic Certificates</option>
                            <option value="Technical Certificates">Technical Certificates</option>
                            <option value="Other">Other</option>
                          </select>
                        </label>
                        <label className="block text-sm text-gray-300">
                          <span className="mb-2 block font-medium">Type</span>
                          <input
                            type="text"
                            name="certificateType"
                            value={formData.certificateType}
                            onChange={handleInputChange}
                            placeholder="Certificate type"
                            className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                            required
                          />
                        </label>
                        <label className="block text-sm text-gray-300">
                          <span className="mb-2 block font-medium">Organization</span>
                          <input
                            type="text"
                            name="organization"
                            value={formData.organization}
                            onChange={handleInputChange}
                            placeholder="Issuing organization"
                            className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                            required
                          />
                        </label>
                        <label className="block text-sm text-gray-300">
                          <span className="mb-2 block font-medium">Issue Date</span>
                          <input
                            type="date"
                            name="issueDate"
                            value={formData.issueDate}
                            onChange={handleInputChange}
                            className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                            required
                          />
                        </label>
                        <label className="block text-sm text-gray-300">
                          <span className="mb-2 block font-medium">Certificate ID</span>
                          <input
                            type="text"
                            name="certificateId"
                            value={formData.certificateId}
                            onChange={handleInputChange}
                            placeholder="Optional ID"
                            className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                          />
                        </label>
                      </div>

                      <label className="block text-sm text-gray-300">
                        <span className="mb-2 block font-medium">Description</span>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Certificate description"
                          className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all resize-none"
                        />
                      </label>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="block text-sm text-gray-300">
                          <span className="mb-2 block font-medium">Image URL</span>
                          <input
                            type="text"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleInputChange}
                            placeholder="Optional remote image URL"
                            className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                          />
                        </label>
                        <label className="block text-sm text-gray-300">
                          <span className="mb-2 block font-medium">PDF URL</span>
                          <input
                            type="text"
                            name="pdfUrl"
                            value={formData.pdfUrl}
                            onChange={handleInputChange}
                            placeholder="Optional remote PDF URL"
                            className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <span className="mb-2 block text-sm font-medium text-gray-300">Image File</span>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="sr-only"
                              id="admin-image-input"
                            />
                            <label
                              htmlFor="admin-image-input"
                              className="flex h-full min-h-[54px] items-center justify-between rounded-2xl border border-dashed border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-300 transition-all hover:border-primary"
                            >
                              <span>{imageFile ? imageFile.name : 'Choose image file'}</span>
                              <Upload className="w-4 h-4 text-gray-400" />
                            </label>
                          </div>
                        </div>
                        <div>
                          <span className="mb-2 block text-sm font-medium text-gray-300">PDF File</span>
                          <div className="relative">
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={handlePdfChange}
                              className="sr-only"
                              id="admin-pdf-input"
                            />
                            <label
                              htmlFor="admin-pdf-input"
                              className="flex h-full min-h-[54px] items-center justify-between rounded-2xl border border-dashed border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-300 transition-all hover:border-primary"
                            >
                              <span>{pdfFile ? pdfFile.name : 'Choose PDF file'}</span>
                              <Upload className="w-4 h-4 text-gray-400" />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {editId ? 'Update Certificate' : 'Create Certificate'}
                        </button>
                        <button
                          type="button"
                          onClick={resetForm}
                          className="w-full rounded-2xl border border-gray-700 bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition-all hover:border-primary"
                        >
                          Reset
                        </button>
                      </div>
                        </form>
                      </section>
                    </div>
                  )}

                  {activeSection === 'skills' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr] w-full">
                      <section className="rounded-3xl border border-gray-800 bg-gray-950 p-5 shadow-lg flex flex-col">
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Technical Skills</h3>
                        <p className="text-sm text-gray-400">Create, update, view and restore skill entries with flexible category and icon support.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSkillViewMode('table')}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${skillViewMode === 'table' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                        >
                          Table View
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSkillViewMode('card')}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${skillViewMode === 'card' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                        >
                          Card View
                        </button>
                        <button
                          type="button"
                          onClick={toggleShowDeletedSkills}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${showDeletedSkills ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                        >
                          {showDeletedSkills ? 'Showing Deleted' : 'Show Deleted'}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gray-800 bg-gray-900 p-4 text-sm text-gray-300">
                      <span>{skills.length} {showDeletedSkills ? 'deleted' : 'active'} skills</span>
                      <span className="text-gray-400">Use the form below to add or edit skills, including icon upload and display order.</span>
                    </div>

                    {skillViewMode === 'table' ? (
                      <div className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900">
                        <table className="min-w-full table-fixed border-separate border-spacing-0 text-left text-sm text-gray-300">
                          <thead className="bg-gray-950 text-xs uppercase text-gray-500">
                            <tr>
                              <th className="w-[22%] px-4 py-3">Name</th>
                              <th className="w-[18%] px-4 py-3">Category</th>
                              <th className="w-[12%] px-4 py-3">Order</th>
                              <th className="w-[12%] px-4 py-3">Level</th>
                              <th className="w-[18%] px-4 py-3">Icon</th>
                              <th className="w-[18%] px-4 py-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800 bg-gray-900">
                            {skills.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                                  No skills available yet.
                                </td>
                              </tr>
                            ) : (
                              skills.map((skill) => (
                                <tr key={skill._id} className="hover:bg-gray-800 transition-colors">
                                  <td className="px-4 py-4 align-top text-sm text-white">{skill.name}</td>
                                  <td className="px-4 py-4 align-top text-sm text-gray-300">{skill.category}</td>
                                  <td className="px-4 py-4 align-top text-sm text-gray-300">{skill.displayOrder}</td>
                                  <td className="px-4 py-4 align-top text-sm text-emerald-300">{skill.level}%</td>
                                  <td className="px-4 py-4 align-top text-sm text-gray-200">
                                    {skill.iconUrl ? (
                                      <img src={skill.iconUrl} alt={skill.name} className="h-8 w-8 rounded-full object-cover" />
                                    ) : (
                                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-xs text-gray-400">N/A</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 align-top">
                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleSkillView(skill)}
                                        className="inline-flex items-center gap-1 rounded-2xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300 transition-all hover:border-primary"
                                      >
                                        <Eye className="w-3.5 h-3.5" /> View
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSkillEdit(skill)}
                                        className="inline-flex items-center gap-1 rounded-2xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300 transition-all hover:border-primary"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" /> Edit
                                      </button>
                                      {showDeletedSkills ? (
                                        <button
                                          type="button"
                                          onClick={() => handleRestoreSkill(skill)}
                                          className="inline-flex items-center gap-1 rounded-2xl border border-emerald-700 bg-emerald-800/70 px-3 py-2 text-xs text-emerald-100 transition-all hover:bg-emerald-700"
                                        >
                                          Restore
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleSkillDelete(skill)}
                                          className="inline-flex items-center gap-1 rounded-2xl border border-red-700 bg-red-800/70 px-3 py-2 text-xs text-red-100 transition-all hover:bg-red-700"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {skills.length === 0 ? (
                          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-6 text-center text-sm text-gray-500">
                            No skills available yet.
                          </div>
                        ) : (
                          skills.map((skill) => (
                            <div key={skill._id} className="rounded-3xl border border-gray-800 bg-gray-900 p-5 shadow-sm">
                              <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                  <h4 className="text-white text-base font-semibold">{skill.name}</h4>
                                  <p className="text-xs uppercase text-gray-500">{skill.category}</p>
                                </div>
                                {skill.iconUrl ? (
                                  <img src={skill.iconUrl} alt={skill.name} className="h-12 w-12 rounded-full object-cover" />
                                ) : (
                                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-xs text-gray-500">Icon</span>
                                )}
                              </div>
                              <div className="space-y-2 text-sm text-gray-300">
                                <p><span className="font-semibold text-gray-400">Order:</span> {skill.displayOrder}</p>
                                <p><span className="font-semibold text-gray-400">Level:</span> {skill.level}%</p>
                                <p>{skill.description || 'No description provided.'}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSkillView(skill)}
                                    className="rounded-2xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300 transition-all hover:border-primary"
                                  >
                                    View
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSkillEdit(skill)}
                                    className="rounded-2xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300 transition-all hover:border-primary"
                                  >
                                    Edit
                                  </button>
                                  {showDeletedSkills ? (
                                    <button
                                      type="button"
                                      onClick={() => handleRestoreSkill(skill)}
                                      className="rounded-2xl border border-emerald-700 bg-emerald-800/70 px-3 py-2 text-xs text-emerald-100 transition-all hover:bg-emerald-700"
                                    >
                                      Restore
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSkillDelete(skill)}
                                      className="rounded-2xl border border-red-700 bg-red-800/70 px-3 py-2 text-xs text-red-100 transition-all hover:bg-red-700"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {selectedSkill && (
                      <div className="mt-4 rounded-3xl border border-gray-800 bg-gray-900 p-4 text-sm text-gray-300">
                        <h4 className="text-white font-semibold">Selected Skill</h4>
                        <p className="mt-2"><span className="font-semibold text-gray-400">Name:</span> {selectedSkill.name}</p>
                        <p className="mt-2"><span className="font-semibold text-gray-400">Category:</span> {selectedSkill.category}</p>
                        <p className="mt-2"><span className="font-semibold text-gray-400">Order:</span> {selectedSkill.displayOrder}</p>
                        <p className="mt-2"><span className="font-semibold text-gray-400">Level:</span> {selectedSkill.level}%</p>
                        <p className="mt-2"><span className="font-semibold text-gray-400">Description:</span> {selectedSkill.description || 'N/A'}</p>
                      </div>
                    )}

                      </section>

                      <section className="rounded-3xl border border-gray-800 bg-gray-950 p-5 shadow-lg h-fit">
                        <h4 className="text-lg font-semibold text-white mb-4">{skillEditId ? 'Update Skill' : 'Create Skill'}</h4>
                        <form onSubmit={submitSkill} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <label className="block text-sm text-gray-300">
                            <span className="mb-2 block font-medium">Skill Name</span>
                            <input
                              type="text"
                              name="name"
                              value={skillForm.name}
                              onChange={handleSkillInputChange}
                              placeholder="Skill name"
                              className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                              required
                            />
                          </label>
                          <label className="block text-sm text-gray-300">
                            <span className="mb-2 block font-medium">Category</span>
                            <select
                              name="category"
                              value={skillForm.category}
                              onChange={handleSkillInputChange}
                              className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                              required
                            >
                              <option value="">Select category</option>
                              <option value="Frontend">Frontend</option>
                              <option value="Backend">Backend</option>
                              <option value="Database">Database</option>
                              <option value="Tools">Tools</option>
                              <option value="Cloud">Cloud</option>
                              <option value="Custom">Add manually</option>
                            </select>
                          </label>
                        </div>
                        {skillForm.category === 'Custom' && (
                          <label className="block text-sm text-gray-300">
                            <span className="mb-2 block font-medium">Manual Category</span>
                            <input
                              type="text"
                              name="customCategory"
                              value={skillForm.customCategory}
                              onChange={handleSkillInputChange}
                              placeholder="Enter custom category"
                              className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                              required
                            />
                          </label>
                        )}
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {skillEditId ? 'Update Skill' : 'Create Skill'}
                          </button>
                          <button
                            type="button"
                            onClick={resetSkillForm}
                            className="w-full rounded-2xl border border-gray-700 bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition-all hover:border-primary"
                          >
                            Reset
                          </button>
                        </div>
                        </form>
                      </section>
                    </div>
                  )}

                  {activeSection === 'projects' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr] w-full">
                      <section className="rounded-3xl border border-gray-800 bg-gray-950 p-5 shadow-lg flex flex-col">
                        <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Projects</h3>
                        <p className="text-sm text-gray-400">Create, update, view and delete project cards.</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{projects.length} total</span>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900">
                      <table className="min-w-full table-fixed border-separate border-spacing-0 text-left text-sm text-gray-300">
                        <thead className="bg-gray-950 text-xs uppercase text-gray-500">
                          <tr>
                            <th className="w-[30%] px-4 py-3">Title</th>
                            <th className="w-[20%] px-4 py-3">Tech</th>
                            <th className="w-[20%] px-4 py-3">Links</th>
                            <th className="w-[30%] px-4 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 bg-gray-900">
                          {projects.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-500">
                                No projects available yet.
                              </td>
                            </tr>
                          ) : (
                            projects.map((project) => (
                              <tr key={project._id} className="hover:bg-gray-800 transition-colors">
                                <td className="px-4 py-4 align-top text-sm text-white">{project.title}</td>
                                <td className="px-4 py-4 align-top text-sm text-gray-300">{project.tech.slice(0, 3).join(', ') || 'N/A'}</td>
                                <td className="px-4 py-4 align-top text-sm text-gray-300">
                                  {project.github ? 'GitHub' : '—'} · {project.demo ? 'Demo' : '—'}
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleProjectView(project)}
                                      className="inline-flex items-center gap-1 rounded-2xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300 transition-all hover:border-primary"
                                    >
                                      <Eye className="w-3.5 h-3.5" /> View
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleProjectEdit(project)}
                                      className="inline-flex items-center gap-1 rounded-2xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300 transition-all hover:border-primary"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleProjectDelete(project)}
                                      className="inline-flex items-center gap-1 rounded-2xl border border-red-700 bg-red-800/70 px-3 py-2 text-xs text-red-100 transition-all hover:bg-red-700"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {selectedProject && (
                      <div className="mt-4 rounded-3xl border border-gray-800 bg-gray-900 p-4 text-sm text-gray-300">
                        <h4 className="text-white font-semibold">Selected Project</h4>
                        <p className="mt-2"><span className="font-semibold text-gray-400">Title:</span> {selectedProject.title}</p>
                        <p className="mt-2"><span className="font-semibold text-gray-400">Problem:</span> {selectedProject.problem}</p>
                        <p className="mt-2"><span className="font-semibold text-gray-400">Tech:</span> {selectedProject.tech.join(', ') || 'N/A'}</p>
                        <p className="mt-2"><span className="font-semibold text-gray-400">Links:</span> {selectedProject.github || 'No GitHub'} / {selectedProject.demo || 'No Demo'}</p>
                      </div>
                    )}

                      </section>

                      <section className="rounded-3xl border border-gray-800 bg-gray-950 p-5 shadow-lg h-fit">
                        <h4 className="text-lg font-semibold text-white mb-4">{projectEditId ? 'Update Project' : 'Create Project'}</h4>
                        <form onSubmit={submitProject} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <label className="block text-sm text-gray-300">
                            <span className="mb-2 block font-medium">Title</span>
                            <input
                              type="text"
                              name="title"
                              value={projectForm.title}
                              onChange={handleProjectInputChange}
                              placeholder="Project title"
                              className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                              required
                            />
                          </label>
                          <label className="block text-sm text-gray-300">
                            <span className="mb-2 block font-medium">Image URL</span>
                            <input
                              type="text"
                              name="imageUrl"
                              value={projectForm.imageUrl}
                              onChange={handleProjectInputChange}
                              placeholder="Optional remote image URL"
                              className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                            />
                          </label>
                          <label className="block text-sm text-gray-300">
                            <span className="mb-2 block font-medium">GitHub Link</span>
                            <input
                              type="url"
                              name="github"
                              value={projectForm.github}
                              onChange={handleProjectInputChange}
                              placeholder="https://github.com/..."
                              className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                            />
                          </label>
                          <label className="block text-sm text-gray-300">
                            <span className="mb-2 block font-medium">Live Demo</span>
                            <input
                              type="url"
                              name="demo"
                              value={projectForm.demo}
                              onChange={handleProjectInputChange}
                              placeholder="https://..."
                              className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                            />
                          </label>
                        </div>
                        <label className="block text-sm text-gray-300">
                          <span className="mb-2 block font-medium">Problem Statement</span>
                          <textarea
                            name="problem"
                            value={projectForm.problem}
                            onChange={handleProjectInputChange}
                            rows={3}
                            placeholder="Project problem / goal"
                            className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all resize-none"
                          />
                        </label>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="block text-sm text-gray-300">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="font-medium">Features</span>
                              <button type="button" onClick={addFeature} className="text-xs text-primary hover:text-white transition-colors">
                                + Add Feature
                              </button>
                            </div>
                            <div className="space-y-2">
                              {projectForm.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={feature}
                                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                                    placeholder={`Feature ${idx + 1}`}
                                    className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeFeature(idx)}
                                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <label className="block text-sm text-gray-300">
                            <span className="mb-2 block font-medium">Technology Tags</span>
                            <input
                              type="text"
                              name="tech"
                              value={projectForm.tech}
                              onChange={handleProjectInputChange}
                              placeholder="Comma-separated tech tags"
                              className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                            />
                          </label>
                        </div>
                        <label className="block text-sm text-gray-300">
                          <span className="mb-2 block font-medium">Description</span>
                          <textarea
                            name="description"
                            value={projectForm.description}
                            onChange={handleProjectInputChange}
                            rows={3}
                            placeholder="Project description"
                            className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all resize-none"
                          />
                        </label>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <span className="mb-2 block text-sm font-medium text-gray-300">Image File</span>
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="sr-only"
                                id="admin-project-image-input"
                              />
                              <label
                                htmlFor="admin-project-image-input"
                                className="flex h-full min-h-[54px] items-center justify-between rounded-2xl border border-dashed border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-300 transition-all hover:border-primary"
                              >
                                <span>{imageFile ? imageFile.name : 'Choose image file'}</span>
                                <Upload className="w-4 h-4 text-gray-400" />
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {projectEditId ? 'Update Project' : 'Create Project'}
                          </button>
                          <button
                            type="button"
                            onClick={resetProjectForm}
                            className="w-full rounded-2xl border border-gray-700 bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition-all hover:border-primary"
                          >
                            Reset
                          </button>
                        </div>
                        </form>
                      </section>
                    </div>
                  )}

                  {activeSection === 'achievements' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr] w-full">
                      <section className="rounded-3xl border border-gray-800 bg-gray-950 p-5 shadow-lg flex flex-col">
                        <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Honors & Achievements</h3>
                        <p className="text-sm text-gray-400">Create, update, view and delete achievement items.</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{achievements.length} total</span>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900">
                      <table className="min-w-full table-fixed border-separate border-spacing-0 text-left text-sm text-gray-300">
                        <thead className="bg-gray-950 text-xs uppercase text-gray-500">
                          <tr>
                            <th className="w-[40%] px-4 py-3">Title</th>
                            <th className="w-[40%] px-4 py-3">Icon</th>
                            <th className="w-[20%] px-4 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 bg-gray-900">
                          {achievements.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-4 py-10 text-center text-sm text-gray-500">
                                No achievements available yet.
                              </td>
                            </tr>
                          ) : (
                            achievements.map((achievement) => (
                              <tr key={achievement._id} className="hover:bg-gray-800 transition-colors">
                                <td className="px-4 py-4 align-top text-sm text-white">{achievement.title}</td>
                                <td className="px-4 py-4 align-top text-sm text-gray-300">{achievement.icon}</td>
                                <td className="px-4 py-4 align-top">
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleAchievementView(achievement)}
                                      className="inline-flex items-center gap-1 rounded-2xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300 transition-all hover:border-primary"
                                    >
                                      <Eye className="w-3.5 h-3.5" /> View
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAchievementEdit(achievement)}
                                      className="inline-flex items-center gap-1 rounded-2xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300 transition-all hover:border-primary"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAchievementDelete(achievement)}
                                      className="inline-flex items-center gap-1 rounded-2xl border border-red-700 bg-red-800/70 px-3 py-2 text-xs text-red-100 transition-all hover:bg-red-700"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {selectedAchievement && (
                      <div className="mt-4 rounded-3xl border border-gray-800 bg-gray-900 p-4 text-sm text-gray-300">
                        <h4 className="text-white font-semibold">Selected Achievement</h4>
                        <p className="mt-2"><span className="font-semibold text-gray-400">Title:</span> {selectedAchievement.title}</p>
                        <p className="mt-2"><span className="font-semibold text-gray-400">Icon:</span> {selectedAchievement.icon}</p>
                        <p className="mt-2"><span className="font-semibold text-gray-400">Color:</span> {selectedAchievement.color}</p>
                        <p className="mt-2"><span className="font-semibold text-gray-400">Description:</span> {selectedAchievement.description || 'N/A'}</p>
                      </div>
                    )}

                      </section>

                      <section className="rounded-3xl border border-gray-800 bg-gray-950 p-5 shadow-lg h-fit">
                        <h4 className="text-lg font-semibold text-white mb-4">{achievementEditId ? 'Update Achievement' : 'Create Achievement'}</h4>
                        <form onSubmit={submitAchievement} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <label className="block text-sm text-gray-300">
                            <span className="mb-2 block font-medium">Title</span>
                            <input
                              type="text"
                              name="title"
                              value={achievementForm.title}
                              onChange={handleAchievementInputChange}
                              placeholder="Achievement title"
                              className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                              required
                            />
                          </label>
                          <label className="block text-sm text-gray-300">
                            <span className="mb-2 block font-medium">Icon</span>
                            <select
                              name="icon"
                              value={achievementForm.icon}
                              onChange={handleAchievementInputChange}
                              className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                            >
                              <option value="Target">Target</option>
                              <option value="Star">Star</option>
                              <option value="Award">Award</option>
                              <option value="Zap">Zap</option>
                            </select>
                          </label>
                          <label className="block text-sm text-gray-300">
                            <span className="mb-2 block font-medium">Color</span>
                            <select
                              name="color"
                              value={achievementForm.color}
                              onChange={handleAchievementInputChange}
                              className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                            >
                              <option value="from-blue-500 to-indigo-600">Blue</option>
                              <option value="from-yellow-400 to-orange-500">Yellow</option>
                              <option value="from-green-400 to-emerald-600">Green</option>
                              <option value="from-pink-500 to-rose-600">Pink</option>
                            </select>
                          </label>
                        </div>
                        <label className="block text-sm text-gray-300">
                          <span className="mb-2 block font-medium">Description</span>
                          <textarea
                            name="description"
                            value={achievementForm.description}
                            onChange={handleAchievementInputChange}
                            rows={3}
                            placeholder="Achievement description"
                            className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all resize-none"
                          />
                        </label>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {achievementEditId ? 'Update Achievement' : 'Create Achievement'}
                          </button>
                          <button
                            type="button"
                            onClick={resetAchievementForm}
                            className="w-full rounded-2xl border border-gray-700 bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition-all hover:border-primary"
                          >
                            Reset
                          </button>
                        </div>
                        </form>
                      </section>
                    </div>
                  )}

                  {activeSection === 'about' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr] w-full">
                      <section className="rounded-3xl border border-gray-800 bg-gray-950 p-5 shadow-lg flex flex-col">
                        <div className="mb-5 flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">About Items</h3>
                            <p className="text-sm text-gray-400">Manage multiple about blocks (paragraphs) on your portfolio.</p>
                          </div>
                        </div>
                        <div className="flex-1 overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
                          <table className="w-full text-left text-sm text-gray-300">
                            <thead className="border-b border-gray-800 bg-gray-950/50 text-gray-400">
                              <tr>
                                <th className="px-4 py-3 font-medium">Order</th>
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Content Preview</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                              {aboutItems.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                    No about items found. Add one on the right.
                                  </td>
                                </tr>
                              ) : (
                                aboutItems.map((item) => (
                                  <tr key={item._id} className="transition-colors hover:bg-gray-800/50">
                                    <td className="px-4 py-3 font-medium text-white">{item.order}</td>
                                    <td className="px-4 py-3 font-medium text-white">{item.title}</td>
                                    <td className="px-4 py-3 text-gray-400 max-w-[200px] truncate">{item.content}</td>
                                    <td className="px-4 py-3 text-right">
                                      <div className="flex justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => editAbout(item)}
                                          className="rounded-lg bg-gray-800 p-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                                        >
                                          <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => deleteAbout(item._id)}
                                          className="rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </section>

                      <section className="rounded-3xl border border-gray-800 bg-gray-950 p-5 shadow-lg h-fit">
                        <div className="mb-5">
                          <h3 className="text-lg font-semibold text-white">{aboutEditId ? 'Update About Item' : 'Create About Item'}</h3>
                          <p className="text-sm text-gray-400">Add a new block of text to your about section.</p>
                        </div>

                        {message && (
                          <div
                            className={`rounded-2xl p-4 mb-4 text-sm ${
                              message.type === 'error'
                                ? 'bg-red-500/15 border border-red-500 text-red-300'
                                : 'bg-emerald-500/15 border border-emerald-500 text-emerald-300'
                            }`}
                          >
                            {message.text}
                          </div>
                        )}

                        <form onSubmit={submitAbout} className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <label className="block text-sm text-gray-300">
                              <span className="mb-2 block font-medium">Title</span>
                              <input
                                type="text"
                                required
                                value={aboutForm.title}
                                onChange={(e) => setAboutForm((s) => ({ ...s, title: e.target.value }))}
                                placeholder="e.g. Early Life, Education"
                                className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                              />
                            </label>

                            <label className="block text-sm text-gray-300">
                              <span className="mb-2 block font-medium">Order (Display Order)</span>
                              <input
                                type="number"
                                required
                                value={aboutForm.order}
                                onChange={(e) => setAboutForm((s) => ({ ...s, order: Number(e.target.value) }))}
                                className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                              />
                            </label>

                            <label className="block text-sm text-gray-300">
                              <span className="mb-2 block font-medium">Content / Paragraphs</span>
                              <textarea
                                required
                                value={aboutForm.content}
                                onChange={(e) => setAboutForm((s) => ({ ...s, content: e.target.value }))}
                                placeholder="Write the content for this about block..."
                                rows={6}
                                className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                              />
                            </label>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              type="submit"
                              disabled={loading}
                              className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {aboutEditId ? 'Update Item' : 'Create Item'}
                            </button>
                            <button
                              type="button"
                              onClick={resetAboutForm}
                              className="w-full rounded-2xl border border-gray-700 bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition-all hover:border-primary"
                            >
                              Reset
                            </button>
                          </div>
                        </form>
                      </section>
                    </div>
                  )}

                  {activeSection === 'resume' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr] w-full">
                      <section className="rounded-3xl border border-gray-800 bg-gray-950 p-5 shadow-lg flex flex-col">
                        <div className="mb-5 flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">Current Resume</h3>
                            <p className="text-sm text-gray-400">View and manage your resume PDF.</p>
                          </div>
                        </div>
                        {resumeRecord ? (
                          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 flex flex-col items-center justify-center text-center">
                            <h4 className="text-xl font-semibold text-white mb-2">{resumeRecord.originalName}</h4>
                            <p className="text-sm text-gray-400 mb-6">Uploaded: {new Date(resumeRecord.createdAt).toLocaleDateString()}</p>
                            <div className="flex gap-4">
                              <a href={`http://localhost:5000${resumeRecord.url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700">
                                <Eye className="w-4 h-4" /> View PDF
                              </a>
                              <button onClick={() => deleteResume(resumeRecord._id)} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500">
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-gray-800 border-dashed bg-gray-900/50 p-10 flex items-center justify-center text-gray-500">
                            No resume uploaded yet.
                          </div>
                        )}
                      </section>
                      <section className="rounded-3xl border border-gray-800 bg-gray-950 p-5 shadow-lg h-fit">
                        <h4 className="text-lg font-semibold text-white mb-4">Upload Resume</h4>
                        <form onSubmit={submitResume} className="space-y-4">
                          <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-700 bg-gray-900 p-6 transition-all hover:border-primary">
                            <Upload className="mb-2 h-8 w-8 text-gray-400" />
                            <p className="text-sm text-gray-400">{resumeFile ? resumeFile.name : 'Select PDF'}</p>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                              className="absolute inset-0 cursor-pointer opacity-0"
                              required
                            />
                          </div>
                          <button type="submit" disabled={loading || !resumeFile} className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed">
                            Upload
                          </button>
                        </form>
                      </section>
                    </div>
                  )}

                  {activeSection === 'timeline' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr] w-full">
                      <section className="rounded-3xl border border-gray-800 bg-gray-950 p-5 shadow-lg flex flex-col">
                        <div className="mb-5 flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">Timeline</h3>
                            <p className="text-sm text-gray-400">Manage Experience & Education.</p>
                          </div>
                        </div>
                        <div className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900">
                          <table className="min-w-full table-fixed border-separate border-spacing-0 text-left text-sm text-gray-300">
                            <thead className="bg-gray-950 text-xs uppercase text-gray-500">
                              <tr>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                              {timelineItems.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-800">
                                  <td className="px-4 py-3 truncate max-w-[150px]">{item.title}</td>
                                  <td className="px-4 py-3 whitespace-nowrap">{item.date}</td>
                                  <td className="px-4 py-3 capitalize">{item.type}</td>
                                  <td className="px-4 py-3 flex gap-2">
                                    <button type="button" onClick={() => editTimeline(item)} className="text-gray-400 hover:text-white"><Edit3 className="w-4 h-4"/></button>
                                    <button type="button" onClick={() => deleteTimeline(item._id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4"/></button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>
                      <section className="rounded-3xl border border-gray-800 bg-gray-950 p-5 shadow-lg h-fit">
                        <h4 className="text-lg font-semibold text-white mb-4">{timelineEditId ? 'Update Timeline' : 'Create Timeline'}</h4>
                        <form onSubmit={submitTimeline} className="space-y-4">
                          <input type="text" value={timelineForm.title} onChange={(e) => setTimelineForm(s => ({...s, title: e.target.value}))} placeholder="Role / Degree" required className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all" />
                          <input type="text" value={timelineForm.date} onChange={(e) => setTimelineForm(s => ({...s, date: e.target.value}))} placeholder="Date (e.g. 2021 - Present)" required className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all" />
                          <input type="text" value={timelineForm.location} onChange={(e) => setTimelineForm(s => ({...s, location: e.target.value}))} placeholder="Location / Company" className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all" />
                          <select value={timelineForm.type} onChange={(e) => setTimelineForm(s => ({...s, type: e.target.value}))} className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all">
                            <option value="work">Work Experience</option>
                            <option value="education">Education</option>
                            <option value="certification">Certification</option>
                          </select>
                          <textarea value={timelineForm.description} onChange={(e) => setTimelineForm(s => ({...s, description: e.target.value}))} placeholder="Description" rows={3} className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all resize-none" />
                          <input type="number" value={timelineForm.order} onChange={(e) => setTimelineForm(s => ({...s, order: Number(e.target.value)}))} placeholder="Order" className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all" />
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed">{timelineEditId ? 'Update' : 'Create'}</button>
                            <button type="button" onClick={resetTimelineForm} className="w-full rounded-2xl border border-gray-700 bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition-all hover:border-primary">Reset</button>
                          </div>
                        </form>
                      </section>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {selectedCertificate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedCertificate(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-3xl rounded-3xl bg-gray-950 border border-gray-800 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-800">
              <div>
                <h3 className="text-xl font-semibold text-white">Certificate Details</h3>
                <p className="text-sm text-gray-400">Viewing record without affecting page layout.</p>
              </div>
              <button type="button" onClick={() => setSelectedCertificate(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid gap-4 pt-6 lg:grid-cols-2">
              <div className="space-y-3 rounded-3xl border border-gray-800 bg-gray-900 p-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400">Title</h4>
                  <p className="text-white">{selectedCertificate.title}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-400">Organization</h4>
                  <p className="text-white">{selectedCertificate.organization}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-400">Category</h4>
                  <p className="text-white">{selectedCertificate.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-400">Type</h4>
                  <p className="text-white">{selectedCertificate.certificateType}</p>
                </div>
              </div>
              <div className="space-y-3 rounded-3xl border border-gray-800 bg-gray-900 p-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400">Issue Date</h4>
                  <p className="text-white">{new Date(selectedCertificate.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-400">Certificate ID</h4>
                  <p className="text-white">{selectedCertificate.certificateId || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-400">Image URL</h4>
                  <p className="truncate text-emerald-300">{selectedCertificate.imageUrl}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-400">PDF URL</h4>
                  <p className="truncate text-emerald-300">{selectedCertificate.pdfUrl || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-3xl border border-gray-800 bg-gray-900 p-4">
              <h4 className="text-sm font-semibold text-gray-400">Description</h4>
              <p className="whitespace-pre-line text-white">{selectedCertificate.description || 'No description provided.'}</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {deleteTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xl rounded-3xl bg-gray-950 border border-red-700 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-red-800">
              <div>
                <h3 className="text-xl font-semibold text-white">Confirm Delete</h3>
                <p className="text-sm text-gray-400">Deleting this record will not affect layout or pagination stability.</p>
              </div>
              <button type="button" onClick={() => setDeleteTarget(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-5 space-y-4 text-sm text-gray-300">
              <p>
                Are you sure you want to delete <span className="font-semibold text-white">{deleteTarget.title}</span>?
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="w-full rounded-2xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Delete Record
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {skillDeleteTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSkillDeleteTarget(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xl rounded-3xl bg-gray-950 border border-red-700 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-red-800">
              <div>
                <h3 className="text-xl font-semibold text-white">Confirm Delete</h3>
                <p className="text-sm text-gray-400">This skill will be soft deleted and can be restored later.</p>
              </div>
              <button type="button" onClick={() => setSkillDeleteTarget(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-5 space-y-4 text-sm text-gray-300">
              <p>
                Are you sure you want to delete <span className="font-semibold text-white">{skillDeleteTarget.name}</span>?
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setSkillDeleteTarget(null)}
                  className="w-full rounded-2xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSkillDelete}
                  disabled={loading}
                  className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Soft Delete Skill
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
