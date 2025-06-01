import { create } from 'zustand';
import {
  UserProfile,
  ProfileFormValues,
  PasswordFormValues,
  EmailFormValues,
  ShowPasswordsState,
  Message,
} from '@/types/profileEdit'; 

interface ProfileEditState {
  user: UserProfile | null;
  initialLoading: boolean;
  message: Message | null;
  activeTab: string;

  // Personal Info
  profileForm: ProfileFormValues;
  savingProfile: boolean;
  setProfileForm: (data: Partial<ProfileFormValues>) => void;
  submitProfileForm: () => Promise<void>;

  // Password
  passwordForm: PasswordFormValues;
  showPasswords: ShowPasswordsState;
  savingPassword: boolean;
  setPasswordForm: (data: Partial<PasswordFormValues>) => void;
  toggleShowPassword: (field: keyof ShowPasswordsState) => void;
  submitPasswordForm: () => Promise<void>;

  // Email
  emailForm: EmailFormValues;
  savingEmail: boolean;
  resendingVerification: boolean;
  setEmailForm: (data: Partial<EmailFormValues>) => void;
  submitEmailForm: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;

  // Profile Image
  profileImageFile: File | null;
  profileImagePreview: string | null;
  uploadingImage: boolean;
  setProfileImageFile: (file: File | null) => void;
  clearProfileImagePreview: () => void;
  uploadProfileImage: () => Promise<void>;
  removeProfileImage: () => Promise<void>;

  // General
  fetchUserData: (userId: string) => Promise<void>;
  setMessage: (message: Message | null) => void;
  setActiveTab: (tab: string) => void;
}

const initialProfileForm: ProfileFormValues = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: '',
  lastEducation: '',
  currentAddress: '',
  country: 'Indonesia',
};

const initialPasswordForm: PasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const initialEmailForm: EmailFormValues = {
  newEmail: '',
};

