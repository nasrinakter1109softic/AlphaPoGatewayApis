// scripts/migrate-and-run.ts
import { spawn } from 'child_process';

const args = process.argv.slice(2);
const nameArg = args[0];

if (!nameArg) {
  console.error('❌ Please provide a migration name.');
  process.exit(1);
}

const genCommand = `ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli migration:generate src/migrations/${nameArg} --dataSource src/config/ormconfig.ts`;
const runCommand = `ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli migration:run --dataSource src/config/ormconfig.ts`;

const gen = spawn(genCommand, { shell: true, stdio: 'inherit' });

gen.on('exit', (code) => {
  if (code !== 0) process.exit(code);

  const run = spawn(runCommand, { shell: true, stdio: 'inherit' });
  run.on('exit', (code) => process.exit(code ?? 0));
});
