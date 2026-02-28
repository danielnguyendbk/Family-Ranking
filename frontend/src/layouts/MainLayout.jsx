import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export function MainLayout({ children }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="text-lg font-semibold text-[var(--color-primary)]">
            Family Ranking
          </Link>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  Trang chủ
                </Link>
                <Link
                  to="/users"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  Người dùng
                </Link>
                <Link
                  to="/pending"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  Chờ duyệt
                </Link>
                <Link
                  to="/bet-settlement"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  Thanh toán cược
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600/50 text-xs font-medium text-white">
                      {user?.username?.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="text-[var(--color-text)]">{user?.username}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg bg-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-muted)] hover:bg-red-500/20 hover:text-red-400"
                >
                  Đăng xuất
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-sm text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
                  title="Đổi giao diện sáng/tối"
                  aria-label="Đổi giao diện"
                >
                  Giao diện
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-[var(--color-primary-hover)]"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
