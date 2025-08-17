import { DataSource } from 'typeorm';
import { Roles } from '../../src/role/entity/role.entity';
import { Permission } from '../../src/permission/entity/permission.entity';
import { Menu } from '../../src/menu/entity/menu.entity';

// ---------- helpers: diff-based sync for many-to-many ----------
async function syncRolePermissions(
  ds: DataSource,
  roleId: number,
  desiredIds: number[],
) {
  const role = await ds.getRepository(Roles).findOne({
    where: { roleId },
    relations: ['permissions'],
  });
  if (!role) return;

  const existingIds = new Set(
    (role.permissions ?? []).map((p) => p.permissionId),
  );
  const desired = new Set(desiredIds);

  const toAdd = [...desired].filter((id) => !existingIds.has(id));
  const toRemove = [...existingIds].filter((id) => !desired.has(id));

  if (toAdd.length) {
    await ds
      .createQueryBuilder()
      .relation(Roles, 'permissions')
      .of(roleId)
      .add(toAdd);
  }
  if (toRemove.length) {
    await ds
      .createQueryBuilder()
      .relation(Roles, 'permissions')
      .of(roleId)
      .remove(toRemove);
  }
}

async function syncRoleMenus(
  ds: DataSource,
  roleId: number,
  desiredIds: number[],
) {
  const role = await ds.getRepository(Roles).findOne({
    where: { roleId },
    relations: ['menus'],
  });
  if (!role) return;

  const existingIds = new Set((role.menus ?? []).map((m) => m.id));
  const desired = new Set(desiredIds);

  const toAdd = [...desired].filter((id) => !existingIds.has(id));
  const toRemove = [...existingIds].filter((id) => !desired.has(id));

  if (toAdd.length) {
    await ds
      .createQueryBuilder()
      .relation(Roles, 'menus')
      .of(roleId)
      .add(toAdd);
  }
  if (toRemove.length) {
    await ds
      .createQueryBuilder()
      .relation(Roles, 'menus')
      .of(roleId)
      .remove(toRemove);
  }
}
// ---------------------------------------------------------------

function menuKey(menu: Menu) {
  const raw = `${menu.title} ${menu.path}`.toLowerCase();
  if (/\bdeposit/.test(raw)) return 'deposit';
  if (/\bwithdraw/.test(raw)) return 'withdraw';
  if (/\buser/.test(raw)) return 'user';
  if (/\brole/.test(raw)) return 'role';
  if (/\bpermission/.test(raw)) return 'permission';
  if (/\bmenu\b/.test(raw) || /\bnavigation/.test(raw)) return 'menu';
  if (/\bmerchant|company|client/.test(raw)) return 'merchant';
  if (/\btransaction|txn/.test(raw)) return 'txn';
  if (/\bwallet|balance/.test(raw)) return 'wallet';
  if (/\bprovider|gateway|integration/.test(raw)) return 'provider';
  if (/\breport|analytics/.test(raw)) return 'report';
  if (/\bsetting|config/.test(raw)) return 'setting';
  if (/\bnotification|message/.test(raw)) return 'notification';
  if (/\baudit|log/.test(raw)) return 'audit';
  if (/\bwebhook/.test(raw)) return 'webhook';
  if (/\bcommission|rm\b/.test(raw)) return 'commission';
  if (/\bdashboard|home\b/.test(raw)) return 'dashboard';
  return '';
}

export async function mapPermissionsToRolesAndMenus(ds: DataSource) {
  const roleRepo = ds.getRepository(Roles);
  const permRepo = ds.getRepository(Permission);
  const menuRepo = ds.getRepository(Menu);

  const [roles, perms, menus] = await Promise.all([
    roleRepo.find(),
    permRepo.find(),
    menuRepo.find(),
  ]);

  const allPermIds = perms.map((p) => p.permissionId);
  const allMenuIds = menus.map((m) => m.id);

  const superAdmin = roles.find((r) => r.roleName === 'SUPER_ADMIN');
  const merchant = roles.find((r) => r.roleName === 'MERCHANT');

  if (superAdmin) {
    await syncRolePermissions(ds, superAdmin.roleId, allPermIds);
    await syncRoleMenus(ds, superAdmin.roleId, allMenuIds);
    console.log('🔗 SUPER_ADMIN mapped to ALL permissions & menus');
  }

  if (merchant) {
    const allow = new Set<string>([
      'auth_login',
      'auth_logout',
      'auth_refresh',
      'company_list',
      'company_create',
      'company_update',
      'company_view',
      'deposit_list',
      'deposit_create_address',
      'deposit_address_view',
      'file_upload',
      'currency_list',
      'currency_view',
      'company_balance_list'
    ]);
    const permIds = perms
      .filter((p) => allow.has(p.slug))
      .map((p) => p.permissionId);
    const menuIds = menus
      .filter((m) =>
        [
          'dashboard',
          'company',
          'deposit',
          'callback',
          'upload',
          'alphapo',
          'currency',
          'app',
        ].includes(menuKey(m)),
      )
      .map((m) => m.id);

    await syncRolePermissions(ds, merchant.roleId, permIds);
    await syncRoleMenus(ds, merchant.roleId, menuIds);
    console.log(
      `🔗 MERCHANT mapped to ${permIds.length} permissions & ${menuIds.length} menus`,
    );
  }
}
