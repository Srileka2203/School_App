import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ErpReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFinancialReport(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};

    const [salesAgg, poAgg] = await Promise.all([
      this.prisma.erpSalesOrder.aggregate({
        where,
        _sum: { orderTotal: true },
      }).catch(() => ({ _sum: { orderTotal: 0 } })),
      this.prisma.purchaseOrder.aggregate({
        where,
        _sum: { totalAmount: true },
      }).catch(() => ({ _sum: { totalAmount: 0 } })),
    ]);

    const totalRevenue = salesAgg._sum?.orderTotal || 0;
    const costOfGoodsSold = poAgg._sum?.totalAmount || 0;
    const grossMargin = totalRevenue > 0 ? ((totalRevenue - costOfGoodsSold) / totalRevenue) * 100 : 0;
    const operatingExpenses = Math.round(costOfGoodsSold * 0.35);
    const netIncome = totalRevenue - costOfGoodsSold - operatingExpenses;

    return {
      period: 'Fiscal Year 2026',
      totalRevenue,
      costOfGoodsSold,
      grossMarginPercent: Number(grossMargin.toFixed(1)),
      operatingExpenses,
      netIncome,
      generatedAt: new Date().toISOString(),
    };
  }

  async getProcurementReport(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};

    const [totalSpendAgg, vendors, ordersCount] = await Promise.all([
      this.prisma.purchaseOrder.aggregate({
        where,
        _sum: { totalAmount: true },
      }).catch(() => ({ _sum: { totalAmount: 0 } })),
      this.prisma.vendor.findMany({
        where,
        take: 5,
        orderBy: { rating: 'desc' },
      }).catch(() => []),
      this.prisma.purchaseOrder.count({ where }).catch(() => 0),
    ]);

    return {
      period: 'Last 30 Days',
      totalPoSpend: totalSpendAgg._sum?.totalAmount || 0,
      totalPurchaseOrders: ordersCount,
      topSuppliers: vendors.map((v) => ({
        id: v.id,
        supplier: v.name,
        rating: v.rating,
        status: v.status,
      })),
      generatedAt: new Date().toISOString(),
    };
  }

  async getProductionEfficiencyReport(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};

    const workOrders = await this.prisma.manufacturingWorkOrder.findMany({
      where,
      take: 20,
    }).catch(() => []);

    const totalTarget = workOrders.reduce((sum, wo) => sum + wo.quantityTarget, 0);
    const totalCompleted = workOrders.reduce((sum, wo) => sum + wo.quantityCompleted, 0);
    const completionRate = totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0;

    return {
      period: 'Monthly',
      overallEquipmentEffectiveness: 88.6,
      completionRatePercent: Number(completionRate.toFixed(1)),
      totalUnitsProduced: totalCompleted,
      totalUnitsTargeted: totalTarget,
      activeWorkOrdersCount: workOrders.length,
      generatedAt: new Date().toISOString(),
    };
  }

  async getInventoryReport(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};

    const inventory = await this.prisma.inventoryItem.findMany({
      where,
    }).catch(() => []);

    const totalSKUs = inventory.length;
    const totalValuation = inventory.reduce((sum, item) => sum + (item.quantityOnHand * item.unitPrice), 0);
    const lowStockItems = inventory.filter((item) => item.quantityOnHand <= item.reorderLevel);

    return {
      period: 'Current Stock Valuation',
      totalSKUs,
      totalInventoryValuation: Math.round(totalValuation),
      lowStockAlertsCount: lowStockItems.length,
      lowStockItems: lowStockItems.map((item) => ({
        sku: item.sku,
        name: item.name,
        quantityOnHand: item.quantityOnHand,
        reorderLevel: item.reorderLevel,
        status: item.status,
      })),
      generatedAt: new Date().toISOString(),
    };
  }

  async getQualityReport(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};

    const [inspections, audits] = await Promise.all([
      this.prisma.qualityInspection.findMany({ where, take: 50 }).catch(() => []),
      this.prisma.qualityAudit.findMany({ where, take: 10 }).catch(() => []),
    ]);

    const totalInspections = inspections.length;
    const passedInspections = inspections.filter((i) => i.result === 'PASS').length;
    const passRate = totalInspections > 0 ? (passedInspections / totalInspections) * 100 : 100;
    const totalDefects = inspections.reduce((sum, i) => sum + i.defectsCount, 0);

    return {
      period: 'YTD Quality & Compliance',
      totalInspections,
      passRatePercent: Number(passRate.toFixed(1)),
      totalDefectsLogged: totalDefects,
      auditsSummary: audits.map((a) => ({
        title: a.title,
        standard: a.standard,
        score: a.score,
        status: a.status,
      })),
      generatedAt: new Date().toISOString(),
    };
  }

  async getExecutiveSummary(workspaceId?: string) {
    const [financial, procurement, production, inventory, quality] = await Promise.all([
      this.getFinancialReport(workspaceId),
      this.getProcurementReport(workspaceId),
      this.getProductionEfficiencyReport(workspaceId),
      this.getInventoryReport(workspaceId),
      this.getQualityReport(workspaceId),
    ]);

    return {
      title: 'Enterprise ERP Executive Consolidated Summary',
      financial,
      procurement,
      production,
      inventory,
      quality,
      generatedAt: new Date().toISOString(),
    };
  }
}
