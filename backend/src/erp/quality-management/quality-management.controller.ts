import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QualityManagementService } from './quality-management.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('ERP - Quality Management')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('erp/quality-management')
export class QualityManagementController {
  constructor(private readonly qualityService: QualityManagementService) {}

  @Get('inspections')
  @ApiOperation({ summary: 'List QA and batch release inspections' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'Inspection list' })
  async getInspections(@Query('workspaceId') workspaceId?: string) {
    return this.qualityService.getInspections(workspaceId);
  }

  @Post('inspections')
  @ApiOperation({ summary: 'Log a new QA inspection result' })
  async createInspection(@Body() body: any) {
    return this.qualityService.createInspection(body);
  }

  @Get('audits')
  @ApiOperation({ summary: 'List quality audits and compliance certifications' })
  @ApiQuery({ name: 'workspaceId', required: false })
  async getAudits(@Query('workspaceId') workspaceId?: string) {
    return this.qualityService.getAudits(workspaceId);
  }
}
