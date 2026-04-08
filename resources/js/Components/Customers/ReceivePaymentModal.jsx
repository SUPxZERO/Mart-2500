import { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, HandCoins, Banknote, QrCode } from 'lucide-react';

export default function ReceivePaymentModal({ isOpen, onClose, customer }) {
    const [amountKhr, setAmountKhr] = useState(customer?.total_debt_balance > 0 ? customer.total_debt_balance.toString() : '');
    const [method, setMethod] = useState('Cash');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !customer) return null;

    const formatMoney = (amount) => new Intl.NumberFormat('en-US').format(amount);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!amountKhr || parseInt(amountKhr) <= 0) return;

        setIsSubmitting(true);

        router.post(`/customers/${customer.id}/payment`, {
            amount_khr: parseInt(amountKhr),
            payment_method: method
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                onClose();
            },
            onError: (errors) => {
                console.error(errors);
                setIsSubmitting(false);
                alert("Failed to record payment. See console.");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <HandCoins className="text-indigo-500 w-6 h-6" />
                        Receive Payment
                    </h3>
                    <button onClick={onClose} disabled={isSubmitting} className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                    
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex justify-between items-center">
                        <span className="text-rose-700 font-bold uppercase tracking-wider text-xs">Current Debt</span>
                        <span className="text-xl font-black text-rose-700">{formatMoney(customer.total_debt_balance)} <span className="text-sm">KHR</span></span>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Amount Received (KHR)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                autoFocus
                                required
                                value={amountKhr}
                                onChange={e => setAmountKhr(e.target.value)}
                                className="block w-full text-2xl font-bold pl-4 pr-16 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <span className="text-slate-400 font-bold">KHR</span>
                            </div>
                        </div>
                    </div>

                    <div>
                         <label className="block text-sm font-bold text-slate-700 mb-2">Payment Method</label>
                         <div className="flex gap-2">
                             {['Cash', 'ABA', 'KHQR'].map(m => (
                                 <button
                                     key={m}
                                     type="button"
                                     onClick={() => setMethod(m)}
                                     className={`flex-1 py-3 px-2 flex flex-col items-center justify-center gap-1 border-2 rounded-xl transition-all ${
                                         method === m 
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                                     }`}
                                 >
                                     {m === 'Cash' && <Banknote className="w-5 h-5" />}
                                     {(m === 'ABA' || m === 'KHQR') && <QrCode className="w-5 h-5" />}
                                     <span className="font-bold text-sm tracking-wide">{m}</span>
                                 </button>
                             ))}
                         </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !amountKhr}
                        className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>Confirm Payment</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
