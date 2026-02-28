import { Link } from 'react-router-dom';

export function AuthLayout({ title, children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-4 py-8">
      <Link to="/" className="mb-6 text-xl font-semibold text-[var(--color-primary)]">
        Family Ranking
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-[var(--color-text)]">{title}</h1>
        {children}
      </div>
    </div>
  );
}
