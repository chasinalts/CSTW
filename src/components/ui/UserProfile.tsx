// User profile component that displays user information
import { useAuth0Context } from '../../contexts/Auth0Context';
import HolographicText from './HolographicText';

interface UserProfileProps {
  className?: string;
  showDetails?: boolean;
}

const UserProfile = ({ className = '', showDetails = false }: UserProfileProps) => {
  const { currentUser, isLoading, isAuthenticated } = useAuth0Context();

  if (isLoading) {
    return (
      <div className={`p-4 rounded-lg bg-gray-800 bg-opacity-50 ${className}`}>
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          {showDetails && (
            <>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className={`p-4 rounded-lg bg-gray-800 bg-opacity-50 ${className}`}>
        <HolographicText
          text="Not signed in"
          as="p"
          className="text-sm text-gray-400"
        />
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg bg-gray-800 bg-opacity-50 ${className}`}>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-medium">
                {currentUser.email.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <HolographicText
              text={currentUser.email}
              as="p"
              className="text-sm font-medium"
            />
            <div className="flex space-x-2 mt-1">
              {currentUser.is_owner && (
                <span className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded-full text-xs">
                  Owner
                </span>
              )}
              {currentUser.role === 'admin' && (
                <span className="bg-purple-900 text-purple-200 px-2 py-0.5 rounded-full text-xs">
                  Admin
                </span>
              )}
              {!currentUser.is_owner && currentUser.role !== 'admin' && (
                <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs">
                  User
                </span>
              )}
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="text-sm text-gray-300">{currentUser.role}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">ID</p>
                <p className="text-sm text-gray-300 truncate">{currentUser.id}</p>
              </div>
              {currentUser.created_at && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Joined</p>
                  <p className="text-sm text-gray-300">
                    {new Date(currentUser.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              {currentUser.permissions && (
                <div className="col-span-2 mt-2">
                  <p className="text-xs text-gray-500 mb-1">Permissions</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(currentUser.permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <p className="text-xs text-gray-400">
                          {key.replace(/_/g, ' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
