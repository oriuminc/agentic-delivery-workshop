import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type Level = 'info' | 'warn' | 'error';
export type LogFields = Record<string, unknown>;
export type Logger = (level: Level, msg: string, fields?: LogFields) => void;

/**
 * Structured JSON-lines logger. Every line carries a requestId when one is
 * known, so `/rca <requestId>` can grep a single request across systems.
 */
export function createLogger(file?: string, echo = true): Logger {
  if (file) mkdirSync(dirname(file), { recursive: true });
  return (level, msg, fields = {}) => {
    const line = JSON.stringify({ ts: new Date().toISOString(), level, service: 'folio-backend', msg, ...fields });
    if (echo) (level === 'error' ? console.error : console.log)(line);
    if (file) appendFileSync(file, line + '\n');
  };
}

export const silentLogger: Logger = () => {};
