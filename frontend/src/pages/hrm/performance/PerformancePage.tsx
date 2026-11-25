import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmPerformanceReview } from '../../../types/hrm.types';
import { PlusIcon, SearchIcon, RefreshCwIcon, AwardIcon } from '../../../components/common/Icons';

export const PerformancePage: React.FC = () => {
  const [reviews, setReviews] = useState<HrmPerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newReview, setNewReview] = useState({
    employeeId: '',
    cycleName: 'Annual Review 2026',
    rating: 5,
    reviewNotes: '',
    status: 'COMPLETED' as const,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmService.getPerformanceReviews();
      if (res && res.data) setReviews(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load reviews');
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
      await hrmService.createPerformanceReview(newReview);
      setSuccess('Performance appraisal logged');
      setShowModal(false);
      setNewReview({ employeeId: '', cycleName: 'Annual Review 2026', rating: 5, reviewNotes: '', status: 'COMPLETED' });
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit review');
    }
  };

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      return (r.employeeName || '').toLowerCase().includes(search.toLowerCase()) ||
        r.cycleName.toLowerCase().includes(search.toLowerCase());
    });
  }, [reviews, search]);

  return (
    <HrmLayout title="Performance Reviews & Appraisals" subtitle="Track staff evaluations, review cycles, KPIs, and manager appraisals">
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      <div className="card mb-6 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 w-full sm:w-auto">
            <SearchIcon className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search appraisals by staff or cycle..."
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
              <PlusIcon size={14} /> New Appraisal
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
                <th>Cycle</th>
                <th>Score / Rating</th>
                <th>Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Loading performance appraisals...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">No appraisals recorded.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="font-semibold">{r.employeeName || r.employeeId}</td>
                    <td>{r.cycleName}</td>
                    <td>
                      <div className="flex items-center gap-1 font-bold text-amber-500">
                        <AwardIcon size={14} />
                        <span>{r.rating || 0} / 5</span>
                      </div>
                    </td>
                    <td className="max-w-md truncate">{r.reviewNotes || '-'}</td>
                    <td><span className="badge badge-success badge-sm">{r.status}</span></td>
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
            <h3 className="text-lg font-bold mb-4">Log Performance Review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMP-001 or ID"
                  value={newReview.employeeId}
                  onChange={(e) => setNewReview({ ...newReview, employeeId: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Review Cycle *</label>
                <input
                  type="text"
                  required
                  value={newReview.cycleName}
                  onChange={(e) => setNewReview({ ...newReview, cycleName: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating (1 to 5) *</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  required
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) || 5 })}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Review Comments</label>
                <textarea
                  rows={3}
                  placeholder="Key accomplishments, feedback, goals..."
                  value={newReview.reviewNotes}
                  onChange={(e) => setNewReview({ ...newReview, reviewNotes: e.target.value })}
                  className="textarea textarea-bordered w-full"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
