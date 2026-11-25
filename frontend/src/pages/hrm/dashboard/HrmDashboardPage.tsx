import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmDashboardStats } from '../../../types/hrm.types';
import { UsersIcon, CheckCircleIcon, ClockIcon, BriefcaseIcon, RefreshCwIcon } from '../../../components/common/Icons';
import { Link } from 'react-router-dom';

export const HrmDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<HrmDashboardStats>({
    totalEmployees: 4,
    activeEmployees: 4,
    totalDepartments: 4,
    totalDesignations: 4,
    todayPresentCount: 3,
    pendingLeavesCount: 1,
    openJobPostingsCount: 2,
    pendingExpensesCount: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmService.getDashboardStats();
      if (res) setStats(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuickCheckIn = async () => {
    try {
      await hrmService.checkIn({ employeeId: 'emp-101', method: 'WEB_PORTAL' });
      setSuccess('Successfully clocked in for today!');
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to clock in');
    }
  };

  return (
    <HrmLayout
      title="HRM Overview & Workforce Analytics"
      subtitle="Comprehensive view of employee headcount, attendance, operations, and talent"
      activeTab="dashboard"
      error={error}
      success={success}
      onDismissError={() => setError(null)}
      onDismissSuccess={() => setSuccess(null)}
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={handleQuickCheckIn} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ClockIcon size={16} />
            <span>Quick Check-In</span>
          </button>
          <button type="button" onClick={loadData} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCwIcon size={16} />
            <span>Refresh</span>
          </button>
        </div>
      }
    >
      {loading && <div style={{ marginBottom: 12, fontSize: 13, color: "#64748b" }}>Loading metrics...</div>}
      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20, borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>TOTAL EMPLOYEES</span>
            <UsersIcon size={20} style={{ color: '#3b82f6' }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8, color: '#0f172a' }}>{stats.totalEmployees}</div>
          <div style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>{stats.activeEmployees} currently active</div>
        </div>

        <div className="card" style={{ padding: 20, borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>TODAY'S ATTENDANCE</span>
            <CheckCircleIcon size={20} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8, color: '#0f172a' }}>{stats.todayPresentCount}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Clocked-in team members</div>
        </div>

        <div className="card" style={{ padding: 20, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>PENDING LEAVES</span>
            <ClockIcon size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8, color: '#0f172a' }}>{stats.pendingLeavesCount}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Awaiting manager approval</div>
        </div>

        <div className="card" style={{ padding: 20, borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>DEPARTMENTS</span>
            <BriefcaseIcon size={20} style={{ color: '#8b5cf6' }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8, color: '#0f172a' }}>{stats.totalDepartments}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Active business divisions</div>
        </div>
      </div>

      {/* Quick Launchpad & Navigation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#0f172a' }}>Quick Operations</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/hrm/employees" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
              <span>👥 View Employee Directory</span>
              <span style={{ color: '#3b82f6' }}>&rarr;</span>
            </Link>
            <Link to="/hrm/leave-management" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
              <span>🏖️ Review Leave Requests</span>
              <span style={{ color: '#3b82f6' }}>&rarr;</span>
            </Link>
            <Link to="/hrm/attendance" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
              <span>⏱️ Real-time Attendance Roster</span>
              <span style={{ color: '#3b82f6' }}>&rarr;</span>
            </Link>
            <Link to="/hrm/payroll" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
              <span>💳 Monthly Payroll Processing</span>
              <span style={{ color: '#3b82f6' }}>&rarr;</span>
            </Link>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#0f172a' }}>Talent & Organization</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/hrm/departments" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
              <span>🏢 Departments & Cost Centers</span>
              <span style={{ color: '#3b82f6' }}>&rarr;</span>
            </Link>
            <Link to="/hrm/recruitment" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
              <span>🎯 Open Recruitment Postings ({stats.openJobPostingsCount})</span>
              <span style={{ color: '#3b82f6' }}>&rarr;</span>
            </Link>
            <Link to="/hrm/expenses" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
              <span>🧾 Expense Claims Reimbursement</span>
              <span style={{ color: '#3b82f6' }}>&rarr;</span>
            </Link>
            <Link to="/hrm/reports" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
              <span>📊 HR Analytics & Headcount Reports</span>
              <span style={{ color: '#3b82f6' }}>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </HrmLayout>
  );
};
