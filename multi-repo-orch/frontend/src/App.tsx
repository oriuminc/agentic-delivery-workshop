import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiError } from './api/client';
import { Editor } from './components/Editor';
import { Sidebar } from './components/Sidebar';
import { Toast, type ToastMessage } from './components/Toast';
import type { Entry, EntryInput } from './types';

const EMPTY: EntryInput = { title: '', body: '' };

export function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EntryInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  const selected = useMemo(() => entries.find((e) => e.id === selectedId), [entries, selectedId]);
  const dirty = composing
    ? draft.title !== '' || draft.body !== ''
    : !!selected && (draft.title !== selected.title || draft.body !== selected.body);

  const fail = useCallback((err: unknown, fallback: string) => {
    const e = err instanceof ApiError ? err : undefined;
    setToast({ kind: 'error', text: e?.message ?? fallback, requestId: e?.requestId });
  }, []);

  useEffect(() => {
    api.listEntries()
      .then((list) => {
        setEntries(list);
        if (list[0]) { setEditing(false); setSelectedId(list[0].id); setDraft({ title: list[0].title, body: list[0].body }); }
      })
      .catch((err) => fail(err, 'Could not load entries'))
      .finally(() => setLoading(false));
  }, [fail]);

  const guard = () => !dirty || window.confirm('Discard unsaved changes?');

  const select = (id: string) => {
    if (id === selectedId && !composing) return;
    if (!guard()) return;
    const entry = entries.find((e) => e.id === id);
    setComposing(false);
    setEditing(false);
    setSelectedId(id);
    setDraft(entry ? { title: entry.title, body: entry.body } : EMPTY);
  };

  const startEdit = () => setEditing(true);

  const cancelEdit = () => {
    if (!guard()) return;
    setDraft(selected ? { title: selected.title, body: selected.body } : EMPTY);
    setEditing(false);
  };

  const startNew = () => {
    if (!guard()) return;
    setComposing(true);
    setEditing(true);
    setSelectedId(null);
    setDraft(EMPTY);
  };

  const save = useCallback(async () => {
    if (!editing || saving || draft.title.trim() === '') return;
    setSaving(true);
    try {
      const saved = composing ? await api.createEntry(draft) : await api.updateEntry(selectedId!, draft);
      setEntries((list) => [saved, ...list.filter((e) => e.id !== saved.id)]);
      setComposing(false);
      setEditing(false);
      setSelectedId(saved.id);
      setDraft({ title: saved.title, body: saved.body });
      setToast({ kind: 'success', text: composing ? 'Entry created' : 'Saved' });
    } catch (err) {
      fail(err, 'Could not save entry');
    } finally {
      setSaving(false);
    }
  }, [composing, draft, editing, fail, saving, selectedId]);

  const remove = async () => {
    if (!selectedId) return;
    try {
      await api.deleteEntry(selectedId);
      const rest = entries.filter((e) => e.id !== selectedId);
      setEntries(rest);
      setEditing(false);
      setSelectedId(rest[0]?.id ?? null);
      setDraft(rest[0] ? { title: rest[0].title, body: rest[0].body } : EMPTY);
      setToast({ kind: 'success', text: 'Entry deleted' });
    } catch (err) {
      fail(err, 'Could not delete entry');
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); void save(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const showEditor = composing || !!selected;

  return (
    <div className="layout">
      <Sidebar entries={entries} selectedId={selectedId} loading={loading} onSelect={select} onNew={startNew} />
      <main className="main">
        {showEditor ? (
          <Editor
            key={selected?.id ?? 'new'}
            draft={draft}
            createdAt={selected?.createdAt}
            updatedAt={selected?.updatedAt}
            createdMeta={selected?.createdMeta}
            updatedMeta={selected?.updatedMeta}
            isNew={composing}
            editing={editing}
            onEdit={startEdit}
            onCancel={cancelEdit}
            dirty={dirty}
            saving={saving}
            onChange={setDraft}
            onSave={save}
            onDelete={remove}
          />
        ) : (
          !loading && (
            <section className="empty">
              <h1>A blank page, waiting.</h1>
              <p className="muted">Start your first entry — a sentence is enough.</p>
              <button type="button" className="btn btn-primary" onClick={startNew}>Write your first entry</button>
            </section>
          )
        )}
      </main>
      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
