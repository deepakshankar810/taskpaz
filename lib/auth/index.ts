import { signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import type { User, UserPreferences } from '@/lib/types';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await createOrUpdateUserProfile(user);
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const createOrUpdateUserProfile = async (user: FirebaseUser) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    const userData = {
      email: user.email || '',
      name: user.displayName || 'User',
      avatar: user.photoURL || '',
      updatedAt: serverTimestamp(),
    };

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
      });
    } else {
      await setDoc(userRef, userData, { merge: true });
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    // Suppress error so login can proceed even if profile sync fails
  }
};

export const updateUserPreferences = async (userId: string, preferences: Partial<UserPreferences>) => {
  try {
    const userRef = doc(db, 'users', userId);
    // We use setDoc with merge: true to avoid overwriting other fields if we just want to patch preferences
    // But since preferences is a nested object, we should be careful. 
    // Using dot notation for updates is safer if we want to update just one field, but setDoc merge is fine if we pass the whole object structure we want merged.
    await setDoc(userRef, { preferences }, { merge: true });
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
};
