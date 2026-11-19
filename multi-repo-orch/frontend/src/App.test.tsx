import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { api, ApiError } from './api/client';
import type { Entry } from './types';

vi.mock('./api/client', async (orig) => {
  const mod = await orig<typeof import('./api/client')>();
  return {
    ...mod,
    api: { listEntries: vi.fn(), createEntry: vi.fn(), updateEntry: vi.fn(), deleteEntry: vi.fn() },
  };
});

const mocked = vi.mocked(api);
const entry = (over: Partial<Entry> = {}): Entry => ({
  id: 'e1', title: 'Rainy Sunday', body: 'Tea and a book.',
  createdAt: '2026-11-15T10:00:00.000Z', updatedAt: '2026-11-15T10:00:00.000Z', ...over,
});

beforeEach(() => vi.resetAllMocks());

describe('App', () => {
  // Tests the first-load experience with existing entries.
  // Params: API returns one entry "Rainy Sunday".
  // Expected: it's listed in the sidebar and opened in the editor.
  it('lists entries and opens the newest one', async () => {
    mocked.listEntries.mockResolvedValue([entry()]);
    render(<App />);
    expect(await screen.findByRole('button', { name: /Rainy Sunday/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Rainy Sunday' })).toBeInTheDocument();
    expect(within(screen.getByRole('article')).getByText('Tea and a book.')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  // Tests the empty state when there are no entries yet.
  // Params: API returns [].
  // Expected: the "A blank page" heading and a call-to-action are shown.
  it('shows an empty state with no entries', async () => {
    mocked.listEntries.mockResolvedValue([]);
    render(<App />);
    expect(await screen.findByText('A blank page, waiting.')).toBeInTheDocument();
  });

  // Tests creating an entry end-to-end through the UI.
  // Params: user types title "New day" and body "Fresh start"; createEntry echoes it back.
  // Expected: createEntry called with that input, entry appears in the list, success toast.
  it('creates a new entry', async () => {
    const user = userEvent.setup();
    mocked.listEntries.mockResolvedValue([]);
    mocked.createEntry.mockResolvedValue(entry({ id: 'e2', title: 'New day', body: 'Fresh start' }));
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /New entry/ }));
    expect(screen.getByRole('button', { name: 'Create entry' })).toBeDisabled();
    await user.type(screen.getByLabelText('Title'), 'New day');
    await user.type(screen.getByLabelText('Entry'), 'Fresh start');
    await user.click(screen.getByRole('button', { name: 'Create entry' }));
    expect(mocked.createEntry).toHaveBeenCalledWith({ title: 'New day', body: 'Fresh start' });
    expect(await screen.findByRole('button', { name: /New day/ })).toBeInTheDocument();
    expect(screen.getByText('Entry created')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  // Tests that delete requires confirmation before calling the API.
  // Params: one entry; user clicks Delete, then confirms.
  // Expected: deleteEntry("e1") only after confirm; list ends empty → empty state.
  it('deletes an entry after confirmation', async () => {
    const user = userEvent.setup();
    mocked.listEntries.mockResolvedValue([entry()]);
    mocked.deleteEntry.mockResolvedValue(undefined);
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    expect(mocked.deleteEntry).not.toHaveBeenCalled();
    expect(screen.getByText('Delete this entry?')).toBeInTheDocument();
    const confirmBtns = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(confirmBtns[confirmBtns.length - 1]!);
    expect(mocked.deleteEntry).toHaveBeenCalledWith('e1');
    expect(await screen.findByText('A blank page, waiting.')).toBeInTheDocument();
  });

  // Tests that a failed save surfaces the backend request id to the user —
  // the hand-off point for `/rca <id>`.
  // Params: updateEntry rejects with ApiError requestId "ab12cd34".
  // Expected: an alert with the error message and "Ref ab12cd34".
  it('shows the request id when a save fails', async () => {
    const user = userEvent.setup();
    mocked.listEntries.mockResolvedValue([entry()]);
    mocked.updateEntry.mockRejectedValue(new ApiError('something went wrong', 500, 'internal', 'ab12cd34'));
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    await user.type(screen.getByLabelText('Entry'), ' More.');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('something went wrong');
    expect(alert).toHaveTextContent('Ref ab12cd34');
  });

  // Tests the ⌘S / Ctrl+S save shortcut.
  // Params: edited body, then Ctrl+S.
  // Expected: updateEntry called with the edited draft.
  it('saves with Ctrl+S', async () => {
    const user = userEvent.setup();
    mocked.listEntries.mockResolvedValue([entry()]);
    mocked.updateEntry.mockResolvedValue(entry({ body: 'Tea and a book. Later.' }));
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    await user.type(screen.getByLabelText('Entry'), ' Later.');
    await user.keyboard('{Control>}s{/Control}');
    await waitFor(() =>
      expect(mocked.updateEntry).toHaveBeenCalledWith('e1', { title: 'Rainy Sunday', body: 'Tea and a book. Later.' }),
    );
  });

  // What: Edit button switches to prefilled fields.
  // Params: one entry; click Edit.
  // Expected: Title and Entry textboxes with current values; Save and Cancel shown.
  it('shows prefilled fields after clicking Edit', async () => {
    const user = userEvent.setup();
    mocked.listEntries.mockResolvedValue([entry()]);
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('Title')).toHaveValue('Rainy Sunday');
    expect(screen.getByLabelText('Entry')).toHaveValue('Tea and a book.');
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  // What: Save returns to read mode with new content.
  // Params: edit body, click Save; updateEntry resolves with new body.
  // Expected: updateEntry called, no textboxes, new text visible.
  it('returns to read mode after saving', async () => {
    const user = userEvent.setup();
    mocked.listEntries.mockResolvedValue([entry()]);
    mocked.updateEntry.mockResolvedValue(entry({ body: 'Changed body' }));
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    await user.type(screen.getByLabelText('Entry'), '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await within(await screen.findByRole('article')).findByText('Changed body')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  // What: Cancel with no changes.
  // Params: click Edit then Cancel.
  // Expected: read mode, no confirm dialog.
  it('cancels a clean edit without confirming', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm');
    mocked.listEntries.mockResolvedValue([entry()]);
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(confirm).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  // What: Cancel when dirty confirms; decline stays, accept reverts.
  // Params: type in body, Cancel with confirm false then true.
  // Expected: first stays editing; second shows original text read-only.
  it('confirms before discarding a dirty edit on Cancel', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    mocked.listEntries.mockResolvedValue([entry()]);
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    await user.type(screen.getByLabelText('Entry'), ' zzz');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByLabelText('Entry')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(within(screen.getByRole('article')).getByText('Tea and a book.')).toBeInTheDocument();
  });

  // What: switching entries while editing opens the other read-only.
  // Params: two entries; Edit first, click second in sidebar.
  // Expected: second title as heading, no textboxes.
  it('opens another entry read-only after editing', async () => {
    const user = userEvent.setup();
    mocked.listEntries.mockResolvedValue([entry(), entry({ id: 'e2', title: 'Other day', body: 'Other' })]);
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: /Other day/ }));
    expect(screen.getByRole('heading', { name: 'Other day' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  // What: read-view title must not reuse the sidebar's .entry-title class (regression: sidebar titles rendered huge).
  // Params: render one entry.
  // Expected: article heading has class read-title; sidebar title keeps entry-title only.
  it('keeps read title and sidebar title classes distinct', async () => {
    mocked.listEntries.mockResolvedValue([entry()]);
    render(<App />);
    const heading = await screen.findByRole('heading', { name: 'Rainy Sunday' });
    expect(heading).toHaveClass('read-title');
    expect(heading).not.toHaveClass('entry-title');
    expect(document.querySelectorAll('.entry-title')).toHaveLength(1);
  });

  // What: Ctrl+S in read mode does nothing.
  // Params: press Ctrl+S without editing.
  // Expected: updateEntry not called.
  it('ignores Ctrl+S in read mode', async () => {
    const user = userEvent.setup();
    mocked.listEntries.mockResolvedValue([entry()]);
    render(<App />);
    await screen.findByRole('button', { name: 'Edit' });
    await user.keyboard('{Control>}s{/Control}');
    expect(mocked.updateEntry).not.toHaveBeenCalled();
  });

  // What: HTML in body is rendered as literal text.
  // Params: body "<script>alert(1)</script><b>x</b>".
  // Expected: the literal string is visible; no bold element injected.
  it('renders HTML in the body as text', async () => {
    mocked.listEntries.mockResolvedValue([entry({ body: '<script>alert(1)</script><b>x</b>' })]);
    const { container } = render(<App />);
    expect(await within(await screen.findByRole('article')).findByText('<script>alert(1)</script><b>x</b>')).toBeInTheDocument();
    expect(container.querySelector('.entry-body b')).toBeNull();
  });
});

describe('App entry meta', () => {
  // What: after saving an edit, the meta block reflects the updatedMeta returned by the API.
  // Params: entry with old meta; updateEntry resolves with new updatedMeta.
  // Expected: "Last edited from" shows the new ip; "Created from" is unchanged.
  it('shows the updatedMeta returned by the API after save', async () => {
    const createdMeta = { ip: '10.0.0.1', userAgent: 'UA-one' };
    mocked.listEntries.mockResolvedValue([entry({ createdMeta, updatedMeta: createdMeta })]);
    mocked.updateEntry.mockResolvedValue(entry({ createdMeta, updatedMeta: { ip: '10.0.0.2', userAgent: 'UA-two' } }));
    render(<App />);
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    const title = await screen.findByLabelText('Title');
    await userEvent.type(title, '!');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Last edited from 10.0.0.2 · UA-two')).toBeInTheDocument();
    expect(screen.getByText('Created from 10.0.0.1 · UA-one')).toBeInTheDocument();
  });
});
