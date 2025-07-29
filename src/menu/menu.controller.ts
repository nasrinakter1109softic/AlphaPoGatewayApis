import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post('create')
  async createMenu(@Body() body: CreateMenuDto) {
    const existing = await this.menuService.findByTitle(body.title);
    if (existing) {
      return { message: 'Already created' };
    }
    return this.menuService.createMenu(body);
  }

  @Get()
  async getMenus() {
    return this.menuService.getAllMenus();
  }

  @Get(':id')
  async getMenuById(@Param('id') id: number) {
    return this.menuService.getMenuById(id);
  }

  @Put(':id')
  async updateMenu(@Param('id') id: number, @Body() body: UpdateMenuDto) {
    return this.menuService.updateMenu(id, body);
  }

  @Delete(':id')
  async deleteMenu(@Param('id') id: number) {
    return this.menuService.deleteMenu(id);
  }
}
