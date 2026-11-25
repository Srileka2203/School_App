import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar';

export interface HrmNavTab {
  id: string;
  label: string;
  path: string;
  badge?: number | string;
}

export const HRM_NAV_TABS: HrmNavTab[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/hrm/dashboard' },
  { id: 'employees', label: 'Employees', path: '/hrm/employees' },
  { id: 'departments', label: 'Departments', path: '/hrm/departments' },
  { id: 'designations', label: 'Designations', path: '/hrm/designations' },
  { id: 'attendance', label: 'Attendance', path: '/hrm/attendance' },
  { id: 'leave-management', label: 'Leaves', path: '/hrm/leave-management' },
  { id: 'shifts', label: 'Shifts', path: '/hrm/shifts' },
  { id: 'payroll', label: 'Payroll', path: '/hrm/payroll' },
  { id: 'recruitment', label: 'Recruitment', path: '/hrm/recruitment' },
  { id: 'onboarding', label: 'Onboarding', path: '/hrm/onboarding' },
  { id: 'performance', label: 'Performance', path: '/hrm/performance' },
  { id: 'expenses', label: 'Expenses', path: '/hrm/expenses' },
  { id: 'assets', label: 'Assets', path: '/hrm/assets' },
  { id: 'training', label: 'Training', path: '/hrm/training' },
  { id: 'helpdesk', label: 'Helpdesk', path: '/hrm/helpdesk' },
  { id: 'reports', label: 'Reports', path: '/hrm/reports' },
  { id: 'employee-skills', label: 'Skills', path: '/hrm/employee-skills' },
  { id: 'employee-certifications', label: 'Certifications', path: '/hrm/employee-certifications' },
  { id: 'employee-education', label: 'Education', path: '/hrm/employee-education' },
  { id: 'employee-experience', label: 'Experience', path: '/hrm/employee-experience' },
  { id: 'employee-documents', label: 'Documents', path: '/hrm/employee-documents' },
  { id: 'locations', label: 'Locations', path: '/hrm/locations' },
  { id: 'job-grades', label: 'Job Grades', path: '/hrm/job-grades' },
  { id: 'employment-types', label: 'Employment Types', path: '/hrm/employment-types' },
  { id: 'reporting', label: 'Org Chart', path: '/hrm/reporting' },
  { id: 'employee-history', label: 'History', path: '/hrm/employee-history' },
];

interface HrmLayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  activeTab?: string;
  error?: string | string[] | null;
  success?: string | null;
  onDismissError?: () => void;
  onDismissSuccess?: () => void;
  children: React.ReactNode;
}

export const HrmLayout: React.FC<HrmLayoutProps> = ({
  title,
  subtitle,
  actions,
  activeTab,
  error,
  success,
  onDismissError,
  onDismissSuccess,
  children,
}) => {
  const location = useLocation();

  return (
    <div className="app-layout erp-shell" id="hrm-suite-root">
      <Navbar />

      <main className="app-main-content lg-page ld-page erp-main-content">
        <div className="erp-container">
          {/* Scrollable Sub-Navigation Tabs across all 26 HRM Modules */}
          <div className="erp-nav-scroll-wrapper" role="navigation" aria-label="HRM Suite Navigation">
            <div className="erp-nav-tabs">
              {HRM_NAV_TABS.map((tab) => {
                const isRootActive =
                  tab.id === 'dashboard' &&
                  (location.pathname === '/hrm' || location.pathname === '/hrm/dashboard');
                const isCurrent =
                  activeTab === tab.id ||
                  location.pathname.startsWith(tab.path) ||
                  isRootActive;

                return (
                  <NavLink
                    key={tab.id}
                    to={tab.path}
                    className={`erp-nav-item ${isCurrent ? 'is-active' : ''}`}
                  >
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className="erp-badge-pill">{tab.badge}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Top Header & Context Actions */}
          <header className="erp-header">
            <div className="erp-header-left">
              <h1 className="erp-title">
                <span>{title}</span>
              </h1>
              {subtitle && <p className="erp-subtitle">{subtitle}</p>}
            </div>
            {actions && <div className="erp-header-actions">{actions}</div>}
          </header>

          {/* Global Feedback Banners */}
          {error && (
            <div className="erp-alert-wrap" style={{ marginBottom: 16 }}>
              <div className="alert alert-error" role="alert" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{Array.isArray(error) ? error.join(', ') : error}</span>
                {onDismissError && (
                  <button type="button" onClick={onDismissError} className="alert-close-btn" aria-label="Dismiss alert">
                    ×
                  </button>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="erp-alert-wrap" style={{ marginBottom: 16 }}>
              <div className="alert alert-success" role="alert" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{success}</span>
                {onDismissSuccess && (
                  <button type="button" onClick={onDismissSuccess} className="alert-close-btn" aria-label="Dismiss alert">
                    ×
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Page Body Content */}
          <div className="erp-body-flow">{children}</div>
        </div>
      </main>
    </div>
  );
};
