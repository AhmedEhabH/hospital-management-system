// Re-export all auth DTOs for backward compatibility
export * from './dtos/auth';

// Additional user-related interfaces
export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  userId: string;
  fullName: string;
  displayName: string;
  avatar?: string;
  lastLogin?: Date;
  isActive: boolean;
}
