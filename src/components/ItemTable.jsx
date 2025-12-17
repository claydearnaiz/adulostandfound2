import React from 'react';
import { Eye, Pencil, Trash2, CheckSquare, Square, MinusSquare } from 'lucide-react';
import { format } from 'date-fns';

export const ItemTable = ({
  items,
  onView,
  onEdit,
  onDelete,
  // New selection props
  selectedIds = [],
  onSelectionChange,
  showSelection = false
}) => {
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(items.map(item => item.id));
    }
  };

  const handleSelectItem = (itemId) => {
    if (selectedIds.includes(itemId)) {
      onSelectionChange?.(selectedIds.filter(id => id !== itemId));
    } else {
      onSelectionChange?.([...selectedIds, itemId]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {showSelection && (
                <th className="w-12 px-4 py-4">
                  <button
                    onClick={handleSelectAll}
                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                    title={allSelected ? 'Deselect all' : 'Select all'}
                  >
                    {allSelected ? (
                      <CheckSquare size={18} className="text-blue-600" />
                    ) : someSelected ? (
                      <MinusSquare size={18} className="text-blue-400" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
              )}
              <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Date Found</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Location</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                >
                  {showSelection && (
                    <td className="w-12 px-4 py-4">
                      <button
                        onClick={() => handleSelectItem(item.id)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare size={18} className="text-blue-600" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-300">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                        <p className="text-sm text-slate-500 truncate max-w-[200px]">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                    {format(new Date(item.dateFound), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 hidden lg:table-cell">
                    <span className="truncate block max-w-[200px]">{item.locationFound}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${item.status === 'Claimed' ? 'badge-success' : 'badge-warning'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onView(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
