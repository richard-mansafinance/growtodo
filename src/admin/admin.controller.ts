import {
  Controller,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { SetUserRolesDto } from './dto/setUserRoles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // First-time setup — no guards
  @Post('setup')
  @ApiOperation({ summary: 'First-time setup of an admin user' })
  @ApiCreatedResponse({
    description: 'Admin user created successfully',
    schema: {
      example: { message: 'Admin user created with email admin@example.com' },
    },
  })
  @ApiBadRequestResponse({ description: 'An admin already exists' })
  @ApiResponse({
    status: 500,
    description: 'Failed to set up admin user',
  })
  async setupAdmin(
    @Body() createAdminDto: CreateAdminDto,
  ): Promise<{ message: string }> {
    return await this.adminService.setupAdmin(createAdminDto);
  }

  // Create additional admins — must be authenticated admin
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiCreatedResponse({
    description: 'Admin created successfully',
    schema: {
      example: { message: 'Admin user created with email admin@example.com' },
    },
  })
  @ApiBadRequestResponse({ description: 'Email already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin access required' })
  @ApiResponse({ status: 500, description: 'Failed to create admin user' })
  async createAdmin(
    @Body() createAdminDto: CreateAdminDto,
  ): Promise<{ message: string }> {
    return await this.adminService.createAdmin(createAdminDto);
  }

  // Update user roles — must be authenticated admin
  @Put(':userId/roles')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update user roles' })
  @ApiOkResponse({
    description: 'User roles updated successfully',
    schema: {
      example: { message: 'User roles updated to admin' },
    },
  })
  @ApiBadRequestResponse({ description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin access required' })
  @ApiResponse({ status: 500, description: 'Failed to set user roles' })
  async setUserRoles(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() setUserRolesDto: SetUserRolesDto,
  ): Promise<{ message: string }> {
    return await this.adminService.setUserRoles(userId, setUserRolesDto.roles);
  }
}
