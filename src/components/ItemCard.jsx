import React, { useState, useCallback } from 'react';
import { Calendar, MapPin, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { LazyImage } from './LazyImage';

export const ItemCard = React.memo(({ item, onClick, isAdmin, onEdit, onDelete }) => {
  const handleClick = useCallback(() => {
    onClick(item);
  }, [onClick, item]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    onEdit(item);
  }, [onEdit, item]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete(item);
  }, [onDelete, item]);

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer will-change-transform"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="aspect-[4/3] relative overflow-hidden">
        <LazyImage
          src={item.image}
          alt={item.name}
          className="absolute inset-0 bg-slate-50"
          imgStyle={{ objectFit: 'contain', padding: '8px' }}
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`badge ${item.status === 'Claimed' ? 'badge-success' : 'badge-warning'
            } shadow-sm`}>
            {item.status}
          </span>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
            <button
              onClick={handleEdit}
              className="p-2 bg-white/95 text-blue-600 hover:bg-blue-50 rounded-lg shadow-md transition-colors"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 bg-white/95 text-red-500 hover:bg-red-50 rounded-lg shadow-md transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors duration-150">
          {item.name}
        </h3>

        <div className="space-y-1 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400 shrink-0" />
            <span>{format(new Date(item.dateFound), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-slate-400 shrink-0" />
            <span className="line-clamp-1">{item.locationFound}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">Claim at</span>
          <span className="badge badge-info">{item.claimLocation}</span>
        </div>
      </div>
    </div>
  );
});

ItemCard.displayName = 'ItemCard';
