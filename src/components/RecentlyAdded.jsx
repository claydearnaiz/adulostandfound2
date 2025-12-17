import React from 'react';
import { Sparkles, ChevronRight, Clock } from 'lucide-react';
import { format, isAfter, subDays } from 'date-fns';
import { LazyImage } from './LazyImage';

export const RecentlyAdded = ({ items, onItemClick }) => {
    // Filter items added in the last 7 days
    const sevenDaysAgo = subDays(new Date(), 7);
    const recentItems = items.filter(item => {
        if (!item.createdAt) return false;
        const createdDate = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        return isAfter(createdDate, sevenDaysAgo);
    }).slice(0, 10); // Max 10 items

    if (recentItems.length === 0) return null;

    return (
        <div className="mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-orange-500/20">
                        <Sparkles size={18} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Recently Added</h2>
                        <p className="text-xs text-slate-500">Items from the past week</p>
                    </div>
                </div>
                <span className="text-sm text-slate-400 font-medium">
                    {recentItems.length} new item{recentItems.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Horizontal scroll container */}
            <div className="relative -mx-4 px-4">
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                    {recentItems.map((item) => (
                        <RecentItemCard key={item.id} item={item} onClick={() => onItemClick(item)} />
                    ))}
                </div>

                {/* Fade gradient on right */}
                <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
            </div>
        </div>
    );
};

const RecentItemCard = ({ item, onClick }) => {
    const createdDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);

    return (
        <button
            onClick={onClick}
            className="flex-shrink-0 w-56 bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden hover:shadow-md hover:scale-[1.02] transition-all group text-left"
        >
            {/* Image */}
            <div className="relative h-32 overflow-hidden">
                <LazyImage
                    src={item.image}
                    alt={item.name}
                    className="absolute inset-0 bg-slate-50 group-hover:scale-105 transition-transform duration-300"
                    imgStyle={{ objectFit: 'contain', padding: '8px' }}
                />
                {/* NEW badge */}
                <div className="absolute top-2 left-2 z-10">
                    <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg animate-pulse">
                        NEW
                    </span>
                </div>
                {/* Status badge */}
                <div className="absolute top-2 right-2 z-10">
                    <span className={`badge text-xs ${item.status === 'Claimed' ? 'badge-success' : 'badge-warning'
                        }`}>
                        {item.status}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                <p className="font-semibold text-slate-900 truncate mb-1">{item.name}</p>
                <div className="flex items-center gap-1 text-slate-400">
                    <Clock size={12} />
                    <span className="text-xs">
                        {format(createdDate, 'MMM d')}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs truncate">{item.locationFound}</span>
                </div>
            </div>
        </button>
    );
};
