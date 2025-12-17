import React from 'react';
import { Package, Clock, CheckCircle, TrendingUp, ClipboardList } from 'lucide-react';

export const StatsCards = ({ items, pendingClaimsCount = 0 }) => {
  const totalItems = items.length;
  const unclaimedItems = items.filter(i => i.status === 'Unclaimed').length;
  const claimedItems = items.filter(i => i.status === 'Claimed').length;
  const claimRate = totalItems > 0 ? Math.round((claimedItems / totalItems) * 100) : 0;

  const stats = [
    {
      label: 'Total Items',
      value: totalItems,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Unclaimed',
      value: unclaimedItems,
      icon: Clock,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600'
    },
    {
      label: 'Claimed',
      value: claimedItems,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      label: 'Pending Claims',
      value: pendingClaimsCount,
      icon: ClipboardList,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <Icon className={stat.textColor} size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
