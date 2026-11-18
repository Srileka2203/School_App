import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProjectManagementService } from './project-management.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('ERP - Project Management')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('erp/project-management')
export class ProjectManagementController {
  constructor(private readonly projectService: ProjectManagementService) {}

  @Get('projects')
  @ApiOperation({ summary: 'List all ERP capital/client projects' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  async findAll() {
    return this.projectService.findAll();
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Get project details, milestones, and budget burn' })
  @ApiParam({ name: 'id', description: 'Project ID or Code' })
  async findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Post('projects')
  @ApiOperation({ summary: 'Create a new ERP project' })
  async create(@Body() body: any) {
    return this.projectService.create(body);
  }
}
