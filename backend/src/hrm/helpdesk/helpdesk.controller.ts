import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { HrmHelpdeskService } from './helpdesk.service';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('HRM - HR Helpdesk & Tickets')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hrm/helpdesk')
export class HrmHelpdeskController {
  constructor(private readonly service: HrmHelpdeskService) {}

  @Get('tickets')
  @ApiOperation({ summary: 'List all internal HR employee service tickets' })
  async getTickets() {
    return this.service.getTickets();
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get HR support ticket details' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async getTicket(@Param('id') id: string) {
    return this.service.getTicket(id);
  }

  @Post('tickets')
  @ApiOperation({ summary: 'Submit an internal HR support inquiry' })
  async createTicket(@Body() body: any) {
    return this.service.createTicket(body);
  }

  @Post('tickets/:id/resolve')
  @ApiOperation({ summary: 'Mark HR service ticket as resolved' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async resolveTicket(@Param('id') id: string) {
    return this.service.resolveTicket(id);
  }
}
