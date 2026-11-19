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
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('ERP - Approvals')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('erp/approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  @ApiOperation({ summary: 'List all ERP approval workflows' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'List of approvals' })
  async findAll(@Query('workspaceId') workspaceId?: string) {
    return this.approvalsService.findAll(workspaceId);
  }

  @Get('pending')
  @ApiOperation({ summary: 'List pending approval workflows requiring review' })
  @ApiQuery({ name: 'workspaceId', required: false })
  @ApiResponse({ status: 200, description: 'List of pending approvals' })
  async getPending(@Query('workspaceId') workspaceId?: string) {
    return this.approvalsService.getPending(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get approval request details' })
  @ApiParam({ name: 'id', description: 'Approval ID' })
  async findOne(@Param('id') id: string) {
    return this.approvalsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a new approval request' })
  async create(@Body() body: any) {
    return this.approvalsService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an approval request' })
  @ApiParam({ name: 'id', description: 'Approval ID' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.approvalsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an approval request' })
  @ApiParam({ name: 'id', description: 'Approval ID' })
  async remove(@Param('id') id: string) {
    return this.approvalsService.remove(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve an ERP request' })
  @ApiParam({ name: 'id', description: 'Approval ID' })
  @ApiBody({ required: false, schema: { type: 'object', properties: { comment: { type: 'string', example: 'Approved by director' } } } })
  async approve(@Param('id') id: string, @Body('comment') comment?: string) {
    return this.approvalsService.approve(id, comment);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject an ERP request' })
  @ApiParam({ name: 'id', description: 'Approval ID' })
  @ApiBody({ required: false, schema: { type: 'object', properties: { reason: { type: 'string', example: 'Missing budget approval' } } } })
  async reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.approvalsService.reject(id, reason);
  }
}
