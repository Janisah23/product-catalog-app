import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from './config.js';

function createApp() {
  const { FIREBASE_PROJECT_ID: projectId, FIREBASE_CLIENT_EMAIL: clientEmail, FIREBASE_PRIVATE_KEY: key } = config;
  if (clientEmail && key) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey: key.replace(/\\n/g, '\n') }),
      projectId,
    });
  }
  if (config.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp({ credential: applicationDefault(), projectId });
  }
  // No credentials: only works against the Firebase emulators.
  return initializeApp({ projectId });
}

const app = getApps()[0] ?? createApp();

export const adminAuth = getAuth(app);
export const db = getFirestore(app);
export const productsCol = db.collection('products');
export const categoriesCol = db.collection('categories');
export const usersCol = db.collection('users');
/** Each user's cart lives at carts/{uid}/items/{productId}. The uid always comes from the verified token. */
export const cartItemsCol = (uid: string) => db.collection('carts').doc(uid).collection('items');
