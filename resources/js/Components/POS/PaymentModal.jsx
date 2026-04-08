import { useState, useEffect } from 'react';
import { t } from '@/i18n';
import { X, Banknote, QrCode, CreditCard, UserX } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { QRCodeSVG } from 'qrcode.react';
import { generateKHQRPayload } from '@/utils/khqr';

export default function PaymentModal({ isOpen, onClose, onConfirm }) {
    const { getCartTotal, selectedCustomer, cart } = useCartStore();
    const [paymentMethod, setPaymentMethod] = useState('');
    const [cashReceived, setCashReceived] = useState('');
    
    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setPaymentMethod('');
            setCashReceived('');
            
            // Set default payment method intelligently
            if (selectedCustomer && selectedCustomer.total_debt_balance > 0) {
                // If they already have debt, maybe default to adding more debt, or default to cash. Let's default to cash.
                setPaymentMethod('Cash');
            } else {
                setPaymentMethod('Cash');
            }
        }
    }, [isOpen, selectedCustomer]);

    if (!isOpen || cart.length === 0) return null;

    const total = getCartTotal();
    const formatMoney = (amount) => new Intl.NumberFormat('en-US').format(amount);
    
    // Exact change calculation
    const received = parseInt(cashReceived) || 0;
    const change = received - total;
    
    // Can they use credit? Only if a named customer is selected. Walk-ins cannot have debt.
    const canUseCredit = selectedCustomer !== null;

    const handleConfirm = () => {
        if (paymentMethod === 'Cash' && received < total) {
            alert(t('pos.insufficient_cash'));
            return;
        }
        
        onConfirm({
            method: paymentMethod,
            received_khr: paymentMethod === 'Cash' ? received : total,
            change_khr: paymentMethod === 'Cash' ? Math.max(0, change) : 0,
            status: paymentMethod === 'Unpaid_Debt' ? 'Added_To_Debt' : 'Completed'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Left Side: Summary & Payment Method */}
                <div className="w-1/2 flex flex-col border-r border-slate-100 bg-slate-50">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800">{t('pos.checkout')}</h3>
                        <p className="text-sm text-slate-500 mt-1">{t('pos.checkout_description')}</p>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm mb-6 text-center shadow-emerald-500/10">
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">{t('pos.total_due')}</p>
                            <p className="text-4xl font-black text-emerald-600">{formatMoney(total)} <span className="textlg">KHR</span></p>
                        </div>

                        <div className="space-y-3">
                            <PaymentOption 
                                icon={<Banknote />} title={t('pos.cash')} 
                                active={paymentMethod === 'Cash'} 
                                onClick={() => setPaymentMethod('Cash')} 
                            />
                            <PaymentOption 
                                icon={<CreditCard />} title={t('pos.aba_bank_transfer')} 
                                active={paymentMethod === 'ABA'} 
                                onClick={() => setPaymentMethod('ABA')} 
                            />
                            <PaymentOption 
                                icon={<QrCode />} title={t('pos.khqr')} 
                                active={paymentMethod === 'KHQR'} 
                                onClick={() => setPaymentMethod('KHQR')} 
                            />
                            
                            <button
                                onClick={() => canUseCredit && setPaymentMethod('Unpaid_Debt')}
                                disabled={!canUseCredit}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden ${
                                    paymentMethod === 'Unpaid_Debt' 
                                        ? 'border-rose-500 bg-rose-50/50 object-cover' 
                                        : canUseCredit 
                                            ? 'border-slate-100 bg-white hover:border-slate-300' 
                                            : 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-60'
                                }`}
                            >
                                <div className={`p-3 rounded-full shrink-0 ${paymentMethod === 'Unpaid_Debt' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <UserX className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className={`font-bold text-lg ${paymentMethod === 'Unpaid_Debt' ? 'text-rose-700' : 'text-slate-700'}`}>{t('pos.store_credit_debt')}</h4>
                                    <p className="text-sm text-slate-500 line-clamp-1">
                                        {canUseCredit ? t('pos.customer_add_to_balance', { name: selectedCustomer.name }) : t('pos.customer_not_available_walk_in')}
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Specific Details (Calculator or QR) */}
                <div className="w-1/2 flex flex-col bg-white">
                    <div className="flex justify-end p-4">
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-slate-100">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 px-8 pb-8 flex flex-col justify-center">
                        {paymentMethod === 'Cash' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('pos.cash_received')}</label>
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            autoFocus
                                            value={cashReceived}
                                            onChange={(e) => setCashReceived(e.target.value)}
                                            className="block w-full text-3xl font-bold pl-4 pr-16 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors"
                                            placeholder="0"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <span className="text-slate-400 font-bold text-xl">KHR</span>
                                        </div>
                                    </div>
                                    
                                    {/* Quick Cash Buttons */}
                                    <div className="flex gap-2 mt-3">
                                        {[total, 10000, 20000, 50000, 100000].filter((val, i, arr) => val >= total && arr.indexOf(val) === i).map(amount => (
                                            <button 
                                                key={amount}
                                                onClick={() => setCashReceived(amount.toString())}
                                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition-colors flex-1"
                                            >
                                                {formatMoney(amount)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {received > 0 && (
                                    <div className={`p-6 rounded-xl border ${change < 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-200'}`}>
                                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">
                                            {change < 0 ? t('pos.insufficient_amount') : t('pos.change_due')}
                                        </p>
                                        <p className={`text-4xl font-black ${change < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                                            {formatMoney(Math.abs(change))} <span className="text-lg">KHR</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {(paymentMethod === 'ABA' || paymentMethod === 'KHQR') && (
                            <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-300 py-12">
                                <div className="p-4 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 relative group overflow-hidden">
                                    <QRCodeSVG 
                                        value={generateKHQRPayload(total)} 
                                        size={200}
                                        level="M"
                                        includeMargin={false}
                                        imageSettings={{
                                            src: "/favicon.ico",
                                            x: undefined, y: undefined,
                                            height: 40, width: 40,
                                            excavate: true,
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-sm font-bold text-slate-700">{t('pos.payload')}<br/><span className="font-mono text-xs text-indigo-600 break-all p-2 inline-block max-w-[180px]">{generateKHQRPayload(total)}</span></p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-800">{t('pos.scan_khqr')}</h4>
                                    <p className="text-slate-500 mt-2">{t('pos.khqr_description', { total: formatMoney(total) })}</p>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'Unpaid_Debt' && (
                            <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-300 py-12">
                                <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center shadow-inner">
                                    <UserX className="w-12 h-12" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-rose-700">{t('pos.add_to_balance')}</h4>
                                    <p className="text-slate-600 mt-2 text-lg">
                                        {t('pos.debt_increase_message', { name: selectedCustomer?.name, total: formatMoney(total) })}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-6">
                            <button
                                onClick={handleConfirm}
                                disabled={!paymentMethod || (paymentMethod === 'Cash' && received < total)}
                                className={`w-full py-5 font-bold rounded-xl shadow-lg transition-all text-xl ${
                                    paymentMethod === 'Unpaid_Debt'
                                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                                        : !paymentMethod || (paymentMethod === 'Cash' && received < total)
                                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 active:scale-[0.98]'
                                }`}
                            >
                                {t('actions.confirm_order')}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function PaymentOption({ icon, title, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden ${
                active 
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm shadow-emerald-500/10' 
                    : 'border-slate-100 bg-white hover:border-slate-300'
            }`}
        >
            <div className={`p-3 rounded-full shrink-0 transition-colors ${active ? 'bg-emerald-500 text-white shadow-inner' : 'bg-slate-100 text-slate-500'}`}>
                {icon}
            </div>
            <div>
                <h4 className={`font-bold text-lg ${active ? 'text-emerald-700' : 'text-slate-700'}`}>{title}</h4>
            </div>
            {active && (
                <div className="absolute right-4 text-emerald-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}
        </button>
    );
}
