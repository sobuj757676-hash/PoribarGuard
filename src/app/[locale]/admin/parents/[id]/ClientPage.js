"use client";

import React from 'react';
import { useAdminParentDetails, useAdminParentMutation } from '@/hooks/useApi';
import ParentProfileCard from '@/components/admin/parent-details/ParentProfileCard';
import SubscriptionCard from '@/components/admin/parent-details/SubscriptionCard';
import ChildDevicesList from '@/components/admin/parent-details/ChildDevicesList';
import TransactionsList from '@/components/admin/parent-details/TransactionsList';
import SupportTicketsList from '@/components/admin/parent-details/SupportTicketsList';
import AdminActionsBlock from '@/components/admin/parent-details/AdminActionsBlock';

export default function ClientPage({ id, locale }) {
    const { parent, isLoading, isError, mutate } = useAdminParentDetails(id);
    const { trigger: parentMutation, isMutating } = useAdminParentMutation(id);

    if (isLoading) {
        return (
            <div className="p-8 space-y-6 animate-pulse">
                <div className="h-32 bg-slate-200 rounded-xl w-full"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 bg-slate-200 rounded-xl w-full"></div>
                    <div className="h-64 bg-slate-200 rounded-xl w-full"></div>
                </div>
            </div>
        );
    }

    if (isError || !parent) {
        return (
            <div className="p-8 text-center text-red-500">
                <h1 className="text-2xl font-bold mb-4">Error</h1>
                <p>Failed to load parent details. They may have been deleted.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Family Details</h1>
                <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${parent.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {parent.isActive ? 'Active' : 'Suspended'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ParentProfileCard parent={parent} locale={locale} />
                <SubscriptionCard subscription={parent.subscription} locale={locale} />
            </div>

            <ChildDevicesList childrenList={parent.children} locale={locale} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TransactionsList transactions={parent.transactions} locale={locale} />
                <SupportTicketsList supportTickets={parent.supportTickets} locale={locale} />
            </div>

            <AdminActionsBlock
                parent={parent}
                mutate={mutate}
                parentMutation={parentMutation}
                isMutating={isMutating}
            />
        </div>
    );
}
