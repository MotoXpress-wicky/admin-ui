import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pager } from '@/shared/components/Pager';
import { useFetch } from '@/shared/hooks/useFetch';
import { formatDateTime } from '@/shared/lib/format';
import { usersApi } from '../api/usersApi';
import type { AuditAction } from '../types/user.types';

const TEXT: Record<AuditAction, string> = {
  LOCK: 'locked',
  UNLOCK: 'unlocked',
  GRANT_ADMIN: 'made admin',
  REVOKE_ADMIN: 'removed admin from',
};

// Who did what to which account. Lines are only added, never changed.
export const AuditLogPage = () => {
  const [page, setPage] = useState(0);
  const load = useCallback(() => usersApi.auditLog(page), [page]);
  const { data, error, isLoading } = useFetch(load);

  return (
    <>
      <p>
        <Link to="/users">&larr; Users</Link>
      </p>
      <h1>Audit log</h1>

      {isLoading && <p className="muted">Loading...</p>}
      {error && <p role="alert" className="error">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>Who</th>
              <th>Did</th>
              <th>To</th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((e) => (
              <tr key={e.id}>
                <td>{formatDateTime(e.createdAt)}</td>
                <td>{e.adminUserId === null ? 'start-up bootstrap' : e.adminEmail}</td>
                <td>{TEXT[e.action] ?? e.action}</td>
                <td>{e.targetEmail}</td>
              </tr>
            ))}
            {data && data.content.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  Nothing has been changed yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && <Pager page={data.page} totalPages={data.totalPages} onPage={setPage} />}
    </>
  );
};
