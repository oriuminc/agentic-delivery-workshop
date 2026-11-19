import { randomUUID } from 'node:crypto';
import express, { type ErrorRequestHandler } from 'express';
import type { EntryStore } from './store.js';
import { silentLogger, type Logger } from './logger.js';
import { entriesRouter, sendError } from './routes/entries.js';

const REQUEST_ID = /^[A-Za-z0-9_-]{1,64}$/;

export interface AppOptions {
  /** Express "trust proxy" value (e.g. "1", "loopback"). Unset/false: X-Forwarded-For is ignored. */
  trustProxy?: string | boolean;
}

export function createApp(store: EntryStore, log: Logger = silentLogger, opts: AppOptions = {}) {
  const app = express();
  if (opts.trustProxy !== undefined && opts.trustProxy !== false && opts.trustProxy !== '') {
    // Numeric strings are hop counts; "true" is refused as it lets clients forge their IP.
    const v = opts.trustProxy;
    if (v === true || v === 'true') throw new Error('trust proxy "true" is unsafe; use a hop count or "loopback"');
    app.set('trust proxy', typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : v);
  }
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  // Request id: honour a well-formed incoming id, otherwise mint one.
  app.use((req, res, next) => {
    const incoming = req.header('x-request-id');
    const id = incoming && REQUEST_ID.test(incoming) ? incoming : randomUUID().slice(0, 8);
    res.locals.requestId = id;
    res.setHeader('x-request-id', id);
    const started = Date.now();
    res.on('finish', () => {
      log(res.statusCode >= 500 ? 'error' : 'info', 'request', {
        // originalUrl, not req.path: routers strip their mount path from req.path.
        requestId: id, method: req.method, path: req.originalUrl.split('?')[0], status: res.statusCode,
        ms: Date.now() - started,
      });
    });
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api/entries', entriesRouter(store));
  app.use((_req, res) => sendError(res, 404, 'not_found', 'route not found'));

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err?.type === 'entity.parse.failed') return sendError(res, 400, 'invalid_json', 'request body is not valid JSON');
    if (err?.type === 'entity.too.large') return sendError(res, 413, 'too_large', 'request body is too large');
    log('error', 'unhandled error', { requestId: res.locals.requestId, error: String(err?.stack ?? err) });
    sendError(res, 500, 'internal', 'something went wrong');
  };
  app.use(onError);
  return app;
}
