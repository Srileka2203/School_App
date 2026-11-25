import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmEmployee } from '../../../types/hrm.types';
import { PlusIcon, SearchIcon, RefreshCwIcon, TrashIcon } from '../../../components/common/Icons';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<HrmEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [newEmp, setNewEmp] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    salary: 95000,
    status: 'ACTIVE' as const,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmService.getEmployees();
      const list = (res as any)?.data || (Array.isArray(res) ? res : []);
      setEmployees(list);
    } catch (err: any) {
      setError(err?.message || 'Failed to load employee directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const name = `${e.firstName || ''} ${e.lastName || ''}`.toLowerCase();
      const matchSearch = name.includes(search.toLowerCase()) ||
        (e.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.employeeNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.department || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [employees, search, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.firstName.trim() || !newEmp.email.trim()) return;
    try {
      setError(null);
      await hrmService.createEmployee(newEmp);
      setSuccess(`Employee ${newEmp.firstName} ${newEmp.lastName} added successfully!`);
      setShowModal(false);
      setNewEmp({ firstName: '', lastName: '', email: '', phone: '', department: 'Engineering', designation: 'Software Engineer', salary: 95000, status: 'ACTIVE' });
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to add employee');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await hrmService.deleteEmployee(id);
      setSuccess('Employee deleted successfully.');
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete employee');
    }
  };

  return (
    <HrmLayout
      title="Employee Directory"
      subtitle="Manage your organization workforce, roles, salaries, and employment status"
      activeTab="employees"
      error={error}
      success={success}
      onDismissError={() => setError(null)}
      onDismissSuccess={() => setSuccess(null)}
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PlusIcon size={16} />
            <span>Add Employee</span>
          </button>
          <button type="button" onClick={loadData} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCwIcon size={16} />
            <span>Refresh</span>
          </button>
        </div>
      }
    >
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260, background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
            <SearchIcon size={16} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by name, email, department, or EMP ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 14 }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, background: '#fff' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="INACTIVE">Inactive</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
              <th style={{ padding: '12px 16px' }}>EMP ID</th>
              <th style={{ padding: '12px 16px' }}>NAME</th>
              <th style={{ padding: '12px 16px' }}>EMAIL & CONTACT</th>
              <th style={{ padding: '12px 16px' }}>DEPARTMENT</th>
              <th style={{ padding: '12px 16px' }}>DESIGNATION</th>
              <th style={{ padding: '12px 16px' }}>SALARY</th>
              <th style={{ padding: '12px 16px' }}>STATUS</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>Loading employees...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>No employees found matching criteria.</td></tr>
            ) : (
              filtered.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#3b82f6' }}>{emp.employeeNumber || emp.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{emp.firstName} {emp.lastName}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>{emp.email}</div>
                    {emp.phone && <div style={{ fontSize: 12, color: '#64748b' }}>{emp.phone}</div>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{emp.department || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>{emp.designation || '—'}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{emp.salary ? `$${emp.salary.toLocaleString()}` : '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                      background: emp.status === 'ACTIVE' ? '#dcfce7' : emp.status === 'ON_LEAVE' ? '#fef3c7' : '#f1f5f9',
                      color: emp.status === 'ACTIVE' ? '#166534' : emp.status === 'ON_LEAVE' ? '#92400e' : '#475569'
                    }}>
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button type="button" onClick={() => handleDelete(emp.id)} className="btn btn-icon" style={{ color: '#ef4444' }} title="Delete">
                      <TrashIcon size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: 24, background: '#fff', borderRadius: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Add New Employee</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>First Name *</label>
                  <input type="text" required value={newEmp.firstName} onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Last Name *</label>
                  <input type="text" required value={newEmp.lastName} onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Work Email *</label>
                <input type="email" required value={newEmp.email} onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Phone</label>
                  <input type="text" value={newEmp.phone} onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Department</label>
                  <input type="text" value={newEmp.department} onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Designation</label>
                  <input type="text" value={newEmp.designation} onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Annual Salary ($)</label>
                  <input type="number" value={newEmp.salary} onChange={(e) => setNewEmp({ ...newEmp, salary: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
