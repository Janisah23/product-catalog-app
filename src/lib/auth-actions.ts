import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { api } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Passwords are never handled by our code after the form: Firebase Authentication hashes and stores
 * them (scrypt) and the Express API only ever sees signed ID tokens.
 */
export async function signUp(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await cred.user.getIdToken(true); // refresh so the token carries the new display name
  useAuthStore.getState().setUser({ uid: cred.user.uid, email: cred.user.email, displayName: name });
  await api.get("/me", { auth: true }).catch(() => undefined); // creates the Firestore profile
}

export const logIn = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);

export const logOut = () => signOut(auth);

const FIREBASE_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/user-not-found": "Email or password is incorrect.",
  "auth/wrong-password": "Email or password is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/email-already-in-use": "An account with this email already exists. Log in instead.",
  "auth/weak-password": "Choose a stronger password with at least 8 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
  "auth/network-request-failed": "Can't reach Firebase. Check your connection and try again.",
  "auth/operation-not-allowed": "Email and password sign-in is turned off in the Firebase console.",
};

export function authErrorMessage(err: unknown) {
  const code = (err as { code?: string })?.code;
  return (code && FIREBASE_MESSAGES[code]) || "Something went wrong. Try again.";
}
