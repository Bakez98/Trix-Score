import React from 'react';
import { useGame, type GameMode, type GameType } from '../context/GameContext';
import { PlayCircle, ShieldIcon, Users } from 'lucide-react';

export const GameSetup: React.FC = () => {
  const { dispatch } = useGame();
  
  const [gameType, setGameType] = React.useState<GameType>('Kingdoms');
  const [gameMode, setGameMode] = React.useState<GameMode>('Individual');
  const [players, setPlayers] = React.useState<string[]>(['Player 1', 'Player 2', 'Player 3', 'Player 4']);

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (players.some(p => p.trim() === '')) {
      alert("All players must have a name!");
      return;
    }
    dispatch({ type: 'SET_GAME_CONFIG', payload: { gameType, gameMode, players } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100">
      <div className="max-w-xl w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700/50">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black bg-gradient-to-br from-indigo-400 to-purple-400 object-cover bg-clip-text text-transparent">Trix ScoreTracker</h1>
          <p className="text-slate-400 mt-2">Setup your new game</p>
        </div>

        <form onSubmit={handleStart} className="space-y-8">
          {/* Game Type */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><ShieldIcon className="w-5 h-5 text-indigo-400" /> Game Type</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`p-4 rounded-xl border-2 transition-all ${gameType === 'Kingdoms' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-600'}`}
                onClick={() => setGameType('Kingdoms')}
              >
                <div className="font-bold text-lg">Kingdoms</div>
                <div className="text-xs text-slate-400 mt-1">5 distinct games per kingdom</div>
              </button>
              <button
                type="button"
                className={`p-4 rounded-xl border-2 transition-all ${gameType === 'Complex' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-600'}`}
                onClick={() => setGameType('Complex')}
              >
                <div className="font-bold text-lg">Complex</div>
                <div className="text-xs text-slate-400 mt-1">2 distinct games per kingdom</div>
              </button>
            </div>
          </section>

          {/* Game Mode */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="w-5 h-5 text-purple-400" /> Game Mode</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`p-4 rounded-xl border-2 transition-all ${gameMode === 'Individual' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 hover:border-slate-600'}`}
                onClick={() => setGameMode('Individual')}
              >
                <div className="font-bold text-lg">Individual</div>
                <div className="text-xs text-slate-400 mt-1">Jewish (Free for all)</div>
              </button>
              <button
                type="button"
                className={`p-4 rounded-xl border-2 transition-all ${gameMode === 'Partnership' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 hover:border-slate-600'}`}
                onClick={() => setGameMode('Partnership')}
              >
                <div className="font-bold text-lg">Partnership</div>
                <div className="text-xs text-slate-400 mt-1">P1+P3 vs P2+P4</div>
              </button>
            </div>
          </section>

          {/* Players */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="w-5 h-5 text-pink-400" /> Players</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {players.map((p, i) => (
                <div key={i} className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Player {i + 1}</label>
                  <input
                    type="text"
                    value={p}
                    onChange={e => handlePlayerNameChange(i, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-500"
                    placeholder={`Player ${i + 1} Name`}
                    required
                  />
                </div>
              ))}
            </div>
            {gameMode === 'Partnership' && (
              <div className="bg-slate-700/30 p-3 rounded-lg text-sm text-slate-300 mt-2 border border-slate-700/50">
                <span className="font-bold text-indigo-400">Team 1:</span> {players[0] || 'P1'} &amp; {players[2] || 'P3'} <span className="mx-2 text-slate-500">|</span> 
                <span className="font-bold text-purple-400">Team 2:</span> {players[1] || 'P2'} &amp; {players[3] || 'P4'}
              </div>
            )}
          </section>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transform transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/25"
          >
            <PlayCircle className="w-6 h-6" /> Start Game
          </button>
        </form>
      </div>
    </div>
  );
};
