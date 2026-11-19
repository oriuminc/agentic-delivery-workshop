import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile, copyFile, access } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Database, Entry, EntryInput, RequestMeta } from './types.js';

export interface EntryStore {
  list(): Promise<Entry[]>;
  get(id: string): Promise<Entry | undefined>;
  create(input: EntryInput, meta: RequestMeta): Promise<Entry>;
  update(id: string, patch: Partial<EntryInput>, meta: RequestMeta): Promise<Entry | undefined>;
  remove(id: string): Promise<boolean>;
}

/**
 * JSON-file backed store. Reads once, keeps an in-memory copy, and serialises
 * writes through a promise chain so concurrent requests can't interleave.
 * Writes are atomic: write to a temp file, then rename over the real one.
 */
export class JsonFileStore implements EntryStore {
  private db: Database | undefined;
  private writeChain: Promise<void> = Promise.resolve();

  constructor(
    private readonly file: string,
    private readonly seedFile?: string,
    private readonly now: () => Date = () => new Date(),
  ) {}

  private async load(): Promise<Database> {
    if (this.db) return this.db;
    await mkdir(dirname(this.file), { recursive: true });
    const exists = await access(this.file).then(() => true, () => false);
    if (!exists && this.seedFile) await copyFile(this.seedFile, this.file);
    const raw = exists || this.seedFile ? await readFile(this.file, 'utf8') : '{"entries":[]}';
    const parsed = JSON.parse(raw) as Partial<Database>;
    this.db = { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
    return this.db;
  }

  private persist(): Promise<void> {
    const snapshot = JSON.stringify(this.db, null, 2);
    this.writeChain = this.writeChain.then(async () => {
      const tmp = `${this.file}.${process.pid}.tmp`;
      await writeFile(tmp, snapshot, 'utf8');
      await rename(tmp, this.file);
    });
    return this.writeChain;
  }

  async list(): Promise<Entry[]> {
    const db = await this.load();
    return [...db.entries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id: string): Promise<Entry | undefined> {
    return (await this.load()).entries.find((e) => e.id === id);
  }

  async create(input: EntryInput, meta: RequestMeta): Promise<Entry> {
    const db = await this.load();
    const ts = this.now().toISOString();
    const entry: Entry = { id: randomUUID(), ...input, createdAt: ts, updatedAt: ts, createdMeta: meta, updatedMeta: { ...meta } };
    db.entries.push(entry);
    await this.persist();
    return entry;
  }

  async update(id: string, patch: Partial<EntryInput>, meta: RequestMeta): Promise<Entry | undefined> {
    const db = await this.load();
    const entry = db.entries.find((e) => e.id === id);
    if (!entry) return undefined;
    Object.assign(entry, patch, { updatedAt: this.now().toISOString(), updatedMeta: meta });
    await this.persist();
    return entry;
  }

  async remove(id: string): Promise<boolean> {
    const db = await this.load();
    const before = db.entries.length;
    db.entries = db.entries.filter((e) => e.id !== id);
    if (db.entries.length === before) return false;
    await this.persist();
    return true;
  }
}
