import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { History, Clock, User, Package, AlertCircle, RefreshCw } from 'lucide-react';
import { activityLogService } from '../services/activityLogService';
import { format, formatDistanceToNow } from 'date-fns';

export const ActivityLogModal = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadLogs();
            // Cleanup old logs when modal opens
            activityLogService.cleanupOldLogs();
        }
    }, [isOpen]);

    const loadLogs = async () => {
        setLoading(true);
        const data = await activityLogService.getRecentLogs(100);
        setLogs(data);
        setLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Activity Log">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500">
                        <History size={16} />
                        <span className="text-sm font-medium">Recent activity (last 60 days)</span>
                    </div>
                    <button
                        onClick={loadLogs}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Log List */}
                <div className="max-h-[400px] overflow-y-auto -mx-6 px-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <RefreshCw className="animate-spin text-blue-500 mb-3" size={24} />
                            <p className="text-sm text-slate-500">Loading activity...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="text-slate-300 mb-3" size={32} />
                            <p className="text-slate-500 font-medium">No activity yet</p>
                            <p className="text-sm text-slate-400">Actions will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log) => {
                                const actionInfo = activityLogService.getActionInfo(log.action);
                                return (
                                    <div
                                        key={log.id}
                                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                                    >
                                        <div className={`p-2 rounded-lg ${actionInfo.bgColor} shrink-0`}>
                                            <Package size={14} className={actionInfo.color} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-900">
                                                <span className="font-semibold">{log.userName}</span>
                                                {' '}
                                                <span className={actionInfo.color}>{actionInfo.label}</span>
                                            </p>
                                            <p className="text-sm text-slate-600 truncate">
                                                {log.itemName}
                                            </p>
                                            {log.details && (
                                                <p className="text-xs text-slate-400 mt-1">{log.details}</p>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs text-slate-400">
                                                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                            </p>
                                            <p className="text-[10px] text-slate-300 mt-0.5">
                                                {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                                            </p>
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
