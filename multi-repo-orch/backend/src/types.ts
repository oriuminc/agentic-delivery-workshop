// Contract types — mirrored in frontend/src/types.ts. Keep docs/API.md in sync.
export interface RequestMeta {
  ip: string | null; // req.ip; null if unavailable
  userAgent: string | null; // sanitised, max 256 chars; null if absent
}

export interface Entry {
  id: string;
  title: string;
  body: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdMeta?: RequestMeta; // server-set; absent on legacy entries
  updatedMeta?: RequestMeta; // server-set; last editor
}

export interface EntryInput {
  title: string;
  body: string;
}

export interface Database {
  entries: Entry[];
}

export interface ApiError {
  error: { code: string; message: string; requestId: string };
}
