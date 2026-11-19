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
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'List of projects' })
  async findAll(@Query('workspaceId') workspaceId?: string) {
    return this.projectService.findAll(workspaceId);
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

  @Patch('projects/:id')
  @ApiOperation({ summary: 'Update project attributes, budget, and timeline' })
  @ApiParam({ name: 'id', description: 'Project ID or Code' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.projectService.update(id, body);
  }

  @Delete('projects/:id')
  @ApiOperation({ summary: 'Delete or archive an ERP project' })
  @ApiParam({ name: 'id', description: 'Project ID or Code' })
  async remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }

  @Post('projects/:id/milestones')
  @ApiOperation({ summary: 'Add a deliverable milestone to a project' })
  @ApiParam({ name: 'id', description: 'Project ID or Code' })
  @ApiBody({ schema: { type: 'object', properties: { title: { type: 'string', example: 'Phase 1 Architecture Validation' }, status: { type: 'string', example: 'IN_PROGRESS', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] }, dueDate: { type: 'string', example: '2026-12-15' } } } })
  async addMilestone(@Param('id') id: string, @Body() body: any) {
    return this.projectService.addMilestone(id, body);
  }

  @Patch('milestones/:milestoneId')
  @ApiOperation({ summary: 'Update project milestone progress' })
  @ApiParam({ name: 'milestoneId', description: 'Milestone ID' })
  async updateMilestone(@Param('milestoneId') milestoneId: string, @Body() body: any) {
    return this.projectService.updateMilestone(milestoneId, body);
  }

  @Delete('milestones/:milestoneId')
  @ApiOperation({ summary: 'Remove a project milestone' })
  @ApiParam({ name: 'milestoneId', description: 'Milestone ID' })
  async removeMilestone(@Param('milestoneId') milestoneId: string) {
    return this.projectService.removeMilestone(milestoneId);
  }
}
