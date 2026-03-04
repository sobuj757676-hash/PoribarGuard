import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const toggleLang = () => {
        const nextLocale = locale === 'en' ? 'bn' : 'en';
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <button
            onClick={toggleLang}
            className="flex items-center gap-1 text-sm font-medium hover:text-emerald-600 transition-colors"
        >
            <Globe className="w-4 h-4" />
            {locale === 'en' ? 'BN' : 'EN'}
        </button>
    );
}