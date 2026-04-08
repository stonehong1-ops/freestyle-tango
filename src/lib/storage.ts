import { storage } from './firebase';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTask,
  StorageError
} from 'firebase/storage';

/**
 * 1. Safe Storage Utility
 * Prevents app crashes in restricted environments (KakaoTalk, iOS Private Mode, etc.)
 */
export const SafeStorage = {
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`[SafeStorage] Error reading ${key}:`, e);
      return null;
    }
  },

  set: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[SafeStorage] Error writing ${key}:`, e);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[SafeStorage] Error removing ${key}:`, e);
    }
  },

  getJson: <T>(key: string): T | null => {
    const val = SafeStorage.get(key);
    if (!val) return null;
    try {
      return JSON.parse(val) as T;
    } catch (e) {
      console.error(`[SafeStorage] JSON Parse Error for ${key}:`, e);
      SafeStorage.remove(key);
      return null;
    }
  },

  setJson: (key: string, value: any): void => {
    try {
      const str = JSON.stringify(value);
      SafeStorage.set(key, str);
    } catch (e) {
      console.error(`[SafeStorage] JSON Stringify Error for ${key}:`, e);
    }
  }
};

/**
 * 2. File Upload Utility
 * Common file upload utility for Firebase Storage.
 */
export const dataURLtoBlob = (dataURL: string): Blob => {
  const parts = dataURL.split(',');
  if (parts.length < 2) throw new Error('Invalid Data URL');

  const byteString = atob(parts[1]);
  const mimeString = parts[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  metadata?: any;
}

export const uploadFile = async (
  input: File | Blob | string,
  path: string,
  options?: UploadOptions
): Promise<string> => {
  let blob: Blob;

  if (typeof input === 'string' && input.startsWith('data:')) {
    blob = dataURLtoBlob(input);
  } else if (typeof input === 'string') {
    throw new Error('Input must be a File, Blob, or Data URL');
  } else {
    blob = input;
  }

  const storageRef = ref(storage, path);
  const uploadTask: UploadTask = uploadBytesResumable(storageRef, blob, options?.metadata);

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (options?.onProgress) {
          options.onProgress(Math.round(progress));
        }
      },
      (error: StorageError) => {
        console.error('Upload Error at path:', path, error);
        let message = '업로드 중 오류가 발생했습니다.';
        if (error.code === 'storage/unauthorized') {
          message = '업로드 권한이 없습니다. (관리자 로그인을 확인해주세요)';
        } else {
          message += ` (${error.message})`;
        }
        reject(new Error(message));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (err: any) {
          reject(new Error(`다운로드 URL을 가져오는데 실패했습니다: ${err.message}`));
        }
      }
    );
  });
};
