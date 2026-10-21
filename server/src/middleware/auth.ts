import type { NextFunction, Request, Response } from 'express';
import { adminAuth } from '../firebase.js';
import { unauthorized } from '../lib/errors.js';

/** Verifies the Firebase ID token on every call. req.user.uid is the only identity the cart routes use. */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw unauthorized('Missing bearer token');
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name };
  } catch {
    throw unauthorized('Invalid or expired token');
  }
  next();
}
