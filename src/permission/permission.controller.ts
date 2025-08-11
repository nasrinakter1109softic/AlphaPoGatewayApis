import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { GenericQueryDto } from 'src/common/dtos/GenericQueryDto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Permissions } from '@/auth/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Permissions('permission_create')
  @Post('create')
  create(@Body() body: CreatePermissionDto) {
    if (!body.title || !body.slug) {
      throw new BadRequestException('Title and Slug is required');
    }
    return this.permissionService.create(body);
  }

  @Permissions('permission_list')
  @Get()
  findAll(@Query() query: GenericQueryDto) {
    return this.permissionService.findAll(query);
  }

  @Permissions('permission_view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(+id);
  }

  @Permissions('permission_update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionService.update(+id, dto);
  }

  @Permissions('permission_delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(+id);
  }
}
