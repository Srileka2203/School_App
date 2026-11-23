import { api } from './api';
import type {
  ErpDashboardResponse,
  ErpOperationalStats,
  BusinessWorkflow,
  CreateWorkflowPayload,
  ApprovalRequestItem,
  CreateApprovalPayload,
  PurchaseOrder,
  Vendor,
  CreatePurchaseOrderPayload,
  ErpSalesOrder,
  CreateSalesOrderPayload,
  InventoryItem,
  LogisticsShipment,
  CreateShipmentPayload,
  ErpProject,
  CreateProjectPayload,
  ManufacturingWorkOrder,
  BillOfMaterial,
  CreateWorkOrderPayload,
  QualityInspection,
  QualityAudit,
  CreateInspectionPayload,
  ErpConnector,
  ErpIntegrationLog,
  FinancialReport,
  ProcurementReport,
  ProductionEfficiencyReport,
} from '../types/erp.types';

export const erpService = {
  // 1. Dashboard
  async getDashboardOverview(workspaceId?: string): Promise<ErpDashboardResponse> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return api.get<ErpDashboardResponse>(`/erp/dashboard/overview${query}`);
  },

  async getDashboardStats(workspaceId?: string): Promise<ErpOperationalStats> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return api.get<ErpOperationalStats>(`/erp/dashboard/stats${query}`);
  },

  // 2. Business Workflows
  async getWorkflows(workspaceId?: string): Promise<{ data: BusinessWorkflow[]; meta: { total: number } }> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return api.get<{ data: BusinessWorkflow[]; meta: { total: number } }>(`/erp/business-workflows${query}`);
  },

  async getWorkflow(id: string): Promise<BusinessWorkflow> {
    return api.get<BusinessWorkflow>(`/erp/business-workflows/${id}`);
  },

  async createWorkflow(payload: CreateWorkflowPayload): Promise<BusinessWorkflow> {
    return api.post<BusinessWorkflow>('/erp/business-workflows', payload);
  },

  async updateWorkflow(id: string, payload: Partial<CreateWorkflowPayload>): Promise<BusinessWorkflow> {
    return api.patch<BusinessWorkflow>(`/erp/business-workflows/${id}`, payload);
  },

  async deleteWorkflow(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/erp/business-workflows/${id}`);
  },

  // 3. Approvals
  async getApprovals(workspaceId?: string): Promise<{ data: ApprovalRequestItem[]; meta: { total: number } }> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return api.get<{ data: ApprovalRequestItem[]; meta: { total: number } }>(`/erp/approvals${query}`);
  },

  async getApproval(id: string): Promise<ApprovalRequestItem> {
    return api.get<ApprovalRequestItem>(`/erp/approvals/${id}`);
  },

  async createApproval(payload: CreateApprovalPayload): Promise<ApprovalRequestItem> {
    return api.post<ApprovalRequestItem>('/erp/approvals', payload);
  },

  async approveRequest(id: string, comment?: string): Promise<ApprovalRequestItem> {
    return api.post<ApprovalRequestItem>(`/erp/approvals/${id}/approve`, { comment });
  },

  async rejectRequest(id: string, reason?: string): Promise<ApprovalRequestItem> {
    return api.post<ApprovalRequestItem>(`/erp/approvals/${id}/reject`, { reason });
  },

  // 4. Procurement
  async getPurchaseOrders(workspaceId?: string): Promise<{ data: PurchaseOrder[]; meta: { total: number } }> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return api.get<{ data: PurchaseOrder[]; meta: { total: number } }>(`/erp/procurement/orders${query}`);
  },

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    return api.get<PurchaseOrder>(`/erp/procurement/orders/${id}`);
  },

  async createPurchaseOrder(payload: CreatePurchaseOrderPayload): Promise<PurchaseOrder> {
    return api.post<PurchaseOrder>('/erp/procurement/orders', payload);
  },

  async getVendors(workspaceId?: string): Promise<{ data: Vendor[]; meta: { total: number } }> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return api.get<{ data: Vendor[]; meta: { total: number } }>(`/erp/procurement/vendors${query}`);
  },

  // 5. Order Management
  async getSalesOrders(workspaceId?: string): Promise<{ data: ErpSalesOrder[]; meta: { total: number } }> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return api.get<{ data: ErpSalesOrder[]; meta: { total: number } }>(`/erp/order-management/orders${query}`);
  },

  async getSalesOrder(id: string): Promise<ErpSalesOrder> {
    return api.get<ErpSalesOrder>(`/erp/order-management/orders/${id}`);
  },

  async createSalesOrder(payload: CreateSalesOrderPayload): Promise<ErpSalesOrder> {
    return api.post<ErpSalesOrder>('/erp/order-management/orders', payload);
  },

  async updateOrderStatus(id: string, status: string): Promise<ErpSalesOrder> {
    return api.patch<ErpSalesOrder>(`/erp/order-management/orders/${id}/status`, { status });
  },

  // 6. Supply Chain
  async getInventory(workspaceId?: string): Promise<{ data: InventoryItem[]; meta: { total: number } }> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return api.get<{ data: InventoryItem[]; meta: { total: number } }>(`/erp/supply-chain/inventory${query}`);
  },

  async getShipments(workspaceId?: string): Promise<{ data: LogisticsShipment[]; meta: { total: number } }> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return api.get<{ data: LogisticsShipment[]; meta: { total: number } }>(`/erp/supply-chain/shipments${query}`);
  },

  async createShipment(payload: CreateShipmentPayload): Promise<LogisticsShipment> {
    return api.post<LogisticsShipment>('/erp/supply-chain/shipments', payload);
  },

  // 7. Project Management
  async getProjects(workspaceId?: string): Promise<{ data: ErpProject[]; meta: { total: number } }> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return api.get<{ data: ErpProject[]; meta: { total: number } }>(`/erp/project-management/projects${query}`);
  },

  async getProject(id: string): Promise<ErpProject> {
    return api.get<ErpProject>(`/erp/project-management/projects/${id}`);
  },

  async createProject(payload: CreateProjectPayload): Promise<ErpProject> {
    return api.post<ErpProject>('/erp/project-management/projects', payload);
  },

  // 8. Manufacturing
  async getWorkOrders(workspaceId?: string): Promise<{ data: ManufacturingWorkOrder[]; meta: { total: number } }> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return api.get<{ data: ManufacturingWorkOrder[]; meta: { total: number } }>(`/erp/manufacturing/work-orders${query}`);
  },

  async createWorkOrder(payload: CreateWorkOrderPayload): Promise<ManufacturingWorkOrder> {
    return api.post<ManufacturingWorkOrder>('/erp/manufacturing/work-orders', payload);
  },

  async getBillOfMaterials(workspaceId?: string): Promise<{ data: BillOfMaterial[]; meta: { total: number } }> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return api.get<{ data: BillOfMaterial[]; meta: { total: number } }>(`/erp/manufacturing/bom${query}`);
  },

  // 9. Quality Management
  async getInspections(workspaceId?: string): Promise<{ data: QualityInspection[]; meta: { total: number } }> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return api.get<{ data: QualityInspection[]; meta: { total: number } }>(`/erp/quality-management/inspections${query}`);
  },

  async createInspection(payload: CreateInspectionPayload): Promise<QualityInspection> {
    return api.post<QualityInspection>('/erp/quality-management/inspections', payload);
  },

  async getAudits(workspaceId?: string): Promise<{ data: QualityAudit[]; meta: { total: number } }> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return api.get<{ data: QualityAudit[]; meta: { total: number } }>(`/erp/quality-management/audits${query}`);
  },

  // 10. Integrations
  async getConnectors(workspaceId?: string): Promise<{ data: ErpConnector[]; meta: { total: number } }> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
    return api.get<{ data: ErpConnector[]; meta: { total: number } }>(`/erp/integrations${query}`);
  },

  async triggerSync(id: string): Promise<{ message: string; connector: ErpConnector }> {
    return api.post<{ message: string; connector: ErpConnector }>(`/erp/integrations/${id}/sync`, {});
  },

  async getIntegrationLogs(connectorId?: string): Promise<ErpIntegrationLog[]> {
    const query = connectorId ? `?connectorId=${encodeURIComponent(connectorId)}` : '';
    return api.get<ErpIntegrationLog[]>(`/erp/integrations/logs${query}`);
  },

  // 11. Reports
  async getFinancialReport(): Promise<FinancialReport> {
    return api.get<FinancialReport>('/erp/reports/financial');
  },

  async getProcurementReport(): Promise<ProcurementReport> {
    return api.get<ProcurementReport>('/erp/reports/procurement');
  },

  async getProductionReport(): Promise<ProductionEfficiencyReport> {
    return api.get<ProductionEfficiencyReport>('/erp/reports/production');
  },
};
