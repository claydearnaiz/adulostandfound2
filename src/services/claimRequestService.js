import { dbInstance } from './firebase';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    doc,
    serverTimestamp
} from 'firebase/firestore';

const CLAIM_REQUESTS_COLLECTION = 'claimRequests';

/**
 * Claim request service for user claims management
 */
export const claimRequestService = {
    /**
     * Submit a new claim request
     */
    submit: async (itemId, itemName, userId, userName, proofDescription, proofImage = null) => {
        try {
            const docRef = await addDoc(collection(dbInstance, CLAIM_REQUESTS_COLLECTION), {
                itemId,
                itemName,
                userId,
                userName,
                proofDescription,
                proofImage,
                status: 'pending', // pending, approved, rejected
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                adminNotes: ''
            });
            return { id: docRef.id };
        } catch (error) {
            console.error('Error submitting claim request:', error);
            throw error;
        }
    },

    /**
     * Get all pending claim requests (for admins)
     */
    getPending: async () => {
        try {
            const q = query(
                collection(dbInstance, CLAIM_REQUESTS_COLLECTION),
                where('status', '==', 'pending'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate?.() || new Date()
            }));
        } catch (error) {
            console.error('Error fetching pending claims:', error);
            return [];
        }
    },

    /**
     * Get claim requests by user ID
     */
    getByUser: async (userId) => {
        try {
            const q = query(
                collection(dbInstance, CLAIM_REQUESTS_COLLECTION),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate?.() || new Date(),
                updatedAt: d.data().updatedAt?.toDate?.() || new Date()
            }));
        } catch (error) {
            console.error('Error fetching user claims:', error);
            return [];
        }
    },

    /**
     * Approve a claim request
     */
    approve: async (requestId, adminNotes = '') => {
        try {
            const ref = doc(dbInstance, CLAIM_REQUESTS_COLLECTION, requestId);
            await updateDoc(ref, {
                status: 'approved',
                adminNotes,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error approving claim:', error);
            throw error;
        }
    },

    /**
     * Reject a claim request
     */
    reject: async (requestId, adminNotes = '') => {
        try {
            const ref = doc(dbInstance, CLAIM_REQUESTS_COLLECTION, requestId);
            await updateDoc(ref, {
                status: 'rejected',
                adminNotes,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error rejecting claim:', error);
            throw error;
        }
    },

    /**
     * Get claim request by ID
     */
    getById: async (requestId) => {
        try {
            const ref = doc(dbInstance, CLAIM_REQUESTS_COLLECTION, requestId);
            const snapshot = await getDoc(ref);
            if (snapshot.exists()) {
                return {
                    id: snapshot.id,
                    ...snapshot.data(),
                    createdAt: snapshot.data().createdAt?.toDate?.() || new Date()
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching claim request:', error);
            return null;
        }
    },

    /**
     * Check if user has pending claim for an item
     */
    hasPendingClaim: async (itemId, userId) => {
        try {
            const q = query(
                collection(dbInstance, CLAIM_REQUESTS_COLLECTION),
                where('itemId', '==', itemId),
                where('userId', '==', userId),
                where('status', '==', 'pending')
            );
            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking pending claim:', error);
            return false;
        }
    },

    /**
     * Get pending claims count (for admin badge)
     */
    getPendingCount: async () => {
        try {
            const q = query(
                collection(dbInstance, CLAIM_REQUESTS_COLLECTION),
                where('status', '==', 'pending')
            );
            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch (error) {
            console.error('Error getting pending count:', error);
            return 0;
        }
    },

    /**
     * Delete a claim request (user can delete their own claims)
     */
    deleteClaim: async (requestId, userId) => {
        try {
            const ref = doc(dbInstance, CLAIM_REQUESTS_COLLECTION, requestId);
            const snapshot = await getDoc(ref);

            if (!snapshot.exists()) {
                throw new Error('Claim not found');
            }

            // Verify the claim belongs to this user
            if (snapshot.data().userId !== userId) {
                throw new Error('Unauthorized: Cannot delete another user\'s claim');
            }

            await deleteDoc(ref);
            return true;
        } catch (error) {
            console.error('Error deleting claim:', error);
            throw error;
        }
    },

    /**
     * Get approved claims by user (claimed items history)
     */
    getApprovedByUser: async (userId) => {
        try {
            const q = query(
                collection(dbInstance, CLAIM_REQUESTS_COLLECTION),
                where('userId', '==', userId),
                where('status', '==', 'approved'),
                orderBy('updatedAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate?.() || new Date(),
                updatedAt: d.data().updatedAt?.toDate?.() || new Date()
            }));
        } catch (error) {
            console.error('Error fetching approved claims:', error);
            return [];
        }
    },

    /**
     * Get status display info
     */
    getStatusInfo: (status) => {
        const statusMap = {
            'pending': { label: 'Pending', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
            'approved': { label: 'Approved', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
            'rejected': { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
        };
        return statusMap[status] || statusMap['pending'];
    },

    /**
     * Get all users who have made claim requests (admin function)
     */
    getAllUsersWithClaims: async () => {
        try {
            const q = query(
                collection(dbInstance, CLAIM_REQUESTS_COLLECTION),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);

            // Group claims by userId and get unique users
            const usersMap = new Map();
            snapshot.docs.forEach(d => {
                const data = d.data();
                const userId = data.userId;

                if (!usersMap.has(userId)) {
                    usersMap.set(userId, {
                        userId,
                        userName: data.userName,
                        claims: [],
                        pendingCount: 0,
                        approvedCount: 0,
                        rejectedCount: 0,
                        lastActivity: data.createdAt?.toDate?.() || new Date()
                    });
                }

                const user = usersMap.get(userId);
                user.claims.push({
                    id: d.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                    updatedAt: data.updatedAt?.toDate?.() || new Date()
                });

                // Update counts
                if (data.status === 'pending') user.pendingCount++;
                else if (data.status === 'approved') user.approvedCount++;
                else if (data.status === 'rejected') user.rejectedCount++;

                // Track latest activity
                const claimDate = data.createdAt?.toDate?.() || new Date();
                if (claimDate > user.lastActivity) {
                    user.lastActivity = claimDate;
                }
            });

            // Convert to array and sort by last activity
            return Array.from(usersMap.values()).sort((a, b) => b.lastActivity - a.lastActivity);
        } catch (error) {
            console.error('Error fetching users with claims:', error);
            return [];
        }
    }
};
