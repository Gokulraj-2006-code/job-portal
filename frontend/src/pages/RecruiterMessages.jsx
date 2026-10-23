import React, { useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import { adminService } from '../services/adminService';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

// Same theme, layout, and behavior as the Admin Messages page — kept
// consistent so Messages looks and works the same across panels.
const RecruiterMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await adminService.getMessages();
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id) => {
    await adminService.markMessageRead(id);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await adminService.deleteMessage(id);
      toast.success('Message deleted');
      load();
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  return (
    <div className="page-recruiter-messages">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      {loading ? (
        <p className="text-slate-400 dark:text-slate-500">Loading...</p>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-xl border p-4 dark:bg-slate-800 ${
                msg.read ? 'border-slate-200 dark:border-slate-700' : 'border-primary-200 dark:border-primary-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{msg.subject}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{msg.name} · {msg.email}</p>
                  <p className="text-sm mt-2">{msg.message}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{formatDate(msg.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleMarkRead(msg.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                    title={msg.read ? 'Read' : 'Mark as read'}
                  >
                    {msg.read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterMessages;
