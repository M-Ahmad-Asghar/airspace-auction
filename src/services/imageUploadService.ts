import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadImage(file: File, userId: string, listingId?: string): Promise<string> {
  try {
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${userId}_${timestamp}_${file.name}`;
    const path = listingId ? `listings/${listingId}/${filename}` : `temp/${filename}`;
    
    // Upload file to Firebase Storage
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function uploadImages(files: (File | string)[], userId: string, listingId?: string): Promise<string[]> {
  try {
    const uploadPromises = files.map(async (file) => {
      if (typeof file === 'string') {
        // Already a URL, return as is
        return file;
      } else {
        // Upload the file and get URL
        return await uploadImage(file, userId, listingId);
      }
    });

    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
}
