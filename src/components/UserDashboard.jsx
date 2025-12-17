import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Clock, CheckCircle, XCircle, Package, Calendar, AlertCircle, FileText } from 'lucide-react';
import { claimRequestService } from '../services/claimRequestService';
import { format, formatDistanceToNow } from 'date-fns';

export const UserDashboard = ({ isOpen, onClose, userId }) => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            loadClaims();
        }
    }, [isOpen, userId]);

    const loadClaims = async () => {
        setLoading(true);
        const data = await claimRequestService.getByUser(userId);
        setClaims(data);
        setLoading(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircle size={16} className="text-emerald-500" />;
            case 'rejected':
                return <XCircle size={16} className="text-red-500" />;
            default:
                return <Clock size={16} className="text-amber-500" />;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="My Claims">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 text-slate-500 pb-3 border-b border-slate-100">
                    <FileText size={16} />
                    <span className="text-sm font-medium">Your claim request history</span>
                </div>

                {/* Claims List */}
                <div className="max-h-[400px] overflow-y-auto -mx-6 px-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3" />
                            <p className="text-sm text-slate-500">Loading claims...</p>
                        </div>
                    ) : claims.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Package className="text-slate-300 mb-3" size={40} />
                            <p className="text-slate-500 font-medium">No claim requests yet</p>
                            <p className="text-sm text-slate-400 text-center mt-1">
                                Submit a claim for an item you've lost to see it here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {claims.map((claim) => {
                                const statusInfo = claimRequestService.getStatusInfo(claim.status);
                                return (
                                    <div
                                        key={claim.id}
                                        className={`p-4 rounded-xl border ${statusInfo.borderColor} ${statusInfo.bgColor}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {getStatusIcon(claim.status)}
                                                    <span className={`text-sm font-semibold ${statusInfo.color}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                </div>
                                                <p className="text-slate-900 font-medium truncate">{claim.itemName}</p>
                                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                                    {claim.proofDescription}
                                                </p>
                                                {claim.adminNotes && claim.status !== 'pending' && (
                                                    <div className="mt-2 p-2 bg-white/50 rounded-lg">
                                                        <p className="text-xs text-slate-400 mb-0.5">Admin response:</p>
                                                        <p className="text-sm text-slate-600">{claim.adminNotes}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-slate-400">
                                                    {formatDistanceToNow(claim.createdAt, { addSuffix: true })}
                                                </p>
                                                <p className="text-[10px] text-slate-300 mt-0.5">
                                                    {format(claim.createdAt, 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
