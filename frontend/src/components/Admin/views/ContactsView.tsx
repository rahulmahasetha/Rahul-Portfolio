import React, { useState, useEffect, useMemo } from 'react';
import { Mail, Search, Trash2, Calendar, User, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { StatsCard } from '../ui/StatsCard';

export interface ContactRecord {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export function ContactsView() {
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactRecord | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/contact');
      const data = await response.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load contacts', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  const deleteContact = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/contact/${id}`, { credentials: 'include', method: 'DELETE', headers: { 'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '' } });
      if (response.ok) {
        setContacts(prev => prev.filter(c => c._id !== id));
        if (selectedContact?._id === id) setSelectedContact(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-admin-card rounded-xl border border-admin-border">
              <Mail className="h-6 w-6 text-admin-primary" />
            </div>
            Messages
          </h1>
          <p className="mt-2 text-admin-text-secondary">View and manage contact form submissions</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard title="Total Messages" value={contacts.length} icon={MessageSquare} iconColor="primary" />
        <StatsCard title="Recent (30 days)" value={contacts.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} icon={Mail} iconColor="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[350px_1fr] items-start flex-1 min-h-[500px]">
        {/* Inbox List */}
        <div className="flex flex-col gap-4 rounded-2xl border border-admin-border bg-admin-card p-4 shadow-sm h-[600px] overflow-hidden">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-secondary" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-admin-border bg-admin-surface pl-9 pr-4 text-sm text-white focus:border-admin-primary focus:outline-none"
            />
          </div>

          <div className="overflow-y-auto pr-2 -mr-2 space-y-2 flex-1">
            {filteredContacts.length === 0 ? (
              <div className="py-12 text-center text-admin-text-secondary">
                No messages found.
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div 
                  key={contact._id} 
                  onClick={() => setSelectedContact(contact)}
                  className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                    selectedContact?._id === contact._id 
                      ? 'border-admin-primary bg-admin-primary/5' 
                      : 'border-admin-border bg-admin-surface hover:border-admin-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-white line-clamp-1">{contact.name}</h3>
                    <span className="text-xs text-admin-text-secondary shrink-0">{new Date(contact.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm font-medium text-admin-primary line-clamp-1 mb-1">{contact.subject}</p>
                  <p className="text-xs text-admin-text-secondary line-clamp-2">{contact.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail View */}
        <div className="rounded-2xl border border-admin-border bg-admin-card shadow-sm h-[600px] overflow-y-auto flex flex-col">
          {selectedContact ? (
            <>
              <div className="p-6 border-b border-admin-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 bg-admin-card/95 backdrop-blur z-10">
                <div className="w-full sm:w-auto overflow-hidden">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 truncate">{selectedContact.subject}</h2>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-admin-text-secondary w-full truncate">
                      <User className="h-4 w-4 shrink-0" />
                      <span className="text-white font-medium truncate">{selectedContact.name}</span>
                      <span className="truncate">({selectedContact.email})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-admin-text-secondary">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{new Date(selectedContact.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <a href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-admin-surface px-4 py-2 text-sm font-semibold text-white border border-admin-border hover:border-admin-primary transition-colors">
                    <Mail className="h-4 w-4" /> Reply
                  </a>
                  <Button variant="danger" onClick={() => deleteContact(selectedContact._id)} className="px-3">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-admin-text text-[15px] leading-relaxed">
                    {selectedContact.message}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-admin-text-secondary p-6">
              <Mail className="h-16 w-16 mb-4 opacity-20" />
              <p>Select a message to view its contents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
