import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './entity/menu.entity';
import { Repository } from 'typeorm';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async createMenu(data: CreateMenuDto): Promise<Menu> {
    const menu = this.menuRepository.create(data);
    return this.menuRepository.save(menu);
  }

  async getAllMenus(): Promise<Menu[]> {
    return this.menuRepository.find();
  }

  async getMenuById(id: number): Promise<Menu | null> {
    return this.menuRepository.findOne({ where: { id }, relations: ['roles'] });
  }

  async updateMenu(id: number, data: UpdateMenuDto): Promise<Menu> {
    const menu = await this.getMenuById(id);
    if (!menu) throw new NotFoundException('Menu not found');
    Object.assign(menu, data);
    return this.menuRepository.save(menu);
  }

  async deleteMenu(id: number): Promise<void> {
    const menu = await this.getMenuById(id);
    if (!menu) throw new NotFoundException('Menu not found');
    if (menu.roles && menu.roles.length > 0) {
      throw new ConflictException(
        'Cannot delete menu because it is already assigned to roles',
      );
    }
    await this.menuRepository.remove(menu);
  }

  async findByTitle(title: string): Promise<Menu | null> {
    return this.menuRepository.findOne({ where: { title } });
  }
}
