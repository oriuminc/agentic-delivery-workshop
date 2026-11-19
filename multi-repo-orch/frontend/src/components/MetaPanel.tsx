import type { RequestMeta } from '../types';

function describe(meta: RequestMeta): string {
  return [meta.ip ?? 'unknown', meta.userAgent].filter((p) => p !== null && p !== '').join(' · ');
}

interface Props {
  createdMeta?: RequestMeta;
  updatedMeta?: RequestMeta;
}

export function MetaPanel({ createdMeta, updatedMeta }: Props) {
  if (!createdMeta && !updatedMeta) return null;
  return (
    <div className="meta-panel">
      {createdMeta && <p>Created from {describe(createdMeta)}</p>}
      {updatedMeta && <p>Last edited from {describe(updatedMeta)}</p>}
    </div>
  );
}
