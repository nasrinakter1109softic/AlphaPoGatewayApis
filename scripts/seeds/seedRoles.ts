import { Roles } from '../../src/role/entity/role.entity';
import { DataSource, Repository } from 'typeorm';

export async function seedRoles(ds: DataSource): Promise<Roles[]> {
  const repo: Repository<Roles> = ds.getRepository(Roles);
  const existing = await repo.find();
  if (existing.length) {
    console.log('Roles already seeded, skipping...');
    return existing;
  }
  const roles = repo.create([
    { roleName: 'SUPER_ADMIN', isPredefined: true },
    { roleName: 'MERCHANT', isPredefined: true },
  ]);
  await repo.save(roles);
  console.log('Roles seeded successfully!');
  return roles;
}
