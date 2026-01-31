import { db, storage } from '@/lib/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDocs,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Project, CreateProjectInput } from '@/lib/types';

export const createProject = async (userId: string, input: CreateProjectInput) => {
    try {
        const docRef = await addDoc(collection(db, 'projects'), {
            userId,
            ...input,
            content: input.content || '',
            color: input.color || '#3b82f6', // Default blue
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
};

export const updateProject = async (projectId: string, data: Partial<CreateProjectInput>) => {
    try {
        const docRef = doc(db, 'projects', projectId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
};

const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Canvas to Blob failed'));
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export const uploadProjectImage = async (projectId: string, file: File) => {
    try {
        // Compress image before upload
        const compressedBlob = await compressImage(file);
        const storageRef = ref(storage, `projects/${projectId}/images/${Date.now()}_optimized.jpg`);
        const snapshot = await uploadBytes(storageRef, compressedBlob);
        const url = await getDownloadURL(snapshot.ref);
        return url;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

export const deleteProject = async (projectId: string) => {
    try {
        await deleteDoc(doc(db, 'projects', projectId));
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
};

// Helper to convert Firestore doc to Project type
export const docToProject = (doc: any): Project => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    } as Project;
};
export const getProjects = async (userId: string): Promise<Project[]> => {
    try {
        const q = query(
            collection(db, 'projects'),
            where('userId', '==', userId),
            orderBy('updatedAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docToProject);
    } catch (error) {
        console.error('Error getting projects:', error);
        throw error;
    }
};
