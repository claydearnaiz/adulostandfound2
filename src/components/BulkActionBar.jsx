import React from 'react';
import { CheckCircle, Trash2, X } from 'lucide-react';

export const BulkActionBar = ({
    selectedCount,
    onMarkClaimed,
    onDelete,
    onClearSelection,
    loading = false
}) => {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div className="bg-slate-900 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4">
                {/* Selection count */}
                <div className="flex items-center gap-2 pr-4 border-r border-slate-700">
                    <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">
                        {selectedCount}
                    </div>
                    <span className="text-sm font-medium text-slate-300">
                        item{selectedCount !== 1 ? 's' : ''} selected
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onMarkClaimed}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    >
                        <CheckCircle size={16} />
                        Mark Claimed
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                </div>

                {/* Clear selection */}
                <button
                    onClick={onClearSelection}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all ml-2"
                    title="Clear selection"
                >
                    <X size={18} />
                </button>
            </div>

            <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};
