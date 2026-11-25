import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmJobPosting, HrmCandidate } from '../../../types/hrm.types';
import { PlusIcon, RefreshCwIcon } from '../../../components/common/Icons';

export const RecruitmentPage: React.FC = () => {
  const [jobs, setJobs] = useState<HrmJobPosting[]>([]);
  const [candidates, setCandidates] = useState<HrmCandidate[]>([]);
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates'>('jobs');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [newJob, setNewJob] = useState({
    jobTitle: '',
    department: 'Engineering',
    openingsCount: 1,
    employmentType: 'Full-time',
    description: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [jobsRes, candRes] = await Promise.all([
        hrmService.getJobPostings(),
        hrmService.getCandidates(),
      ]);
      if (jobsRes && jobsRes.data) setJobs(jobsRes.data);
      if (candRes && candRes.data) setCandidates(candRes.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load recruitment data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await hrmService.createJobPosting(newJob);
      setSuccess('Job opening published successfully');
      setShowJobModal(false);
      setNewJob({ jobTitle: '', department: 'Engineering', openingsCount: 1, employmentType: 'Full-time', description: '' });
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to create job posting');
    }
  };

  return (
    <HrmLayout title="Recruitment & Hiring Pipeline" subtitle="Manage job postings, applicant tracking, and recruitment stages">
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      <div className="flex justify-between items-center mb-6">
        <div className="tabs tabs-boxed">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`tab ${activeTab === 'jobs' ? 'tab-active' : ''}`}
          >
            Open Job Requisitions ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('candidates')}
            className={`tab ${activeTab === 'candidates' ? 'tab-active' : ''}`}
          >
            Candidates & Applicants ({candidates.length})
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="btn btn-outline btn-sm gap-1">
            <RefreshCwIcon size={14} /> Refresh
          </button>
          <button onClick={() => setShowJobModal(true)} className="btn btn-primary btn-sm gap-1">
            <PlusIcon size={14} /> Post New Job
          </button>
        </div>
      </div>

      {activeTab === 'jobs' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-8 text-center text-slate-400">Loading open jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400">No active job postings. Create one above.</div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="card p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-base">{job.jobTitle || job.title}</h4>
                  <span className="badge badge-success badge-sm">{job.status}</span>
                </div>
                <div className="text-xs text-slate-500 mb-3">{job.department || 'General'} • {job.employmentType || 'Full-time'}</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">{job.description || 'No description provided.'}</p>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span>Openings: {job.openingsCount || job.openings || 1}</span>
                  <span>Applicants: {job.applicantsCount || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Contact</th>
                  <th>Stage</th>
                  <th>Applied Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8">Loading candidates...</td></tr>
                ) : candidates.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-400">No applicants found.</td></tr>
                ) : (
                  candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="font-bold">{c.name}</td>
                      <td>{c.jobTitle || 'General Opening'}</td>
                      <td>
                        <div className="text-sm">{c.email}</div>
                        <div className="text-xs text-slate-400">{c.phone || '-'}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary badge-sm">{c.currentStage}</span>
                      </td>
                      <td>{c.appliedDate ? new Date(c.appliedDate).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showJobModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Post New Job Opening</h3>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={newJob.jobTitle}
                  onChange={(e) => setNewJob({ ...newJob, jobTitle: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    type="text"
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Open Positions</label>
                  <input
                    type="number"
                    min="1"
                    value={newJob.openingsCount}
                    onChange={(e) => setNewJob({ ...newJob, openingsCount: parseInt(e.target.value) || 1 })}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Role responsibilities and qualifications..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="textarea textarea-bordered w-full"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowJobModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
