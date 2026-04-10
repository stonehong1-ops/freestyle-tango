import { User } from '@/lib/db';

export type UserRole = 'admin' | 'staff' | 'instructor' | 'none';

/**
 * Checks if a user has a specific role.
 * Supports staffRole as a string (comma-separated) or an array of strings.
 */
export const hasRole = (user: any, targetRole: UserRole): boolean => {
  if (!user) return targetRole === 'none';
  
  // Also check isAdminLogged context if possible, but usually user object is preferred
  const roleValue = user.staffRole || user.staffrole;
  
  if (!roleValue) {
    if (targetRole === 'instructor' && user.isInstructor) return true;
    return targetRole === 'none';
  }

  const normalizedTarget = targetRole.toLowerCase();

  if (Array.isArray(roleValue)) {
    return roleValue.some(r => typeof r === 'string' && r.toLowerCase() === normalizedTarget);
  }

  if (typeof roleValue === 'string') {
    return roleValue
      .split(',')
      .map(r => r.trim().toLowerCase())
      .includes(normalizedTarget);
  }

  return false;
};

export const getEffectiveRole = (user: User | null, isAdminLogged: boolean): UserRole => {
  if (isAdminLogged || hasRole(user, 'admin')) return 'admin';
  if (hasRole(user, 'staff')) return 'staff';
  if (hasRole(user, 'instructor')) return 'instructor';
  return 'none';
};

export const hasPermission = (role: UserRole, action: string): boolean => {
  if (role === 'admin') return true;
  
  switch (action) {
    case 'view_admin_tab':
      return role === 'staff' || role === 'instructor';
    case 'manage_members':
    case 'manage_classes':
    case 'manage_milongas':
    case 'manage_stay':
      return role === 'staff';
    case 'view_student_list':
    case 'upload_media':
      return role === 'staff' || role === 'instructor';
    case 'manage_coupons':
      return false; // Only admin for now
    default:
      return false;
  }
};
