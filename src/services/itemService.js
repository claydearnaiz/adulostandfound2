import { dbInstance } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const ITEMS_COLLECTION = 'items';

export const itemService = {
  getAll: async () => {
    try {
      const snapshot = await getDocs(collection(dbInstance, ITEMS_COLLECTION));
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error fetching items:', error);
      return [];
    }
  },

  add: async (item) => {
    try {
      const payload = { ...item, createdAt: serverTimestamp() };
      const docRef = await addDoc(collection(dbInstance, ITEMS_COLLECTION), payload);
      return { id: docRef.id, ...item };
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const ref = doc(dbInstance, ITEMS_COLLECTION, id);
      await updateDoc(ref, data);
      return { id, ...data };
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const ref = doc(dbInstance, ITEMS_COLLECTION, id);
      await deleteDoc(ref);
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },
};