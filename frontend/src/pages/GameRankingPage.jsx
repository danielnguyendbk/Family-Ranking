import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { gamesApi, matchesApi } from '../services/apiService';
import { PageSpinner } from '../components/Spinner';
import { useToast } from '../context/ToastContext';

export function GameRankingPage() {
  const { gameId } = useParams();
  const toast = useToast();
  const [game, setGame] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;
    async function load() {
      try {
        const [gamesRes, rankRes] = await Promise.all([
          gamesApi.getAll(),
          matchesApi.getRanking(Number(gameId)),
        ]);
        if (cancelled) return;
        const list = gamesRes.data ?? [];
        const g = list.find((x) => x.id === Number(gameId));
        setGame(g ?? null);
        setRanking(rankRes.data ?? []);
      } catch (err) {
        if (!cancelled) toast.error(err.response?.data?.message || 'Không thể tải bảng xếp hạng');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [gameId, toast]);

  if (loading) return <MainLayout><PageSpinner /></MainLayout>;
  if (!game) {
    return (
      <MainLayout>
        <p className="text-[var(--color-error)]">Không tìm thấy trò chơi.</p>
        <Link to="/" className="mt-2 inline-block text-[var(--color-primary)] hover:underline">
          Về trang chủ
        </Link>
      </MainLayout>
    );
  }

  const played = (r) => r.wins + r.losses + r.draws;

  return (
    <MainLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Bảng xếp hạng – {game.name}</h1>
          {game.description && (
            <p className="text-sm text-[var(--color-muted)]">{game.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            to={`/games/${gameId}/match/create`}
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-slate-900 hover:bg-[var(--color-primary-hover)]"
          >
            Tạo trận đấu
          </Link>
          <Link
            to={`/games/${gameId}/teams`}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
          >
            Đội
          </Link>
          <Link
            to={`/games/${gameId}/matches`}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
          >
            Lịch sử trận đấu
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="p-3 font-medium text-[var(--color-muted)]">Hạng</th>
              <th className="p-3 font-medium text-[var(--color-muted)]">Người chơi</th>
              <th className="p-3 font-medium text-[var(--color-muted)]">Đã chơi</th>
              <th className="p-3 font-medium text-[var(--color-muted)]">Thắng</th>
              <th className="p-3 font-medium text-[var(--color-muted)]">Hòa</th>
              <th className="p-3 font-medium text-[var(--color-muted)]">Thua</th>
              <th className="p-3 font-medium text-[var(--color-muted)]">Điểm</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((r) => (
              <tr key={r.userId} className="border-b border-[var(--color-border)] last:border-0">
                <td className="p-3 font-medium text-[var(--color-text)]">{r.rank}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {r.avatar ? (
                      <img
                        src={r.avatar}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600/20 text-xs font-medium text-sky-700 dark:text-sky-200">
                        {r.username?.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <span className="text-[var(--color-text)]">{r.username}</span>
                  </div>
                </td>
                <td className="p-3 text-[var(--color-muted)]">{played(r)}</td>
                <td className="p-3 text-[var(--color-success)]">{r.wins}</td>
                <td className="p-3 text-[var(--color-muted)]">{r.draws}</td>
                <td className="p-3 text-[var(--color-error)]">{r.losses}</td>
                <td className="p-3 font-semibold text-[var(--color-primary)]">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ranking.length === 0 && (
        <p className="mt-4 text-center text-[var(--color-muted)]">Chưa có dữ liệu xếp hạng. Hãy tạo một trận đấu để bắt đầu.</p>
      )}
    </MainLayout>
  );
}
