// ==========================================
// ERP TYPES DEFINITIONS
// ==========================================

export interface ErpDashboardMetrics {
  activeWorkflows: number;
  pendingApprovals: number;
  openProcurementOrders: number;
  activeOrders: number;
  supplyChainAlerts: number;
  activeProjects: number;
  manufacturingRuns: number;
  qualityInspectionsPending: number;
}

export interface ErpOperationalStats {
  totalProcurementSpend: number;
  fulfilledOrders: number;
  averageProductionCycleHours: number;
  complianceScorePercent: number;
}

export interface ErpDashboardResponse {
  message: string;
  metrics: ErpDashboardMetrics;
  lastUpdated: string;
}

// 1. Business Workflows
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  error?: string;
}

export interface BusinessWorkflow {
  id: string;
  name: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  trigger: string;
  stepsCount: number;
  definition?: Record<string, any>;
  workspaceId?: string;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
  executions?: WorkflowExecution[];
}

export interface CreateWorkflowPayload {
  name: string;
  category?: string;
  status?: string;
  trigger?: string;
  stepsCount?: number;
  definition?: Record<string, any>;
  workspaceId?: string;
}

// 2. Approvals
export interface ApprovalRequestItem {
  id: string;
  title: string;
  module: string;
  requester: string;
  requesterId?: string;
  approverRole: string;
  approverId?: string;
  amount?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  comment?: string;
  details?: Record<string, any>;
  workspaceId?: string;
  submittedAt: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApprovalPayload {
  title: string;
  module?: string;
  requester?: string;
  approverRole?: string;
  amount?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  details?: Record<string, any>;
  workspaceId?: string;
}

// 3. Procurement
export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  itemName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Vendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  rating: number;
  activeContracts: number;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  vendorId?: string;
  vendor?: Vendor | null;
  totalAmount: number;
  currency: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  orderDate: string;
  expectedDelivery?: string;
  lineItemsCount: number;
  notes?: string;
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
  items?: PurchaseOrderItem[];
}

export interface CreatePurchaseOrderPayload {
  poNumber?: string;
  vendorName: string;
  vendorId?: string;
  totalAmount?: number;
  currency?: string;
  status?: string;
  expectedDelivery?: string;
  lineItemsCount?: number;
  notes?: string;
  workspaceId?: string;
}

// 4. Order Management
export interface ErpSalesOrderItem {
  id: string;
  salesOrderId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ErpSalesOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerId?: string;
  orderTotal: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'FULFILLED' | 'CANCELLED';
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL';
  orderDate: string;
  lineItemsCount: number;
  shippingAddress?: string;
  billingAddress?: string;
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
  items?: ErpSalesOrderItem[];
}

export interface CreateSalesOrderPayload {
  orderNumber?: string;
  customerName: string;
  customerId?: string;
  orderTotal?: number;
  currency?: string;
  status?: string;
  paymentStatus?: string;
  lineItemsCount?: number;
  shippingAddress?: string;
  billingAddress?: string;
  workspaceId?: string;
}

// 5. Supply Chain
export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  warehouseLocation: string;
  quantityOnHand: number;
  reorderLevel: number;
  unitPrice: number;
  unitOfMeasure: string;
  status: 'OPTIMAL' | 'LOW_STOCK' | 'CRITICAL' | 'OVERSTOCK';
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogisticsShipment {
  id: string;
  trackingNumber: string;
  carrier: string;
  origin: string;
  destination: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  estimatedArrival?: string;
  actualArrival?: string;
  notes?: string;
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShipmentPayload {
  trackingNumber?: string;
  carrier?: string;
  origin: string;
  destination: string;
  status?: string;
  estimatedArrival?: string;
  notes?: string;
  workspaceId?: string;
}

// 6. Project Management
export interface ErpProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ErpProject {
  id: string;
  projectCode: string;
  name: string;
  description?: string;
  client: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED';
  budgetTotal: number;
  spentTotal: number;
  startDate: string;
  targetEndDate?: string;
  milestonesCount: number;
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
  milestones?: ErpProjectMilestone[];
}

export interface CreateProjectPayload {
  projectCode?: string;
  name: string;
  description?: string;
  client?: string;
  status?: string;
  budgetTotal?: number;
  spentTotal?: number;
  startDate?: string;
  targetEndDate?: string;
  milestonesCount?: number;
  workspaceId?: string;
}

// 7. Manufacturing
export interface ManufacturingWorkOrder {
  id: string;
  orderNumber: string;
  productName: string;
  quantityTarget: number;
  quantityCompleted: number;
  status: 'SCHEDULED' | 'IN_PRODUCTION' | 'COMPLETED' | 'ON_HOLD';
  startDate: string;
  dueDate?: string;
  productionLine: string;
  notes?: string;
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BomComponent {
  id?: string;
  bomId?: string;
  componentName: string;
  sku?: string;
  partNumber?: string;
  qtyPerUnit?: number;
  quantityRequired?: number;
  unit: string;
  costPerUnit?: number;
}

export interface BillOfMaterial {
  id: string;
  bomCode: string;
  assemblyName?: string;
  productName?: string;
  version?: string;
  revision?: string;
  status: string;
  components?: BomComponent[];
  createdAt: string;
}

export interface CreateWorkOrderPayload {
  orderNumber?: string;
  productName: string;
  quantityTarget?: number;
  quantityCompleted?: number;
  status?: string;
  startDate?: string;
  dueDate?: string;
  productionLine?: string;
  notes?: string;
  workspaceId?: string;
}

// 8. Quality Management
export interface QualityInspection {
  id: string;
  inspectionCode: string;
  targetBatch: string;
  inspector: string;
  sampleSize: number;
  defectsCount: number;
  result: 'PASS' | 'FAIL' | 'CONDITIONAL' | 'PENDING';
  inspectionDate: string;
  notes?: string;
  workspaceId?: string;
  createdAt: string;
}

export interface QualityAudit {
  id: string;
  title?: string;
  auditTitle?: string;
  auditor?: string;
  standard?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'PASSED' | 'ACTION_REQUIRED' | 'COMPLIANT' | 'NON_COMPLIANT';
  score?: number;
  auditDate: string;
  notes?: string;
  workspaceId?: string;
}

export interface CreateInspectionPayload {
  inspectionCode?: string;
  targetBatch: string;
  inspector?: string;
  sampleSize?: number;
  defectsCount?: number;
  result?: string;
  inspectionDate?: string;
  notes?: string;
  workspaceId?: string;
}

// 9. Integrations
export interface ErpIntegrationLog {
  id: string;
  connectorId: string;
  level: string;
  message: string;
  timestamp: string;
  payload?: any;
}

export interface ErpConnector {
  id: string;
  name: string;
  type: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'IDLE';
  config?: any;
  lastSyncAt?: string;
  recordsSyncedToday: number;
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
  logs?: ErpIntegrationLog[];
}

// 10. Reports
export interface FinancialReport {
  period: string;
  totalRevenue: number;
  costOfGoodsSold: number;
  grossMarginPercent: number;
  operatingExpenses: number;
  netIncome: number;
  generatedAt: string;
}

export interface SupplierSpend {
  supplier: string;
  spend: number;
  onTimeDelivery: string;
}

export interface ProcurementReport {
  period: string;
  totalPoSpend: number;
  topSuppliers: SupplierSpend[];
  generatedAt: string;
}

export interface ProductionEfficiencyReport {
  period: string;
  overallEquipmentEffectiveness: number;
  scrapRatePercent: number;
  downtimeHours: number;
  totalUnitsProduced: number;
  generatedAt: string;
}
