import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Editor } from './Editor';
import type { RequestMeta } from '../types';

const base = {
  draft: { title: 'T', body: 'B' }, isNew: false, dirty: false, saving: false,
  createdAt: '2026-11-15T10:00:00.000Z', updatedAt: '2026-11-15T10:00:00.000Z',
  editing: false, onEdit: vi.fn(), onCancel: vi.fn(),
  onChange: vi.fn(), onSave: vi.fn(), onDelete: vi.fn(),
};
const created: RequestMeta = { ip: '203.0.113.5', userAgent: 'Mozilla/5.0 Alpha' };
const updated: RequestMeta = { ip: '198.51.100.7', userAgent: 'Mozilla/5.0 Beta' };

describe('<Editor />', () => {
  // What: a saved entry with meta shows who created and last edited it.
  // Params: createdMeta and updatedMeta with different ip and UA.
  // Expected: both lines render with ip and UA.
  it('shows created and last-edited ip and user agent', () => {
    render(<Editor {...base} createdMeta={created} updatedMeta={updated} />);
    expect(screen.getByText('Created from 203.0.113.5 · Mozilla/5.0 Alpha')).toBeInTheDocument();
    expect(screen.getByText('Last edited from 198.51.100.7 · Mozilla/5.0 Beta')).toBeInTheDocument();
  });

  // What: metadata is visible in the read-only view an entry opens in.
  // Params: editing false, with createdMeta and updatedMeta.
  // Expected: both meta lines render and no Title field is present.
  it('shows the meta block in the read-only view', () => {
    render(<Editor {...base} editing={false} createdMeta={created} updatedMeta={updated} />);
    expect(screen.getByText('Created from 203.0.113.5 · Mozilla/5.0 Alpha')).toBeInTheDocument();
    expect(screen.getByText('Last edited from 198.51.100.7 · Mozilla/5.0 Beta')).toBeInTheDocument();
    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
  });

  // What: metadata stays visible while editing.
  // Params: editing true, with createdMeta and updatedMeta.
  // Expected: the Title field and both meta lines render.
  it('shows the meta block in the edit view', () => {
    render(<Editor {...base} editing createdMeta={created} updatedMeta={updated} />);
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByText('Created from 203.0.113.5 · Mozilla/5.0 Alpha')).toBeInTheDocument();
  });

  // What: legacy entries have no meta.
  // Params: no meta props.
  // Expected: no meta block and no crash.
  it('renders no meta block for an entry without meta', () => {
    render(<Editor {...base} />);
    expect(screen.queryByText(/Created from/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Last edited from/)).not.toBeInTheDocument();
  });

  // What: an unsaved draft has no server meta yet.
  // Params: isNew true, no meta.
  // Expected: no meta block.
  it('shows no meta block for a new draft', () => {
    render(<Editor {...base} isNew createdAt={undefined} updatedAt={undefined} />);
    expect(screen.queryByText(/Created from/)).not.toBeInTheDocument();
  });

  // What: UA is client-controlled and must not be interpreted as HTML.
  // Params: userAgent containing a script tag.
  // Expected: the tag is shown as literal text and no script element exists.
  it('renders a user agent containing markup as literal text', () => {
    const ua = '<script>alert(1)</script>';
    const { container } = render(<Editor {...base} createdMeta={{ ip: '1.2.3.4', userAgent: ua }} />);
    expect(screen.getByText(`Created from 1.2.3.4 · ${ua}`)).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
  });

  // What: null ip or UA from the server.
  // Params: ip null, userAgent null.
  // Expected: ip shows "unknown"; the missing UA is omitted.
  it('shows unknown for a null ip', () => {
    render(<Editor {...base} createdMeta={{ ip: null, userAgent: null }} />);
    expect(screen.getByText('Created from unknown')).toBeInTheDocument();
  });
});
