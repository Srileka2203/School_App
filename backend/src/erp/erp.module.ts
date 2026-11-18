import { Module } from '@nestjs/common';
import { ErpDashboardModule } from './dashboard/dashboard.module';
import { BusinessWorkflowsModule } from './business-workflows/business-workflows.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { ProcurementModule } from './procurement/procurement.module';
import { OrderManagementModule } from './order-management/order-management.module';
import { SupplyChainModule } from './supply-chain/supply-chain.module';
import { ProjectManagementModule } from './project-management/project-management.module';
import { ManufacturingModule } from './manufacturing/manufacturing.module';
import { QualityManagementModule } from './quality-management/quality-management.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ErpReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ErpDashboardModule,
    BusinessWorkflowsModule,
    ApprovalsModule,
    ProcurementModule,
    OrderManagementModule,
    SupplyChainModule,
    ProjectManagementModule,
    ManufacturingModule,
    QualityManagementModule,
    IntegrationsModule,
    ErpReportsModule,
  ],
  exports: [
    ErpDashboardModule,
    BusinessWorkflowsModule,
    ApprovalsModule,
    ProcurementModule,
    OrderManagementModule,
    SupplyChainModule,
    ProjectManagementModule,
    ManufacturingModule,
    QualityManagementModule,
    IntegrationsModule,
    ErpReportsModule,
  ],
})
export class ErpModule {}
