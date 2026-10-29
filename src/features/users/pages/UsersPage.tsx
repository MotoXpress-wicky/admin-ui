import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Pager } from '@/shared/components/Pager';
import { useFetch } from '@/shared/hooks/useFetch';
import { getErrorMessage } from '@/shared/lib/getErrorMessage';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { usersApi } from '../api/usersApi';
import type { AdminUser, UserChange } from '../types/user.types';

export const UsersPage = () => {
  const me = useAuthStore((s) => s.user);
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const page = Number(params.get('page') ?? '0');
  const [text, setText] = useState(q);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(() => usersApi.list(q || undefined, page), [q, page]);
  const { data, error, isLoading, reload } = useFetch(load);

  // One change at a time. The service checks the rules again (you cannot change yourself).
  const change = async (user: AdminUser, body: UserChange, question: string | null, done: string) => {
    if (question && !window.confirm(question)) return;
    setBusyId(user.id);
    try {
      await usersApi.change(user.id, body);
      toast.success(done);
      reload();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="toolbar">
        <h1>Users</h1>
        <span className="spacer" />
        <Link to="/users/audit-log">Audit log</Link>
      </div>

      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          const next = new URLSearchParams();
          if (text.trim()) next.set('q', text.trim());
          setParams(next);
        }}
      >
        <input className="input" type="search" placeholder="Name or email" aria-label="Search users" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit">Search</button>
      </form>

      <p className="muted">
        A locked account cannot log in and its refresh tokens end at once. A short token can work for up to 15 minutes more.
        Giving or taking admin also works when the person next gets a new token.
      </p>

      {isLoading && <p className="muted">Loading users...</p>}
      {error && <p role="alert" className="error">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Sign-in</th>
              <th>Role</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data?.content.map((u) => {
              const isMe = me?.id === String(u.id);
              const busy = busyId === u.id;
              return (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.authProvider.toLowerCase()}</td>
                  <td>{u.admin ? <span className="badge ok">admin</span> : 'customer'}</td>
                  <td>{u.locked ? <span className="badge no">locked</span> : 'active'}</td>
                  <td>
                    {isMe ? (
                      <span className="muted">you</span>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="link-button"
                          disabled={busy}
                          onClick={() =>
                            void change(
                              u,
                              { locked: !u.locked },
                              u.locked ? null : `Lock ${u.email}? They will be logged out.`,
                              u.locked ? 'Account unlocked' : 'Account locked',
                            )
                          }
                        >
                          {u.locked ? 'Unlock' : 'Lock'}
                        </button>
                        {' · '}
                        <button
                          type="button"
                          className="link-button"
                          disabled={busy}
                          onClick={() =>
                            void change(
                              u,
                              { admin: !u.admin },
                              u.admin ? `Take admin rights from ${u.email}?` : `Make ${u.email} an admin? They can then change everything in the shop.`,
                              u.admin ? 'Admin rights removed' : 'Now an admin',
                            )
                          }
                        >
                          {u.admin ? 'Remove admin' : 'Make admin'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {data && data.content.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <Pager
          page={data.page}
          totalPages={data.totalPages}
          onPage={(p) => {
            const next = new URLSearchParams(params);
            next.set('page', String(p));
            setParams(next);
          }}
        />
      )}
    </>
  );
};
