import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import POSLayout from '@/Layouts/POSLayout';
import ItemCard from '@/Components/POS/ItemCard';
import SearchBar from '@/Components/POS/SearchBar';
import Cart from '@/Components/POS/Cart';
import { t } from '@/i18n';
import { useCartStore } from '@/store/useCartStore';

export default function POSIndex({ items, customers, exchange_rate }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const { addItem, cart } = useCartStore();

    // Build unique category list
    const categories = useMemo(() => {
        const cats = [...new Set(items.map(i => i.category).filter(Boolean))];
        return ['All', ...cats.sort()];
    }, [items]);

    // Build a quick lookup: item id -> qty in cart
    const cartQtyMap = useMemo(() => {
        return cart.reduce((map, ci) => {
            map[ci.id] = (map[ci.id] || 0) + ci.qty;
            return map;
        }, {});
    }, [cart]);

    // Filter by category then search
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [items, activeCategory, searchQuery]);

    return (
        <POSLayout
            title={t('pos.workspace_title')}
            description={t('pos.workspace_description')}
            contentPadded={false}
            contentWidth="full"
        >
            <Head title={t('pos.page_title')} />
            
            <div className="flex h-full min-h-[calc(100vh-13rem)] flex-col overflow-hidden lg:flex-row">
                
                {/* Left Side: Item Catalog Wrapper */}
                <div className="relative flex flex-1 flex-col border-b border-slate-200 bg-slate-50 lg:h-full lg:border-b-0 lg:border-r">
                    
                    {/* Search Bar Header */}
                    <header className="z-10 flex items-center border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
                        <div className="flex w-full items-center justify-center">
                            <SearchBar value={searchQuery} onChange={setSearchQuery} />
                        </div>
                    </header>

                    {/* Category Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1 sm:px-6 scrollbar-none">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                    activeCategory === cat
                                        ? 'bg-slate-800 text-white shadow-sm'
                                        : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Scrollable Item Grid */}
                    <div className="flex-1 overflow-y-auto p-4 pb-24 scroll-smooth sm:p-6">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                            {filteredItems.map((item) => (
                                <ItemCard 
                                    key={item.id} 
                                    item={item}
                                    qtyInCart={cartQtyMap[item.id] || 0}
                                    onClick={addItem} 
                                />
                            ))}
                            {filteredItems.length === 0 && (
                                <div className="col-span-full py-16 text-center text-slate-400">
                                    <p className="text-4xl mb-2">🔍</p>
                                    <p className="font-medium">No items found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Active Cart Drawer/Pane */}
                <div className="z-20 flex w-full shrink-0 flex-col border-l border-slate-200 bg-white shadow-xl lg:h-full lg:w-[26rem] lg:shadow-none">
                    <Cart customers={customers} />
                </div>

            </div>
        </POSLayout>
    );
}
