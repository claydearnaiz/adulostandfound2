import { dbInstance } from './firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    where,
    deleteDoc,
    doc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

const ACTIVITY_LOGS_COLLECTION = 'activityLogs';
const RETENTION_DAYS = 60;

/**
 * Activity log service for tracking admin actions
 */
export const activityLogService = {
    /**
     * Log an activity
     * @param {string} action - Action type: 'add', 'edit', 'delete', 'claim', 'claim_approve', 'claim_reject'
     * @param {object} user - User object with uid and displayName/email
     * @param {object} itemData - Item data (at minimum: id, name)
     * @param {string} details - Optional additional details
     */
    log: async (action, user, itemData, details = '') => {
        try {
            await addDoc(collection(dbInstance, ACTIVITY_LOGS_COLLECTION), {
                action,
                userId: user?.uid || 'unknown',
                userName: user?.displayName || user?.email?.split('@')[0] || 'Unknown User',
                itemId: itemData?.id || null,
                itemName: itemData?.name || 'Unknown Item',
                details,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error('Error logging activity:', error);
            // Don't throw - logging failures shouldn't break the main operation
        }
    },

    /**
     * Get recent activity logs
     * @param {number} maxItems - Maximum number of logs to retrieve
     */
    getRecentLogs: async (maxItems = 50) => {
        try {
            const q = query(
                collection(dbInstance, ACTIVITY_LOGS_COLLECTION),
                orderBy('timestamp', 'desc'),
                limit(maxItems)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                timestamp: d.data().timestamp?.toDate?.() || new Date()
            }));
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            return [];
        }
    },

    /**
     * Clean up logs older than retention period (60 days)
     * Should be called periodically (e.g., on admin login)
     */
    cleanupOldLogs: async () => {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
            const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

            const q = query(
                collection(dbInstance, ACTIVITY_LOGS_COLLECTION),
                where('timestamp', '<', cutoffTimestamp)
            );

            const snapshot = await getDocs(q);
            const deletePromises = snapshot.docs.map(d =>
                deleteDoc(doc(dbInstance, ACTIVITY_LOGS_COLLECTION, d.id))
            );

            await Promise.all(deletePromises);
            console.log(`Cleaned up ${snapshot.docs.length} old activity logs`);
            return snapshot.docs.length;
        } catch (error) {
            console.error('Error cleaning up old logs:', error);
            return 0;
        }
    },

    /**
     * Get action display info
     */
    getActionInfo: (action) => {
        const actionMap = {
            'add': { label: 'Added item', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
            'edit': { label: 'Edited item', color: 'text-blue-600', bgColor: 'bg-blue-50' },
            'delete': { label: 'Deleted item', color: 'text-red-600', bgColor: 'bg-red-50' },
            'claim': { label: 'Marked as claimed', color: 'text-purple-600', bgColor: 'bg-purple-50' },
            'claim_request': { label: 'Claim request submitted', color: 'text-amber-600', bgColor: 'bg-amber-50' },
            'claim_approve': { label: 'Approved claim', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
            'claim_reject': { label: 'Rejected claim', color: 'text-red-600', bgColor: 'bg-red-50' },
            'bulk_claim': { label: 'Bulk marked as claimed', color: 'text-purple-600', bgColor: 'bg-purple-50' },
            'bulk_delete': { label: 'Bulk deleted items', color: 'text-red-600', bgColor: 'bg-red-50' }
        };
        return actionMap[action] || { label: action, color: 'text-slate-600', bgColor: 'bg-slate-50' };
    }
};
