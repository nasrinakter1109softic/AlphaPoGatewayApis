import 'tsconfig-paths/register'; // ✅ path aliases enable
import 'reflect-metadata'; // ✅ TypeORM requires this
import 'dotenv/config';
import { AppDataSource } from '../../src/config/ormconfig';
import { seedRoles } from './seedRoles';
import { seedAllPermissions } from './seedAllPermissions';
import { seedMenus } from './seedMenus';
import { mapPermissionsToRolesAndMenus } from './mapPermissionsToRolesAndMenus';
import { seedSuperAdminUser } from './seedSuperAdminUser';

async function seedDatabase() {
  await AppDataSource.initialize();
  try {
    await seedRoles(AppDataSource);
    await seedMenus(AppDataSource);
    await seedAllPermissions(AppDataSource);

    await mapPermissionsToRolesAndMenus(AppDataSource);
    await seedSuperAdminUser(AppDataSource);
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seedDatabase().catch(console.error);
