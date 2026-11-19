import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { QualityManagementService } from './quality-management.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('ERP - Quality Management')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('erp/quality-management')
export class QualityManagementController {
  constructor(private readonly qualityService: QualityManagementService) {}

  // --- INSPECTIONS ---
  @Get('inspections')
  @ApiOperation({ summary: 'List QA and batch release inspections' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'Inspection list' })
  async getInspections(@Query('workspaceId') workspaceId?: string) {
    return this.qualityService.getInspections(workspaceId);
  }

  @Get('inspections/:id')
  @ApiOperation({ summary: 'Get QA inspection details' })
  @ApiParam({ name: 'id', description: 'Inspection ID or Code' })
  async getInspection(@Param('id') id: string) {
    return this.qualityService.getInspection(id);
  }

  @Post('inspections')
  @ApiOperation({ summary: 'Log a new QA inspection result' })
  @ApiBody({ schema: { type: 'object', properties: { targetBatch: { type: 'string', example: 'Batch WO-0041-A' }, inspector: { type: 'string', example: 'Dr. Michael Chen' }, sampleSize: { type: 'number', example: 100 }, defectsCount: { type: 'number', example: 0 }, result: { type: 'string', example: 'PASS', enum: ['PASS', 'FAIL', 'CONDITIONAL_PASS'] }, notes: { type: 'string', example: 'Tolerance verified within 0.005mm' } } } })
  async createInspection(@Body() body: any) {
    return this.qualityService.createInspection(body);
  }

  @Patch('inspections/:id')
  @ApiOperation({ summary: 'Update QA inspection findings' })
  @ApiParam({ name: 'id', description: 'Inspection ID or Code' })
  async updateInspection(@Param('id') id: string, @Body() body: any) {
    return this.qualityService.updateInspection(id, body);
  }

  @Delete('inspections/:id')
  @ApiOperation({ summary: 'Remove a QA inspection record' })
  @ApiParam({ name: 'id', description: 'Inspection ID or Code' })
  async removeInspection(@Param('id') id: string) {
    return this.qualityService.removeInspection(id);
  }

  // --- AUDITS ---
  @Get('audits')
  @ApiOperation({ summary: 'List quality audits and compliance certifications' })
  @ApiQuery({ name: 'workspaceId', required: false })
  async getAudits(@Query('workspaceId') workspaceId?: string) {
    return this.qualityService.getAudits(workspaceId);
  }

  @Get('audits/:id')
  @ApiOperation({ summary: 'Get compliance audit details' })
  @ApiParam({ name: 'id', description: 'Audit ID' })
  async getAudit(@Param('id') id: string) {
    return this.qualityService.getAudit(id);
  }

  @Post('audits')
  @ApiOperation({ summary: 'Schedule or log a new compliance audit' })
  @ApiBody({ schema: { type: 'object', properties: { title: { type: 'string', example: 'ISO 14001 Environmental Management Audit' }, standard: { type: 'string', example: 'ISO 14001' }, score: { type: 'number', example: 98.5 }, auditor: { type: 'string', example: 'Global Certifications LLC' }, status: { type: 'string', example: 'COMPLIANT', enum: ['COMPLIANT', 'NON_COMPLIANT', 'IN_PROGRESS'] } } } })
  async createAudit(@Body() body: any) {
    return this.qualityService.createAudit(body);
  }

  @Patch('audits/:id')
  @ApiOperation({ summary: 'Update audit score or compliance status' })
  @ApiParam({ name: 'id', description: 'Audit ID' })
  async updateAudit(@Param('id') id: string, @Body() body: any) {
    return this.qualityService.updateAudit(id, body);
  }

  @Delete('audits/:id')
  @ApiOperation({ summary: 'Remove an audit record' })
  @ApiParam({ name: 'id', description: 'Audit ID' })
  async removeAudit(@Param('id') id: string) {
    return this.qualityService.removeAudit(id);
  }
}
