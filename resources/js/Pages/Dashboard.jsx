import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { t } from '@/i18n';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {t('auth.dashboard')}
                </h2>
            }
        >
            <Head title={t('auth.dashboard')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {t('auth.logged_in')}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
