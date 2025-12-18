import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from './Modal';
import { Clock, CheckCircle, XCircle, User, Package, MessageSquare, Image, RefreshCw, AlertCircle } from 'lucide-react';
import { claimRequestService } from '../services/claimRequestService';
import { format, formatDistanceToNow } from 'date-fns';

export const ClaimRequestsPanel = ({ isOpen, onClose, onClaimAction }) => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [adminNotes, setAdminNotes] = useState({});
    const [zoomedImage, setZoomedImage] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadClaims();
        }
    }, [isOpen]);

    const loadClaims = async () => {
        setLoading(true);
        const data = await claimRequestService.getPending();
        setClaims(data);
        setLoading(false);
    };

    const handleApprove = async (claim) => {
        if (!window.confirm(`Approve claim for "${claim.itemName}" by ${claim.userName}?`)) return;

        setActionLoading(claim.id);
        try {
            await claimRequestService.approve(claim.id, adminNotes[claim.id] || '');
            await onClaimAction('approve', claim);
            loadClaims();
        } catch (error) {
            console.error('Error approving claim:', error);
            alert('Failed to approve claim');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (claim) => {
        if (!window.confirm(`Reject claim for "${claim.itemName}" by ${claim.userName}?`)) return;

        setActionLoading(claim.id);
        try {
            await claimRequestService.reject(claim.id, adminNotes[claim.id] || '');
            await onClaimAction('reject', claim);
            loadClaims();
        } catch (error) {
            console.error('Error rejecting claim:', error);
            alert('Failed to reject claim');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Pending Claim Requests">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Clock size={16} />
                            <span className="text-sm font-medium">
                                {claims.length} pending request{claims.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <button
                            onClick={loadClaims}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Refresh"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {/* Claims List */}
                    <div className="max-h-[500px] overflow-y-auto -mx-6 px-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <RefreshCw className="animate-spin text-blue-500 mb-3" size={24} />
                                <p className="text-sm text-slate-500">Loading requests...</p>
                            </div>
                        ) : claims.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <CheckCircle className="text-emerald-300 mb-3" size={40} />
                                <p className="text-slate-500 font-medium">No pending requests</p>
                                <p className="text-sm text-slate-400">All caught up!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {claims.map((claim) => (
                                    <div
                                        key={claim.id}
                                        className="p-4 rounded-xl border border-amber-200 bg-amber-50"
                                    >
                                        {/* Claim header */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                                    <User size={18} className="text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{claim.userName}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {formatDistanceToNow(claim.createdAt, { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-lg">
                                                <Clock size={12} className="text-amber-600" />
                                                <span className="text-xs font-semibold text-amber-600">Pending</span>
                                            </div>
                                        </div>

                                        {/* Item info */}
                                        <div className="flex items-center gap-2 mb-3 p-2 bg-white/60 rounded-lg">
                                            <Package size={14} className="text-slate-400" />
                                            <span className="text-sm font-medium text-slate-700">Claiming: {claim.itemName}</span>
                                        </div>

                                        {/* Proof description */}
                                        <div className="mb-3">
                                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Proof of ownership</p>
                                            <p className="text-sm text-slate-700 bg-white/60 p-3 rounded-lg">
                                                {claim.proofDescription}
                                            </p>
                                        </div>

                                        {/* Proof image */}
                                        {claim.proofImage && (
                                            <div className="mb-3">
                                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Attached image</p>
                                                <img
                                                    src={claim.proofImage}
                                                    alt="Proof"
                                                    className="h-32 w-full object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => setZoomedImage(claim.proofImage)}
                                                    title="Click to zoom"
                                                />
                                            </div>
                                        )}

                                        {/* Admin notes */}
                                        <div className="mb-3">
                                            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
                                                Response to user (optional)
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                placeholder="Add a note for the user..."
                                                value={adminNotes[claim.id] || ''}
                                                onChange={(e) => setAdminNotes({ ...adminNotes, [claim.id]: e.target.value })}
                                            />
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(claim)}
                                                disabled={actionLoading === claim.id}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                                            >
                                                <CheckCircle size={16} />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(claim)}
                                                disabled={actionLoading === claim.id}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                                            >
                                                <XCircle size={16} />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Image Zoom Modal - Rendered via Portal to escape Modal's overflow */}
            {zoomedImage && createPortal(
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 cursor-pointer"
                    onClick={() => setZoomedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setZoomedImage(null);
                            }}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2"
                        >
                            <XCircle size={36} />
                        </button>
                        <img
                            src={zoomedImage}
                            alt="Proof - Zoomed"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <p className="text-center text-white/60 text-sm mt-4">Click anywhere to close</p>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
