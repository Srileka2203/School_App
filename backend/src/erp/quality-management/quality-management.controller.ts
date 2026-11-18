import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiResponse({ status: 200, description: 'Inspection list' })
  async getInspections() {
    return this.qualityService.getInspections();
  }

  @Post('inspections')
  @ApiOperation({ summary: 'Log a new QA inspection result' })
  async createInspection(@Body() body: any) {
    return this.qualityService.createInspection(body);
  }

  @Get('audits')
  @ApiOperation({ summary: 'List quality audits and compliance certifications' })
  async getAudits() {
    return this.qualityService.getAudits();
  }
}
