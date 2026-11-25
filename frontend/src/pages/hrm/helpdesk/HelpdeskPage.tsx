import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmHelpdeskTicket } from '../../../types/hrm.types';
import { PlusIcon, SearchIcon, RefreshCwIcon, CheckCircleIcon } from '../../../components/common/Icons';

export const HelpdeskPage: React.FC = () => {
  const [tickets, setTickets] = useState<HrmHelpdeskTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'IT Support',
    priority: 'MEDIUM' as const,
    description: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmService.getHelpdeskTickets();
      if (res && res.data) setTickets(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await hrmService.createHelpdeskTicket(newTicket);
      setSuccess('Helpdesk ticket logged');
      setShowModal(false);
      setNewTicket({ subject: '', category: 'IT Support', priority: 'MEDIUM', description: '' });
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit ticket');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      setError(null);
      await hrmService.resolveHelpdeskTicket(id);
      setSuccess('Ticket marked as resolved');
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to resolve ticket');
    }
  };

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
        (t.employeeName || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tickets, search, statusFilter]);

  return (
    <HrmLayout title="Employee HR Helpdesk & Support" subtitle="Internal queries, IT requests, workplace grievances, and resolution tracking">
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      <div className="card mb-6 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-1 w-full sm:w-auto gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search tickets by subject or number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-bordered w-full pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-bordered"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} className="btn btn-outline btn-sm gap-1" title="Refresh">
              <RefreshCwIcon size={14} /> Refresh
            </button>
            <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm gap-1">
              <PlusIcon size={14} /> Open Ticket
            </button>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <th>Ticket #</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Requester</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">Loading helpdesk tickets...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No support tickets found.</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="font-mono font-bold text-primary">{t.ticketNumber}</td>
                    <td className="font-semibold">{t.subject}</td>
                    <td><span className="badge badge-outline">{t.category}</span></td>
                    <td>
                      <span className={`badge badge-xs ${t.priority === 'URGENT' || t.priority === 'HIGH' ? 'badge-error' : 'badge-ghost'}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td>{t.employeeName || 'Staff Member'}</td>
                    <td>
                      <span className={`badge badge-sm ${t.status === 'RESOLVED' ? 'badge-success' : t.status === 'IN_PROGRESS' ? 'badge-info' : 'badge-warning'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      {t.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolve(t.id)}
                          className="btn btn-xs btn-success gap-1"
                        >
                          <CheckCircleIcon size={12} /> Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Open Support Ticket</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VPN Access Issue / Salary Inquiry"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="select select-bordered w-full"
                  >
                    <option value="IT Support">IT Support</option>
                    <option value="Payroll">Payroll</option>
                    <option value="HR Policy">HR Policy</option>
                    <option value="Facilities">Facilities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                    className="select select-bordered w-full"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the issue or request..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="textarea textarea-bordered w-full"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
