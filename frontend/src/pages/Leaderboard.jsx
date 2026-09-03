import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [error, setError] = useState('');
  const { user, isDemo } = useAuth();

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const leaderboardRequest = api.get('/leaderboard');
        const mineRequest = isDemo ? Promise.resolve({ data: { rank: null } }) : api.get('/leaderboard/me');
        const [{ data: leaderboard }, { data: mine }] = await Promise.all([leaderboardRequest, mineRequest]);
        setUsers(leaderboard.users);
        setMyRank(mine.rank);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Leaderboard is unavailable');
      }
    };

    loadLeaderboard();
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socket.on('leaderboard:update', ({ users: nextUsers }) => setUsers(nextUsers));
    socket.on('leaderboard:error', ({ message }) => setError(message));

    return () => socket.disconnect();
  }, [isDemo]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">ScaleForge rankings</p>
          <h1 className="text-4xl font-black text-slate-900 mt-2">Leaderboard</h1>
          <p className="text-slate-500 mt-2">{isDemo ? 'Browse the rankings. Demo results never appear here.' : 'Average score across each user&apos;s last five interviews.'}</p>
        </div>
      </header>

      {myRank && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Your current standing</p>
            <p className="text-3xl font-black mt-1">#{myRank.rank}</p>
          </div>
          <p className="text-2xl font-bold text-orange-300">{myRank.score.toFixed(2)}<span className="text-sm text-slate-400"> / 10</span></p>
        </div>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">{error}</p>}

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[3rem_1fr_6rem] gap-4 px-6 py-4 bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400">
          <span>#</span><span>Candidate</span><span className="text-right">Score</span>
        </div>
        {users.length ? users.map((entry) => (
          <div key={entry.userId} className={`grid grid-cols-[3rem_1fr_6rem] gap-4 items-center px-6 py-5 border-t border-slate-100 ${entry.userId === user?._id ? 'bg-orange-50' : ''}`}>
            <span className="font-black text-slate-400">{entry.rank}</span>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-black shrink-0">
                {entry.user.name.slice(0, 1).toUpperCase()}
              </div>
              <span className="font-bold text-slate-800 truncate">{entry.user.name}</span>
            </div>
            <span className="text-right font-black text-indigo-600">{entry.score.toFixed(2)}</span>
          </div>
        )) : <p className="p-10 text-center text-slate-500">Complete an interview to enter the rankings.</p>}
      </section>
    </div>
  );
};

export default Leaderboard;
