import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { gamesApi, matchesApi } from '../services/apiService';
import { PageSpinner } from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const isAdmin = (user) => user?.username?.toLowerCase() === 'admin';

export function DashboardPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [matchCountByGame, setMatchCountByGame] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    winPoint: 3,
    drawPoint: 1,
    lossPoint: 0,
    teamGame: false,
  });

  const loadGames = async () => {
    try {
      const [gamesRes, matchesRes] = await Promise.all([
        gamesApi.getAll(),
        matchesApi.getMyMatches(),
      ]);
      setGames(gamesRes.data ?? []);
      const list = matchesRes.data ?? [];
      const count = {};
      list.forEach((m) => {
        const gid = m.game?.id;
        if (gid) count[gid] = (count[gid] || 0) + 1;
      });
      setMatchCountByGame(count);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tải trò chơi');
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [gamesRes, matchesRes] = await Promise.all([
          gamesApi.getAll(),
          matchesApi.getMyMatches(),
        ]);
        if (cancelled) return;
        setGames(gamesRes.data ?? []);
        const list = matchesRes.data ?? [];
        const count = {};
        list.forEach((m) => {
          const gid = m.game?.id;
          if (gid) count[gid] = (count[gid] || 0) + 1;
        });
        setMatchCountByGame(count);
      } catch (err) {
        if (!cancelled) toast.error(err.response?.data?.message || 'Không thể tải trò chơi');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [toast]);

  const openEditModal = (game) => {
    setEditingGame(game);
    setCreateForm({
      name: game.name,
      description: game.description ?? '',
      winPoint: game.winPoint ?? 3,
      drawPoint: game.drawPoint ?? 1,
      lossPoint: game.lossPoint ?? 0,
      teamGame: game.teamGame ?? false,
    });
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setEditingGame(null);
    setCreateForm({ name: '', description: '', winPoint: 3, drawPoint: 1, lossPoint: 0, teamGame: false });
  };

  const handleSaveGame = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        winPoint: Number(createForm.winPoint),
        drawPoint: Number(createForm.drawPoint),
        lossPoint: Number(createForm.lossPoint),
        teamGame: createForm.teamGame,
      };
      if (editingGame) {
        await gamesApi.update(editingGame.id, payload);
        toast.success('Đã cập nhật trò chơi.');
      } else {
        await gamesApi.create(payload);
        toast.success('Đã tạo trò chơi.');
      }
      closeModals();
      await loadGames();
    } catch (err) {
      toast.error(err.response?.data?.message || (editingGame ? 'Không thể cập nhật trò chơi' : 'Không thể tạo trò chơi'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGame = async (game) => {
    if (!window.confirm(`Xóa trò chơi "${game.name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await gamesApi.delete(game.id);
      toast.success('Đã xóa trò chơi.');
      await loadGames();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa trò chơi');
    }
  };

  if (loading) return <MainLayout><PageSpinner /></MainLayout>;

  return (
    <MainLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Trò chơi</h1>
        {isAdmin(user) && (
          <button
            type="button"
            onClick={() => {
              setEditingGame(null);
              setCreateForm({ name: '', description: '', winPoint: 3, drawPoint: 1, lossPoint: 0, teamGame: false });
              setShowCreateModal(true);
            }}
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-slate-900 hover:bg-[var(--color-primary-hover)]"
          >
            Tạo trò chơi
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <div
            key={game.id}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-lg transition hover:border-[var(--color-primary)]/50"
          >
            <h2 className="text-lg font-semibold text-[var(--color-text)]">{game.name}</h2>
            {game.description && (
              <p className="mt-1 text-sm text-[var(--color-muted)] line-clamp-2">
                {game.description}
              </p>
            )}
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Trận của bạn: <span className="font-medium text-[var(--color-text)]">{matchCountByGame[game.id] ?? 0}</span>
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                to={`/games/${game.id}`}
                className="inline-block rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-slate-900 hover:bg-[var(--color-primary-hover)]"
              >
                Xem bảng xếp hạng
              </Link>
              {isAdmin(user) && (
                <>
                  <button
                    type="button"
                    onClick={() => openEditModal(game)}
                    className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGame(game)}
                    className="rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    Xóa
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {games.length === 0 && (
        <p className="text-center text-[var(--color-muted)]">
          Chưa có trò chơi nào.{isAdmin(user) && ' Nhấn "Tạo trò chơi" để thêm.'}
        </p>
      )}

      {(showCreateModal || editingGame) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !submitting && closeModals()}>
          <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">{editingGame ? 'Sửa trò chơi' : 'Tạo trò chơi'}</h2>
            <form onSubmit={handleSaveGame} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">Tên *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
                  placeholder="vd: FIFA"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">Mô tả (tùy chọn)</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
                  placeholder="Mô tả ngắn"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">Điểm thắng</label>
                  <input
                    type="number"
                    min={0}
                    value={createForm.winPoint}
                    onChange={(e) => setCreateForm((f) => ({ ...f, winPoint: e.target.value === '' ? 0 : Number(e.target.value) }))}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">Điểm hòa</label>
                  <input
                    type="number"
                    min={0}
                    value={createForm.drawPoint}
                    onChange={(e) => setCreateForm((f) => ({ ...f, drawPoint: e.target.value === '' ? 0 : Number(e.target.value) }))}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">Điểm thua</label>
                  <input
                    type="number"
                    min={0}
                    value={createForm.lossPoint}
                    onChange={(e) => setCreateForm((f) => ({ ...f, lossPoint: e.target.value === '' ? 0 : Number(e.target.value) }))}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
                  />
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={createForm.teamGame}
                  onChange={(e) => setCreateForm((f) => ({ ...f, teamGame: e.target.checked }))}
                  className="rounded text-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--color-text)]">Trò chơi đồng đội</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-slate-900 hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
                >
                  {submitting ? (editingGame ? 'Đang lưu...' : 'Đang tạo...') : (editingGame ? 'Lưu' : 'Tạo')}
                </button>
                <button
                  type="button"
                  onClick={() => !submitting && closeModals()}
                  className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)] hover:bg-[var(--color-surface)]"
                >
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
