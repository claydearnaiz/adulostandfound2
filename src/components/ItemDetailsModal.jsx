import React from 'react';
import { Modal } from './Modal';
import { Calendar, MapPin, Box, Tag, Clock, Info, Send } from 'lucide-react';
import { format } from 'date-fns';
import { LazyImage } from './LazyImage';

export const ItemDetailsModal = React.memo(({
  item,
  isOpen,
  onClose,
  // New props for claim functionality
  showClaimButton = false,
  onSubmitClaim,
  hasExistingClaim = false
}) => {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="space-y-5">
        {/* Image */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
          <LazyImage
            src={item.image}
            alt={item.name}
            className="absolute inset-0"
          />
          <div className="absolute top-3 left-3 z-10">
            <span className={`badge text-sm ${item.status === 'Claimed' ? 'badge-success' : 'badge-warning'
              }`}>
              {item.status}
            </span>
          </div>
        </div>

        {/* Title & Category */}
        <div>
          {item.category && (
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Tag size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">{item.category}</span>
            </div>
          )}
          <h2 className="text-2xl font-bold text-slate-900">{item.name}</h2>
        </div>

        {/* Description */}
        <p className="text-slate-600 leading-relaxed">{item.description}</p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCard
            icon={Calendar}
            label="Date Found"
            value={format(new Date(item.dateFound), 'MMM d, yyyy')}
          />
          <InfoCard
            icon={MapPin}
            label="Location"
            value={item.locationFound}
          />
          <InfoCard
            icon={Box}
            label="Claim At"
            value={item.claimLocation}
            highlight
          />
          <InfoCard
            icon={Clock}
            label="Hours"
            value="8AM - 5PM"
          />
        </div>

        {/* Notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
          <Info className="shrink-0 text-blue-600 mt-0.5" size={18} />
          <p className="text-sm text-blue-700">
            Bring a valid ID and proof of ownership to <strong>{item.claimLocation}</strong> during office hours.
          </p>
        </div>

        {/* Claim Request Button */}
        {showClaimButton && item.status === 'Unclaimed' && (
          <div className="pt-2">
            {hasExistingClaim ? (
              <div className="w-full py-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-center font-medium">
                You have a pending claim for this item
              </div>
            ) : (
              <button
                onClick={onSubmitClaim}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-600/20"
              >
                <Send size={18} />
                Submit Claim Request
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
});

ItemDetailsModal.displayName = 'ItemDetailsModal';

const InfoCard = React.memo(({ icon: Icon, label, value, highlight }) => (
  <div className={`p-3 rounded-xl ${highlight ? 'bg-blue-50' : 'bg-slate-50'}`}>
    <div className="flex items-center gap-1.5 mb-0.5">
      <Icon size={12} className={highlight ? 'text-blue-500' : 'text-slate-400'} />
      <span className="text-[10px] font-semibold text-slate-500 uppercase">{label}</span>
    </div>
    <p className={`text-sm font-semibold truncate ${highlight ? 'text-blue-700' : 'text-slate-900'}`}>{value}</p>
  </div>
));

InfoCard.displayName = 'InfoCard';
