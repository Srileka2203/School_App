import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmShift } from '../../../types/hrm.types';
import { PlusIcon, RefreshCwIcon, ClockIcon } from '../../../components/common/Icons';

export const ShiftsPage: React.FC = () => {
  const [shifts, setShifts] = useState<HrmShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newShift, setNewShift] = useState({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    breakMinutes: 60,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmService.getShifts();
      if (res && res.data) setShifts(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load shifts');
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
      await hrmService.createShift(newShift);
      setSuccess('Shift pattern created successfully');
      setShowModal(false);
      setNewShift({ name: '', startTime: '09:00', endTime: '18:00', breakMinutes: 60 });
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to create shift');
    }
  };

  return (
    <HrmLayout title="Work Shifts & Rostering" subtitle="Configure daily shift rosters, break durations, and staff allocations">
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg">Configured Shifts ({shifts.length})</h3>
        <div className="flex gap-2">
          <button onClick={loadData} className="btn btn-outline btn-sm gap-1">
            <RefreshCwIcon size={14} /> Refresh
          </button>
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm gap-1">
            <PlusIcon size={14} /> Create Shift
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-8 text-center text-slate-400">Loading shift patterns...</div>
        ) : shifts.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-400">No shifts found. Create your first shift schedule above.</div>
        ) : (
          shifts.map((s) => (
            <div key={s.id} className="card p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-base">{s.name}</h4>
                <span className="badge badge-success badge-sm">{s.status || 'ACTIVE'}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                <div className="flex items-center gap-2">
                  <ClockIcon size={16} className="text-primary" />
                  <span>{s.startTime} - {s.endTime}</span>
                </div>
                <div>Break: {s.breakMinutes || 60} mins</div>
                <div>Assigned Personnel: {s.assignedCount || 0}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Create Shift Schedule</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Shift Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning General Shift"
                  value={newShift.name}
                  onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Break Duration (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={newShift.breakMinutes}
                  onChange={(e) => setNewShift({ ...newShift, breakMinutes: parseInt(e.target.value) || 0 })}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
