import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { createLogger } from './logger.js';
import { JsonFileStore } from './store.js';

const root = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const port = Number(process.env.PORT ?? 4000);
const log = createLogger(process.env.LOG_FILE ?? root('logs/app.log'));
const store = new JsonFileStore(process.env.DB_FILE ?? root('data/db.json'), root('data/seed.json'));

createApp(store, log, { trustProxy: process.env.TRUST_PROXY }).listen(port, () => log('info', 'listening', { port }));
