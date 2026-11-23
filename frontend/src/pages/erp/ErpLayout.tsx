import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar';
import { ErrorMessage } from '../../components/auth/ErrorMessage';
import { SuccessMessage } from '../../components/auth/SuccessMessage';

export interface ErpNavTab {
  id: string;
  label: string;
  path: string;
  badge?: number | string;
}

export const ERP_NAV_TABS: ErpNavTab[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/erp/dashboard' },
  { id: 'workflows', label: 'Workflows', path: '/erp/workflows' },
  { id: 'approvals', label: 'Approvals', path: '/erp/approvals' },
  { id: 'procurement', label: 'Procurement', path: '/erp/procurement' },
  { id: 'orders', label: 'Order Mgmt', path: '/erp/orders' },
  { id: 'supply-chain', label: 'Supply Chain', path: '/erp/supply-chain' },
  { id: 'projects', label: 'Projects', path: '/erp/projects' },
  { id: 'manufacturing', label: 'Manufacturing', path: '/erp/manufacturing' },
  { id: 'quality', label: 'Quality', path: '/erp/quality' },
  { id: 'integrations', label: 'Integrations', path: '/erp/integrations' },
  { id: 'reports', label: 'Reports', path: '/erp/reports' },
];

interface ErpLayoutProps {
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

export const ErpLayout: React.FC<ErpLayoutProps> = ({
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
    <div className="app-layout erp-shell" id="erp-enterprise-root">
      <Navbar />

      <main className="app-main-content lg-page ld-page erp-main-content">
        <div className="erp-container">
          {/* Sub-Navigation Tabs across all 11 ERP Modules */}
          <div className="erp-nav-scroll-wrapper" role="navigation" aria-label="ERP Enterprise Navigation">
            <div className="erp-nav-tabs">
              {ERP_NAV_TABS.map((tab) => {
                const isRootActive =
                  tab.id === 'dashboard' &&
                  (location.pathname === '/erp' || location.pathname === '/erp/dashboard');
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
              <ErrorMessage error={error} onDismiss={onDismissError} />
            </div>
          )}
          {success && (
            <div className="erp-alert-wrap" style={{ marginBottom: 16 }}>
              <SuccessMessage message={success} onDismiss={onDismissSuccess} />
            </div>
          )}

          {/* Main Content Area */}
          {children}
        </div>
      </main>
    </div>
  );
};
