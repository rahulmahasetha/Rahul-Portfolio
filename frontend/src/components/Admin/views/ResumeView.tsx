import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, File as FileIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { StatsCard } from '../ui/StatsCard';

export interface ResumeRecord {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  createdAt: string;
}

export function ResumeView() {
  const [resume, setResume] = useState<ResumeRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/resume');
      const data = await response.json();
      setResume(data);
    } catch (error) {
      console.error('Failed to load resume', error);
    } finally {
      setLoading(false);
    }
  };

  const submitResume = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const payload = new FormData();
      payload.append('resume', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/resume`, { credentials: 'include', method: 'POST', body: payload, headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' }
      });
      
      if (!response.ok) throw new Error('Upload failed');
      const saved = await response.json();

      setResume(saved);
      setFile(null);
      setMessage({ type: 'success', text: 'Resume updated successfully.' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Could not upload resume.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-admin-card rounded-xl border border-admin-border">
              <FileText className="h-6 w-6 text-admin-primary" />
            </div>
            Resume
          </h1>
          <p className="mt-2 text-admin-text-secondary">Upload and manage your CV</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StatsCard 
          title="Current Resume" 
          value={resume ? "Uploaded" : "None"} 
          description={resume ? new Date(resume.createdAt).toLocaleDateString() : 'No resume uploaded yet'}
          icon={FileText} 
          iconColor="primary" 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-4 items-start">
        {/* Upload Form */}
        <div className="rounded-2xl border border-admin-border bg-admin-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-white">Upload New Resume</h2>
          
          {message && (
            <div className={`mb-6 rounded-xl p-4 text-sm ${message.type === 'success' ? 'bg-admin-success/10 text-admin-success' : 'bg-admin-danger/10 text-admin-danger'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={submitResume} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-admin-text-secondary">Resume File (PDF)</label>
              <div className="rounded-xl border-2 border-dashed border-admin-border bg-admin-surface/50 p-8 text-center hover:bg-admin-surface transition-colors cursor-pointer relative flex flex-col items-center justify-center min-h-[200px]">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  required
                />
                {file ? (
                  <>
                    <FileIcon className="h-10 w-10 text-admin-primary mb-3" />
                    <p className="text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-admin-text-secondary mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-admin-text-secondary mb-3" />
                    <p className="text-sm font-medium text-white">Click or drag PDF here to upload</p>
                  </>
                )}
              </div>
            </div>
            
            <Button type="submit" disabled={loading || !file} className="w-full">
              {loading ? 'Uploading...' : 'Upload Resume'}
            </Button>
          </form>
        </div>

        {/* Current Resume Info */}
        <div className="rounded-2xl border border-admin-border bg-admin-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-white">Current File</h2>
          {resume ? (
            <div className="flex flex-col items-center p-8 border border-admin-border rounded-xl bg-admin-surface text-center">
              <div className="w-full h-64 mb-4 overflow-hidden rounded border border-admin-border">
                <iframe
                  src={resume.url.endsWith('.pdf') ? `https://docs.google.com/gview?url=${encodeURIComponent(resume.url)}&embedded=true` : resume.url}
                  className="w-full h-full"
                  title="Resume Preview"
                />
              </div>
              <h3 className="text-lg font-medium text-white break-all mb-2">{resume.originalName}</h3>
              <p className="text-sm text-admin-text-secondary mb-6">
                Uploaded on {new Date(resume.createdAt).toLocaleDateString()}
              </p>
              <a href={resume.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" /> Download Resume
              </a>
            </div>
          ) : (
            <div className="py-12 text-center text-admin-text-secondary border border-dashed border-admin-border rounded-xl">
              No resume is currently uploaded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
