import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const lines = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`);
  console.error(`Invalid server environment. Check server/.env (see server/.env.example):\n${lines.join('\n')}`);
  process.exit(1);
}

export const config = parsed.data;
