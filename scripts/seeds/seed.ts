import 'tsconfig-paths/register'; // ✅ path aliases enable
import 'reflect-metadata'; // ✅ TypeORM requires this
import 'dotenv/config';
import dataSource from '../../src/config/ormconfig';
import { seedRoles } from './seedRoles';
import { seedAllPermissions } from './seedAllPermissions';
import { seedMenus } from './seedMenus';
import { mapPermissionsToRolesAndMenus } from './mapPermissionsToRolesAndMenus';

async function seedDatabase() {
  await dataSource.initialize();
  try {
    await seedRoles(dataSource);
    await seedMenus(dataSource);
    await seedAllPermissions(dataSource);

    await mapPermissionsToRolesAndMenus(dataSource);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await dataSource.destroy();
  }
}

seedDatabase().catch(console.error);
