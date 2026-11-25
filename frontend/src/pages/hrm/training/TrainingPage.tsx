import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmTrainingProgram } from '../../../types/hrm.types';
import { PlusIcon, SearchIcon, RefreshCwIcon } from '../../../components/common/Icons';

export const TrainingPage: React.FC = () => {
  const [programs, setPrograms] = useState<HrmTrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newProg, setNewProg] = useState({
    title: '',
    trainer: '',
    startDate: '',
    endDate: '',
    capacity: 20,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmService.getTrainingPrograms();
      if (res && res.data) setPrograms(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load training programs');
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
      await hrmService.createTrainingProgram(newProg);
      setSuccess('Training program launched');
      setShowModal(false);
      setNewProg({ title: '', trainer: '', startDate: '', endDate: '', capacity: 20 });
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to create training');
    }
  };

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      return p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.trainer || '').toLowerCase().includes(search.toLowerCase());
    });
  }, [programs, search]);

  return (
    <HrmLayout title="Learning & Development" subtitle="Organize staff training courses, certifications, workshops, and skill programs">
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      <div className="card mb-6 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 w-full sm:w-auto">
            <SearchIcon className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search training programs or instructors..."
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
              <PlusIcon size={14} /> Create Program
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-8 text-center text-slate-400">Loading learning modules...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-400">No training programs scheduled. Create one above.</div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="card p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-base">{p.title}</h4>
                <span className="badge badge-success badge-sm">{p.status || 'UPCOMING'}</span>
              </div>
              <div className="text-xs text-slate-500 mb-3">Trainer: {p.trainer || 'External Mentor'}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-4">
                <div>Start: {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'TBD'}</div>
                <div>End: {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'TBD'}</div>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span>Enrolled: {p.enrolledCount || 0}</span>
                <span>Capacity: {p.capacity || 25}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Schedule Training Program</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Cloud Architecture Boot Camp"
                  value={newProg.title}
                  onChange={(e) => setNewProg({ ...newProg, title: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lead Instructor / Trainer</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Jane Smith"
                  value={newProg.trainer}
                  onChange={(e) => setNewProg({ ...newProg, trainer: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newProg.startDate}
                    onChange={(e) => setNewProg({ ...newProg, startDate: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={newProg.endDate}
                    onChange={(e) => setNewProg({ ...newProg, endDate: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity Limit</label>
                <input
                  type="number"
                  min="1"
                  value={newProg.capacity}
                  onChange={(e) => setNewProg({ ...newProg, capacity: parseInt(e.target.value) || 20 })}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
