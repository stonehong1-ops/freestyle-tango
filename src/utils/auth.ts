import { User } from '@/lib/db';

export type UserRole = 'admin' | 'staff' | 'instructor' | 'none';

export const getEffectiveRole = (user: User | null, isAdminLogged: boolean): UserRole => {
  if (isAdminLogged) return 'admin';
  if (!user) return 'none';
  if (user.staffRole) return user.staffRole;
  if (user.isInstructor) return 'instructor';
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
