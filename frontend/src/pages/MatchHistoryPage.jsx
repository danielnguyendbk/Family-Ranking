import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { matchesApi } from '../services/apiService';
import { PageSpinner } from '../components/Spinner';
import { useToast } from '../context/ToastContext';

const fmt = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleString('vi-VN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const STATUS_LABEL = {
  COMPLETED: 'HOÀN THÀNH',
  PENDING: 'CHỜ DUYỆT',
  REJECTED: 'TỪ CHỐI',
  ACCEPTED: 'ĐÃ CHẤP NHẬN',
};

export function MatchHistoryPage() {
  const { gameId } = useParams();
  const toast = useToast();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await matchesApi.getMyMatches();
        if (cancelled) return;
        const list = res.data ?? [];
        const filtered = gameId
          ? list.filter((m) => m.game?.id === Number(gameId))
          : list;
        setMatches(filtered);
      } catch (err) {
        if (!cancelled) toast.error(err.response?.data?.message || 'Không thể tải trận đấu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [gameId, toast]);

  if (loading) return <MainLayout><PageSpinner /></MainLayout>;

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {gameId ? 'Lịch sử trận đấu' : 'Trận của tôi'}
        </h1>
        {gameId && (
          <Link
            to={`/games/${gameId}`}
            className="text-[var(--color-primary)] hover:underline"
          >
            Về bảng xếp hạng
          </Link>
        )}
      </div>
      <div className="space-y-3">
        {matches.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-medium text-[var(--color-text)]">{m.game?.name}</span>
                <span className="ml-2 text-sm text-[var(--color-muted)]">
                  {m.teamMatch
                    ? `${m.team1?.name ?? 'Đội 1'} vs ${m.team2?.name ?? 'Đội 2'}`
                    : `${m.player1?.username ?? '?'} vs ${m.player2?.username ?? '?'}`}
                </span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  m.status === 'COMPLETED'
                    ? 'bg-green-500/20 text-green-400'
                    : m.status === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-400'
                    : m.status === 'REJECTED'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-sky-500/20 text-sky-400'
                }`}
              >
                {STATUS_LABEL[m.status] ?? m.status}
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
            <div className="mt-2 space-y-0.5 text-xs text-[var(--color-muted)]">
              <p>Ngày tạo: {fmt(m.createdAt)}</p>
              {m.betSettledRequestedAt && (
                <p>Thanh toán gửi lúc: {fmt(m.betSettledRequestedAt)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {matches.length === 0 && (
        <p className="text-center text-[var(--color-muted)]">Chưa có trận đấu nào.</p>
      )}
    </MainLayout>
  );
}
