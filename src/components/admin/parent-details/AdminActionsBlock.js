import React from 'react';
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
        <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden mt-8">
            <div className="p-6 border-b border-red-100 bg-red-50/30">
                <h2 className="text-lg font-semibold text-red-700 flex items-center">
                    Administrative Actions
                </h2>
            </div>
            <div className="p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                    <p className="font-medium text-slate-900">{parent.isActive ? 'Suspend Account' : 'Reactivate Account'}</p>
                    <p className="text-sm text-slate-500">
                        {parent.isActive
                            ? 'Temporarily disable access for this parent and all connected child devices.'
                            : 'Restore access for this parent and all connected child devices.'}
                    </p>
                </div>
                <button
                    onClick={toggleStatus}
                    disabled={isMutating}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                        parent.isActive
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                >
                    {parent.isActive ? (
                        <span className="flex items-center"><Ban className="w-4 h-4 mr-2" /> Suspend Family</span>
                    ) : (
                        <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Reactivate Family</span>
                    )}
                </button>
            </div>
            <div className="p-6 border-t border-red-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                    <p className="font-medium text-red-900">Delete Family</p>
                    <p className="text-sm text-red-600/80">
                        Permanently delete this account, all children, device records, and history. This action cannot be undone.
                    </p>
                </div>
                <button
                    onClick={deleteAccount}
                    disabled={isMutating}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap flex items-center"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Permanently
                </button>
            </div>
        </div>
    );
}
