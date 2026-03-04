import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="relative mx-auto mb-8 w-32 h-32">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-pulse"></div>
                    <div className="absolute inset-4 bg-emerald-500/20 rounded-full"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Shield className="w-16 h-16 text-emerald-500" />
                    </div>
                </div>
                <h1 className="text-7xl font-black text-white mb-2">404</h1>
                <h2 className="text-xl font-bold text-gray-300 mb-3">Page Not Found</h2>
                <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                    The page you're looking for doesn't exist or has been moved.
                    Your family's data is safe — this is just a navigation issue.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/" className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20">
                        <ArrowLeft className="w-4 h-4" /> Go Home
                    </Link>
                    <Link href="/dashboard" className="flex items-center justify-center gap-2 bg-gray-800 text-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition border border-gray-700">
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