export const useProfileEditStore = create<ProfileEditState>((set, get) => ({
  user: null,
  initialLoading: true,
  message: null,
  activeTab: 'personal',

  profileForm: initialProfileForm,
  savingProfile: false,
  setProfileForm: (data) => set((state) => ({ profileForm: { ...state.profileForm, ...data } })),
  submitProfileForm: async () => {
    set({ savingProfile: true, message: null });
    const { user, profileForm, fetchUserData } = get();
    if (!user) {
      set({ savingProfile: false, message: { type: 'error', text: 'User not found' } });
      return;
    }
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }
      set({ message: { type: 'success', text: 'Profile updated successfully!' } });
      await fetchUserData(user.id);
    } catch (error) {
      set({ message: { type: 'error', text: error instanceof Error ? error.message : 'Failed to update profile' } });
    } finally {
      set({ savingProfile: false });
    }
  },

  passwordForm: initialPasswordForm,
  showPasswords: { current: false, new: false, confirm: false },
  savingPassword: false,
  setPasswordForm: (data) => set((state) => ({ passwordForm: { ...state.passwordForm, ...data } })),
  toggleShowPassword: (field) =>
    set((state) => ({
      showPasswords: { ...state.showPasswords, [field]: !state.showPasswords[field] },
    })),
  submitPasswordForm: async () => {
    set({ savingPassword: true, message: null });
    const { user, passwordForm } = get();
    if (!user) {
      set({ savingPassword: false, message: { type: 'error', text: 'User not found' } });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      set({ savingPassword: false, message: { type: 'error', text: 'New passwords do not match' } });
      return;
    }
    try {
      const response = await fetch(`/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update password');
      }
      set({ message: { type: 'success', text: 'Password updated successfully!' } });
      set({ passwordForm: initialPasswordForm }); // Reset form
    } catch (error) {
      set({ message: { type: 'error', text: error instanceof Error ? error.message : 'Failed to update password' } });
    } finally {
      set({ savingPassword: false });
    }
  },

  emailForm: initialEmailForm,
  savingEmail: false,
  resendingVerification: false,
  setEmailForm: (data) => set((state) => ({ emailForm: { ...state.emailForm, ...data } })),
  submitEmailForm: async () => {
    set({ savingEmail: true, message: null });
    const { user, emailForm, fetchUserData } = get();
    if (!user) {
      set({ savingEmail: false, message: { type: 'error', text: 'User not found' } });
      return;
    }
    try {
      const response = await fetch('/api/auth/verify-email', { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: emailForm.newEmail, userId: user.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update email');
      set({ message: { type: 'success', text: result.message } });
      await fetchUserData(user.id); 
    } catch (error) {
      set({ message: { type: 'error', text: error instanceof Error ? error.message : 'Failed to update email' } });
    } finally {
      set({ savingEmail: false });
    }
  },
  resendVerificationEmail: async () => {
    set({ resendingVerification: true, message: null });
    const { user } = get();
    if (!user) {
        set({ resendingVerification: false, message: { type: 'error', text: 'User not found' } });
        return;
    }
    try {
      const response = await fetch('/api/auth/verify-email', { // Endpoint to resend verification for current email
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }), 
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to resend verification email');
      set({ message: { type: 'success', text: result.message } });
    } catch (error) {
      set({ message: { type: 'error', text: error instanceof Error ? error.message : 'Failed to resend verification email' } });
    } finally {
      set({ resendingVerification: false });
    }
  },

  profileImageFile: null,
  profileImagePreview: null,
  uploadingImage: false,
  setProfileImageFile: (file) => {
    if (!file) {
      set({ profileImageFile: null, profileImagePreview: null, message: null });
      return;
    }
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      set({ message: { type: 'error', text: 'Invalid file type. Only JPG, JPEG, PNG are allowed.' } });
      return;
    }
    // Validate file size (1MB)
    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      set({ message: { type: 'error', text: 'File is too large. Maximum size is 1MB.' } });
      return;
    }
    set({ profileImageFile: file, message: null });
    const reader = new FileReader();
    reader.onload = (e) => {
      set({ profileImagePreview: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  },
  clearProfileImagePreview: () => set({ profileImageFile: null, profileImagePreview: null }),
  uploadProfileImage: async () => {
    set({ uploadingImage: true, message: null });
    const { user, profileImageFile, fetchUserData, clearProfileImagePreview } = get();
    if (!user || !profileImageFile) {
      set({ uploadingImage: false, message: { type: 'error', text: 'User or image file not found' } });
      return;
    }
    try {
      const formData = new FormData();
      formData.append('profileImage', profileImageFile);
      const response = await fetch(`/api/users/${user.id}/profile-image`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to upload image');
      set({ message: { type: 'success', text: result.message } });
      clearProfileImagePreview();
      await fetchUserData(user.id);
    } catch (error) {
      set({ message: { type: 'error', text: error instanceof Error ? error.message : 'Failed to upload image' } });
    } finally {
      set({ uploadingImage: false });
    }
  },
  removeProfileImage: async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) return;
    set({ uploadingImage: true, message: null }); // Use uploadingImage state for this action too
    const { user, fetchUserData } = get();
    if (!user) {
      set({ uploadingImage: false, message: { type: 'error', text: 'User not found' } });
      return;
    }
    try {
      const response = await fetch(`/api/users/${user.id}/profile-image`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove photo');
      set({ message: { type: 'success', text: 'Profile photo removed successfully!' } });
      await fetchUserData(user.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      set({ message: { type: 'error', text: 'Failed to remove profile photo' } });
    } finally {
      set({ uploadingImage: false });
    }
  },

  fetchUserData: async (userId: string) => {
    set({ initialLoading: true });
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      const userData: UserProfile = await response.json();
      set({
        user: userData,
        profileForm: {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phoneNumber: userData.phoneNumber || '',
          dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
          gender: userData.gender || '',
          lastEducation: userData.lastEducation || '',
          currentAddress: userData.currentAddress || '',
          country: userData.country || 'Indonesia',
        },
        emailForm: {
          newEmail: userData.email || '',
        },
        message: null,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      set({ message: { type: 'error', text: 'Failed to load profile data' }, user: null });
    } finally {
      set({ initialLoading: false });
    }
  },
  setMessage: (message) => set({ message }),
  setActiveTab: (tab) => set({ activeTab: tab, message: null }), // Clear message on tab change
}));