import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { usersCol } from '../firebase.js';
import { requireAuth } from '../middleware/auth.js';

export const meRouter = Router();

// GET /api/me: verifies the token and keeps a profile document in Firestore.
meRouter.get('/', requireAuth, async (req, res) => {
  const { uid, email, name } = req.user!;
  const ref = usersCol.doc(uid);
  const existing = await ref.get();
  await ref.set(
    {
      email: email ?? null,
      displayName: name ?? null,
      lastLoginAt: FieldValue.serverTimestamp(),
      ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true },
  );
  res.json({ data: { uid, email: email ?? null, displayName: name ?? null } });
});
