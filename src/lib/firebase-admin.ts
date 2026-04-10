import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (sa) {
      const serviceAccount = JSON.parse(sa);
      
      // Ensure private_key handles newline characters from env variables
      if (typeof serviceAccount.private_key === 'string') {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      });
      console.log('Firebase Admin initialized for project:', serviceAccount.project_id);
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT environment variable is missing');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

// Export the services only when an app exists to avoid build-time crashes
export const adminMessaging = admin.apps.length ? admin.messaging() : (null as any);
export const adminFirestore = admin.apps.length ? admin.firestore() : (null as any);
export const adminAuth = admin.apps.length ? admin.auth() : (null as any);
export const FieldValue = admin.firestore.FieldValue;
