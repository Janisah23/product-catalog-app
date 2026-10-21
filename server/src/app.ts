import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { cartRouter } from './routes/cart.js';
import { meRouter } from './routes/me.js';
import { categoriesRouter, productsRouter } from './routes/products.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: config.CLIENT_ORIGIN.split(',').map((o) => o.trim()),
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/me', meRouter);
  app.use('/api/cart', cartRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
