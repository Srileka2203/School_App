import React, { useState } from 'react';
import { Navbar } from '../../../components/common/Navbar';
import {
  FileTextIcon,
  UploadIcon,
  RefreshCwIcon,
  SearchIcon,
  DownloadIcon,
  TrashIcon,
  CheckCircleIcon,
  ShieldIcon,
  GlobeIcon,
} from '../../../components/common/Icons';

interface FileItem {
  id: string;
  name: string;
  size: string;
  mimeType: string;
  entityType: 'deal' | 'lead' | 'workspace';
  uploadedBy: string;
  createdAt: string;
}

export const FilesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'deal' | 'lead' | 'workspace'>('all');

  const files: FileItem[] = [
    {
      id: 'file-1',
      name: 'Acme_Enterprise_Contract_Q4.pdf',
      size: '2.4 MB',
      mimeType: 'application/pdf',
      entityType: 'deal',
      uploadedBy: 'Sri (Admin)',
      createdAt: 'Nov 14, 2026',
    },
    {
      id: 'file-2',
      name: 'Lead_Qualification_Requirements.docx',
      size: '850 KB',
      mimeType: 'application/docx',
      entityType: 'lead',
      uploadedBy: 'Sarah Connor',
      createdAt: 'Nov 12, 2026',
    },
    {
      id: 'file-3',
      name: 'Corporate_Brand_Assets_2026.zip',
      size: '14.2 MB',
      mimeType: 'application/zip',
      entityType: 'workspace',
      uploadedBy: 'Sri (Admin)',
      createdAt: 'Nov 10, 2026',
    },
    {
      id: 'file-4',
      name: 'Enterprise_Architecture_Overview.pdf',
      size: '4.1 MB',
      mimeType: 'application/pdf',
      entityType: 'deal',
      uploadedBy: 'John Doe',
      createdAt: 'Nov 08, 2026',
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeFilter === 'all') return matchesSearch;
    return matchesSearch && f.entityType === activeFilter;
  });

  return (
    <div className="crm-page-container">
      <Navbar />

      <main className="crm-main-content">
        <div className="page-header" style={{ marginBottom: '1.5rem' }}>
          <div className="page-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="section-icon-badge" style={{ width: '38px', height: '38px', borderRadius: '10px' }}>
                <FileTextIcon size={20} />
              </span>
              <div>
                <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  Files &amp; Attachments
                </h1>
                <p className="page-subtitle" style={{ fontSize: '0.85rem' }}>
                  Centralized repository for documents, contracts, and CRM attachments
                </p>
              </div>
            </div>
          </div>

          <div className="page-actions-group">
            <button
              type="button"
              className="crm-btn crm-btn-primary crm-btn-sm"
              style={{ height: '38px' }}
              onClick={() => alert('Document upload modal initialized.')}
            >
              <UploadIcon size={15} />
              <span>Upload Document</span>
            </button>
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

        {/* Filter and Search Bar */}
        <div
          className="crm-filter-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
            <span
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748B',
                pointerEvents: 'none',
              }}
            >
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              placeholder="Search files by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="crm-filter-search-input"
              style={{
                width: '100%',
                height: '38px',
                paddingLeft: '2.4rem',
                paddingRight: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '0.85rem',
                background: 'transparent',
              }}
            />
          </div>

          <div className="ld-view-switcher">
            <button
              type="button"
              className={`ld-view-btn ${activeFilter === 'all' ? 'is-active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Files
            </button>
            <button
              type="button"
              className={`ld-view-btn ${activeFilter === 'deal' ? 'is-active' : ''}`}
              onClick={() => setActiveFilter('deal')}
            >
              Deal Docs
            </button>
            <button
              type="button"
              className={`ld-view-btn ${activeFilter === 'lead' ? 'is-active' : ''}`}
              onClick={() => setActiveFilter('lead')}
            >
              Lead Files
            </button>
            <button
              type="button"
              className={`ld-view-btn ${activeFilter === 'workspace' ? 'is-active' : ''}`}
              onClick={() => setActiveFilter('workspace')}
            >
              Workspace
            </button>
          </div>
        </div>

        {/* Files Table */}
        <div className="crm-card" style={{ padding: '0', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.15)', background: 'rgba(16, 185, 129, 0.04)' }}>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>File Name</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>Entity Association</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>Size</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>Uploaded By</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>Date</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr
                  key={file.id}
                  style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.08)' }}
                >
                  <td style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: '#10B981' }}>
                      <FileTextIcon size={16} />
                    </span>
                    <strong>{file.name}</strong>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <span
                      className="crm-badge"
                      style={{
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#059669',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {file.entityType}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', color: '#64748B' }}>{file.size}</td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>{file.uploadedBy}</td>
                  <td style={{ padding: '0.85rem 1.25rem', color: '#64748B' }}>{file.createdAt}</td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="lg-link-btn"
                        title="Download file"
                        style={{ color: '#10B981' }}
                      >
                        <DownloadIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default FilesPage;
