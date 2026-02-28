import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { gamesApi, teamsApi, matchesApi, usersApi } from '../services/apiService';
import { PageSpinner } from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const BET_TYPES = [
  { value: 'FRIENDLY', label: 'Thân thiện' },
  { value: 'LY_NUOC', label: 'Cược (Ly nước)' },
  { value: 'OTHER', label: 'Cược khác' },
];

export function CreateMatchPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [game, setGame] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    gameId: gameId ? Number(gameId) : null,
    teamMatch: false,
    opponentId: null,
    team1Id: null,
    team2Id: null,
    betType: 'FRIENDLY',
    betDescription: '',
    score1: '',
    score2: '',
    winnerId: null,
  });

  useEffect(() => {
    if (!gameId) return;
    const gid = Number(gameId);
    setForm((prev) => ({ ...prev, gameId: gid }));
    let cancelled = false;
    async function load() {
      try {
        const [gamesRes, rankRes, usersRes, teamsRes] = await Promise.all([
          gamesApi.getAll(),
          matchesApi.getRanking(gid),
          usersApi.getAll(),
          teamsApi.getByGame(gid),
        ]);
        if (cancelled) return;
        const list = gamesRes.data ?? [];
        setGame(list.find((x) => x.id === gid) ?? null);
        setRanking(rankRes.data ?? []);
        setAllUsers(usersRes.data ?? []);
        setTeams(teamsRes.data ?? []);
      } catch (err) {
        if (!cancelled) toast.error(err.response?.data?.message || 'Không thể tải dữ liệu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [gameId, toast]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const v = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.gameId) return;
    const payload = {
      gameId: form.gameId,
      teamMatch: form.teamMatch,
      betType: form.betType,
      betDescription: form.betDescription || undefined,
      score1: form.score1 === '' ? undefined : Number(form.score1),
      score2: form.score2 === '' ? undefined : Number(form.score2),
      winnerId: form.winnerId || undefined,
    };
    if (form.teamMatch) {
      payload.team1Id = form.team1Id;
      payload.team2Id = form.team2Id;
    } else {
      payload.opponentId = form.opponentId;
    }
    setSubmitting(true);
    try {
      await matchesApi.create(payload);
      toast.success('Đã tạo trận đấu. Đang chờ đối thủ xác nhận.');
      navigate(`/games/${form.gameId}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tạo trận đấu');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <MainLayout><PageSpinner /></MainLayout>;
  if (!game) {
    return (
      <MainLayout>
        <p className="text-[var(--color-error)]">Không tìm thấy trò chơi.</p>
        <Link to="/" className="mt-2 inline-block text-[var(--color-primary)]">Quay lại</Link>
      </MainLayout>
    );
  }

  const opponents = allUsers
    .filter((u) => u.id !== user?.id)
    .map((u) => ({ userId: u.id, username: u.username }));

  return (
    <MainLayout>
      <div className="mb-6 flex items-center gap-4">
        <Link
          to={`/games/${gameId}`}
          className="text-[var(--color-primary)] hover:underline"
        >
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Tạo trận đấu – {game.name}</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-xl space-y-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-muted)]">
            Loại trận
          </label>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="teamMatch"
                checked={form.teamMatch === false}
                onChange={() => setForm((prev) => ({ ...prev, teamMatch: false }))}
                className="text-[var(--color-primary)]"
              />
              <span className="text-[var(--color-text)]">1v1</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="teamMatch"
                checked={form.teamMatch === true}
                onChange={() => setForm((prev) => ({ ...prev, teamMatch: true }))}
                className="text-[var(--color-primary)]"
              />
              <span className="text-[var(--color-text)]">Đồng đội</span>
            </label>
          </div>
        </div>

        {form.teamMatch ? (
          <>
            {teams.length === 0 && (
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-sm text-[var(--color-muted)]">
                Chưa có đội nào. Hãy tạo đội trước trong{' '}
                <Link to={`/games/${gameId}/teams`} className="text-[var(--color-primary)] hover:underline">
                  Quản lý đội
                </Link>
                .
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">
                Đội 1
              </label>
              <select
                name="team1Id"
                value={form.team1Id ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    team1Id: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                required
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
              >
                <option value="">Chọn đội</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">
                Đội 2
              </label>
              <select
                name="team2Id"
                value={form.team2Id ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    team2Id: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                required
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
              >
                <option value="">Chọn đội</option>
                {teams.filter((t) => t.id !== form.team1Id).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">
              Đối thủ
            </label>
            <select
              name="opponentId"
              value={form.opponentId ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  opponentId: e.target.value ? Number(e.target.value) : null,
                }))
              }
              required
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
            >
              <option value="">Chọn đối thủ</option>
              {opponents.map((r) => (
                <option key={r.userId} value={r.userId}>
                  {r.username}
                </option>
              ))}
            </select>
            {opponents.length === 0 && (
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Chưa có người dùng nào khác. Cần có người dùng khác đăng ký trước khi bạn tạo trận.
              </p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">
            Loại cược
          </label>
          <select
            name="betType"
            value={form.betType}
            onChange={handleChange}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
          >
            {BET_TYPES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
        {form.betType !== 'FRIENDLY' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">
              Mô tả cược (vd: Ly nước)
            </label>
            <input
              type="text"
              name="betDescription"
              value={form.betDescription}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-muted)]"
              placeholder="Tùy chọn"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">
              Tỷ số 1 (tùy chọn)
            </label>
            <input
              type="number"
              name="score1"
              min={0}
              value={form.score1}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">
              Tỷ số 2 (tùy chọn)
            </label>
            <input
              type="number"
              name="score2"
              min={0}
              value={form.score2}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">
            Người thắng (tùy chọn)
          </label>
          <select
            name="winnerId"
            value={form.winnerId ?? ''}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                winnerId: e.target.value ? Number(e.target.value) : null,
              }))
            }
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]"
          >
            <option value="">Không có / Hòa</option>
            {form.teamMatch
              ? teams
                  .filter((t) => t.id === form.team1Id || t.id === form.team2Id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))
              : [
                  ...(user?.id ? [{ id: user.id, name: user.username }] : []),
                  ...(form.opponentId
                    ? [
                        {
                          id: form.opponentId,
                          name: opponents.find((r) => r.userId === form.opponentId)?.username ?? 'Đối thủ',
                        },
                      ]
                    : []),
                ].map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 font-medium text-slate-900 hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
          >
            {submitting ? 'Đang tạo...' : 'Tạo trận đấu'}
          </button>
          <Link
            to={`/games/${gameId}`}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-[var(--color-muted)] hover:bg-[var(--color-surface)]"
          >
            Hủy
          </Link>
        </div>
      </form>
    </MainLayout>
  );
}
