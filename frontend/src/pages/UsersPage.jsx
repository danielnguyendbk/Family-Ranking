import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { PageSpinner } from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/apiService';

const isAdmin = (user) => user?.username?.toLowerCase() === 'admin';

export function UsersPage() {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({ username: '', email: '', password: '' });
  const [editForm, setEditForm] = useState({ username: '', email: '', newPassword: '' });

  const loadUsers = async () => {
    try {
      const res = await usersApi.getAll();
      const all = (res.data ?? []).slice().sort((a, b) =>
        (a.username || '').localeCompare(b.username || '')
      );
      setUsers(all);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tải người dùng');
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await usersApi.getAll();
        if (cancelled) return;
        const all = (res.data ?? []).slice().sort((a, b) =>
          (a.username || '').localeCompare(b.username || '')
        );
        setUsers(all);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Không thể tải người dùng');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [toast]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await usersApi.create({
        username: createForm.username.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
      });
      toast.success('Đã tạo người dùng.');
      setShowCreateModal(false);
      setCreateForm({ username: '', email: '', password: '' });
      await loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tạo người dùng');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setEditForm({ username: u.username ?? '', email: u.email ?? '', newPassword: '' });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      await usersApi.update(editingUser.id, {
        username: editForm.username.trim() || undefined,
        email: editForm.email.trim() || undefined,
        newPassword: editForm.newPassword.trim() || undefined,
      });
      toast.success('Đã cập nhật người dùng.');
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật người dùng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (u.id === currentUser?.id) {
      toast.error('Bạn không thể xóa tài khoản của chính mình');
      return;
    }
    if (!window.confirm(`Xóa người dùng "${u.username}"? Hành động này sẽ xóa toàn bộ dữ liệu của họ.`)) return;
    try {
      await usersApi.delete(u.id);
      toast.success('Đã xóa người dùng.');
      await loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa người dùng');
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay = `${u.username ?? ''} ${u.email ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, users]);

  if (loading) {
    return (
      <MainLayout>
        <PageSpinner />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Người dùng</h1>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên/email"
            className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
          {isAdmin(currentUser) && (
            <button
              type="button"
              onClick={() => { setCreateForm({ username: '', email: '', password: '' }); setShowCreateModal(true); }}
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-slate-900 hover:bg-[var(--color-primary-hover)]"
            >
              Tạo người dùng
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((u) => (
          <div
            key={u.id}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              {u.avatar ? (
                <img src={u.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600/20 text-sm font-semibold text-sky-700 dark:text-sky-200">
                  {u.username?.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-[var(--color-text)]">{u.username}</div>
                <div className="truncate text-sm text-[var(--color-muted)]">{u.email}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-[var(--color-border)] p-3">
                <div className="text-[var(--color-muted)]">Điểm</div>
                <div className="font-semibold text-[var(--color-text)]">{u.totalPoints}</div>
              </div>
              <div className="rounded-lg border border-[var(--color-border)] p-3">
                <div className="text-[var(--color-muted)]">T / H / B</div>
                <div className="font-semibold text-[var(--color-text)]">{u.wins} / {u.draws} / {u.losses}</div>
              </div>
            </div>

            {isAdmin(currentUser) && (
              <div className="mt-3 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm">
                <span className="text-[var(--color-muted)]">Mật khẩu: </span>
                {u.rawPassword
                  ? <code className="font-mono font-semibold text-[var(--color-text)]">{u.rawPassword}</code>
                  : <span className="italic text-[var(--color-muted)]">do người dùng đặt (không hiển thị)</span>
                }
              </div>
            )}

            {isAdmin(currentUser) && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(u)}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteUser(u)}
                  disabled={u.id === currentUser?.id}
                  className="rounded-lg border border-red-500/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-6 text-center text-[var(--color-muted)]">Không tìm thấy người dùng.</p>
      )}

      {/* Create user modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !submitting && setShowCreateModal(false)}>
          <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Tạo người dùng</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">Tên đăng nhập *</label>
                <input
                  type="text"
                  value={createForm.username}
                  onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">Email *</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">Mật khẩu *</label>
                <input
                  type="text"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-slate-900 disabled:opacity-50">
                  {submitting ? 'Đang tạo...' : 'Tạo'}
                </button>
                <button type="button" onClick={() => !submitting && setShowCreateModal(false)} className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)] hover:bg-[var(--color-surface)]">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit user modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !submitting && setEditingUser(null)}>
          <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Sửa người dùng</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">Tên đăng nhập</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">Mật khẩu mới (để trống nếu không đổi)</label>
                <input
                  type="text"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm((f) => ({ ...f, newPassword: e.target.value }))}
                  placeholder="Tùy chọn"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-slate-900 disabled:opacity-50">
                  {submitting ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button type="button" onClick={() => !submitting && setEditingUser(null)} className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)] hover:bg-[var(--color-surface)]">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
