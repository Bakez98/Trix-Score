import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Plus, RotateCcw, Trophy, Users, History } from 'lucide-react';
import { AddRoundModal } from './AddRoundModal';

export const Scoreboard: React.FC = () => {
  const { state, dispatch } = useGame();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showCumulative, setShowCumulative] = useState(false);
  
  const gamesPerKingdom = state.gameType === 'Complex' ? 2 : 5;
  const totalRounds = state.rounds.length;
  const currentKingdomIndex = Math.floor(totalRounds / gamesPerKingdom);
  const isGameOver = currentKingdomIndex >= 4;
  const currentDealer = isGameOver ? null : state.players[currentKingdomIndex];
  const gamesPlayedThisKingdom = totalRounds % gamesPerKingdom;
  
  const calculateScores = () => {
    // Initialize scores
    let playerScores = [0, 0, 0, 0];
    
    // Sum from rounds
    state.rounds.forEach(round => {
      round.playerScores.forEach((score, index) => {
        playerScores[index] += score;
      });
    });

    // Handle partnership mode
    if (state.gameMode === 'Partnership') {
      const team1Score = playerScores[0] + playerScores[2];
      const team2Score = playerScores[1] + playerScores[3];
      return {
        individual: playerScores,
        teams: [team1Score, team2Score]
      };
    }

    return { individual: playerScores, teams: null };
  };

  const scores = calculateScores();

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the game? This will clear all scores.")) {
      dispatch({ type: 'RESET_GAME' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent inline-flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" /> 
              Trix Scoreboard
            </h1>
            <p className="text-slate-400 mt-2 uppercase text-sm font-semibold tracking-wider flex items-center gap-3 flex-wrap">
              <span>{state.gameType} • {state.gameMode}</span>
              {!isGameOver && (
                <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-500/30">
                  👑 {currentDealer}'s Kingdom ({gamesPlayedThisKingdom}/{gamesPerKingdom})
                </span>
              )}
              {isGameOver && (
                <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/30">
                  🎉 Game Over!
                </span>
              )}
            </p>
          </div>
          
          <div className="flex gap-3">
            {!isGameOver && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-5 h-5" /> Add Round
              </button>
            )}
            <button 
              onClick={handleReset}
              className="bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-5 h-5" /> Reset
            </button>
          </div>
        </header>

        {/* Scores Display */}
        {state.gameMode === 'Partnership' && scores.teams ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2"><Users className="w-5 h-5"/> Team 1</h2>
              <div className="text-5xl font-black mb-4">{scores.teams[0]}</div>
              <div className="flex gap-4 text-slate-400 font-medium">
                <span>{state.players[0]}: {scores.individual[0]}</span>
                <span>•</span>
                <span>{state.players[2]}: {scores.individual[2]}</span>
              </div>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2"><Users className="w-5 h-5"/> Team 2</h2>
              <div className="text-5xl font-black mb-4">{scores.teams[1]}</div>
              <div className="flex gap-4 text-slate-400 font-medium">
                <span>{state.players[1]}: {scores.individual[1]}</span>
                <span>•</span>
                <span>{state.players[3]}: {scores.individual[3]}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {state.players.map((player, idx) => (
              <div key={idx} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl text-center">
                <div className="text-slate-400 font-semibold mb-2 truncate" title={player}>{player}</div>
                <div className={`text-4xl font-black ${scores.individual[idx] < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {scores.individual[idx]}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      
      {/* History Section */}
      {state.rounds.length > 0 && (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200">
              <History className="w-5 h-5 text-indigo-400" /> Round History
            </h2>
            <button 
              onClick={() => setShowCumulative(!showCumulative)}
              className="text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg transition-colors border border-slate-600 shadow-sm"
            >
              {showCumulative ? 'Showing Cumulative Scores' : 'Showing Round Points'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="p-3 rounded-tl-lg">Game</th>
                  {state.players.map((p, i) => <th key={i} className="p-3 text-center">{p}</th>)}
                  <th className="p-3 rounded-tr-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {state.rounds.map((round, roundIndex) => {
                  const cumulativeScores = [0, 0, 0, 0];
                  for (let i = 0; i <= roundIndex; i++) {
                     for (let p = 0; p < 4; p++) {
                        cumulativeScores[p] += state.rounds[i].playerScores[p];
                     }
                  }

                  return (
                  <tr key={round.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-3 font-semibold text-slate-300">
                      {round.gameType === 'ComplexNegative' ? 'Complex' : round.gameType}
                    </td>
                    {round.playerScores.map((score, idx) => {
                      const cumScore = cumulativeScores[idx];
                      const displayScore = showCumulative ? cumScore : score;
                      const isNegative = displayScore < 0;
                      const isPositive = displayScore > 0;
                      return (
                        <td key={idx} className={`p-3 text-center font-bold ${isNegative ? 'text-red-400' : isPositive ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {showCumulative ? (
                             <div className="flex flex-col items-center">
                               <span>{cumScore}</span>
                               <span className="text-[10px] opacity-60 font-medium tracking-tight">({score > 0 ? '+' : ''}{score})</span>
                             </div>
                          ) : (
                             score
                          )}
                        </td>
                      );
                    })}
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this round?")) {
                            dispatch({ type: 'REMOVE_ROUND', payload: { id: round.id } });
                          }
                        }}
                        className="text-red-400 hover:text-red-300 font-medium text-xs bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAddModalOpen && <AddRoundModal onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
};
