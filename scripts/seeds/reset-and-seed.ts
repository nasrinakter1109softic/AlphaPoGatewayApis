import 'dotenv/config';
import 'tsconfig-paths/register';
import { AppDataSource } from '../../src/config/ormconfig';

async function resetTables() {
  console.log('🗑️  Truncating seed-related tables (with CASCADE)...');

  // Only main tables casecade truncate
  const tables = ['roles', 'permissions', 'menus'];

  for (const table of tables) {
    try {
      await AppDataSource.query(
        `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`,
      );
      console.log(`   ✔ ${table} truncated`);
    } catch (err) {
      console.warn(`   ⚠️  Could not truncate ${table}:`, err?.message ?? err);
    }
  }
}

async function main() {
  await AppDataSource.initialize();
  try {
    await resetTables();
  } finally {
    await AppDataSource.destroy();
  }

  console.log('🌱  Running seed script...');
  await import('./seed');
}

main().catch((err) => {
  console.error('❌ Seed reset failed:', err);
  process.exit(1);
});
