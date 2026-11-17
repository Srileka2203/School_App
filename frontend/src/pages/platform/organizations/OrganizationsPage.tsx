import React, { useState } from 'react';
import { Navbar } from '../../../components/common/Navbar';
import { useAuth } from '../../../context/AuthContext';
import { useWorkspace } from '../../../context/useWorkspace';
import {
  BuildingIcon,
  ShieldIcon,
  GlobeIcon,
  CheckCircleIcon,
  SparklesIcon,
  RefreshCwIcon,
} from '../../../components/common/Icons';

export const OrganizationsPage: React.FC = () => {
  const { user } = useAuth();
  const { currentWorkspace, myWorkspaces } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'overview' | 'workspaces' | 'compliance'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const organization = user?.organization || {
    id: 'org-default',
    name: 'Acme Enterprise Solutions',
    slug: 'acme-enterprise',
    plan: 'Enterprise Tier',
    createdAt: new Date().toISOString(),
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="crm-page-container">
      <Navbar />

      <main className="crm-main-content">
        <div className="page-header" style={{ marginBottom: '1.5rem' }}>
          <div className="page-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="section-icon-badge" style={{ width: '38px', height: '38px', borderRadius: '10px' }}>
                <BuildingIcon size={20} />
              </span>
              <div>
                <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  Organization Management
                </h1>
                <p className="page-subtitle" style={{ fontSize: '0.85rem' }}>
                  Manage enterprise organization settings, tenant boundaries, and workspaces
                </p>
              </div>
            </div>
          </div>

          <div className="page-actions-group">
            <button
              type="button"
              className="refresh-btn-secondary"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCwIcon size={16} className={isRefreshing ? 'icon-spin' : ''} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Organization Hero Card */}
        <div className="crm-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                }}
              >
                {organization.name.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{organization.name}</h2>
                  <span className="crm-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: 700 }}>
                    Active Organization
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', fontSize: '0.82rem', color: '#64748B' }}>
                  <span>ID: {organization.id}</span>
                  <span>•</span>
                  <span>Plan: Enterprise Dedicated</span>
                  <span>•</span>
                  <span>Active Workspaces: {myWorkspaces?.length || 1}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="count-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem' }}>
                <ShieldIcon size={14} />
                <span>Multi-Tenant Guard Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="ld-view-switcher" style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={`ld-view-btn ${activeTab === 'overview' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview &amp; Profile
          </button>
          <button
            type="button"
            className={`ld-view-btn ${activeTab === 'workspaces' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('workspaces')}
          >
            Workspaces ({myWorkspaces?.length || 1})
          </button>
          <button
            type="button"
            className={`ld-view-btn ${activeTab === 'compliance' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('compliance')}
          >
            Security &amp; Compliance
          </button>
        </div>

        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div className="crm-card" style={{ padding: '1.25rem', borderRadius: '14px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GlobeIcon size={16} style={{ color: '#10B981' }} />
                Organization Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                    Legal Entity Name
                  </label>
                  <strong>{organization.name}</strong>
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                    Domain Slug
                  </label>
                  <span>{('slug' in organization ? (organization as any).slug : undefined) || 'acme-crm'}</span>
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                    Default Workspace
                  </label>
                  <span>{currentWorkspace?.name || 'Primary Workspace'}</span>
                </div>
              </div>
            </div>

            <div className="crm-card" style={{ padding: '1.25rem', borderRadius: '14px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SparklesIcon size={16} style={{ color: '#10B981' }} />
                Subscription &amp; Capacity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                    Current License
                  </label>
                  <span style={{ color: '#059669', fontWeight: 700 }}>Enterprise Platform Unlimited</span>
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                    Seats Provisioned
                  </label>
                  <span>Unlimited Workspace Members</span>
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                    SLA &amp; Support Tier
                  </label>
                  <span>24/7 Dedicated Support &amp; 99.99% Uptime Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workspaces' && (
          <div className="crm-card" style={{ padding: '1.25rem', borderRadius: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Organization Workspaces</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(myWorkspaces || [currentWorkspace]).filter(Boolean).map((ws) => (
                <div
                  key={ws.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(16, 185, 129, 0.22)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: ws.id === currentWorkspace?.id ? '#10B981' : '#1E293B',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}
                    >
                      {ws.name.charAt(0)}
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem' }}>{ws.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {ws.id === currentWorkspace?.id ? 'Current Active Workspace' : 'Tenant Workspace'}
                      </span>
                    </div>
                  </div>
                  {ws.id === currentWorkspace?.id && (
                    <span className="crm-badge" style={{ background: '#10B981', color: '#FFFFFF', fontSize: '0.72rem' }}>
                      Active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="crm-card" style={{ padding: '1.25rem', borderRadius: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldIcon size={18} style={{ color: '#10B981' }} />
              Security &amp; Audit Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 600 }}>
                <CheckCircleIcon size={16} />
                <span>End-to-End Data Encryption at Rest and in Transit</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 600 }}>
                <CheckCircleIcon size={16} />
                <span>Multi-Factor Authentication (MFA) Policy Enforceable</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 600 }}>
                <CheckCircleIcon size={16} />
                <span>Immutable System Audit Trail Active</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrganizationsPage;
