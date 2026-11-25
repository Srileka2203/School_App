import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmAttendance } from '../../../types/hrm.types';
import { PlusIcon, SearchIcon, RefreshCwIcon, ClockIcon } from '../../../components/common/Icons';

export const AttendancePage: React.FC = () => {
  const [attendances, setAttendances] = useState<HrmAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInData, setCheckInData] = useState({ employeeId: '', method: 'WEB' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmService.getAttendance();
      if (res && res.data) setAttendances(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await hrmService.checkIn(checkInData);
      setSuccess('Check-in recorded successfully');
      setShowCheckInModal(false);
      setCheckInData({ employeeId: '', method: 'WEB' });
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to record check-in');
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      setError(null);
      await hrmService.checkOut(id);
      setSuccess('Check-out recorded successfully');
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to record check-out');
    }
  };

  const filtered = useMemo(() => {
    return attendances.filter((a) => {
      const matchSearch =
        (a.employeeName || '').toLowerCase().includes(search.toLowerCase()) ||
        a.employeeId.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [attendances, search, statusFilter]);

  return (
    <HrmLayout title="Attendance & Time Tracking" subtitle="Track daily check-ins, check-outs, work hours, and presence">
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      <div className="card mb-6 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-1 w-full sm:w-auto gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search employee attendance..."
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
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ABSENT">Absent</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} className="btn btn-outline btn-sm gap-1" title="Refresh">
              <RefreshCwIcon size={14} /> Refresh
            </button>
            <button onClick={() => setShowCheckInModal(true)} className="btn btn-primary btn-sm gap-1">
              <PlusIcon size={14} /> Record Check-In
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
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Total Hours</th>
                <th>Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">Loading attendance records...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">No attendance records found.</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="font-semibold">{item.employeeName || item.employeeId}</td>
                    <td>{item.date ? new Date(item.date).toLocaleDateString() : '-'}</td>
                    <td>{item.clockIn || item.checkIn || '-'}</td>
                    <td>{item.clockOut || item.checkOut || '-'}</td>
                    <td>{item.totalHours ? item.totalHours.toFixed(1) + ' hrs' : '-'}</td>
                    <td><span className="badge badge-sm">{item.method || 'WEB'}</span></td>
                    <td>
                      <span className={`badge badge-sm ${item.status === 'PRESENT' ? 'badge-success' : item.status === 'LATE' ? 'badge-warning' : 'badge-ghost'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {!(item.clockOut || item.checkOut) && (
                        <button
                          onClick={() => handleCheckOut(item.id)}
                          className="btn btn-xs btn-outline btn-warning gap-1"
                          title="Clock Out"
                        >
                          <ClockIcon size={12} /> Check-Out
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

      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Record Attendance Check-In</h3>
            <form onSubmit={handleCheckIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee ID / Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMP-001 or ID"
                  value={checkInData.employeeId}
                  onChange={(e) => setCheckInData({ ...checkInData, employeeId: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Method</label>
                <select
                  value={checkInData.method}
                  onChange={(e) => setCheckInData({ ...checkInData, method: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="WEB">Web App</option>
                  <option value="BIOMETRIC">Biometric</option>
                  <option value="MOBILE">Mobile</option>
                  <option value="RFID">RFID</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowCheckInModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Check-In</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
