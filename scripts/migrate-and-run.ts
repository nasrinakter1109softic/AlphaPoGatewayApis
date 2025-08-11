import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const nameArg = args.find((a) => !a.startsWith('--'));
const isDryRun = args.includes('--dry');

if (!nameArg) {
  console.error(
    '❌ Please provide a migration name. Example: npm run migrate users-unique-index',
  );
  process.exit(1);
}

const safeName = nameArg
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9-_]/g, '-');
if (!safeName) {
  console.error('❌ Invalid migration name.');
  process.exit(1);
}

// ensure migrations dir exists
const migDir = path.resolve('src/migrations');
if (!existsSync(migDir)) mkdirSync(migDir, { recursive: true });

const genArgs = [
  '-r',
  'tsconfig-paths/register',
  './node_modules/typeorm/cli',
  'migration:generate',
  `src/migrations/${safeName}`,
  '--dataSource',
  'src/config/ormconfig.ts',
];

const runArgs = [
  '-r',
  'tsconfig-paths/register',
  './node_modules/typeorm/cli',
  'migration:run',
  '--dataSource',
  'src/config/ormconfig.ts',
];

function run(
  cmd: string,
  args: string[],
  inherit = false,
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      shell: true,
      stdio: inherit ? 'inherit' : 'pipe',
    });
    let stdout = '',
      stderr = '';
    if (!inherit) {
      child.stdout?.on('data', (d) => {
        stdout += d.toString();
      });
      child.stderr?.on('data', (d) => {
        stderr += d.toString();
      });
    }
    child.on('exit', (code) => resolve({ code: code ?? 0, stdout, stderr }));
  });
}

(async () => {
  console.log(
    `🛠️  Generating migration: ${safeName}${isDryRun ? ' (dry run)' : ''}`,
  );
  const gen = await run('ts-node', genArgs); // capture output to detect "No changes"

  // surface output to console
  process.stdout.write(gen.stdout);
  process.stderr.write(gen.stderr);

  if (gen.code !== 0) process.exit(gen.code);

  // detect “No changes in database schema” (TypeORM 0.3.x message)
  const noChanges = /No changes in database schema were found/i.test(
    gen.stdout + gen.stderr,
  );
  if (noChanges) {
    console.log('ℹ️  No changes detected. Skipping migration:run.');
    process.exit(0);
  }

  if (isDryRun) {
    console.log(
      '✅ Dry run complete. Migration file generated but not executed.',
    );
    process.exit(0);
  }

  console.log('🚀 Running pending migrations...');
  const runMig = await run('ts-node', runArgs, true); // now inherit to stream logs
  process.exit(runMig.code);
})().catch((e) => {
  console.error('❌ migrate-and-run failed:', e);
  process.exit(1);
});
