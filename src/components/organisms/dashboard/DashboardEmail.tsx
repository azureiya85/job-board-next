'use client';

import { Mail, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useProfileEditStore } from '@/stores/profileEditStores';

export function DashboardEmail() {
  // Individual property selection to prevent unnecessary re-renders
  const user = useProfileEditStore((state) => state.user);
  const emailForm = useProfileEditStore((state) => state.emailForm);
  const setEmailForm = useProfileEditStore((state) => state.setEmailForm);
  const submitEmailForm = useProfileEditStore((state) => state.submitEmailForm);
  const savingEmail = useProfileEditStore((state) => state.savingEmail);
  const resendVerificationEmail = useProfileEditStore((state) => state.resendVerificationEmail);
  const resendingVerification = useProfileEditStore((state) => state.resendingVerification);

  if (!user) return null; 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitEmailForm();
  };
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Email Settings</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium text-gray-800 mb-2">Current Email</h3>
        <p className="text-gray-600">{user.email}</p>
        <div className="mt-2">
          {user.isEmailVerified ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </span>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                <AlertCircle className="w-3 h-3 mr-1" />
                Not Verified
              </span>
              <button
                onClick={resendVerificationEmail}
                disabled={resendingVerification}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendingVerification ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Resend Verification
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Email Address
          </label>
          <input
            type="email"
            value={emailForm.newEmail}
            onChange={(e) => setEmailForm({ newEmail: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            You will need to verify the new email address before it becomes active.
          </p>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={savingEmail || emailForm.newEmail === user.email}
            className="bg-primary hover:bg-accent cursor-pointer text-white px-6 py-2 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {savingEmail ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Update Email
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}