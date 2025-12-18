import { dbInstance } from './firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

const USERS_COLLECTION = 'users';
const LOGIN_ATTEMPTS_COLLECTION = 'loginAttempts';

/**
 * User service for managing user accounts and login attempts
 */
export const userService = {
    /**
     * Get login attempts for an email
     */
    getLoginAttempts: async (email) => {
        try {
            const ref = doc(dbInstance, LOGIN_ATTEMPTS_COLLECTION, email.toLowerCase());
            const snapshot = await getDoc(ref);
            if (snapshot.exists()) {
                return snapshot.data();
            }
            return { attempts: 0, isDeactivated: false };
        } catch (error) {
            console.error('Error getting login attempts:', error);
            return { attempts: 0, isDeactivated: false };
        }
    },

    /**
     * Increment failed login attempts for an email
     * Returns true if account is now deactivated
     */
    incrementLoginAttempts: async (email) => {
        try {
            const normalizedEmail = email.toLowerCase();
            const ref = doc(dbInstance, LOGIN_ATTEMPTS_COLLECTION, normalizedEmail);
            const snapshot = await getDoc(ref);

            let currentAttempts = 0;
            if (snapshot.exists()) {
                currentAttempts = snapshot.data().attempts || 0;
            }

            const newAttempts = currentAttempts + 1;
            const isDeactivated = newAttempts >= 3;

            await setDoc(ref, {
                email: normalizedEmail,
                attempts: newAttempts,
                isDeactivated,
                lastAttempt: serverTimestamp(),
                ...(isDeactivated && { deactivatedAt: serverTimestamp() })
            }, { merge: true });

            return { attempts: newAttempts, isDeactivated };
        } catch (error) {
            console.error('Error incrementing login attempts:', error);
            throw error;
        }
    },

    /**
     * Reset login attempts for an email (on successful login)
     */
    resetLoginAttempts: async (email) => {
        try {
            const ref = doc(dbInstance, LOGIN_ATTEMPTS_COLLECTION, email.toLowerCase());
            await setDoc(ref, {
                email: email.toLowerCase(),
                attempts: 0,
                isDeactivated: false,
                lastAttempt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error resetting login attempts:', error);
        }
    },

    /**
     * Check if an email is deactivated
     */
    isDeactivated: async (email) => {
        try {
            const data = await userService.getLoginAttempts(email);
            return data.isDeactivated || false;
        } catch (error) {
            console.error('Error checking deactivation status:', error);
            return false;
        }
    },

    /**
     * Reactivate a user account (admin function)
     */
    reactivateUser: async (email) => {
        try {
            const ref = doc(dbInstance, LOGIN_ATTEMPTS_COLLECTION, email.toLowerCase());
            await updateDoc(ref, {
                attempts: 0,
                isDeactivated: false,
                reactivatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error reactivating user:', error);
            throw error;
        }
    },

    /**
     * Get all deactivated users (admin function)
     */
    getDeactivatedUsers: async () => {
        try {
            const q = query(
                collection(dbInstance, LOGIN_ATTEMPTS_COLLECTION),
                where('isDeactivated', '==', true),
                orderBy('deactivatedAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                deactivatedAt: d.data().deactivatedAt?.toDate?.() || new Date(),
                lastAttempt: d.data().lastAttempt?.toDate?.() || new Date()
            }));
        } catch (error) {
            console.error('Error fetching deactivated users:', error);
            return [];
        }
    },

    /**
     * Get deactivated users count
     */
    getDeactivatedCount: async () => {
        try {
            const q = query(
                collection(dbInstance, LOGIN_ATTEMPTS_COLLECTION),
                where('isDeactivated', '==', true)
            );
            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch (error) {
            console.error('Error getting deactivated count:', error);
            return 0;
        }
    }
};
