import { useState } from 'react';

export default function ItemCard({ item, qtyInCart = 0, onClick }) {
    const [imageError, setImageError] = useState(false);
    const formattedPrice = new Intl.NumberFormat('en-US').format(item.default_price);
    const hasImage = !!item.image_url && !imageError;
    const inCart = qtyInCart > 0;

    return (
        <button
            onClick={() => onClick(item)}
            className={`group relative flex flex-col h-44 bg-white rounded-2xl shadow-sm border transition-all duration-200 active:scale-[0.97] w-full overflow-hidden ${
                inCart
                    ? 'border-emerald-400 shadow-emerald-100 shadow-md'
                    : 'border-slate-100 hover:border-emerald-400 hover:shadow-lg'
            }`}
        >
            {/* Cart quantity badge */}
            {inCart && (
                <div className="absolute top-2 right-2 z-10 min-w-[1.4rem] h-[1.4rem] px-1 bg-emerald-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-sm">
                    {qtyInCart}
                </div>
            )}

            {/* Image or gradient placeholder */}
            <div className="flex-1 w-full overflow-hidden relative">
                {hasImage ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-slate-100 via-slate-50 to-white flex items-center justify-center">
                        <span className="text-4xl select-none opacity-30">📦</span>
                    </div>
                )}
                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>


            {/* Name + Price footer */}
            <div className="w-full px-3 py-2 bg-white border-t border-slate-50 shrink-0">
                <p className="text-xs font-semibold text-slate-700 text-center leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2 mb-1">
                    {item.name}
                </p>
                <div className="flex items-center justify-center">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {formattedPrice} KHR
                    </span>
                </div>
            </div>
        </button>
    );
}
