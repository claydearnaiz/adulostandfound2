import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from './Modal';
import { Users, Clock, CheckCircle, XCircle, ChevronRight, RefreshCw, Search, User } from 'lucide-react';
import { claimRequestService } from '../services/claimRequestService';
import { formatDistanceToNow, format } from 'date-fns';

export const UsersPanel = ({ isOpen, onClose }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [zoomedImage, setZoomedImage] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadUsers();
        }
    }, [isOpen]);

    const loadUsers = async () => {
        setLoading(true);
        const data = await claimRequestService.getAllUsersWithClaims();
        setUsers(data);
        setLoading(false);
    };

    const filteredUsers = users.filter(user =>
        user.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircle size={14} className="text-emerald-500" />;
            case 'rejected':
                return <XCircle size={14} className="text-red-500" />;
            default:
                return <Clock size={14} className="text-amber-500" />;
        }
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={() => {
                    setSelectedUser(null);
                    onClose();
                }}
                title={selectedUser ? `${selectedUser.userName}'s Claims` : "Users & Claims History"}
            >
                <div className="space-y-4">
                    {!selectedUser ? (
                        <>
                            {/* Header / Search */}
                            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Users size={16} />
                                    <span className="text-sm font-medium">
                                        {users.length} user{users.length !== 1 ? 's' : ''} with claims
                                    </span>
                                </div>
                                <div className="flex-1" />
                                <button
                                    onClick={loadUsers}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title="Refresh"
                                >
                                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Users List */}
                            <div className="max-h-[400px] overflow-y-auto -mx-6 px-6">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <RefreshCw className="animate-spin text-blue-500 mb-3" size={24} />
                                        <p className="text-sm text-slate-500">Loading users...</p>
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Users className="text-slate-300 mb-3" size={40} />
                                        <p className="text-slate-500 font-medium">
                                            {searchQuery ? 'No users found' : 'No users with claims yet'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredUsers.map((user) => (
                                            <button
                                                key={user.userId}
                                                onClick={() => setSelectedUser(user)}
                                                className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-200 transition-all text-left group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                                        {user.userName?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-900 truncate">{user.userName}</p>
                                                        <p className="text-xs text-slate-400">
                                                            Last activity {formatDistanceToNow(user.lastActivity, { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {/* Stats badges */}
                                                        <div className="flex items-center gap-1.5 text-xs">
                                                            {user.pendingCount > 0 && (
                                                                <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg">
                                                                    <Clock size={12} />
                                                                    {user.pendingCount}
                                                                </span>
                                                            )}
                                                            {user.approvedCount > 0 && (
                                                                <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                                                                    <CheckCircle size={12} />
                                                                    {user.approvedCount}
                                                                </span>
                                                            )}
                                                            {user.rejectedCount > 0 && (
                                                                <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-lg">
                                                                    <XCircle size={12} />
                                                                    {user.rejectedCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Back button and user info */}
                            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                >
                                    <ChevronRight size={16} className="rotate-180" />
                                </button>
                                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                    {selectedUser.userName?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{selectedUser.userName}</p>
                                    <p className="text-xs text-slate-400">{selectedUser.claims.length} total claims</p>
                                </div>
                            </div>

                            {/* User's Claims List */}
                            <div className="max-h-[400px] overflow-y-auto -mx-6 px-6">
                                <div className="space-y-3">
                                    {selectedUser.claims.map((claim) => {
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

                                                {/* Proof image */}
                                                {claim.proofImage && (
                                                    <div className="mt-3">
                                                        <img
                                                            src={claim.proofImage}
                                                            alt="Proof"
                                                            className="h-24 w-full object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                                                            onClick={() => setZoomedImage(claim.proofImage)}
                                                            title="Click to zoom"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Image Zoom Modal - Rendered via Portal to escape Modal's overflow */}
            {
                zoomedImage && createPortal(
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
                )
            }
        </>
    );
};
