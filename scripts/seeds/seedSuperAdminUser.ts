import { DataSource } from 'typeorm';
import { Roles } from '../../src/role/entity/role.entity';
import { User } from '../../src/user/entity/user.entity';
import { UserType } from '../../src/common/enums/user-type.enum';
import { HashUtil } from '../../src/common/utils/hash.util';
import { UserStatus } from '@/common/enums/user-status';

type AdminInfo = {
  name?: string;
  email: string;
  phone?: string | null;
  password: string;
};

function readEnv(): AdminInfo {
  const email = process.env.SA_EMAIL || 'admin@alphapro.local';
  const password = process.env.SA_PASSWORD || 'Admin@123456';
  return { email, password };
}

export async function seedSuperAdminUser(ds: DataSource) {
  const roleRepo = ds.getRepository(Roles);
  const userRepo = ds.getRepository(User);

  let superAdminRole = await roleRepo.findOne({
    where: { roleName: 'SUPER_ADMIN' },
  });
  if (!superAdminRole) {
    superAdminRole = roleRepo.create({
      roleName: 'SUPER_ADMIN',
      isPredefined: true,
    });
    await roleRepo.save(superAdminRole);
    console.log('🧱 Created role SUPER_ADMIN');
  }

  const { email, password } = readEnv();
  const resetPassword =
    (process.env.SA_RESET_PASSWORD || 'false').toLowerCase() === 'true';

  let user = await userRepo.findOne({ where: { email }, relations: ['role'] });

  const hashed = await HashUtil.hashPassword(password);

  if (!user) {
    user = userRepo.create({
      email,
      password: hashed,
      userType: UserType.SUPER_ADMIN,
      userStatus: UserStatus.ACTIVE,
      isActive: true,
      role: superAdminRole,
    });
    await userRepo.save(user);
    console.log(`👑 Super admin user created: ${email}`);
  } else {
    let needsSave = false;

    if (!user.role || user.role.roleId !== superAdminRole.roleId) {
      user.role = superAdminRole;
      needsSave = true;
    }
    if (resetPassword) {
      user.password = hashed;
      needsSave = true;
    }
    if (user.userStatus !== UserStatus.ACTIVE || user.isActive !== true) {
      user.userStatus = UserStatus.ACTIVE;
      user.isActive = true;
      needsSave = true;
    }

    if (needsSave) {
      await userRepo.save(user);
      console.log(`👑 Super admin user ensured/updated: ${email}`);
    } else {
      console.log(`👑 Super admin user already up-to-date: ${email}`);
    }
  }
}
