import { Router, type Response } from 'express';
import type { EntryStore } from '../store.js';
import { buildMeta, validateCreate, validateUpdate } from '../validation.js';

export function sendError(res: Response, status: number, code: string, message: string) {
  res.status(status).json({ error: { code, message, requestId: res.locals.requestId as string } });
}

export function entriesRouter(store: EntryStore): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.json({ entries: await store.list() });
  });

  router.get('/:id', async (req, res) => {
    const entry = await store.get(req.params.id);
    if (!entry) return sendError(res, 404, 'not_found', `entry ${req.params.id} not found`);
    res.json({ entry });
  });

  router.post('/', async (req, res) => {
    const result = validateCreate(req.body);
    if (!result.ok) return sendError(res, 400, 'invalid_input', result.message);
    res.status(201).json({ entry: await store.create(result.value, buildMeta(req)) });
  });

  router.patch('/:id', async (req, res) => {
    const result = validateUpdate(req.body);
    if (!result.ok) return sendError(res, 400, 'invalid_input', result.message);
    const entry = await store.update(req.params.id, result.value, buildMeta(req));
    if (!entry) return sendError(res, 404, 'not_found', `entry ${req.params.id} not found`);
    res.json({ entry });
  });

  router.delete('/:id', async (req, res) => {
    const removed = await store.remove(req.params.id);
    if (!removed) return sendError(res, 404, 'not_found', `entry ${req.params.id} not found`);
    res.status(204).end();
  });

  return router;
}
