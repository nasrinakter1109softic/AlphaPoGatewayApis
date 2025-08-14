export type Perm = { slug: string; title: string };

export const PERMISSIONS: Perm[] = [
  // ========== AuthController ==========
  { slug: 'auth_login', title: 'Auth: Login' },
  { slug: 'auth_logout', title: 'Auth: Logout' },
  { slug: 'auth_refresh', title: 'Auth: Refresh Token' },
  //   { slug: 'auth_change_password', title: 'Auth: Change Password' },
  //   { slug: 'auth_force_logout', title: 'Auth: Force Logout (Admin)' },

  // ========== CompanyController ==========
  { slug: 'company_list', title: 'Company: List' },
  { slug: 'company_view', title: 'Company: View' },
  { slug: 'company_create', title: 'Company: Create' },
  { slug: 'company_update', title: 'Company: Update' },
  { slug: 'company_delete', title: 'Company: Delete' },
  {
    slug: 'company_approve',
    title: 'Company: Approved Company Status',
  },

  // ========== OtpController ==========
  { slug: 'verify-otp', title: 'Verify OTP: Verify' },

  // ========== CurrencyController ==========
  { slug: 'currency_list', title: 'Currency: List' },
  { slug: 'currency_update', title: 'Currency: Update' },
  { slug: 'currency_view', title: 'Currency: View' },

  // ========== MenuController ==========
  { slug: 'menu_list', title: 'Menu: List' },
  { slug: 'menu_view', title: 'Menu: View' },
  { slug: 'menu_create', title: 'Menu: Create' },
  { slug: 'menu_update', title: 'Menu: Update' },
  { slug: 'menu_delete', title: 'Menu: Delete' },

  // ========== PermissionController ==========
  { slug: 'permission_list', title: 'Permission: List' },
  { slug: 'permission_view', title: 'Permission: View' },
  { slug: 'permission_create', title: 'Permission: Create' },
  { slug: 'permission_update', title: 'Permission: Update' },
  { slug: 'permission_delete', title: 'Permission: Delete' },

  // ========== RoleController ==========
  { slug: 'role_list', title: 'Role: List' },
  { slug: 'role_view', title: 'Role: View' },
  { slug: 'role_create', title: 'Role: Create' },
  { slug: 'role_update', title: 'Role: Update' },
  { slug: 'role_delete', title: 'Role: Delete' },
  { slug: 'role_assign_permissions', title: 'Role: Assign Permissions' },
  { slug: 'role_assign_menus', title: 'Role: Assign Menus' },

  // ========== DepositController ==========
  { slug: 'deposit_list', title: 'Deposit: List' },
  { slug: 'deposit_create_address', title: 'Deposit: Create Address' },
  { slug: 'deposit_address_list', title: 'Deposit Address: List' },
  { slug: 'deposit_address_view', title: 'Deposit Address: View' },
  { slug: 'deposit_address_update', title: 'Deposit Address: Update' },

  // ========== UploadController ==========
  //   { slug: 'upload_list', title: 'Upload: List' },
  { slug: 'file_upload', title: 'Upload: Create' },
  //   { slug: 'upload_delete', title: 'Upload: Delete' },

  // ========== AppController ==========
  { slug: 'app_health_check', title: 'App: Health Check' },
  { slug: 'app_send_test_email', title: 'App: Send Test Email' },
  { slug: 'app_test_sms', title: 'App: Test SMS' },

  // ========== AlphapoController ==========
  //   { slug: 'alphapo_view_balance', title: 'Alphapo: View Balance' },
  //   { slug: 'alphapo_create_address', title: 'Alphapo: Create Address' },
  //   { slug: 'alphapo_withdraw', title: 'Alphapo: Withdraw/Transfer' },
  //   { slug: 'alphapo_sync', title: 'Alphapo: Sync Transactions' },
  //   { slug: 'alphapo_callback_view', title: 'Alphapo: View Callbacks' },
];
