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

export function BetSettlementPage() {
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
        const withBet = list.filter(
          (m) =>
            m.status === 'COMPLETED' &&
            m.betType !== 'FRIENDLY' &&
            !m.betSettledConfirmed
        );
        setMatches(withBet);
      } catch (err) {
        if (!cancelled) toast.error(err.response?.data?.message || 'Không thể tải dữ liệu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [toast]);

  const isWinner = (m) => {
    if (!m.winnerId) return false;
    if (m.teamMatch) {
      if (m.team1?.id === m.winnerId)
        return m.team1?.members?.some((mem) => mem.id === user?.id);
      if (m.team2?.id === m.winnerId)
        return m.team2?.members?.some((mem) => mem.id === user?.id);
      return false;
    }
    return m.winnerId === user?.id;
  };

  const isLoser = (m) => {
    if (!m.winnerId) return false;
    if (m.teamMatch) {
      if (m.team1?.id === m.winnerId)
        return m.team2?.members?.some((mem) => mem.id === user?.id);
      if (m.team2?.id === m.winnerId)
        return m.team1?.members?.some((mem) => mem.id === user?.id);
      return false;
    }
    const loserId = m.winnerId === m.player1?.id ? m.player2?.id : m.player1?.id;
    return loserId === user?.id;
  };

  const handleSendSettlement = async (id) => {
    setActionId(id);
    try {
      const res = await matchesApi.requestSettlement(id);
      setMatches((prev) => prev.map((m) => (m.id === id ? res.data : m)));
      toast.success('Đã gửi thanh toán. Đang chờ người thắng xác nhận.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setActionId(null);
    }
  };

  const handleConfirmSettlement = async (id) => {
    setActionId(id);
    try {
      const res = await matchesApi.confirmSettlement(id);
      setMatches((prev) => prev.filter((m) => m.id !== id));
      toast.success('Đã xác nhận thanh toán. Cược đã được đóng.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <MainLayout><PageSpinner /></MainLayout>;

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Thanh toán cược</h1>
        <Link to="/" className="text-[var(--color-primary)] hover:underline">
          Trang chủ
        </Link>
      </div>
      <p className="mb-4 text-sm text-[var(--color-muted)]">
        Người thua gửi thanh toán; người thắng xác nhận đã nhận để đóng cược.
      </p>
      <div className="space-y-4">
        {matches.map((m) => {
          const winner = isWinner(m);
          const loser = isLoser(m);
          const canSend = loser && !m.betSettledRequested;
          const canConfirm = winner && m.betSettledRequested && !m.betSettledConfirmed;

          return (
            <div
              key={m.id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-[var(--color-text)]">{m.game?.name}</span>
                <span className="text-sm text-[var(--color-muted)]">
                  {m.teamMatch
                    ? `${m.team1?.name} vs ${m.team2?.name}`
                    : `${m.player1?.username} vs ${m.player2?.username}`}
                </span>
              </div>

              <div className="mt-2 space-y-0.5 text-xs text-[var(--color-muted)]">
                <p>Ngày tạo: {fmt(m.createdAt)}</p>
                {m.betSettledRequestedAt && (
                  <p>Thanh toán gửi lúc: {fmt(m.betSettledRequestedAt)}</p>
                )}
              </div>

              {m.betDescription && (
                <p className="mt-2 text-sm text-amber-400">Cược: {m.betDescription}</p>
              )}

              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {m.betSettledRequested
                  ? 'Người thua đã gửi thanh toán — đang chờ người thắng xác nhận'
                  : loser
                    ? 'Bạn đã thua — hãy gửi thanh toán cho người thắng'
                    : 'Đang chờ người thua gửi thanh toán'}
              </p>

              <div className="mt-3 flex gap-2">
                {canSend && (
                  <button
                    type="button"
                    onClick={() => handleSendSettlement(m.id)}
                    disabled={actionId !== null}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    {actionId === m.id ? 'Đang gửi...' : 'Gửi thanh toán'}
                  </button>
                )}
                {canConfirm && (
                  <button
                    type="button"
                    onClick={() => handleConfirmSettlement(m.id)}
                    disabled={actionId !== null}
                    className="rounded-lg bg-[var(--color-success)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {actionId === m.id ? 'Đang xác nhận...' : 'Xác nhận đã nhận'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {matches.length === 0 && (
        <p className="text-center text-[var(--color-muted)]">Không có trận đấu nào chờ thanh toán cược.</p>
      )}
    </MainLayout>
  );
}
