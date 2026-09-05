import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Trash2,
  Search,
  Sparkles,
  Inbox,
} from 'lucide-react';
import {
  getSentEmails,
  subscribeEmailStore,
  markEmailAsRead,
  clearSentEmails,
  SentEmailRecord,
} from '../services/emailService';

export function EmailSandboxButton() {
  const [emails, setEmails] = useState<SentEmailRecord[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setEmails(getSentEmails());
    const unsubscribe = subscribeEmailStore((updated) => {
      setEmails(updated);
    });
    return unsubscribe;
  }, []);

  const unreadCount = emails.filter((e) => !e.read).length;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
        title="View Dispatched Email Sandbox Inbox"
      >
        <Mail className="w-3.5 h-3.5 text-purple-600" />
        <span className="hidden sm:inline">Email Sandbox</span>
        {emails.length > 0 && (
          <span className="px-1.5 py-0.2 rounded-full bg-purple-600 text-white text-[10px] font-bold">
            {emails.length}
          </span>
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
        )}
      </motion.button>

      <EmailSandboxModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export function EmailSandboxModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [emails, setEmails] = useState<SentEmailRecord[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<SentEmailRecord | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      const list = getSentEmails();
      setEmails(list);
      if (list.length > 0 && !selectedEmail) {
        setSelectedEmail(list[0]);
        markEmailAsRead(list[0].id);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const unsubscribe = subscribeEmailStore((updated) => {
      setEmails(updated);
      if (selectedEmail) {
        const refreshed = updated.find((e) => e.id === selectedEmail.id);
        if (refreshed) setSelectedEmail(refreshed);
      } else if (updated.length > 0) {
        setSelectedEmail(updated[0]);
      }
    });
    return unsubscribe;
  }, [selectedEmail]);

  if (!isOpen) return null;

  const filtered = emails.filter(
    (e) =>
      e.to.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.studioName.toLowerCase().includes(search.toLowerCase()) ||
      e.adminName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (email: SentEmailRecord) => {
    setSelectedEmail(email);
    if (!email.read) {
      markEmailAsRead(email.id);
    }
  };

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'rejection':
        return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl h-[85vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Modal Topbar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-900/40">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base tracking-tight font-display">
                  LUMINA Email Inbox Sandbox
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-900 text-purple-200 text-[10px] font-bold border border-purple-700">
                  Live Notifications ({emails.length})
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inspect registration, approval, and rejection emails dispatched by the platform.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {emails.length > 0 && (
              <button
                type="button"
                onClick={clearSentEmails}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Clear Email History"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear Sandbox</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split Inbox View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Email List Sidebar */}
          <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
            {/* Search */}
            <div className="p-3 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filtered.length === 0 ? (
                <div className="text-center py-12 px-4 text-slate-400 text-xs">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No email notifications captured yet.</p>
                  <p className="text-[11px] mt-1 text-slate-400">
                    Submit a studio signup or click Approve/Reject in Great Master to trigger email dispatches.
                  </p>
                </div>
              ) : (
                filtered.map((item) => {
                  const isSelected = selectedEmail?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-900/20'
                          : item.read
                          ? 'bg-white border-slate-200/80 text-slate-700 hover:border-purple-300'
                          : 'bg-amber-50/70 border-amber-200 text-slate-900 font-semibold hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`truncate font-bold ${
                            isSelected ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          To: {item.to}
                        </span>
                        <span
                          className={`text-[10px] shrink-0 ${
                            isSelected ? 'text-purple-200' : 'text-slate-400'
                          }`}
                        >
                          {new Date(item.sentAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div
                        className={`font-semibold text-xs leading-snug truncate mb-1 ${
                          isSelected ? 'text-white' : 'text-slate-800'
                        }`}
                      >
                        {item.subject}
                      </div>
                      <div
                        className={`text-[11px] truncate flex items-center gap-1.5 ${
                          isSelected ? 'text-purple-200' : 'text-slate-500'
                        }`}
                      >
                        {getBadgeIcon(item.type)}
                        <span>{item.studioName} ({item.adminName})</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Email Live HTML Preview */}
          <div className="flex-1 bg-white flex flex-col overflow-hidden">
            {selectedEmail ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Email Header Metadata */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 text-xs">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <span>{selectedEmail.subject}</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px]">
                        {selectedEmail.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-slate-600 mt-1 space-x-3">
                      <span><strong>To:</strong> {selectedEmail.to}</span>
                      <span>•</span>
                      <span><strong>Studio:</strong> {selectedEmail.studioName}</span>
                      <span>•</span>
                      <span><strong>Sent:</strong> {new Date(selectedEmail.sentAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Render HTML Template preview in sandbox iframe */}
                <div className="flex-1 overflow-auto bg-slate-100/50 p-4">
                  <iframe
                    title="Email Preview"
                    srcDoc={selectedEmail.html}
                    className="w-full h-full min-h-[500px] border border-slate-200 rounded-2xl bg-white shadow-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-sm">
                Select an email from the left sidebar to preview its full notification content.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
