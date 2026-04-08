import { useEffect, useState } from 'react';
import { t } from '@/i18n';
import { Search, X, User } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export default function CustomerModal({ isOpen, onClose, customers }) {
    const [searchQuery, setSearchQuery] = useState('');
    const setSelectedCustomer = useCartStore((state) => state.setSelectedCustomer);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const filteredCustomers = customers?.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.phone_number && c.phone_number.includes(searchQuery))
    ) || [];

    const handleSelect = (customer) => {
        setSelectedCustomer(customer);
        onClose();
    };

    const handleSelectWalkIn = () => {
        setSelectedCustomer(null);
        onClose();
    };

    const formatMoney = (amount) => new Intl.NumberFormat('en-US').format(amount);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800">{t('pos.select_customer')}</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Body */}
                <div className="p-6 border-b border-slate-100">
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            data-page-search="true"
                            type="text"
                            autoFocus
                            className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                            placeholder={t('pos.search_customer_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* List Body */}
                <div className="flex-1 overflow-y-auto p-2">
                    <ul className="space-y-1">
                        {/* Always offer a standard "Walk-in" customer if they didn't explicitly search hard */}
                        {searchQuery === '' && (
                            <li>
                                <button
                                    onClick={handleSelectWalkIn}
                                    className="w-full text-left flex items-center gap-4 px-4 py-3 hover:bg-emerald-50 rounded-xl transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors shrink-0">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-700 group-hover:text-emerald-700">{t('pos.walk_in_customer')}</p>
                                        <p className="text-sm text-slate-400">{t('pos.standard_checkout')}</p>
                                    </div>
                                </button>
                            </li>
                        )}

                        {filteredCustomers.map(customer => (
                            <li key={customer.id}>
                                <button
                                    onClick={() => handleSelect(customer)}
                                    className="w-full text-left flex items-center gap-4 px-4 py-3 hover:bg-emerald-50 rounded-xl transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors shrink-0">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-700 group-hover:text-emerald-700">{customer.name}</p>
                                        <p className="text-sm text-slate-500">{customer.phone_number || t('pos.no_phone')}</p>
                                    </div>
                                    <div className="text-right">
                                        {customer.total_debt_balance > 0 ? (
                                            <div>
                                                <p className="text-xs text-rose-500 font-bold uppercase tracking-wider">{t('pos.owes')}</p>
                                                <p className="text-sm text-rose-600 font-semibold">{formatMoney(customer.total_debt_balance)} KHR</p>
                                            </div>
                                        ) : customer.total_debt_balance < 0 ? (
                                            <div>
                                                <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">{t('pos.credit')}</p>
                                                <p className="text-sm text-emerald-600 font-semibold">{formatMoney(Math.abs(customer.total_debt_balance))} KHR</p>
                                            </div>
                                        ) : null}
                                    </div>
                                </button>
                            </li>
                        ))}
                        
                        {filteredCustomers.length === 0 && searchQuery !== '' && (
                            <div className="py-8 px-4 text-center text-slate-500">
                                <p>{t('pos.customer_search_empty', { searchQuery })}</p>
                            </div>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
