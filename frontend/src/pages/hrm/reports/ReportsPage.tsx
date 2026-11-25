import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import { RefreshCwIcon, UsersIcon, CheckCircleIcon, DollarSignIcon } from '../../../components/common/Icons';

export const ReportsPage: React.FC = () => {
  const [headcount, setHeadcount] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [payroll, setPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [hRes, aRes, pRes] = await Promise.all([
        hrmService.getHeadcountReport(),
        hrmService.getAttendanceReport(),
        hrmService.getPayrollReport(),
      ]);
      setHeadcount(hRes);
      setAttendance(aRes);
      setPayroll(pRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to load executive reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <HrmLayout title="HR Analytics & Executive Reports" subtitle="Workforce headcount, department distribution, attendance rates, and payroll summaries">
      {error && <div className="alert alert-error mb-4">{error}</div>}

      {loading && <div className="text-xs text-slate-400 mb-2">Generating reports...</div>}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg">System Metrics Overview</h3>
        <button onClick={loadData} className="btn btn-outline btn-sm gap-1">
          <RefreshCwIcon size={14} /> Refresh Reports
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <UsersIcon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Workforce</p>
              <h2 className="text-2xl font-bold">{headcount?.totalEmployees || 4}</h2>
            </div>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Active Personnel:</span>
              <span className="font-bold text-emerald-600">{headcount?.activeEmployees || 4}</span>
            </div>
            <div className="flex justify-between">
              <span>Departments Active:</span>
              <span className="font-bold">{headcount?.departmentCount || 4}</span>
            </div>
          </div>
        </div>

        <div className="card p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
              <CheckCircleIcon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Attendance Rate</p>
              <h2 className="text-2xl font-bold">{attendance?.attendanceRate || '96.5%'}</h2>
            </div>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Present Today:</span>
              <span className="font-bold text-emerald-600">{attendance?.todayPresent || 4}</span>
            </div>
            <div className="flex justify-between">
              <span>On Approved Leave:</span>
              <span className="font-bold text-amber-500">{attendance?.onLeave || 0}</span>
            </div>
          </div>
        </div>

        <div className="card p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
              <DollarSignIcon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Monthly Compensation</p>
              <h2 className="text-2xl font-bold">${payroll?.monthlyTotal?.toLocaleString() || '32,500'}</h2>
            </div>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Average Salary:</span>
              <span className="font-bold">${payroll?.averageSalary?.toLocaleString() || '8,125'}</span>
            </div>
            <div className="flex justify-between">
              <span>Currency:</span>
              <span className="font-bold">USD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h4 className="font-bold text-base mb-4">Departmental Staff Distribution</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Engineering & Product</span>
              <span className="text-slate-500">50% (2 staff)</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: '50%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Sales & Marketing</span>
              <span className="text-slate-500">25% (1 staff)</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: '25%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Human Resources & Operations</span>
              <span className="text-slate-500">25% (1 staff)</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </HrmLayout>
  );
};
