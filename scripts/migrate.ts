import { spawn } from 'child_process';

const args = process.argv.slice(2);
const nameArg = args[0];

if (!nameArg) {
  console.error('❌ Please provide a migration name.');
  process.exit(1);
}

const command = `ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli migration:generate src/migrations/${nameArg} --dataSource src/config/ormconfig.ts`;

const child = spawn(command, {
  shell: true,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
