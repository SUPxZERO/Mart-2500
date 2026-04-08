import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { t } from '@/i18n';
import POSLayout from '@/Layouts/POSLayout';
import { Settings, RefreshCw, Download, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsIndex({ exchangeRate }) {
    const { flash } = usePage().props;
    const [rate, setRate] = useState(exchangeRate?.usd_to_khr || 4000);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdateRate = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post('/settings/rate', { usd_to_khr: parseInt(rate) }, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false)
        });
    };

    return (
        <POSLayout
            title={t('settings.title')}
            description={t('settings.description')}
            icon={Settings}
            contentWidth="narrow"
            contentClassName="space-y-6"
        >
            <Head title={t('settings.page_title')} />

            {flash?.success && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <p className="font-medium">{flash.success}</p>
                </div>
            )}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                    <h2 className="flex items-center gap-2 font-bold text-slate-700">
                        <RefreshCw className="h-4 w-4 text-indigo-400" />
                        {t('settings.exchange_rate')}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">{t('settings.exchange_rate_description')}</p>
                </div>

                <form onSubmit={handleUpdateRate} className="flex flex-col gap-6 p-6">
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            {t('settings.usd_to_khr')}
                        </label>
                        <div className="relative w-full max-w-xs">
                            <input
                                type="number"
                                min="3000"
                                max="10000"
                                step="10"
                                required
                                value={rate}
                                onChange={e => setRate(e.target.value)}
                                className="block w-full rounded-2xl border-2 border-slate-200 py-3 pl-4 pr-16 text-2xl font-bold transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                <span className="font-bold text-slate-400">{t('common.khr')}</span>
                            </div>
                        </div>
                        <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                            <AlertCircle className="h-3 w-3" />
                            {t('settings.current_rate', { rate: (exchangeRate?.usd_to_khr || 4000).toLocaleString() })}
                        </p>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:bg-slate-300"
                        >
                            {isSubmitting ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            {t('actions.update_rate')}
                        </button>
                    </div>
                </form>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                    <h2 className="flex items-center gap-2 font-bold text-slate-700">
                        <Download className="h-4 w-4 text-emerald-400" />
                        {t('settings.database_backup')}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">{t('settings.database_backup_description')}</p>
                </div>

                <div className="p-6">
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        {t('settings.database_backup_copy')}
                    </p>
                    <a
                        href="/settings/backup"
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-emerald-600"
                    >
                        <Download className="h-4 w-4" />
                        {t('actions.download_backup')}
                    </a>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                    <h2 className="font-bold text-slate-700">{t('settings.about')}</h2>
                </div>
                <div className="p-6">
                    <dl className="space-y-3 text-sm font-mono">
                        {[
                            [t('settings.application'), 'Mart 2500 POS'],
                            [t('settings.version'), '1.0.0 (Sprint 5 Build)'],
                            [t('settings.database'), 'SQLite (Offline-first)'],
                            [t('settings.currency'), 'KHR (Khmer Riel)'],
                        ].map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                                <dt className="text-slate-400">{key}</dt>
                                <dd className="font-bold text-slate-700">{val}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </POSLayout>
    );
}
