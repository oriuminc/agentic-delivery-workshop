import type { Entry } from '../types';
import { excerpt, relativeTime } from '../format';

interface Props {
  entries: Entry[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function Sidebar({ entries, selectedId, loading, onSelect, onNew }: Props) {
  return (
    <aside className="sidebar">
      <header className="brand">
        <span className="brand-mark" aria-hidden="true">F</span>
        <span className="brand-name">Folio</span>
      </header>

      <button type="button" className="btn btn-primary btn-block" onClick={onNew}>
        <span aria-hidden="true">＋</span> New entry
      </button>

      <p className="sidebar-label">
        Entries <span className="count">{entries.length}</span>
      </p>

      {loading ? (
        <p className="muted pad">Loading…</p>
      ) : (
        <ul className="entry-list" aria-label="Journal entries">
          {entries.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                className={`entry-item${e.id === selectedId ? ' is-active' : ''}`}
                aria-current={e.id === selectedId ? 'true' : undefined}
                onClick={() => onSelect(e.id)}
              >
                <span className="entry-title">{e.title}</span>
                <span className="entry-meta">{relativeTime(e.updatedAt)}</span>
                {e.body && <span className="entry-excerpt">{excerpt(e.body)}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
