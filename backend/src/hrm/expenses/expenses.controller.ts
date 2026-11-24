import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - Employee Expenses')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/expenses')
export class HrmExpensesController {
  constructor(private readonly service: HrmExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'List all employee expense reimbursement claims' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense claim details' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Submit expense reimbursement claim' })
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve reimbursement claim' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  async approve(@Param('id') id: string) {
    return this.service.approve(id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject reimbursement claim' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  async reject(@Param('id') id: string, @Body() body: any) {
    return this.service.reject(id, body?.reason);
  }
}
