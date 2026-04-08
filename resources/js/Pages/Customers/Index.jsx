import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { t } from '@/i18n';
import POSLayout from '@/Layouts/POSLayout';
import { Users, Search, Phone, ChevronRight } from 'lucide-react';

export default function CustomersIndex({ customers, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const formatMoney = (amount) => new Intl.NumberFormat('en-US').format(amount);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/customers', { search: searchQuery }, { preserveState: true, preserveScroll: true });
    };

    return (
        <POSLayout
            title={t('customers.title')}
            description={t('customers.description')}
            icon={Users}
            contentWidth="wide"
            header={
                <form onSubmit={handleSearch} className="relative w-full max-w-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                        placeholder={t('customers.search_placeholder')}
                    />
                </form>
            }
        >
            <Head title={t('customers.page_title')} />

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-6 py-4">{t('customers.table_customer')}</th>
                                <th className="px-6 py-4">{t('customers.table_contact')}</th>
                                <th className="px-6 py-4 text-right">{t('customers.table_lifetime_value')}</th>
                                <th className="px-6 py-4 text-right">{t('customers.table_debt_balance')}</th>
                                <th className="px-6 py-4 text-center">{t('customers.table_action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {customers.data.map((customer) => (
                                <tr key={customer.id} className="group transition-colors hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-700">{customer.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {customer.phone_number ? (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3 w-3" />
                                                {customer.phone_number}
                                            </div>
                                        ) : (
                                            <span className="italic text-slate-300">{t('pos.no_phone')}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-600">
                                        {formatMoney(customer.total_lifetime_spent)} <span className="text-xs text-slate-400">KHR</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {customer.total_debt_balance > 0 ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
                                                Owes {formatMoney(customer.total_debt_balance)} KHR
                                            </span>
                                        ) : customer.total_debt_balance < 0 ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                                Credit {formatMoney(Math.abs(customer.total_debt_balance))} KHR
                                            </span>
                                        ) : (
                                            <span className="font-medium text-slate-400">{t('customers.settled')}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Link 
                                            href={`/customers/${customer.id}`}
                                            className="inline-flex items-center justify-center rounded-lg p-2 text-indigo-500 transition-colors group-hover:shadow-sm hover:bg-indigo-500 hover:text-white"
                                            title="View Profile"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="divide-y divide-slate-100 md:hidden">
                    {customers.data.map((customer) => (
                        <Link
                            key={customer.id}
                            href={`/customers/${customer.id}`}
                            className="block p-5 transition-colors hover:bg-slate-50"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500">
                                            {customer.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-bold text-slate-800">{customer.name}</p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {customer.phone_number || t('pos.no_phone')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-300" />
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-xs uppercase tracking-wider text-slate-400">Lifetime</p>
                                    <p className="mt-1 font-bold text-slate-700">{formatMoney(customer.total_lifetime_spent)} KHR</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-xs uppercase tracking-wider text-slate-400">Balance</p>
                                    <p className="mt-1 font-bold text-slate-700">
                                        {customer.total_debt_balance > 0
                                            ? `${formatMoney(customer.total_debt_balance)} owed`
                                            : customer.total_debt_balance < 0
                                              ? `${formatMoney(Math.abs(customer.total_debt_balance))} credit`
                                              : t('customers.settled')}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                
                {customers.data.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        <Users className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                        <p className="text-lg font-medium">{t('customers.no_customers_found')}</p>
                    </div>
                )}
            </div>
        </POSLayout>
    );
}
