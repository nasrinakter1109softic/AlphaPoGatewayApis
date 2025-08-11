import { DataSource } from 'typeorm';
import { Permission } from '../../src/permission/entity/permission.entity';
import { PERMISSIONS } from './permissions.list';

export async function seedAllPermissions(ds: DataSource) {
  const repo = ds.getRepository(Permission);
  await repo.upsert(PERMISSIONS, {
    conflictPaths: ['slug'],
    skipUpdateIfNoValuesChanged: true,
  });
  console.log(`✅ Seeded/updated ${PERMISSIONS.length} permissions.`);
}
