import { useState, useMemo } from 'react';
import axios from 'axios';
import { t } from '@/i18n';
import { useCartStore } from '@/store/useCartStore';
import { Plus, Minus, Trash2, User, Pencil } from 'lucide-react';
import CustomerModal from './CustomerModal';
import PaymentModal from './PaymentModal';
import ReceiptModal from './ReceiptModal';

export default function Cart({ customers, exchangeRate, paymentGateways }) {
    const { cart, selectedCustomer, removeItem, updateQty, setQty, setCustomPrice, getCartTotal, clearCart } = useCartStore();
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Track which cart row is currently in price-edit mode: { index, value }
    const [editingPrice, setEditingPrice] = useState(null);

    const formatMoney = (amount) => new Intl.NumberFormat('en-US').format(amount);
    
    // Compute total with useMemo to ensure it updates whenever cart changes
    const cartTotal = useMemo(() => getCartTotal(), [cart]);

    return (
        <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
            <div className="h-20 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
                <h2 className="text-xl font-bold text-slate-800">{t('pos.current_order')}</h2>
                {cart.length > 0 && (
                    <button 
                        onClick={clearCart}
                        disabled={isSubmitting}
                        className="text-sm font-medium text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                    >
                        {t('actions.clear_all')}
                    </button>
                )}
            </div>

            <div className="min-h-0 w-full flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <ShoppingCartIcon className="w-16 h-16 mb-4 text-slate-200" />
                        <p>{t('pos.cart_empty')}</p>
                        <p className="text-sm">{t('pos.cart_empty_hint')}</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {cart.map((item, index) => (
                            <li key={`${item.id}-${index}`} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                                {/* Item name + remove */}
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-slate-700 line-clamp-1 pr-2 text-sm">{item.name}</span>
                                    <button 
                                        onClick={() => removeItem(index)}
                                        className="text-slate-300 hover:text-rose-500 transition-colors p-0.5 shrink-0"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Qty controls */}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                                        <button 
                                            onClick={() => updateQty(index, -1)}
                                            className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-500 hover:text-rose-500 active:scale-95 transition-all"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <input 
                                            type="number"
                                            min="1"
                                            value={item.qty === 0 ? '' : item.qty}
                                            onChange={(e) => {
                                                const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                                if (!isNaN(val)) setQty(index, val);
                                            }}
                                            onFocus={(e) => e.target.select()}
                                            className="w-10 text-center font-bold text-slate-700 bg-transparent border-0 focus:ring-0 focus:outline-none p-0 inline-block [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <button 
                                            onClick={() => updateQty(index, 1)}
                                            className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-500 hover:text-emerald-600 active:scale-95 transition-all"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Quick preset buttons */}
                                    <div className="flex gap-1">
                                        {[5, 10, 20].map(preset => (
                                            <button
                                                key={preset}
                                                onClick={() => setQty(index, preset)}
                                                className="px-2 py-1 text-xs font-bold rounded-md bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700 transition-colors active:scale-95"
                                            >
                                                {preset}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price row */}
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-slate-400">
                                        {item.qty > 1 && `${formatMoney(item.custom_price_sold_at)} × ${item.qty}`}
                                    </span>
                                    <div className="flex flex-col items-end">
                                        {editingPrice?.index === index ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    autoFocus
                                                    value={editingPrice.value}
                                                    onChange={e => setEditingPrice({ index, value: e.target.value })}
                                                    onBlur={() => {
                                                        const val = parseInt(editingPrice.value) || 0;
                                                        setCustomPrice(index, val);
                                                        setEditingPrice(null);
                                                    }}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') e.target.blur();
                                                        if (e.key === 'Escape') setEditingPrice(null);
                                                    }}
                                                    className="w-24 text-right text-sm font-bold text-emerald-600 border border-emerald-400 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                                />
                                                <span className="text-xs text-slate-400">KHR</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setEditingPrice({ index, value: item.custom_price_sold_at })}
                                                className="group/price flex items-center gap-1 hover:text-emerald-700 transition-colors"
                                                title="Click to change price"
                                            >
                                                <span className="text-emerald-600 font-bold text-sm">
                                                    {formatMoney(item.custom_price_sold_at * item.qty)} <span className="text-xs">KHR</span>
                                                </span>
                                                <Pencil className="w-3 h-3 text-slate-200 group-hover/price:text-emerald-400 transition-colors" />
                                            </button>
                                        )}
                                        {item.custom_price_sold_at !== item.default_price && editingPrice?.index !== index && (
                                            <span className="text-xs text-amber-500 font-medium">
                                                was {formatMoney(item.default_price)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="sticky bottom-0 shrink-0 border-t border-slate-200 bg-slate-50 px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)]">
                {/* Customer Selector Button */}
                <button
                    onClick={() => setIsCustomerModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 mb-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${selectedCustomer ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-100 text-slate-500'}`}>
                            <User className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('pos.customer')}</p>
                            <p className="font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">
                                {selectedCustomer ? selectedCustomer.name : t('pos.walk_in_customer')}
                            </p>
                        </div>
                    </div>
                </button>

                <div className="flex justify-between items-end mb-4">
                    <span className="text-slate-500 font-medium">{t('pos.total')}</span>
                    <span className="text-2xl font-bold text-emerald-600">
                        {formatMoney(cartTotal)} <span className="text-sm">KHR</span>
                    </span>
                </div>
                <button
                    disabled={cart.length === 0 || isSubmitting}
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-colors text-lg"
                >
                    {t('pos.checkout_pay')}
                </button>
            </div>

            <CustomerModal 
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
                customers={customers}
            />

            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                exchangeRate={exchangeRate}
                paymentGateways={paymentGateways}
                onConfirm={async (paymentData) => {
                    setIsSubmitting(true);
                    
                    try {
                        const payload = {
                            customer_id: selectedCustomer ? selectedCustomer.id : null,
                            payment_method: paymentData.method,
                            payment_provider: paymentData.provider?.display_name || null,
                            received_khr: paymentData.received_khr,
                            items: cart.map(item => ({
                                id: item.id,
                                name: item.name,
                                qty: item.qty,
                                custom_price_sold_at: item.custom_price_sold_at
                            }))
                        };
                        
                        const response = await axios.post('/api/invoices', payload);
                        
                        if (response.data.success) {
                            setIsPaymentModalOpen(false);
                            // Pass the backend generated invoice number to the receipt!
                            setReceiptData({
                                ...paymentData,
                                invoice_number: response.data.invoice_number
                            });
                        }
                    } catch (error) {
                        console.error(t('pos.checkout_failed'), error);
                        alert(error.response?.data?.message || t('pos.failed_complete_transaction'));
                    } finally {
                        setIsSubmitting(false);
                    }
                }}
            />

            <ReceiptModal 
                isOpen={receiptData !== null}
                onClose={() => setReceiptData(null)}
                paymentData={receiptData}
            />
        </div>
    );
}

function ShoppingCartIcon(props) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
    );
}
