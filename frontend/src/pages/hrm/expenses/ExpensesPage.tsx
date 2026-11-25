import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmExpense } from '../../../types/hrm.types';
import { PlusIcon, SearchIcon, RefreshCwIcon, CheckIcon } from '../../../components/common/Icons';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<HrmExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newExp, setNewExp] = useState({
    employeeId: '',
    title: '',
    category: 'Travel',
    amount: 100,
    notes: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmService.getExpenses();
      if (res && res.data) setExpenses(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load expenses');
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
      await hrmService.createExpense(newExp);
      setSuccess('Expense claim logged');
      setShowModal(false);
      setNewExp({ employeeId: '', title: '', category: 'Travel', amount: 100, notes: '' });
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit expense');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setError(null);
      await hrmService.approveExpense(id);
      setSuccess('Expense claim approved');
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to approve expense');
    }
  };

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      return e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.employeeName || '').toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase());
    });
  }, [expenses, search]);

  return (
    <HrmLayout title="Expense Claims & Reimbursements" subtitle="Submit receipts, track reimbursement claims, and review approvals">
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      <div className="card mb-6 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 w-full sm:w-auto">
            <SearchIcon className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search expenses by title, staff or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered w-full pl-9"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} className="btn btn-outline btn-sm gap-1" title="Refresh">
              <RefreshCwIcon size={14} /> Refresh
            </button>
            <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm gap-1">
              <PlusIcon size={14} /> Submit Claim
            </button>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <th>Claim Title</th>
                <th>Staff</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">Loading expense claims...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">No expense claims found.</td></tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="font-semibold">{e.title}</td>
                    <td>{e.employeeName || e.employeeId}</td>
                    <td><span className="badge badge-outline">{e.category}</span></td>
                    <td className="font-bold text-emerald-600">${e.amount.toFixed(2)}</td>
                    <td>
                      <span className={`badge badge-sm ${e.status === 'APPROVED' ? 'badge-success' : e.status === 'REJECTED' ? 'badge-error' : 'badge-warning'}`}>
                        {e.status}
                      </span>
                    </td>
                    <td>
                      {e.status === 'PENDING' && (
                        <button
                          onClick={() => handleApprove(e.id)}
                          className="btn btn-xs btn-success gap-1"
                        >
                          <CheckIcon size={12} /> Approve
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
            <h3 className="text-lg font-bold mb-4">Submit Expense Claim</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMP-001 or ID"
                  value={newExp.employeeId}
                  onChange={(e) => setNewExp({ ...newExp, employeeId: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Claim Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Client Dinner / Flight to NYC"
                  value={newExp.title}
                  onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={newExp.category}
                    onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                    className="select select-bordered w-full"
                  >
                    <option value="Travel">Travel</option>
                    <option value="Meals">Meals</option>
                    <option value="Lodging">Lodging</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={newExp.amount}
                    onChange={(e) => setNewExp({ ...newExp, amount: parseFloat(e.target.value) || 0 })}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
