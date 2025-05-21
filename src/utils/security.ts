interface LoginAttempts {
  count: number;
  lastAttempt: number;
}

interface Session {
  username: string;
  is_owner: boolean;
  last_activity: number;
  created_at: number;
}

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5;

// Login attempts tracking
const getLoginAttempts = (username: string): LoginAttempts => {
  const attempts = localStorage.getItem(`login_attempts_${username}`);
  if (attempts) {
    const parsed = JSON.parse(attempts);
    // Clear attempts if lockout period has passed
    if (Date.now() - parsed.lastAttempt >= LOCKOUT_DURATION) {
      localStorage.removeItem(`login_attempts_${username}`);
      return { count: 0, lastAttempt: Date.now() };
    }
    return parsed;
  }
  return { count: 0, lastAttempt: Date.now() };
};

const incrementLoginAttempts = (username: string): void => {
  const attempts = getLoginAttempts(username);
  const newAttempts = {
    count: attempts.count + 1,
    lastAttempt: Date.now(),
  };
  localStorage.setItem(`login_attempts_${username}`, JSON.stringify(newAttempts));
};

const resetLoginAttempts = (username: string): void => {
  localStorage.removeItem(`login_attempts_${username}`);
};

// Session management
const createSession = (username: string, isOwner: boolean): string => {
  const sessionId = Math.random().toString(36).substring(2);
  const session: Session = {
    username,
    is_owner: isOwner,
    last_activity: Date.now(),
    created_at: Date.now(),
  };
  localStorage.setItem(`session_${sessionId}`, JSON.stringify(session));
  return sessionId;
};

const updateSessionActivity = (sessionId: string): void => {
  const session = getSession(sessionId);
  if (session) {
    session.last_activity = Date.now();
    localStorage.setItem(`session_${sessionId}`, JSON.stringify(session));
  }
};

const getSession = (sessionId: string): Session | null => {
  const sessionData = localStorage.getItem(`session_${sessionId}`);
  if (!sessionData) return null;

  const session: Session = JSON.parse(sessionData);

  // Check session timeout
  if (Date.now() - session.last_activity > SESSION_TIMEOUT) {
    localStorage.removeItem(`session_${sessionId}`);
    return null;
  }

  return session;
};

const clearSession = (sessionId: string): void => {
  localStorage.removeItem(`session_${sessionId}`);
};

// Admin account initialization - removed hardcoded credentials
const initializeAdminAccount = (): void => {
  // Admin accounts should now be created through Firebase Authentication
  // and managed through the Firebase Console
  console.log('Admin account initialization is now handled through Firebase Authentication');
};

// Security utilities
const isAccountLocked = (username: string): boolean => {
  const attempts = getLoginAttempts(username);
  return attempts.count >= MAX_LOGIN_ATTEMPTS &&
         Date.now() - attempts.lastAttempt < LOCKOUT_DURATION;
};

const validateSessionAccess = (sessionId: string, requiredPermission?: string): boolean => {
  const session = getSession(sessionId);
  if (!session) return false;

  // If no specific permission is required, just check if session is valid
  if (!requiredPermission) return true;

  // Get user data to check permissions
  const userData = localStorage.getItem(`user_${session.username}`);
  if (!userData) return false;

  const user = JSON.parse(userData);
  return user.is_owner && user.permissions[requiredPermission];
};

export {
  getLoginAttempts,
  incrementLoginAttempts,
  resetLoginAttempts,
  createSession,
  updateSessionActivity,
  getSession,
  clearSession,
  initializeAdminAccount,
  isAccountLocked,
  validateSessionAccess,
};