import { Menu } from '../../src/menu/entity/menu.entity';
import { DataSource, Repository } from 'typeorm';

export async function seedMenus(ds: DataSource): Promise<Menu[]> {
  const repo: Repository<Menu> = ds.getRepository(Menu);
  const existing = await repo.find();
  if (existing.length) {
    console.log('Menus already seeded, skipping...');
    return existing;
  }
  const items = repo.create([
    { title: 'Dashboard', path: '/dashboard', iconUrl: 'dashboard-icon.png' },
    { title: 'Merchants', path: '/users', iconUrl: 'users-icon.png' },
    { title: 'Reports', path: '/reports', iconUrl: 'reports-icon.png' },
    { title: 'Settings', path: '/settings', iconUrl: 'settings-icon.png' },
  ]);
  await repo.save(items);
  console.log('Menus seeded successfully!');
  return items;
}
