import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, Download, Eye, CheckCircle, XCircle, FileText } from 'lucide-react';
import { adminService } from '../services/adminService';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const statuses = ['Applied', 'Shortlisted', 'Rejected', 'Hired'];

const statusStyles = {
  Applied: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Shortlisted: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Rejected: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  Hired: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const detailRow = (label, value) => (
  <div>
    <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
    <p className="text-sm font-medium">{value || '—'}</p>
  </div>
);

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await adminService.getAllApplications({ status: statusFilter, search });
    setApplications(data);
    setLoading(false);
    if (selected) {
      const updated = data.find((a) => a.id === selected.id);
      if (updated) setSelected(updated);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  const handleStatusChange = async (id, status) => {
    try {
      await adminService.updateApplicationStatus(id, status);
      toast.success('Application status updated');
      load();
    } catch (error) {
      toast.error(error?.message || 'Failed to update status');
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !selected) return;
    setSavingNote(true);
    try {
      await adminService.addApplicationNote(selected.id, noteText.trim());
      setNoteText('');
      load();
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setSavingNote(false);
    }
  };

  const applicantName = (app) => app.fullName || app.seeker?.name || 'Unknown';

  return (
    <div className="page-admin-applications">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Applications</h1>
        <div className="flex flex-wrap items-center gap-3">
          {search && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Searching for &quot;{search}&quot;
            </span>
          )}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-full sm:w-48">
            <option value="All">All Statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto dark:bg-slate-800 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <th className="p-4">Applicant</th>
              <th className="p-4">Job</th>
              <th className="p-4">Company</th>
              <th className="p-4">Applied On</th>
              <th className="p-4">Resume</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-400">Loading...</td></tr>
            ) : applications.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-400">No applications found</td></tr>
            ) : (
              applications.map((app) => (
                <tr
                  key={app.id}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
                  onClick={() => setSelected(app)}
                >
                  <td className="p-4 font-medium">{applicantName(app)}</td>
                  <td className="p-4">{app.job?.title}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{app.job?.company?.name}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{formatDate(app.appliedAt)}</td>
                  <td className="p-4">
                    {app.resume ? (
                      <FileText className="w-4 h-4 text-primary-600" />
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500">None</span>
                    )}
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className={`text-xs font-medium capitalize rounded-full px-2 py-1 border-0 ${statusStyles[app.status] || 'bg-slate-100 dark:bg-slate-700'}`}
                    >
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Full Application Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full my-8 dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold">{applicantName(selected)}&apos;s Application</h3>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[selected.status] || 'bg-slate-100 dark:bg-slate-700'}`}>
                  {selected.status}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(selected.id, 'Shortlisted')}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Shortlist
                  </button>
                  <button
                    onClick={() => handleStatusChange(selected.id, 'Rejected')}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Job Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {detailRow('Applied Job', selected.job?.title)}
                  {detailRow('Company', selected.job?.company?.name)}
                  {detailRow('Application Date', formatDate(selected.appliedAt))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Applicant Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {detailRow('Full Name', selected.fullName || selected.seeker?.name)}
                  {detailRow('Email', selected.email || selected.seeker?.email)}
                  {detailRow('Mobile Number', selected.mobile || selected.seeker?.phone)}
                  {detailRow('Location', selected.location)}
                  {detailRow('Qualification', selected.qualification)}
                  {detailRow('Experience', selected.experience)}
                  {detailRow('Current Company', selected.currentCompany)}
                  {detailRow('Expected Salary', selected.expectedSalary)}
                </div>
              </div>

              {selected.skills && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Skills</h4>
                  <p className="text-sm">{selected.skills}</p>
                </div>
              )}

              {selected.coverLetter && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Cover Letter</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{selected.coverLetter}</p>
                </div>
              )}

              {selected.portfolioUrl && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Portfolio / LinkedIn</h4>
                  <a href={selected.portfolioUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline">
                    {selected.portfolioUrl}
                  </a>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold mb-2">Resume</h4>
                {selected.resume ? (
                  <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3 dark:bg-slate-700">
                    <span className="text-sm">{selected.resume.name}</span>
                    <div className="flex gap-2">
                      <a
                        href={selected.resume.data}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-500"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a
                        href={selected.resume.data}
                        download={selected.resume.name}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-500"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No resume attached</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Internal Notes</h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="input-field"
                    placeholder="Add a note about this candidate..."
                  />
                  <button onClick={handleAddNote} disabled={savingNote} className="btn-secondary shrink-0 disabled:opacity-50">
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {(selected.internalNotes || []).map((note) => (
                    <div key={note.id} className="text-sm bg-slate-50 rounded-lg p-3 dark:bg-slate-700">
                      <p>{note.text}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {note.adminName} · {formatDate(note.addedAt)}
                      </p>
                    </div>
                  ))}
                  {(!selected.internalNotes || selected.internalNotes.length === 0) && (
                    <p className="text-xs text-slate-400">No notes yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
