import { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { usersApi } from '../services/apiService';
import { PageSpinner } from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [form, setForm] = useState({
    username: user?.username ?? '',
    avatar: user?.avatar ?? '',
  });

  useEffect(() => {
    if (user) {
      setForm({ username: user.username, avatar: user.avatar ?? '' });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setAvatarPreview(dataUrl);
      setForm((prev) => ({ ...prev, avatar: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersApi.updateProfile({ username: form.username, avatar: form.avatar || undefined });
      await refreshUser();
      toast.success('Hồ sơ đã được cập nhật');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <MainLayout><PageSpinner /></MainLayout>;

  const played = user.wins + user.losses + user.draws;

  return (
    <MainLayout>
      <h1 className="mb-6 text-2xl font-bold text-[var(--color-text)]">Hồ sơ</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Ảnh đại diện &amp; thống kê</h2>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Ảnh đại diện"
                className="h-24 w-24 rounded-full object-cover ring-2 ring-[var(--color-primary)]"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-border)] text-3xl font-bold text-[var(--color-muted)]">
                {user.username?.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="text-center sm:text-left">
              <p className="text-2xl font-bold text-[var(--color-text)]">{user.username}</p>
              <p className="text-sm text-[var(--color-muted)]">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <span className="text-[var(--color-primary)]">Điểm: {user.totalPoints}</span>
                <span className="text-[var(--color-success)]">Thắng: {user.wins}</span>
                <span className="text-[var(--color-muted)]">Hòa: {user.draws}</span>
                <span className="text-[var(--color-error)]">Thua: {user.losses}</span>
              </div>
              {played > 0 && (
                <p className="mt-1 text-xs text-[var(--color-muted)]">Đã chơi: {played} trận</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Cập nhật hồ sơ</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">
                Tên đăng nhập
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">
                Ảnh đại diện
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="text-sm text-[var(--color-muted)] file:mr-2 file:rounded file:border-0 file:bg-[var(--color-primary)] file:px-3 file:py-1 file:text-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 font-medium text-slate-900 hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            Để đổi mật khẩu, hãy liên hệ admin.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
