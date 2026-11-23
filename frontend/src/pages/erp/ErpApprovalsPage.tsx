import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ErpLayout } from './ErpLayout';
import { erpService } from '../../services/erp.service';
import type { ApprovalRequestItem, CreateApprovalPayload } from '../../types/erp.types';
import { PlusIcon, SearchIcon, CheckIcon, XIcon, RefreshCwIcon } from '../../components/common/Icons';

export const ErpApprovalsPage: React.FC = () => {
  const [approvals, setApprovals] = useState<ApprovalRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newApproval, setNewApproval] = useState<CreateApprovalPayload>({
    title: '',
    module: 'PROCUREMENT',
    requester: '',
    approverRole: 'FINANCE_MANAGER',
    amount: 1500,
    priority: 'HIGH',
  });

  // Action Dialog state (Approve/Reject comment)
  const [actionItem, setActionItem] = useState<{ id: string; type: 'APPROVE' | 'REJECT'; title: string } | null>(null);
  const [actionComment, setActionComment] = useState<string>('');

  const loadApprovals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await erpService.getApprovals();
      setApprovals(res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch approval requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  const filteredApprovals = useMemo(() => {
    return approvals.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.requester.toLowerCase().includes(search.toLowerCase()) ||
        item.module.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [approvals, search, statusFilter, priorityFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApproval.title.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await erpService.createApproval(newApproval);
      setSuccess(`Approval request "${newApproval.title}" submitted successfully.`);
      setShowCreateModal(false);
      setNewApproval({
        title: '',
        module: 'PROCUREMENT',
        requester: '',
        approverRole: 'FINANCE_MANAGER',
        amount: 1500,
        priority: 'HIGH',
      });
      loadApprovals();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit approval');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!actionItem) return;
    try {
      setSubmitting(true);
      setError(null);
      if (actionItem.type === 'APPROVE') {
        await erpService.approveRequest(actionItem.id, actionComment);
        setSuccess(`Request "${actionItem.title}" has been approved.`);
      } else {
        await erpService.rejectRequest(actionItem.id, actionComment);
        setSuccess(`Request "${actionItem.title}" has been rejected.`);
      }
      setActionItem(null);
      setActionComment('');
      loadApprovals();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || `Failed to ${actionItem.type.toLowerCase()} request`);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
        return <span className="erp-badge erp-badge-danger">URGENT</span>;
      case 'HIGH':
        return <span className="erp-badge erp-badge-warning">HIGH</span>;
      case 'MEDIUM':
        return <span className="erp-badge erp-badge-info">MEDIUM</span>;
      default:
        return <span className="erp-badge erp-badge-neutral">{p}</span>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'APPROVED':
        return <span className="erp-badge erp-badge-success">APPROVED</span>;
      case 'REJECTED':
        return <span className="erp-badge erp-badge-danger">REJECTED</span>;
      default:
        return <span className="erp-badge erp-badge-warning">PENDING</span>;
    }
  };

  return (
    <ErpLayout
      title="Approvals & Authorization Engine"
      subtitle="Multi-level signing authority across procurement, finance, expenses, and asset requisitions"
      activeTab="approvals"
      error={error}
      success={success}
      onDismissError={() => setError(null)}
      onDismissSuccess={() => setSuccess(null)}
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={loadApprovals}
            disabled={loading}
            className="erp-btn erp-btn-secondary"
          >
            <RefreshCwIcon size={16} className={loading ? 'erp-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="erp-btn erp-btn-primary"
          >
            <PlusIcon size={16} />
            <span>New Request</span>
          </button>
        </div>
      }
    >
      <div className="erp-card">
        {/* Filter bar */}
        <div className="erp-filter-bar">
          <div className="erp-search-wrap">
            <SearchIcon size={16} className="erp-search-icon" />
            <input
              type="text"
              placeholder="Search by title, requester, or module..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-input erp-search-input"
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="erp-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="erp-select"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">URGENT</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        {/* Approvals Table */}
        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Title & Context</th>
                <th>Module</th>
                <th>Requester</th>
                <th>Approver Role</th>
                <th>Amount</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Submitted</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="erp-empty-cell">
                    Loading approval queue...
                  </td>
                </tr>
              ) : filteredApprovals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="erp-empty-cell">
                    No approval requests found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredApprovals.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                      {item.comment && (
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                          Note: {item.comment}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="erp-badge erp-badge-neutral">{item.module}</span>
                    </td>
                    <td>{item.requester}</td>
                    <td>
                      <span className="erp-badge erp-badge-info">{item.approverRole}</span>
                    </td>
                    <td>
                      <strong>{item.amount !== undefined ? `$${item.amount.toLocaleString()}` : '—'}</strong>
                    </td>
                    <td>{getPriorityBadge(item.priority)}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>{new Date(item.submittedAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      {item.status === 'PENDING' ? (
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setActionItem({ id: item.id, type: 'APPROVE', title: item.title });
                              setActionComment('');
                            }}
                            className="erp-btn erp-btn-sm erp-btn-primary"
                            title="Approve request"
                          >
                            <CheckIcon size={14} />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActionItem({ id: item.id, type: 'REJECT', title: item.title });
                              setActionComment('');
                            }}
                            className="erp-btn erp-btn-sm erp-btn-danger"
                            title="Reject request"
                          >
                            <XIcon size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                          Decided {item.decidedAt ? new Date(item.decidedAt).toLocaleDateString() : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Comment Modal */}
      {actionItem && (
        <div className="erp-modal-overlay">
          <div className="erp-modal">
            <div className="erp-modal-header">
              <h3 className="erp-modal-title">
                {actionItem.type === 'APPROVE' ? 'Approve Request' : 'Reject Request'}
              </h3>
              <button
                type="button"
                className="erp-modal-close"
                onClick={() => setActionItem(null)}
              >
                ✕
              </button>
            </div>
            <div className="erp-modal-body">
              <p style={{ margin: '0 0 12px', fontSize: 14 }}>
                Are you sure you want to {actionItem.type.toLowerCase()} <strong>{actionItem.title}</strong>?
              </p>
              <div className="erp-form-group">
                <label className="erp-label">
                  {actionItem.type === 'APPROVE' ? 'Approval Note (Optional)' : 'Reason for Rejection *'}
                </label>
                <textarea
                  rows={3}
                  value={actionComment}
                  onChange={(e) => setActionComment(e.target.value)}
                  placeholder={actionItem.type === 'APPROVE' ? 'Enter notes or conditions...' : 'Specify why this request cannot be approved...'}
                  className="erp-textarea"
                />
              </div>
            </div>
            <div className="erp-modal-footer">
              <button
                type="button"
                onClick={() => setActionItem(null)}
                className="erp-btn erp-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={submitting || (actionItem.type === 'REJECT' && !actionComment.trim())}
                className={`erp-btn ${actionItem.type === 'APPROVE' ? 'erp-btn-primary' : 'erp-btn-danger'}`}
              >
                {submitting ? 'Processing...' : actionItem.type === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Approval Request Modal */}
      {showCreateModal && (
        <div className="erp-modal-overlay">
          <div className="erp-modal">
            <div className="erp-modal-header">
              <h3 className="erp-modal-title">Submit Approval Request</h3>
              <button
                type="button"
                className="erp-modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="erp-modal-body">
                <div className="erp-form-group">
                  <label className="erp-label">Request Title *</label>
                  <input
                    type="text"
                    required
                    value={newApproval.title}
                    onChange={(e) => setNewApproval({ ...newApproval, title: e.target.value })}
                    placeholder="e.g. Server Infrastructure Upgrade PO"
                    className="erp-input"
                  />
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Origin Module</label>
                    <select
                      value={newApproval.module}
                      onChange={(e) => setNewApproval({ ...newApproval, module: e.target.value })}
                      className="erp-select"
                    >
                      <option value="PROCUREMENT">PROCUREMENT</option>
                      <option value="MANUFACTURING">MANUFACTURING</option>
                      <option value="EXPENSES">EXPENSES</option>
                      <option value="PROJECTS">PROJECTS</option>
                      <option value="SUPPLY_CHAIN">SUPPLY_CHAIN</option>
                    </select>
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Requester Name</label>
                    <input
                      type="text"
                      value={newApproval.requester}
                      onChange={(e) => setNewApproval({ ...newApproval, requester: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Required Approver Role</label>
                    <select
                      value={newApproval.approverRole}
                      onChange={(e) => setNewApproval({ ...newApproval, approverRole: e.target.value })}
                      className="erp-select"
                    >
                      <option value="FINANCE_MANAGER">FINANCE_MANAGER</option>
                      <option value="OPERATIONS_DIRECTOR">OPERATIONS_DIRECTOR</option>
                      <option value="PROCUREMENT_LEAD">PROCUREMENT_LEAD</option>
                      <option value="CFO">CFO</option>
                    </select>
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Estimated Amount ($)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={newApproval.amount}
                      onChange={(e) => setNewApproval({ ...newApproval, amount: Number(e.target.value) })}
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="erp-form-group">
                  <label className="erp-label">Priority</label>
                  <select
                    value={newApproval.priority}
                    onChange={(e: any) => setNewApproval({ ...newApproval, priority: e.target.value })}
                    className="erp-select"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>
              <div className="erp-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="erp-btn erp-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="erp-btn erp-btn-primary"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpLayout>
  );
};
