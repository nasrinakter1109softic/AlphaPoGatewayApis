import 'tsconfig-paths/register';
import 'reflect-metadata';
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
    // Only seed if DB empty (idempotent)
    const rolesCount = await AppDataSource.getRepository('Roles').count();
    if (rolesCount === 0) {
      console.log('🟢 Seeding database...');
      await seedRoles(AppDataSource);
      await seedMenus(AppDataSource);
      await seedAllPermissions(AppDataSource);
      await mapPermissionsToRolesAndMenus(AppDataSource);
      await seedSuperAdminUser(AppDataSource);
      console.log('✅ Database seeding completed successfully!');
    } else {
      console.log('ℹ️ Database already has data. Skipping seed.');
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seedDatabase().catch(console.error);
