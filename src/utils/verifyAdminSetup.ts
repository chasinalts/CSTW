import { initializeAdminAccount } from './security';

interface AdminUser {
  username: string;
  is_owner: boolean;
  permissions: {
    content_management: boolean;
    user_management: boolean;
    system_configuration: boolean;
    media_uploads: boolean;
    security_settings: boolean;
    site_customization: boolean;
  };
}

export const verifyAdminSetup = (): boolean => {
  // First ensure admin account exists
  initializeAdminAccount();

  // Verify admin account configuration
  const adminData = localStorage.getItem('user_ChasinAlts');
  if (!adminData) {
    console.error('Admin account initialization failed');
    return false;
  }

  try {
    const admin = JSON.parse(adminData) as AdminUser;

    // Verify username
    if (admin.username !== 'ChasinAlts') {
      console.error('Admin username mismatch');
      return false;
    }

    // Verify owner status
    if (!admin.is_owner) {
      console.error('Admin is not set as owner');
      return false;
    }

    // Verify all required permissions
    const requiredPermissions = [
      'content_management',
      'user_management',
      'system_configuration',
      'media_uploads',
      'security_settings',
      'site_customization'
    ];

    const hasAllPermissions = requiredPermissions.every(
      permission => admin.permissions[permission as keyof typeof admin.permissions]
    );

    if (!hasAllPermissions) {
      console.error('Admin missing required permissions');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying admin setup:', error);
    return false;
  }
};

// Function to log admin account status - useful for debugging
interface AdminAccountStatus {
  exists: boolean;
  [key: string]: unknown;
}

export const getAdminAccountStatus = (): AdminAccountStatus => {
  const adminData = localStorage.getItem('user_ChasinAlts');
  if (!adminData) {
    return { exists: false };
  }

  try {
    const admin = JSON.parse(adminData);
    const { /* password, */ ...safeAdminData } = admin;
    return {
      exists: true,
      ...safeAdminData
    };
  } catch (error) {
    return {
      exists: true,
      error: 'Failed to parse admin data'
    };
  }
};