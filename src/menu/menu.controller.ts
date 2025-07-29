import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post('create')
  async createMenu(@Body() body: CreateMenuDto) {
    if (!body.title) {
      throw new BadRequestException('Title is required');
    }
    const existing = await this.menuService.findByTitle(body.title);
    if (existing) {
      throw new BadRequestException('Menu with this title already exists');
    }
    return this.menuService.createMenu(body);
  }

  @Get()
  async getMenus() {
    return this.menuService.getAllMenus();
  }

  @Get(':id')
  async getMenuById(@Param('id') id: number) {
    const menu = await this.menuService.getMenuById(id);
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }
    return menu;
  }

  @Put(':id')
  async updateMenu(@Param('id') id: number, @Body() body: UpdateMenuDto) {
    const menu = await this.menuService.getMenuById(id);
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }
    return this.menuService.updateMenu(id, body);
  }

  @Delete(':id')
  async deleteMenu(@Param('id') id: number) {
    const menu = await this.menuService.getMenuById(id);
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }
    await this.menuService.deleteMenu(id);
    return { message: 'Menu deleted successfully' };
  }
}