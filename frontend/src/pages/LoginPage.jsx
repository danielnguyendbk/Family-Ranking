import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { authApi } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      await login(data.token);
      toast.success('Chào mừng trở lại!');
      navigate(from, { replace: true });
    } catch (err) {
      const res = err.response?.data;
      if (res?.status === 401) {
        setErrors({ password: res.message || 'Tên đăng nhập hoặc mật khẩu không đúng' });
        toast.error('Tên đăng nhập hoặc mật khẩu không đúng');
      } else if (res && typeof res === 'object' && !res.status) {
        setErrors(res);
        toast.error(Object.values(res).join(' '));
      } else {
        toast.error(res?.message || 'Đăng nhập thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng nhập">
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
            Mật khẩu
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            placeholder="Mật khẩu"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-[var(--color-error)]">{errors.password}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--color-primary)] py-2.5 font-medium text-slate-900 hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-[var(--color-primary)] hover:underline">
          Đăng ký
        </Link>
      </p>
    </AuthLayout>
  );
}
