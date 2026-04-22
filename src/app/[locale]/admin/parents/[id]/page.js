import React from 'react';
import ClientPage from './ClientPage';

export const metadata = {
    title: 'Family Details | Admin',
    description: 'View parent and family account details',
};

export default async function ParentDetailsPage({ params }) {
    // Next.js 15 requires awaiting dynamic params
    const { id, locale } = await params;

    return <ClientPage id={id} locale={locale} />;
}
