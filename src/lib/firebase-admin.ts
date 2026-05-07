import * as admin from 'firebase-admin';

function getAdminApp() {
  if (!admin.apps.length) {
    try {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      if (privateKey) {
        // Handle escaped newlines and potential extra quotes from Vercel
        privateKey = privateKey.replace(/\\n/g, '\n').trim();
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
          privateKey = privateKey.substring(1, privateKey.length - 1);
        }
      }
      
      if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        console.warn('Firebase Admin credentials missing - skipping initialization');
        return null;
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
    } catch (error) {
      console.error('Firebase admin initialization error', error);
      return null;
    }
  }
  return admin.apps[0];
}

export const adminDb = {
  ref: (path: string) => {
    const app = getAdminApp();
    if (!app) throw new Error('Firebase Admin not initialized');
    return admin.database(app).ref(path);
  }
};

export const adminAuth = {
  verifyIdToken: async (token: string) => {
    const app = getAdminApp();
    if (!app) throw new Error('Firebase Admin not initialized');
    return admin.auth(app).verifyIdToken(token);
  }
};

export default admin;
