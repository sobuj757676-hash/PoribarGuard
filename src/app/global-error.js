'use client';

import { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <html>
            <body className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                    <p className="text-gray-400 mb-6 max-w-md">An unexpected error occurred. Please try again or contact support.</p>
                    <button onClick={reset} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg">
                        Try Again
                    </button>
                </div>
            </body>
        </html>
    );
}
