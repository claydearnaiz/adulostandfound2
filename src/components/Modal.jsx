import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

export const Modal = React.memo(({ isOpen, onClose, title, children, size = 'default' }) => {
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    default: 'max-w-2xl',
    large: 'max-w-4xl',
  };

  return (
    // 1. THIS WRAPPER IS KEY FOR CENTERING: "flex items-center justify-center"
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* Backdrop (No Blur for Performance) */}
      <div 
        className="absolute inset-0 bg-slate-900/50 transition-opacity duration-150"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-150 ease-out will-change-transform`}
        style={{ animation: 'modalIn 150ms ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        {/* Close button (Floating) when no title */}
        {!title && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-600 bg-white/90 hover:bg-slate-100 rounded-xl transition-colors shadow-sm"
          >
            <X size={20} />
          </button>
        )}
        
        {/* Content Area - Auto scroll */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
});

Modal.displayName = 'Modal';