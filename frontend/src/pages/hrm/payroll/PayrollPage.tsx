import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmPayrollRun, HrmPayslip } from '../../../types/hrm.types';
import { RefreshCwIcon, DollarSignIcon } from '../../../components/common/Icons';

export const PayrollPage: React.FC = () => {
  const [runs, setRuns] = useState<HrmPayrollRun[]>([]);
  const [payslips, setPayslips] = useState<HrmPayslip[]>([]);
  const [activeTab, setActiveTab] = useState<'runs' | 'payslips'>('runs');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRunModal, setShowRunModal] = useState(false);
  const [targetMonth, setTargetMonth] = useState('2026-11');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [runsRes, slipsRes] = await Promise.all([
        hrmService.getPayrollRuns(),
        hrmService.getPayslips(),
      ]);
      if (runsRes && runsRes.data) setRuns(runsRes.data);
      if (slipsRes && slipsRes.data) setPayslips(slipsRes.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleProcessRun = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await hrmService.processPayrollRun(targetMonth);
      setSuccess(`Payroll processing completed for ${targetMonth}`);
      setShowRunModal(false);
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to process payroll');
    }
  };

  return (
    <HrmLayout title="Payroll Processing & Payslips" subtitle="Automated monthly payroll runs, allowances, deductions, and payslips">
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      <div className="flex justify-between items-center mb-6">
        <div className="tabs tabs-boxed">
          <button
            onClick={() => setActiveTab('runs')}
            className={`tab ${activeTab === 'runs' ? 'tab-active' : ''}`}
          >
            Payroll Runs ({runs.length})
          </button>
          <button
            onClick={() => setActiveTab('payslips')}
            className={`tab ${activeTab === 'payslips' ? 'tab-active' : ''}`}
          >
            Generated Payslips ({payslips.length})
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="btn btn-outline btn-sm gap-1">
            <RefreshCwIcon size={14} /> Refresh
          </button>
          <button onClick={() => setShowRunModal(true)} className="btn btn-primary btn-sm gap-1">
            <DollarSignIcon size={14} /> Run Payroll
          </button>
        </div>
      </div>

      {activeTab === 'runs' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <th>Payroll Month</th>
                  <th>Employees</th>
                  <th>Gross Total</th>
                  <th>Deductions</th>
                  <th>Net Disbursed</th>
                  <th>Status</th>
                  <th>Processed On</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8">Loading payroll cycles...</td></tr>
                ) : runs.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-400">No payroll runs found. Initiate your first run.</td></tr>
                ) : (
                  runs.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="font-bold">{r.month}</td>
                      <td>{r.employeeCount} staff</td>
                      <td className="font-semibold text-emerald-600">${r.totalGross?.toLocaleString() || 0}</td>
                      <td className="text-red-500">${r.totalDeductions?.toLocaleString() || 0}</td>
                      <td className="font-bold text-primary">${r.totalNet?.toLocaleString() || 0}</td>
                      <td><span className="badge badge-success badge-sm">{r.status}</span></td>
                      <td>{r.executedDate ? new Date(r.executedDate).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Basic Salary</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8">Loading payslips...</td></tr>
                ) : payslips.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-400">No payslips generated. Run payroll first.</td></tr>
                ) : (
                  payslips.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="font-semibold">{p.employeeName || p.employeeId}</td>
                      <td>{p.month}</td>
                      <td>${p.basicSalary?.toLocaleString()}</td>
                      <td className="text-emerald-600">+${p.allowances?.toLocaleString() || 0}</td>
                      <td className="text-red-500">-${p.deductions?.toLocaleString() || 0}</td>
                      <td className="font-bold text-primary">${p.netPay?.toLocaleString()}</td>
                      <td><span className="badge badge-success badge-sm">{p.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showRunModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Execute Payroll Processing</h3>
            <form onSubmit={handleProcessRun} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Target Billing Month *</label>
                <input
                  type="month"
                  required
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
              <p className="text-xs text-slate-500">
                This will automatically calculate salaries, deductions, taxes, and generate employee payslips for active staff.
              </p>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowRunModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Process Payroll</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
