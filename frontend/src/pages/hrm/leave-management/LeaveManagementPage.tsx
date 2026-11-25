import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmLeaveRequest } from '../../../types/hrm.types';
import { PlusIcon, SearchIcon, RefreshCwIcon, CheckIcon, XIcon } from '../../../components/common/Icons';

export const LeaveManagementPage: React.FC = () => {
  const [requests, setRequests] = useState<HrmLeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    employeeId: '',
    leaveType: 'ANNUAL' as const,
    startDate: '',
    endDate: '',
    reason: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmService.getLeaveRequests();
      if (res && res.data) setRequests(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load leave requests');
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
      const start = new Date(newRequest.startDate);
      const end = new Date(newRequest.endDate);
      const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      await hrmService.submitLeaveRequest({
        ...newRequest,
        totalDays,
      });
      setSuccess('Leave request submitted');
      setShowModal(false);
      setNewRequest({ employeeId: '', leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' });
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit leave request');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setError(null);
      await hrmService.approveLeave(id);
      setSuccess('Leave request approved');
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to approve leave');
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Enter rejection reason:') || 'Policy requirements not met';
    try {
      setError(null);
      await hrmService.rejectLeave(id, reason);
      setSuccess('Leave request rejected');
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to reject leave');
    }
  };

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        (r.employeeName || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.reason || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, search, statusFilter]);

  return (
    <HrmLayout title="Leave Management" subtitle="Manage vacation, sick leaves, balances, and approval workflows">
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      <div className="card mb-6 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-1 w-full sm:w-auto gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search leave requests..."
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
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} className="btn btn-outline btn-sm gap-1" title="Refresh">
              <RefreshCwIcon size={14} /> Refresh
            </button>
            <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm gap-1">
              <PlusIcon size={14} /> Request Leave
            </button>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">Loading leave requests...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">No leave requests found.</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="font-semibold">{item.employeeName || item.employeeId}</td>
                    <td><span className="badge badge-outline">{item.leaveType}</span></td>
                    <td>{new Date(item.startDate).toLocaleDateString()}</td>
                    <td>{new Date(item.endDate).toLocaleDateString()}</td>
                    <td className="font-semibold">{item.totalDays} day(s)</td>
                    <td className="max-w-xs truncate">{item.reason || '-'}</td>
                    <td>
                      <span className={`badge badge-sm ${item.status === 'APPROVED' ? 'badge-success' : item.status === 'REJECTED' ? 'badge-error' : 'badge-warning'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.status === 'PENDING' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="btn btn-xs btn-success gap-1"
                            title="Approve"
                          >
                            <CheckIcon size={12} /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            className="btn btn-xs btn-outline btn-error gap-1"
                            title="Reject"
                          >
                            <XIcon size={12} /> Reject
                          </button>
                        </div>
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
            <h3 className="text-lg font-bold mb-4">Submit Leave Request</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee ID / Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMP-001 or ID"
                  value={newRequest.employeeId}
                  onChange={(e) => setNewRequest({ ...newRequest, employeeId: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Leave Type *</label>
                <select
                  value={newRequest.leaveType}
                  onChange={(e) => setNewRequest({ ...newRequest, leaveType: e.target.value as any })}
                  className="select select-bordered w-full"
                >
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="MATERNITY">Maternity Leave</option>
                  <option value="PATERNITY">Paternity Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newRequest.startDate}
                    onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={newRequest.endDate}
                    onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  rows={3}
                  placeholder="Provide details about the leave..."
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  className="textarea textarea-bordered w-full"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
