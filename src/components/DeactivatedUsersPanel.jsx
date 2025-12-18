import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { UserX, RefreshCw, Clock, Mail, Shield, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { userService } from '../services/userService';
import { format, formatDistanceToNow } from 'date-fns';

export const DeactivatedUsersPanel = ({ isOpen, onClose }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reactivatingId, setReactivatingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadDeactivatedUsers();
        }
    }, [isOpen]);

    const loadDeactivatedUsers = async () => {
        setLoading(true);
        const data = await userService.getDeactivatedUsers();
        setUsers(data);
        setLoading(false);
    };

    const handleReactivate = async (email) => {
        setReactivatingId(email);
        setSuccessMessage('');
        try {
            await userService.reactivateUser(email);
            setSuccessMessage(`Successfully reactivated ${email}`);
            // Remove from list
            setUsers(users.filter(u => u.email !== email));
        } catch (error) {
            console.error('Error reactivating user:', error);
        } finally {
            setReactivatingId(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Deactivated Users" size="large">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 text-slate-500 pb-3 border-b border-slate-100">
                    <UserX size={16} />
                    <span className="text-sm font-medium">
                        Users deactivated due to failed login attempts
                    </span>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
                        <CheckCircle size={16} />
                        {successMessage}
                    </div>
                )}

                {/* Users List */}
                <div className="max-h-[400px] overflow-y-auto -mx-6 px-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3" />
                            <p className="text-sm text-slate-500">Loading deactivated users...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="p-4 bg-emerald-50 rounded-full mb-3">
                                <Shield className="text-emerald-500" size={32} />
                            </div>
                            <p className="text-slate-500 font-medium">No deactivated users</p>
                            <p className="text-sm text-slate-400 text-center mt-1">
                                All user accounts are currently active
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="p-4 rounded-xl border border-red-100 bg-red-50/50"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 bg-red-100 rounded-lg">
                                                    <UserX size={14} className="text-red-500" />
                                                </div>
                                                <span className="text-sm font-semibold text-red-700">
                                                    Deactivated Account
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 mb-1">
                                                <Mail size={14} className="text-slate-400" />
                                                <p className="text-slate-900 font-medium">{user.email}</p>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                                                <div className="flex items-center gap-1">
                                                    <AlertTriangle size={12} />
                                                    <span>{user.attempts} failed attempts</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    <span>
                                                        {formatDistanceToNow(user.deactivatedAt, { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-[10px] text-slate-400 mt-1">
                                                Deactivated on {format(user.deactivatedAt, 'MMM d, yyyy \'at\' h:mm a')}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleReactivate(user.email)}
                                            disabled={reactivatingId === user.email}
                                            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                        >
                                            {reactivatingId === user.email ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    Reactivating...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw size={14} />
                                                    Reactivate
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Footer */}
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500">
                    <p className="flex items-start gap-2">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-500" />
                        Users are automatically deactivated after 3 failed login attempts.
                        Reactivating will reset their attempt count and allow them to log in again.
                    </p>
                </div>
            </div>
        </Modal>
    );
};
