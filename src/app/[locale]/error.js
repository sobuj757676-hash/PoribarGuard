"use client";

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorBoundary({ error, reset }) {
  const t = useTranslations('Errors');
  const tCommon = useTranslations('Common');

  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[400px] h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-8 rounded-3xl shadow-lg max-w-md w-full">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t('title')}
        </h2>

        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          {t('description')}
        </p>

        <button
          onClick={() => reset()}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {tCommon('tryAgain')}
        </button>
      </div>
    </div>
  );
}