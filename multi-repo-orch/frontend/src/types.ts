// Mirrors backend/src/types.ts — contract documented in backend/docs/API.md.
export interface Entry {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  createdMeta?: RequestMeta;
  updatedMeta?: RequestMeta;
}

export interface EntryInput {
  title: string;
  body: string;
}

export interface RequestMeta {
  ip: string | null;
  userAgent: string | null;
}
