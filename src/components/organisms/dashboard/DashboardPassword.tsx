'use client';

import { Lock, Eye, EyeOff } from 'lucide-react';
import { useProfileEditStore } from '@/stores/profileEditStores';

export function DashboardPassword() {
  // Individual property selection to prevent unnecessary re-renders
  const passwordForm = useProfileEditStore((state) => state.passwordForm);
  const setPasswordForm = useProfileEditStore((state) => state.setPasswordForm);
  const showPasswords = useProfileEditStore((state) => state.showPasswords);
  const toggleShowPassword = useProfileEditStore((state) => state.toggleShowPassword);
  const submitPasswordForm = useProfileEditStore((state) => state.submitPasswordForm);
  const savingPassword = useProfileEditStore((state) => state.savingPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPasswordForm();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h2>
      
      <div className="space-y-6 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ currentPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('current')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.current ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('new')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.new ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}  
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('confirm')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          type="submit"
          disabled={savingPassword}
          className="cursor-pointer transition-colors duration-300 bg-primary hover:bg-accent text-white px-6 py-2 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {savingPassword ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Updating...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Update Password
            </>
          )}
        </button>
      </div>
    </form>
  );
}