import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
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

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve an ERP request' })
  @ApiParam({ name: 'id', description: 'Approval ID' })
  async approve(@Param('id') id: string, @Body('comment') comment?: string) {
    return this.approvalsService.approve(id, comment);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject an ERP request' })
  @ApiParam({ name: 'id', description: 'Approval ID' })
  async reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.approvalsService.reject(id, reason);
  }
}
