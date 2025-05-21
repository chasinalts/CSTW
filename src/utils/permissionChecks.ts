import { tursoClient } from '../tursoConfig';

/**
 * Checks if the current user has a specific permission
 * @param permission The permission to check for
 * @returns A promise that resolves to a boolean indicating if the user has the permission
 */
export const hasPermission = async (permission: string): Promise<boolean> => {
  try {
    // Get the current user from localStorage
    const userJson = localStorage.getItem('auth_user');
    if (!userJson) {
      return false;
    }

    const user = JSON.parse(userJson);
    if (!user || !user.id) {
      return false;
    }

    // Get the user's profile from Turso
    const result = await tursoClient.execute({
      sql: 'SELECT permissions, is_owner FROM user_profiles WHERE id = ?',
      args: [user.id]
    });

    if (result.rows.length === 0) {
      console.error('Error checking permission: User profile not found');
      return false;
    }

    const data = result.rows[0];

    // If the user is an owner, they have all permissions
    if (data.is_owner === 1 || data.is_owner === true) {
      return true;
    }

    // Check if the user has the specific permission
    const permissions = typeof data.permissions === 'string'
      ? JSON.parse(data.permissions)
      : data.permissions;

    return permissions && permissions[permission] === true;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

/**
 * Checks if the current user is an owner
 * @returns A promise that resolves to a boolean indicating if the user is an owner
 */
export const isOwner = async (): Promise<boolean> => {
  try {
    console.log('isOwner: Checking if current user is an owner');

    // Get the current user from localStorage
    const userJson = localStorage.getItem('auth_user');
    if (!userJson) {
      console.log('isOwner: No authenticated user found in localStorage');
      return false;
    }

    const user = JSON.parse(userJson);
    if (!user || !user.id) {
      console.log('isOwner: Invalid user data in localStorage');
      return false;
    }

    console.log('isOwner: User ID:', user.id);

    // Check if owner status is in localStorage user data
    if (user.is_owner === true || user.is_owner === 'true') {
      console.log('isOwner: User is owner based on localStorage data');
      return true;
    }

    // Get the user's profile from Turso
    console.log('isOwner: Fetching user profile from database');
    const result = await tursoClient.execute({
      sql: 'SELECT is_owner FROM user_profiles WHERE id = ?',
      args: [user.id]
    });

    if (result.rows.length === 0) {
      console.log('isOwner: No user profile found in database');

      // If we have Auth0 metadata indicating owner status, create a profile
      if (user.is_owner === true || user.is_owner === 'true') {
        console.log('isOwner: User should be owner based on metadata, but profile is missing');

        // Try to create a user profile
        try {
          await tursoClient.execute({
            sql: `
              INSERT INTO user_profiles (
                id, email, username, is_owner, created_at, permissions
              ) VALUES (?, ?, ?, ?, ?, ?)
            `,
            args: [
              user.id,
              user.email || '',
              user.username || null,
              1, // is_owner = true
              new Date().toISOString(),
              JSON.stringify({
                content_management: true,
                user_management: true,
                system_configuration: true,
                media_uploads: true,
                security_settings: true,
                site_customization: true
              })
            ]
          });

          console.log('isOwner: Created user profile for owner');
          return true;
        } catch (insertError) {
          console.error('isOwner: Error creating user profile:', insertError);
          // Still return true since metadata indicates owner
          return true;
        }
      }

      // Provide guidance on how to set up owner status
      console.log(`
        ⚠️ OWNER SETUP REQUIRED ⚠️

        To set up your account as an owner:

        1. Go to the Auth0 dashboard
        2. Navigate to User Management > Users
        3. Find your user (${user.email})
        4. Click on the user to edit
        5. In the app_metadata section, add:
           {
             "is_owner": true
           }
        6. Save the changes

        This will give you owner privileges in the application.
      `);

      return false;
    }

    const data = result.rows[0];
    console.log('isOwner: User profile data:', data);

    // Check if is_owner is 1 (SQLite integer for true) or true
    const isOwnerValue = data.is_owner === 1 || data.is_owner === true;
    console.log('isOwner: Is owner value:', isOwnerValue);

    return isOwnerValue;
  } catch (error) {
    console.error('isOwner: Error checking owner status:', error);
    if (error instanceof Error) {
      console.error('isOwner: Error details:', error.message, error.stack);
    }
    return false;
  }
};

/**
 * Checks if the current user is an admin
 * @returns A promise that resolves to a boolean indicating if the user is an admin
 */
export const isAdmin = async (): Promise<boolean> => {
  try {
    console.log('isAdmin: Checking if current user is an admin');

    // Get the current user from localStorage
    const userJson = localStorage.getItem('auth_user');
    if (!userJson) {
      console.log('isAdmin: No authenticated user found in localStorage');
      return false;
    }

    const user = JSON.parse(userJson);
    if (!user || !user.id) {
      console.log('isAdmin: Invalid user data in localStorage');
      return false;
    }

    console.log('isAdmin: User ID:', user.id);

    // First check if user is an owner (owners have admin privileges)
    const ownerStatus = await isOwner();
    if (ownerStatus) {
      console.log('isAdmin: User is an owner, so they have admin privileges');
      return true;
    }

    // Check if role is admin in localStorage user data
    if (user.role === 'admin') {
      console.log('isAdmin: User is admin based on localStorage data');
      return true;
    }

    // Get the user's profile from Turso
    console.log('isAdmin: Fetching user profile from database');
    const result = await tursoClient.execute({
      sql: 'SELECT permissions FROM user_profiles WHERE id = ?',
      args: [user.id]
    });

    if (result.rows.length === 0) {
      console.log('isAdmin: No user profile found in database');
      return false;
    }

    const data = result.rows[0];
    if (!data.permissions) {
      console.log('isAdmin: No permissions data found');
      return false;
    }

    // Parse permissions if it's a string
    const permissions = typeof data.permissions === 'string'
      ? JSON.parse(data.permissions)
      : data.permissions;

    // Check if user has user_management permission (which defines an admin)
    const isAdminValue = permissions.user_management === true;
    console.log('isAdmin: Is admin value:', isAdminValue);

    return isAdminValue;
  } catch (error) {
    console.error('isAdmin: Error checking admin status:', error);
    if (error instanceof Error) {
      console.error('isAdmin: Error details:', error.message, error.stack);
    }
    return false;
  }
};

/**
 * Checks if the current user has the media_uploads permission
 * @returns A promise that resolves to a boolean indicating if the user can upload media
 */
export const canUploadMedia = async (): Promise<boolean> => {
  // Owners and admins can upload media
  const adminStatus = await isAdmin();
  const ownerStatus = await isOwner();
  return ownerStatus || adminStatus;
};
