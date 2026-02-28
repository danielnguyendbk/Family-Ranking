import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { PageSpinner } from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { gamesApi, matchesApi, teamsApi } from '../services/apiService';

function uniqOptions(list) {
  const map = new Map();
  list.forEach((u) => {
    if (!u?.id) return;
    map.set(u.id, u);
  });
  return Array.from(map.values());
}

export function TeamsPage() {
  const { gameId } = useParams();
  const gid = Number(gameId);
  const toast = useToast();
  const { user: me } = useAuth();

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState(null);
  const [teams, setTeams] = useState([]);
  const [ranking, setRanking] = useState([]);

  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [gamesRes, teamsRes, rankRes] = await Promise.all([
          gamesApi.getAll(),
          teamsApi.getByGame(gid),
          matchesApi.getRanking(gid),
        ]);
        if (cancelled) return;
        setGame((gamesRes.data ?? []).find((g) => g.id === gid) ?? null);
        setTeams(teamsRes.data ?? []);
        setRanking(rankRes.data ?? []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Không thể tải đội');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (!Number.isFinite(gid)) return;
    load();
    return () => { cancelled = true; };
  }, [gid, toast]);

  const memberOptions = useMemo(() => {
    const opts = [];
    if (me?.id) opts.push({ id: me.id, username: me.username, avatar: me.avatar });
    (ranking ?? []).forEach((r) => {
      opts.push({ id: r.userId, username: r.username, avatar: r.avatar });
    });
    return uniqOptions(opts).sort((a, b) => (a.username || '').localeCompare(b.username || ''));
  }, [me, ranking]);

  const toggleMember = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await teamsApi.create({ name: name.trim(), gameId: gid, memberIds: selected });
      setTeams((prev) => [res.data, ...prev]);
      setName('');
      setSelected([]);
      toast.success('Đã tạo đội');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tạo đội');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <PageSpinner />
      </MainLayout>
    );
  }

  if (!game) {
    return (
      <MainLayout>
        <p className="text-[var(--color-error)]">Không tìm thấy trò chơi.</p>
        <Link to="/dashboard" className="mt-2 inline-block text-[var(--color-primary)] hover:underline">
          Về trang chủ
        </Link>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <Link
              to={`/games/${gid}`}
              className="text-[var(--color-primary)] hover:underline"
            >
              ← Quay lại
            </Link>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Đội – {game.name}</h1>
          </div>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Tạo đội và thêm thành viên.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Tạo đội</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">Tên đội</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                placeholder="vd: Đội A"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--color-muted)]">Thành viên</label>
                <span className="text-xs text-[var(--color-muted)]">
                  Đã chọn: {selected.length}
                </span>
              </div>

              <div className="max-h-56 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
                {memberOptions.map((u) => (
                  <label
                    key={u.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-[var(--color-surface)]"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(u.id)}
                      onChange={() => toggleMember(u.id)}
                      className="accent-sky-600"
                    />
                    {u.avatar ? (
                      <img src={u.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600/20 text-xs font-semibold text-sky-700 dark:text-sky-200">
                        {u.username?.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <span className="text-sm text-[var(--color-text)]">{u.username}</span>
                  </label>
                ))}

                {memberOptions.length === 0 && (
                  <p className="p-3 text-sm text-[var(--color-muted)]">
                    Chưa có người dùng nào. Người dùng sẽ xuất hiện sau khi họ thi đấu.
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
            >
              {submitting ? 'Đang tạo...' : 'Tạo đội'}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Các đội hiện có</h2>
          <div className="space-y-4">
            {teams.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-[var(--color-text)]">{t.name}</div>
                  <div className="text-sm text-[var(--color-muted)]">{t.members?.length ?? 0} thành viên</div>
                </div>
                {t.members?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {t.members.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1">
                        {m.avatar ? (
                          <img src={m.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600/20 text-xs font-semibold text-sky-700 dark:text-sky-200">
                            {m.username?.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <span className="text-sm text-[var(--color-text)]">{m.username}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-[var(--color-muted)]">Không có thành viên</p>
                )}
              </div>
            ))}
          </div>
          {teams.length === 0 && (
            <p className="text-sm text-[var(--color-muted)]">Chưa có đội nào cho trò chơi này.</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
