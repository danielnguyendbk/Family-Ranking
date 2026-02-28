import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { matchesApi } from '../services/apiService';
import { PageSpinner } from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const fmt = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleString('vi-VN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export function PendingMatchesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await matchesApi.getMyMatches();
        if (cancelled) return;
        const list = res.data ?? [];
        const pending = list.filter(
          (m) =>
            m.status === 'PENDING' &&
            m.player2?.id === user?.id
        );
        setMatches(pending);
      } catch (err) {
        if (!cancelled) toast.error(err.response?.data?.message || 'Không thể tải trận đấu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user?.id, toast]);

  const handleAccept = async (id) => {
    setActionId(id);
    try {
      await matchesApi.accept(id);
      setMatches((prev) => prev.filter((m) => m.id !== id));
      toast.success('Đã chấp nhận trận. Điểm đã được cập nhật.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể chấp nhận trận');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    setActionId(id);
    try {
      await matchesApi.reject(id);
      setMatches((prev) => prev.filter((m) => m.id !== id));
      toast.success('Đã từ chối trận đấu.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể từ chối trận');
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <MainLayout><PageSpinner /></MainLayout>;

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Chờ xác nhận</h1>
        <Link to="/" className="text-[var(--color-primary)] hover:underline">
          Trang chủ
        </Link>
      </div>
      <p className="mb-4 text-sm text-[var(--color-muted)]">
        Các trận bạn là đối thủ. Chấp nhận để xác nhận kết quả và cập nhật bảng xếp hạng.
      </p>
      <div className="space-y-4">
        {matches.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-medium text-[var(--color-text)]">{m.game?.name}</span>
                <span className="ml-2 text-sm text-[var(--color-muted)]">
                  {m.player1?.username} vs bạn
                </span>
              </div>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                CHỜ DUYỆT
              </span>
            </div>
            {(m.score1 != null || m.score2 != null) && (
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Tỷ số: {m.score1 ?? '-'} – {m.score2 ?? '-'}
              </p>
            )}
            {m.betType !== 'FRIENDLY' && m.betDescription && (
              <p className="mt-1 text-sm text-amber-400">Cược: {m.betDescription}</p>
            )}
            <p className="mt-1 text-xs text-[var(--color-muted)]">Ngày tạo: {fmt(m.createdAt)}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => handleAccept(m.id)}
                disabled={actionId !== null}
                className="rounded-lg bg-[var(--color-success)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {actionId === m.id ? 'Đang xử lý...' : 'Chấp nhận'}
              </button>
              <button
                type="button"
                onClick={() => handleReject(m.id)}
                disabled={actionId !== null}
                className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-error)] hover:bg-red-500/10 disabled:opacity-50"
              >
                Từ chối
              </button>
            </div>
          </div>
        ))}
      </div>
      {matches.length === 0 && (
        <p className="text-center text-[var(--color-muted)]">Không có trận đấu nào đang chờ.</p>
      )}
    </MainLayout>
  );
}
