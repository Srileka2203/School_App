import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmOnboardingTask } from '../../../types/hrm.types';
import { PlusIcon, SearchIcon, RefreshCwIcon, CheckCircleIcon } from '../../../components/common/Icons';

export const OnboardingPage: React.FC = () => {
  const [tasks, setTasks] = useState<HrmOnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    taskName: '',
    category: 'IT Setup',
    employeeId: '',
    dueDate: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmService.getOnboardingTasks();
      if (res && res.data) setTasks(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load onboarding tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await hrmService.createOnboardingTask(newTask);
      setSuccess('Onboarding task assigned');
      setShowModal(false);
      setNewTask({ taskName: '', category: 'IT Setup', employeeId: '', dueDate: '' });
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to create onboarding task');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      setError(null);
      await hrmService.completeOnboardingTask(id);
      setSuccess('Task marked as completed');
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to complete task');
    }
  };

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const name = t.taskName || t.title || '';
      return name.toLowerCase().includes(search.toLowerCase()) ||
        (t.employeeName || '').toLowerCase().includes(search.toLowerCase());
    });
  }, [tasks, search]);

  return (
    <HrmLayout title="Employee Onboarding & Offboarding" subtitle="Manage checklists, IT provisioning, and induction tasks for new hires">
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      <div className="card mb-6 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 w-full sm:w-auto">
            <SearchIcon className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search checklist tasks or assignees..."
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
              <PlusIcon size={14} /> Add Checklist Item
            </button>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <th>Task</th>
                <th>Category</th>
                <th>Assignee</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">Loading onboarding tasks...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">No onboarding tasks found.</td></tr>
              ) : (
                filtered.map((item) => {
                  const done = item.isCompleted || item.completed;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="font-semibold">{item.taskName || item.title}</td>
                      <td><span className="badge badge-outline">{item.category || 'General'}</span></td>
                      <td>{item.employeeName || item.employeeId || 'New Hire'}</td>
                      <td>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}</td>
                      <td>
                        <span className={`badge badge-sm ${done ? 'badge-success' : 'badge-warning'}`}>
                          {done ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        {!done && (
                          <button
                            onClick={() => handleComplete(item.id)}
                            className="btn btn-xs btn-success gap-1"
                          >
                            <CheckCircleIcon size={12} /> Mark Done
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Add Onboarding Checklist Item</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Issue Laptop and Security Token"
                  value={newTask.taskName}
                  onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="IT Setup">IT Setup</option>
                  <option value="HR Documentation">HR Documentation</option>
                  <option value="Training">Training</option>
                  <option value="Workstation">Workstation</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee ID</label>
                  <input
                    type="text"
                    placeholder="EMP ID"
                    value={newTask.employeeId}
                    onChange={(e) => setNewTask({ ...newTask, employeeId: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
