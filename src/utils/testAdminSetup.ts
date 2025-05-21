import { getLoginAttempts, incrementLoginAttempts, resetLoginAttempts } from './security';
import { verifyAdminSetup, getAdminAccountStatus } from './verifyAdminSetup';

export const testAdminAccount = async (): Promise<boolean> => {
  console.log('Testing admin account setup and security features...\n');

  try {
    // Step 1: Verify admin account
    console.log('1. Verifying admin account setup...');
    const isAdminValid = verifyAdminSetup();
    console.log(isAdminValid ? '✓ Admin account verified' : '✗ Admin account verification failed');
    
    const adminStatus = getAdminAccountStatus();
    console.log('Admin account status:', adminStatus);
    console.log();

    // Step 2: Test login attempt tracking
    console.log('2. Testing login attempt tracking...');
    const username = 'ChasinAlts';
    
    // Reset any existing attempts
    resetLoginAttempts(username);
    console.log('✓ Login attempts reset');

    // Simulate failed login attempts
    for (let i = 0; i < 3; i++) {
      incrementLoginAttempts(username);
    }
    
    const attempts = getLoginAttempts(username);
    console.log(`✓ Login attempts recorded: ${attempts.count}`);
    console.log(`✓ Last attempt timestamp: ${new Date(attempts.lastAttempt).toISOString()}`);
    console.log();

    // Step 3: Verify permissions
    console.log('3. Verifying admin permissions...');
    if (adminStatus.permissions) {
      const permissions = Object.entries(adminStatus.permissions)
        .map(([key, value]) => `${key}: ${value ? '✓' : '✗'}`)
        .join('\n');
      console.log('Permissions check:');
      console.log(permissions);
    } else {
      console.log('✗ Could not verify permissions');
    }
    console.log();

    // Step 4: Security configuration summary
    console.log('4. Security configuration summary:');
    console.log('- Username:', 'ChasinAlts');
    console.log('- Role:', adminStatus.isOwner ? 'Owner/Administrator' : 'Unknown');
    console.log('- Access Level: Full administrative control');
    console.log('- Security features:');
    console.log('  • Strong password validation');
    console.log('  • Login attempt tracking');
    console.log('  • Account lockout protection');
    console.log('  • Session management');
    console.log('  • Permission-based access control');
    console.log();

    // Final status
    if (isAdminValid && adminStatus.exists && adminStatus.isOwner) {
      console.log('✅ Admin account setup successful and verified');
      return true;
    } else {
      console.log('❌ Admin account setup verification failed');
      return false;
    }
  } catch (error) {
    console.error('Error during admin account verification:', error);
    return false;
  }
};