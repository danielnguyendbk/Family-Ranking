import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { authApi, usersApi } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      await login(data.token);
      if (avatarPreview) {
        await usersApi.updateProfile({ avatar: avatarPreview });
      }
      toast.success('Tạo tài khoản thành công!');
      navigate('/', { replace: true });
    } catch (err) {
      const res = err.response?.data;
      if (res && typeof res === 'object' && !res.status) {
        setErrors(res);
        toast.error(Object.values(res).join(' '));
      } else {
        toast.error(res?.message || 'Đăng ký thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Tạo tài khoản">
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
            autoComplete="username"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            placeholder="Tên đăng nhập"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-[var(--color-error)]">{errors.username}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            placeholder="Email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-[var(--color-error)]">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">
            Mật khẩu
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            placeholder="Ít nhất 6 ký tự"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-[var(--color-error)]">{errors.password}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">
            Ảnh đại diện (tùy chọn)
          </label>
          <div className="flex items-center gap-4">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Xem trước"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-[var(--color-primary)]"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-border)] text-[var(--color-muted)]">
                Chưa có ảnh
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="text-sm text-[var(--color-muted)] file:mr-2 file:rounded file:border-0 file:bg-[var(--color-primary)] file:px-3 file:py-1 file:text-slate-900"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--color-primary)] py-2.5 font-medium text-slate-900 hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        >
          {loading ? 'Đang tạo...' : 'Đăng ký'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-[var(--color-primary)] hover:underline">
          Đăng nhập
        </Link>
      </p>
    </AuthLayout>
  );
}
