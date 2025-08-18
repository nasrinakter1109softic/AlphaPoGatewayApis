import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const nameArg = args.find((a) => !a.startsWith('--'));
const isDryRun = args.includes('--dry');

// Ensure migrations dir exists
const migDir = path.resolve('src/migrations');
if (!existsSync(migDir)) mkdirSync(migDir, { recursive: true });

// Migration generate command (if nameArg provided)
const genArgs = [
  '-r',
  'tsconfig-paths/register',
  './node_modules/typeorm/cli',
  'migration:generate',
  `src/migrations/${nameArg}`,
  '--dataSource',
  'src/config/ormconfig.ts',
];

// Migration run command (always run pending)
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
): Promise<{ code: number }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      shell: true,
      stdio: inherit ? 'inherit' : 'pipe',
    });
    let stdout = '',
      stderr = '';
    if (!inherit) {
      child.stdout?.on('data', (d) => (stdout += d.toString()));
      child.stderr?.on('data', (d) => (stderr += d.toString()));
    }
    child.on('exit', (code) => resolve({ code: code ?? 0 }));
  });
}

(async () => {
  if (!nameArg) {
    // Run only pending migrations
    console.log('🚀 Running pending migrations...');
    const runMig = await run('ts-node', runArgs, true);
    process.exit(runMig.code);
  }

  console.log(
    `🛠️ Generating migration: ${nameArg}${isDryRun ? ' (dry run)' : ''}`,
  );
  const gen = await run('ts-node', genArgs);

  if (gen.code !== 0) process.exit(gen.code);

  if (isDryRun) {
    console.log(
      '✅ Dry run complete. Migration file generated but not executed.',
    );
    process.exit(0);
  }

  console.log('🚀 Running pending migrations...');
  const runMig = await run('ts-node', runArgs, true);
  process.exit(runMig.code);
})();
