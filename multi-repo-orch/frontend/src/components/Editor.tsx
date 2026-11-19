import { useState } from 'react';
import type { EntryInput, RequestMeta } from '../types';
import { MetaPanel } from './MetaPanel';
import { longDate, relativeTime } from '../format';

interface Props {
  draft: EntryInput;
  createdAt?: string;
  updatedAt?: string;
  createdMeta?: RequestMeta;
  updatedMeta?: RequestMeta;
  isNew: boolean;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  dirty: boolean;
  saving: boolean;
  onChange: (draft: EntryInput) => void;
  onSave: () => void;
  onDelete: () => void;
}

export function Editor({ draft, createdAt, updatedAt, createdMeta, updatedMeta, isNew, editing, onEdit, onCancel, dirty, saving, onChange, onSave, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const canSave = dirty && draft.title.trim() !== '' && !saving;
  const status = saving ? 'Saving…' : dirty ? 'Unsaved changes' : updatedAt ? `Saved ${relativeTime(updatedAt)}` : '';

  const deleteControl = confirming ? (
    <span className="confirm">
      Delete this entry?
      <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
      <button type="button" className="btn btn-danger" onClick={() => { setConfirming(false); onDelete(); }}>
        Delete
      </button>
    </span>
  ) : (
    <button type="button" className="btn btn-ghost" onClick={() => setConfirming(true)}>Delete</button>
  );

  if (!editing) {
    return (
      <article className="paper">
        <p className="eyebrow">{createdAt ? longDate(createdAt) : longDate(new Date().toISOString())}</p>
        <ReadView title={draft.title} body={draft.body} />
        {!isNew && <MetaPanel createdMeta={createdMeta} updatedMeta={updatedMeta} />}
        <footer className="editor-bar">
          <span className="status" role="status">{status}</span>
          <div className="actions">
            {deleteControl}
            <button type="button" className="btn btn-primary" onClick={onEdit}>Edit</button>
          </div>
        </footer>
      </article>
    );
  }

  return (
    <article className="paper">
      <p className="eyebrow">{createdAt ? longDate(createdAt) : longDate(new Date().toISOString())}</p>
      <input
        className="title-input"
        aria-label="Title"
        placeholder="Give this entry a title"
        value={draft.title}
        maxLength={200}
        autoFocus={isNew}
        onChange={(e) => onChange({ ...draft, title: e.target.value })}
      />
      <textarea
        className="body-input"
        aria-label="Entry"
        placeholder="What's on your mind?"
        value={draft.body}
        onChange={(e) => onChange({ ...draft, body: e.target.value })}
      />

      {!isNew && <MetaPanel createdMeta={createdMeta} updatedMeta={updatedMeta} />}

      <footer className="editor-bar">
        <span className={`status${dirty ? ' is-dirty' : ''}`} role="status">{status}</span>
        <div className="actions">
          {!isNew && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
          <button type="button" className="btn btn-primary" disabled={!canSave} onClick={onSave} title="Save (⌘S)">
            {isNew ? 'Create entry' : 'Save'}
          </button>
        </div>
      </footer>
    </article>
  );
}

function ReadView({ title, body }: { title: string; body: string }) {
  return (
    <>
      <h1 className="read-title">{title}</h1>
      <div className="entry-body">{body}</div>
    </>
  );
}
