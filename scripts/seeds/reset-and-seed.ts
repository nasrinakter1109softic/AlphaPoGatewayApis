// scripts/seeds/reset-and-seed.ts
import 'dotenv/config';
import 'tsconfig-paths/register';
import dataSource from '../../src/config/ormconfig';

async function resetTables() {
  console.log('🗑️  Truncating seed-related tables (with CASCADE)...');

  // Only main tables casecade truncate
  const tables = ['roles', 'permissions', 'menus'];

  for (const table of tables) {
    try {
      await dataSource.query(
        `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`,
      );
      console.log(`   ✔ ${table} truncated`);
    } catch (err) {
      console.warn(`   ⚠️  Could not truncate ${table}:`, err?.message ?? err);
    }
  }
}

async function main() {
  await dataSource.initialize();
  try {
    await resetTables();
  } finally {
    await dataSource.destroy();
  }

  console.log('🌱  Running seed script...');
  await import('./seed');
}

main().catch((err) => {
  console.error('❌ Seed reset failed:', err);
  process.exit(1);
});
