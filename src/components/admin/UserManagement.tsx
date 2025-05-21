import { useState, useEffect } from '../../utils/react-imports';
import { account, databases, DATABASE_ID, USER_PROFILES_COLLECTION_ID } from '../../appwriteConfig.ts';
import { ID, Query } from 'appwrite';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import { TextField, SelectField } from '../../components/ui/FormField';
import HolographicText from '../../components/ui/HolographicText';
import { motion, AnimatePresence } from 'framer-motion';

// Define user role type
export type UserRole = 'user' | 'admin' | 'owner';

// Define user interface
interface User {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  is_owner: boolean;
  created_at: string;
  last_sign_in_at?: string;
}

const UserManagement = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        // Only owners can see all users
        if (!currentUser?.is_owner) {
          showToast('error', 'Only owners can manage users');
          setLoading(false);
          return;
        }

        // Fetch all user profiles
        try {
          const response = await databases.listDocuments(
            DATABASE_ID,
            USER_PROFILES_COLLECTION_ID,
            [
              Query.orderDesc('created_at')
            ]
          );

          // Transform data to match our User interface
          const transformedUsers: User[] = response.documents.map((user: any) => ({
            id: user.$id,
            email: user.email,
            username: user.username || '',
            role: user.is_owner ? 'owner' : (user.permissions?.user_management ? 'admin' : 'user'),
            is_owner: user.is_owner,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at
          }));

          setUsers(transformedUsers);
        } catch (error) {
          console.error('Error fetching users:', error);
          showToast('error', 'Failed to fetch users');
          return;
        }
      } catch (error) {
        console.error('Error in fetchUsers:', error);
        showToast('error', 'An error occurred while fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, showToast]);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      // Prevent changing owner role
      const user = users.find(u => u.id === userId);
      if (user?.is_owner) {
        showToast('error', 'Cannot change the role of an owner');
        return;
      }

      // Update permissions based on role
      const isAdmin = newRole === 'admin';
      const permissions = {
        content_management: isAdmin,
        user_management: isAdmin,
        system_configuration: isAdmin,
        media_uploads: isAdmin,
        security_settings: isAdmin,
        site_customization: isAdmin
      };

      // Update the user profile in the database
      try {
        await databases.updateDocument(
          DATABASE_ID,
          USER_PROFILES_COLLECTION_ID,
          userId,
          { permissions }
        );
      } catch (error) {
        console.error('Error updating user role:', error);
        showToast('error', 'Failed to update user role');
        return;
      }

      // Update local state
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, role: newRole, permissions }
          : user
      ));

      showToast('success', `User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error in handleRoleChange:', error);
      showToast('error', 'An error occurred while updating user role');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    try {
      // Prevent deleting owner
      const user = users.find(u => u.id === userId);
      if (user?.is_owner) {
        showToast('error', 'Cannot delete an owner account');
        return;
      }

      // Confirm deletion
      if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
      }

      // Delete the user profile
      try {
        await databases.deleteDocument(
          DATABASE_ID,
          USER_PROFILES_COLLECTION_ID,
          userId
        );
      } catch (error) {
        console.error('Error deleting user profile:', error);
        showToast('error', 'Failed to delete user profile');
        return;
      }

      // Delete the user from auth (requires admin privileges)
      // Note: This would typically be done through a server function
      // For now, we'll just remove from our local state

      // Update local state
      setUsers(users.filter(user => user.id !== userId));

      showToast('success', 'User deleted successfully');
    } catch (error) {
      console.error('Error in handleDeleteUser:', error);
      showToast('error', 'An error occurred while deleting user');
    }
  };

  // Handle adding a new user
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      // Validate inputs
      if (!newUserEmail || !newUserPassword) {
        showToast('error', 'Email and password are required');
        return;
      }

      // Create user with Appwrite Auth
      let userId;
      try {
        const user = await account.create(
          ID.unique(),
          newUserEmail,
          newUserPassword,
          newUserEmail
        );

        userId = user.$id;

        // Set user preferences
        await account.updatePrefs({
          is_owner: false
        });
      } catch (error) {
        console.error('Error creating user:', error);
        showToast('error', `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }

      if (!userId) {
        showToast('error', 'Failed to create user');
        return;
      }

      // Determine permissions based on role
      const isAdmin = newUserRole === 'admin';
      const permissions = {
        content_management: isAdmin,
        user_management: isAdmin,
        system_configuration: isAdmin,
        media_uploads: isAdmin,
        security_settings: isAdmin,
        site_customization: isAdmin
      };

      // Create user profile
      try {
        await databases.createDocument(
          DATABASE_ID,
          USER_PROFILES_COLLECTION_ID,
          userId,
          {
            email: newUserEmail,
            is_owner: false,
            created_at: new Date().toISOString(),
            permissions
          }
        );
      } catch (error) {
        console.error('Error creating user profile:', error);
        showToast('error', 'Failed to create user profile');
        return;
      }

      // Add new user to local state
      const newUser: User = {
        id: userId,
        email: newUserEmail,
        role: newUserRole,
        is_owner: false,
        created_at: new Date().toISOString()
      };

      setUsers([newUser, ...users]);

      // Reset form
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');
      setShowAddUserForm(false);

      showToast('success', 'User created successfully');
    } catch (error) {
      console.error('Error in handleAddUser:', error);
      showToast('error', 'An error occurred while creating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  // Get role badge class
  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-600 text-white';
      case 'admin':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="bg-gray-900/80 rounded-lg shadow-lg p-4 backdrop-blur-sm border border-cyan-800/50">
      <div className="flex justify-between items-center mb-6">
        <HolographicText text="User Management" as="h2" className="text-xl font-bold" />
        <div className="flex space-x-2">
          <TextField
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button
            onClick={() => setShowAddUserForm(!showAddUserForm)}
            variant="primary"
          >
            {showAddUserForm ? 'Cancel' : 'Add User'}
          </Button>
        </div>
      </div>

      {/* Add User Form */}
      <AnimatePresence>
        {showAddUserForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <form onSubmit={handleAddUser} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <TextField
                  label="Email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="mb-4">
                <SelectField
                  label="Role"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                >
                  <option value="user">Regular User</option>
                  <option value="admin">Admin</option>
                </SelectField>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <div className="bg-black/50 rounded border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                          <span className="text-lg text-gray-300">{user.email.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.email}</div>
                          {user.username && (
                            <div className="text-sm text-gray-400">{user.username}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === user.id ? (
                        <SelectField
                          value={user.role}
                          onChange={(e) => {
                            handleRoleChange(user.id, e.target.value as UserRole);
                            setEditingUserId(null);
                          }}
                          autoFocus
                          onBlur={() => setEditingUserId(null)}
                          disabled={user.is_owner}
                        >
                          <option value="user">Regular User</option>
                          <option value="admin">Admin</option>
                          {user.is_owner && <option value="owner">Owner</option>}
                        </SelectField>
                      ) : (
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}
                          onClick={() => !user.is_owner && setEditingUserId(user.id)}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(user.last_sign_in_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!user.is_owner && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>* Click on a user's role to change it (except for owners)</p>
        <p>* Only owners can delete users</p>
      </div>
    </div>
  );
};

export default UserManagement;
