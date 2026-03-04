import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

// Base fetcher uses the one defined in SWRConfig globally, but we can define custom mutation fetchers here

/**
 * Custom mutation fetcher for POST/PUT/DELETE
 */
async function sendRequest(url, { arg }) {
    const res = await fetch(url, {
        method: arg.method || 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(arg.headers || {})
        },
        body: JSON.stringify(arg.body)
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'API request failed');
    }

    return res.json();
}

/**
 * PARENT DASHBOARD HOOKS
 */

export function useChildren() {
    const { data, error, isLoading, mutate } = useSWR('/api/children');
    return {
        children: data?.children || [],
        isLoading,
        isError: error,
        mutate
    };
}

export function useProfile() {
    const { data, error, isLoading, mutate } = useSWR('/api/profile');
    return {
        user: data?.user || null,
        isLoading,
        isError: error,
        mutate
    };
}

export function useSubscription() {
    const { data, error, isLoading } = useSWR('/api/subscriptions');
    return {
        subscription: data?.subscription || null,
        isLoading,
        isError: error
    };
}

// Mutations
export function useUpdateProfile() {
    return useSWRMutation('/api/profile', sendRequest);
}

export function useMarkAlertsRead() {
    return useSWRMutation('/api/alerts/mark-read', sendRequest);
}

export function useToggleAppControl(childId) {
    return useSWRMutation(`/api/children/${childId}/app-controls`, sendRequest);
}

export function useTogglePrayerLock(childId) {
    return useSWRMutation(`/api/children/${childId}/prayer-locks`, sendRequest);
}


/**
 * ADMIN DASHBOARD HOOKS
 */

export function useAdminStats() {
    const { data, error, isLoading } = useSWR('/api/admin/stats');
    return {
        stats: data?.stats || null,
        recentTickets: data?.recentTickets || [],
        isLoading,
        isError: error
    };
}

export function useAdminParents(page = 1, search = '') {
    const params = new URLSearchParams({ page: page.toString(), limit: '10' });
    if (search) params.append('search', search);

    const { data, error, isLoading } = useSWR(`/api/admin/parents?${params.toString()}`);
    return {
        parents: data?.parents || [],
        pagination: data?.pagination || { total: 0, totalPages: 1 },
        isLoading,
        isError: error
    };
}

export function useAdminTransactions() {
    const { data, error, isLoading } = useSWR('/api/admin/transactions');
    return {
        transactions: data?.transactions || [],
        gatewayStats: data?.gatewayStats || [],
        isLoading,
        isError: error
    };
}

export function useAdminFilters() {
    const { data, error, isLoading, mutate } = useSWR('/api/admin/filters');
    return {
        domains: data?.domains || [],
        keywords: data?.keywords || [],
        isLoading,
        isError: error,
        mutate
    };
}

export function useAdminDevices() {
    const { data, error, isLoading, mutate } = useSWR('/api/admin/devices', { refreshInterval: 30000 }); // auto refresh every 30s
    return {
        devices: data?.devices || [],
        isLoading,
        isError: error,
        mutate
    };
}

export function useAdminTickets(status = 'OPEN') {
    const { data, error, isLoading, mutate } = useSWR(`/api/admin/tickets?status=${status}`);
    return {
        tickets: data?.tickets || [],
        isLoading,
        isError: error,
        mutate
    };
}

export function useAdminAnalytics() {
    const { data, error, isLoading } = useSWR('/api/admin/analytics');
    return {
        analytics: data || null,
        isLoading,
        isError: error
    };
}

export function useAdminSettings() {
    const { data, error, isLoading, mutate } = useSWR('/api/admin/settings');
    return {
        settings: data?.settings || {},
        isLoading,
        isError: error,
        mutate
    };
}

export function useAdminSettingsMutation() {
    return useSWRMutation('/api/admin/settings', sendRequest);
}
