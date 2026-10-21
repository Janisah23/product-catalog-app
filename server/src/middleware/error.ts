import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../lib/errors.js';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.path}` } });
};

// Express identifies error handlers by their four-argument signature, so `_next` must stay.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      },
    });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON' } });
    return;
  }
  // Firestore FAILED_PRECONDITION (9) means a composite index is missing.
  if (err?.code === 9) {
    console.error('Missing Firestore index:', err.message);
    res.status(500).json({
      error: { code: 'INDEX_REQUIRED', message: 'A Firestore index is missing. Run: firebase deploy --only firestore:indexes' },
    });
    return;
  }
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on the server' } });
};
