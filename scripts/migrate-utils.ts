// scripts/migrate-utils.ts
import { spawn } from 'child_process';

const actions = {
  revert: 'migration:revert',
  dryrun: 'migration:generate --dr --',
  check: 'migration:generate --ch --',
};

const [action, nameOrArg] = process.argv.slice(2);

if (!action || !actions[action]) {
  console.error(
    '❌ Usage: npm run migrate-util [revert|dryrun|check] [MigrationName?]',
  );
  process.exit(1);
}

const cliCommand =
  action === 'revert'
    ? `ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli ${actions[action]} --dataSource src/config/ormconfig.ts`
    : `ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli ${actions[action]} src/migrations/${nameOrArg} --dataSource src/config/ormconfig.ts`;

const child = spawn(cliCommand, { shell: true, stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
