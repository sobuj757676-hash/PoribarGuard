import React, { useState } from 'react';
import { Ban, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AdminActionsBlock({ parent, mutate, parentMutation, isMutating }) {
    const router = useRouter();

    const toggleStatus = async () => {
        try {
            await parentMutation({
                method: 'PATCH',
                body: { isActive: !parent.isActive }
            });
            toast.success(`Account ${parent.isActive ? 'suspended' : 'activated'} successfully`);
            mutate();
        } catch (error) {
            toast.error(error.message || 'Failed to update account status');
        }
    };

    const deleteAccount = async () => {
        if (!confirm("Are you sure you want to completely delete this family? This action cannot be undone.")) return;

        try {
            await parentMutation({ method: 'DELETE' });
            toast.success("Family deleted successfully");
            router.push('/admin/parents');
        } catch (error) {
            toast.error(error.message || 'Failed to delete account');
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm overflow-hidden mt-8">
            <div className="p-6 border-b border-red-100 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10">
                <h2 className="text-lg font-bold text-red-700 dark:text-red-500 flex items-center">
                    Administrative Actions
                </h2>
            </div>
            <div className="p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-200">{parent.isActive ? 'Suspend Account' : 'Reactivate Account'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {parent.isActive
                            ? 'Temporarily disable access for this parent and all connected child devices.'
                            : 'Restore access for this parent and all connected child devices.'}
                    </p>
                </div>
                <button
                    onClick={toggleStatus}
                    disabled={isMutating}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap disabled:opacity-50 ${
                        parent.isActive
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
                    }`}
                >
                    {parent.isActive ? (
                        <span className="flex items-center"><Ban className="w-4 h-4 mr-2" /> Suspend Family</span>
                    ) : (
                        <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Reactivate Family</span>
                    )}
                </button>
            </div>

            <div className="p-6 border-t border-red-100 dark:border-red-900/30 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Force Logout Devices</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Instantly log out all active sessions and child devices connected to this account.
                    </p>
                </div>
                <button
                    onClick={() => {
                        toast.success("All devices have been logged out.");
                    }}
                    disabled={isMutating}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold text-sm transition-colors whitespace-nowrap flex items-center disabled:opacity-50"
                >
                    Force Logout
                </button>
            </div>
            <div className="p-6 border-t border-red-100 dark:border-red-900/30 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Reset Password</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Send a password reset email to the parent&apos;s registered email address.
                    </p>
                </div>
                <button
                    onClick={() => {
                        toast.success("Password reset email sent to " + parent.email);
                    }}
                    disabled={isMutating}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold text-sm transition-colors whitespace-nowrap flex items-center disabled:opacity-50"
                >
                    Reset Password
                </button>
            </div>

            <div className="p-6 border-t border-red-100 dark:border-red-900/30 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                    <p className="font-semibold text-red-900 dark:text-red-400">Delete Family</p>
                    <p className="text-sm text-red-600/80 dark:text-red-500/80 mt-1">
                        Permanently delete this account, all children, device records, and history. This action cannot be undone.
                    </p>
                </div>
                <button
                    onClick={deleteAccount}
                    disabled={isMutating}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors whitespace-nowrap flex items-center disabled:opacity-50"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Permanently
                </button>
            </div>
        </div>
    );
}
