import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { t } from '@/i18n';
import POSLayout from '@/Layouts/POSLayout';
import { FileText, Eye, User, Calendar, DollarSign, CheckCircle2, Download } from 'lucide-react';
import InvoiceDetailModal from '@/Components/Invoices/InvoiceDetailModal';

export default function InvoicesIndex({ invoices }) {
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    const formatMoney = (amount) => new Intl.NumberFormat('en-US').format(amount);
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusBadge = (status, paymentMethod) => {
        if (status === 'Completed') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('invoices.paid_method', { method: paymentMethod })}
                </span>
            );
        }
        if (status === 'Added_To_Debt') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                    <DollarSign className="w-3 h-3" />
                    {t('invoices.store_credit')}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {status}
            </span>
        );
    };

    return (
        <POSLayout
            title={t('invoices.title')}
            description={t('invoices.description')}
            icon={FileText}
            contentClassName="space-y-4"
            header={
                <div className="flex justify-end w-full lg:w-auto">
                    <a
                        href="/invoices/export"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 sm:w-auto"
                        title="Download All Invoices Excel"
                    >
                        <Download className="h-5 w-5" />
                        Export All to Excel
                    </a>
                </div>
            }
        >
            <Head title={t('invoices.page_title')} />

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-6 py-4">{t('invoices.invoice_number')}</th>
                                <th className="px-6 py-4">{t('invoices.date')}</th>
                                <th className="px-6 py-4">{t('invoices.customer')}</th>
                                <th className="px-6 py-4 text-right">{t('invoices.total_khr')}</th>
                                <th className="px-6 py-4">{t('invoices.status_method')}</th>
                                <th className="px-6 py-4 text-center">{t('invoices.action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoices.data.map((invoice) => (
                                <tr key={invoice.id} className="group transition-colors hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono font-medium text-indigo-600">
                                        {invoice.invoice_number}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            {formatDate(invoice.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {invoice.customer ? (
                                            <div className="flex items-center gap-2 font-medium text-slate-700">
                                                <User className="h-4 w-4 text-slate-400" />
                                                {invoice.customer.name}
                                            </div>
                                        ) : (
                                            <span className="italic text-slate-400">{t('invoices.walk_in_customer')}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-700">
                                        {formatMoney(invoice.total_khr)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(invoice.status, invoice.payment_method)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => setSelectedInvoice(invoice)}
                                            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition-colors tooltip hover:bg-indigo-50 hover:text-indigo-600"
                                            title={t('actions.view_receipt')}
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="divide-y divide-slate-100 md:hidden">
                    {invoices.data.map((invoice) => (
                        <button
                            key={invoice.id}
                            type="button"
                            onClick={() => setSelectedInvoice(invoice)}
                            className="block w-full p-5 text-left transition-colors hover:bg-slate-50"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-mono text-sm font-semibold text-indigo-600">
                                        {invoice.invoice_number}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {formatDate(invoice.created_at)}
                                    </p>
                                </div>
                                <Eye className="mt-1 h-5 w-5 shrink-0 text-slate-300" />
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-xs uppercase tracking-wider text-slate-400">{t('invoices.customer')}</p>
                                    <p className="mt-1 font-medium text-slate-700">
                                        {invoice.customer?.name || t('invoices.walk_in_customer')}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-xs uppercase tracking-wider text-slate-400">{t('pos.total')}</p>
                                    <p className="mt-1 font-bold text-slate-700">
                                        {formatMoney(invoice.total_khr)} KHR
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3">
                                {getStatusBadge(invoice.status, invoice.payment_method)}
                            </div>
                        </button>
                    ))}
                </div>
                
                {invoices.data.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                        <p className="text-lg font-medium">{t('invoices.no_invoices_found')}</p>
                        <p className="text-sm">{t('invoices.no_invoices_hint')}</p>
                    </div>
                )}
            </div>
            
            <div className="flex justify-end">
                <p className="font-mono text-sm text-slate-500">{t('invoices.showing_invoices', { count: invoices.data.length, total: invoices.total })}</p>
            </div>

            <InvoiceDetailModal 
                isOpen={selectedInvoice !== null}
                onClose={() => setSelectedInvoice(null)}
                invoiceId={selectedInvoice?.id}
            />
        </POSLayout>
    );
}
