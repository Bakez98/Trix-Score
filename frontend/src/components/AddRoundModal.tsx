import React, { useState } from 'react';
import { useGame, type RoundType, type Round } from '../context/GameContext';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const GAME_TYPES: { id: RoundType; name: string; maxTotal: number; multiplier: number }[] = [
  { id: 'Queens', name: 'Queens', maxTotal: 4, multiplier: -25 },
  { id: 'Diamonds', name: 'Diamonds', maxTotal: 13, multiplier: -10 },
  { id: 'Tricks', name: 'Tricks (Lotoosh)', maxTotal: 13, multiplier: -15 },
  { id: 'KingOfHearts', name: 'King of Hearts', maxTotal: 1, multiplier: -75 },
  { id: 'Trix', name: 'Trix', maxTotal: 0, multiplier: 0 },
  { id: 'ComplexNegative', name: 'Complex Negative', maxTotal: 0, multiplier: 0 }
];

export const AddRoundModal: React.FC<Props> = ({ onClose }) => {
  const { state, dispatch } = useGame();
  
  const gamesPerKingdom = state.gameType === 'Complex' ? 2 : 5;
  const currentKingdomIndex = Math.floor(state.rounds.length / gamesPerKingdom);
  const currentDealer = state.players[currentKingdomIndex];
  
  const playedGamesThisKingdom = state.rounds
    .slice(currentKingdomIndex * gamesPerKingdom)
    .map(r => r.gameType);

  // Available games based on Game Type and what was already played in this Kingdom
  const availableGames = state.gameType === 'Complex' 
    ? GAME_TYPES.filter(g => (g.id === 'ComplexNegative' || g.id === 'Trix') && !playedGamesThisKingdom.includes(g.id))
    : GAME_TYPES.filter(g => g.id !== 'ComplexNegative' && !playedGamesThisKingdom.includes(g.id));

  const [selectedGame, setSelectedGame] = useState<RoundType>(availableGames.length > 0 ? availableGames[0].id : 'Trix');
  
  // State for generic count-based games (Queens, Diamonds, Tricks)
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);
  
  // State for King of Hearts
  const [koHPlayer, setKoHPlayer] = useState<number>(0);
  const [koHDoubledBy, setKoHDoubledBy] = useState<number | null>(null);

  // State for Trix (rank per player: 0=1st, 1=2nd, 2=3rd, 3=4th)
  // Store the playerId for each rank position
  const [trixRanks, setTrixRanks] = useState<string[]>([state.players[0], state.players[1], state.players[2], state.players[3]]);

  // State for Queens doubling (who doubled which queen)
  // Array of 4 (one for each queen player might have taken)
  const [queensDoubledBy, setQueensDoubledBy] = useState<(number | null)[]>([null, null, null, null]);

  // Complex Negative state
  const [complexData, setComplexData] = useState<{
    queens: number[], diamonds: number[], tricks: number[], koh: number, 
    koHDoubledBy: number | null, queensDoubledBy: (number | null)[]
  }>({
    queens: [0, 0, 0, 0],
    diamonds: [0, 0, 0, 0],
    tricks: [0, 0, 0, 0],
    koh: 0,
    koHDoubledBy: null,
    queensDoubledBy: [null, null, null, null]
  });

  const handleSave = () => {
    let finalScores = [0, 0, 0, 0];
    
    // Calculate based on selected game
    if (['Diamonds', 'Tricks'].includes(selectedGame)) {
      const gType = GAME_TYPES.find(g => g.id === selectedGame)!;
      const sum = counts.reduce((a, b) => a + b, 0);
      if (sum !== gType.maxTotal) {
        alert(`Total must be exactly ${gType.maxTotal}. Currently it's ${sum}.`);
        return;
      }
      finalScores = counts.map(c => c * gType.multiplier);
    } 
    else if (selectedGame === 'Queens') {
      const sum = counts.reduce((a, b) => a + b, 0);
      if (sum !== 4) {
        alert(`Total Queens must be exactly 4. Currently it's ${sum}.`);
        return;
      }
      // Base -25
      finalScores = counts.map(c => c * -25);
      
      // Base -25
      finalScores = counts.map(c => c * -25);
      
      
      // Apply the selected global doubled queens to the scores
      queensDoubledBy.forEach((doublerIdx, qIdx) => {
         if (doublerIdx !== null) {
            // Find who took THIS queen.
            // Distribute the 4 queens among the takers based on their counts.
            let currentQ = 0;
            let takerOfThisQueen = 0;
            for (let i = 0; i < 4; i++) {
               currentQ += counts[i];
               if (qIdx < currentQ) { takerOfThisQueen = i; break; }
            }
            
            finalScores[takerOfThisQueen] -= 25; // Additional -25 penalty
            finalScores[doublerIdx] += 25; // +25 bonus to the doubler
         }
      });
    }
    else if (selectedGame === 'KingOfHearts') {
      finalScores[koHPlayer] = -75; // base
      if (koHDoubledBy !== null) {
          finalScores[koHPlayer] -= 75; // extra -75
          finalScores[koHDoubledBy] += 75; // +75 to whoever doubled it
      }
    }
    else if (selectedGame === 'Trix') {
      // Validate unique players
      const unique = new Set(trixRanks);
      if (unique.size !== 4) {
        alert("Each player must have exactly one rank!");
        return;
      }
      const scores = [200, 150, 100, 50];
      trixRanks.forEach((playerName, index) => {
        const pIndex = state.players.indexOf(playerName);
        if (pIndex >= 0) finalScores[pIndex] = scores[index];
      });
    }
    else if (selectedGame === 'ComplexNegative') {
      const sumQ = complexData.queens.reduce((a, b) => a + b, 0);
      const sumD = complexData.diamonds.reduce((a, b) => a + b, 0);
      const sumT = complexData.tricks.reduce((a, b) => a + b, 0);
      
      if (sumQ !== 4 || sumD !== 13 || sumT !== 13) {
        alert(`Invalid inputs. Check totals:\nQueens (${sumQ}/4)\nDiamonds (${sumD}/13)\nTricks (${sumT}/13)`);
        return;
      }

      for (let i = 0; i < 4; i++) {
        finalScores[i] += complexData.queens[i] * -25;
        finalScores[i] += complexData.diamonds[i] * -10;
        finalScores[i] += complexData.tricks[i] * -15;
        if (i === complexData.koh) {
          finalScores[i] += -75;
          if (complexData.koHDoubledBy !== null) {
             finalScores[i] -= 75;
             finalScores[complexData.koHDoubledBy] += 75;
          }
        }
      }

      // Apply Complex Queen doubling
      complexData.queensDoubledBy.forEach((doublerIdx, qIdx) => {
         if (doublerIdx !== null) {
            let currentQ = 0;
            let takerOfThisQueen = 0;
            for (let i = 0; i < 4; i++) {
               currentQ += complexData.queens[i];
               if (qIdx < currentQ) { takerOfThisQueen = i; break; }
            }
            finalScores[takerOfThisQueen] -= 25;
            finalScores[doublerIdx] += 25;
         }
      });
    }

    const round: Round = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      gameType: selectedGame,
      playerScores: finalScores,
      details: { counts, koHPlayer, trixRanks, complexData, koHDoubledBy, queensDoubledBy }
    };

    dispatch({ type: 'ADD_ROUND', payload: round });
    onClose();
  };

  const getGameConfig = () => GAME_TYPES.find(g => g.id === selectedGame);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-3xl w-full max-w-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800 z-10">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Log Round Score</h2>
            <p className="text-sm font-semibold text-indigo-400 mt-1 uppercase tracking-wider">
               👑 {currentDealer}'s Kingdom
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-700/50 hover:bg-slate-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Game Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Select Game</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableGames.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGame(g.id)}
                  className={`p-3 rounded-xl border-2 transition-all font-semibold ${selectedGame === g.id ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200' : 'border-slate-700 text-slate-300 hover:border-slate-600'}`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-700 w-full" />

          {/* Dynamic Inputs based on Game Type */}
          
          {['Queens', 'Diamonds', 'Tricks'].includes(selectedGame) && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                <span>Player</span>
                <span>Amount Taken (Max: {getGameConfig()?.maxTotal})</span>
              </div>
              <div className="space-y-3">
                {state.players.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                    <span className="font-semibold text-slate-200">{p}</span>
                    <input
                      type="number"
                      min="0"
                      max={getGameConfig()!.maxTotal}
                      value={counts[idx] || 0}
                      onChange={(e) => {
                        const newCounts = [...counts];
                        newCounts[idx] = parseInt(e.target.value) || 0;
                        setCounts(newCounts);
                      }}
                      className="w-24 bg-slate-800 border border-slate-600 rounded-lg p-2 text-center text-white font-bold outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div className="text-right text-sm font-semibold">
                Total: <span className={counts.reduce((a, b) => a + b, 0) === getGameConfig()?.maxTotal ? "text-emerald-400" : "text-amber-400"}>{counts.reduce((a, b) => a + b, 0)} / {getGameConfig()?.maxTotal}</span>
              </div>
              
              {/* Queen Doubling Configuration */}
              {selectedGame === 'Queens' && counts.reduce((a, b) => a + b, 0) === 4 && (
                <div className="mt-4 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl space-y-3">
                  <h3 className="text-sm font-bold text-indigo-300 uppercase">Doubling (Tadbeel)</h3>
                  {[0, 1, 2, 3].map(qIdx => (
                    <div key={qIdx} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 font-medium">Queen {qIdx + 1} Doubled By:</span>
                      <select 
                        className="bg-slate-800 border border-slate-600 rounded p-1.5 text-white outline-none focus:border-indigo-500"
                        value={queensDoubledBy[qIdx] === null ? "" : queensDoubledBy[qIdx]!}
                        onChange={(e) => {
                          const newQ = [...queensDoubledBy];
                          newQ[qIdx] = e.target.value === "" ? null : parseInt(e.target.value);
                          setQueensDoubledBy(newQ);
                        }}
                      >
                        <option value="">None</option>
                        {state.players.map((p, idx) => <option key={idx} value={idx}>{p}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedGame === 'KingOfHearts' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-400 uppercase">Who took the King of Hearts? (-75)</label>
                <div className="grid grid-cols-2 gap-3">
                  {state.players.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setKoHPlayer(idx)}
                      className={`p-4 rounded-xl border-2 font-bold transition-all ${koHPlayer === idx ? 'border-red-500 bg-red-500/20 text-red-200' : 'border-slate-700 text-slate-300 hover:border-slate-600'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl">
                 <label className="text-sm font-bold text-indigo-300 uppercase">Was it Doubled (Tadbeel)?</label>
                 <select 
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white font-semibold outline-none focus:border-indigo-500"
                    value={koHDoubledBy === null ? "" : koHDoubledBy}
                    onChange={(e) => setKoHDoubledBy(e.target.value === "" ? null : parseInt(e.target.value))}
                 >
                    <option value="">No (Normal -75)</option>
                    {state.players.map((p, idx) => (
                       <option key={idx} value={idx} disabled={idx === koHPlayer}>Doubled by {p} (Taker: -150, Doubler: +75)</option>
                    ))}
                 </select>
              </div>
            </div>
          )}

          {selectedGame === 'Trix' && (
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-400 uppercase">Select final ranks (1st to 4th)</label>
              {[0, 1, 2, 3].map(rank => (
                <div key={rank} className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    rank === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                    rank === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/50' :
                    rank === 2 ? 'bg-amber-600/20 text-amber-500 border border-amber-600/50' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {rank + 1}
                  </div>
                  <select
                    value={trixRanks[rank]}
                    onChange={(e) => {
                      const newRanks = [...trixRanks];
                      newRanks[rank] = e.target.value;
                      setTrixRanks(newRanks);
                    }}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-3 text-white font-semibold outline-none focus:border-indigo-500 transition-colors"
                  >
                    {state.players.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {selectedGame === 'ComplexNegative' && (
             <div className="space-y-6">
                <p className="text-sm text-slate-400 bg-slate-700/30 p-3 rounded-lg border border-slate-600/50">
                  Input the negative card amounts for each player simultaneously.
                </p>
                <div className="overflow-x-auto border border-slate-700 rounded-xl">
                  <table className="w-full text-left bg-slate-800">
                    <thead className="bg-slate-900 border-b border-slate-700 text-slate-400 text-xs uppercase font-bold">
                      <tr>
                        <th className="p-3">Player</th>
                        <th className="p-3 text-center">Queens (4)</th>
                        <th className="p-3 text-center">Diamonds (13)</th>
                        <th className="p-3 text-center">Tricks (13)</th>
                        <th className="p-3 text-center">KoH (1)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {state.players.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                          <td className="p-3 font-semibold text-slate-200">{p}</td>
                          <td className="p-3">
                            <input type="number" min="0" max="4"
                              value={complexData.queens[idx] || 0}
                              onChange={e => {
                                const newC = {...complexData}; newC.queens[idx] = parseInt(e.target.value) || 0; setComplexData(newC);
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-center text-sm font-bold focus:border-indigo-500 outline-none" />
                          </td>
                          <td className="p-3">
                            <input type="number" min="0" max="13"
                              value={complexData.diamonds[idx] || 0}
                              onChange={e => {
                                const newC = {...complexData}; newC.diamonds[idx] = parseInt(e.target.value) || 0; setComplexData(newC);
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-center text-sm font-bold focus:border-indigo-500 outline-none" />
                          </td>
                          <td className="p-3">
                            <input type="number" min="0" max="13"
                              value={complexData.tricks[idx] || 0}
                              onChange={e => {
                                const newC = {...complexData}; newC.tricks[idx] = parseInt(e.target.value) || 0; setComplexData(newC);
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-center text-sm font-bold focus:border-indigo-500 outline-none" />
                          </td>
                          <td className="p-3 text-center">
                            <input type="radio" name="koh" checked={complexData.koh === idx} onChange={() => setComplexData({...complexData, koh: idx})} className="w-4 h-4 text-indigo-500 focus:ring-indigo-500 bg-slate-900 border-slate-700" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-900/80 border-t border-slate-700 text-xs font-bold text-slate-400">
                      <tr>
                        <td className="p-3 text-right">Totals:</td>
                        <td className={`p-3 text-center ${complexData.queens.reduce((a,b)=>a+b,0) === 4 ? 'text-emerald-400':'text-red-400'}`}>{complexData.queens.reduce((a,b)=>a+b,0)}</td>
                        <td className={`p-3 text-center ${complexData.diamonds.reduce((a,b)=>a+b,0) === 13 ? 'text-emerald-400':'text-red-400'}`}>{complexData.diamonds.reduce((a,b)=>a+b,0)}</td>
                        <td className={`p-3 text-center ${complexData.tricks.reduce((a,b)=>a+b,0) === 13 ? 'text-emerald-400':'text-red-400'}`}>{complexData.tricks.reduce((a,b)=>a+b,0)}</td>
                        <td className="p-3 text-center text-emerald-400">1</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl space-y-4">
                   <h3 className="text-sm font-bold text-indigo-300 uppercase">Complex Doubling (Tadbeel)</h3>
                   
                   <div className="space-y-2">
                       <label className="text-xs font-semibold text-slate-400">Who doubled the King of Hearts?</label>
                       <select 
                          className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-indigo-500 text-sm"
                          value={complexData.koHDoubledBy === null ? "" : complexData.koHDoubledBy}
                          onChange={(e) => setComplexData({...complexData, koHDoubledBy: e.target.value === "" ? null : parseInt(e.target.value)})}
                       >
                          <option value="">None</option>
                          {state.players.map((p, idx) => <option key={idx} value={idx} disabled={idx === complexData.koh}>{p}</option>)}
                       </select>
                   </div>

                   {complexData.queens.reduce((a,b)=>a+b,0) === 4 && (
                      <div className="space-y-2 pt-2 border-t border-indigo-500/20">
                          <label className="text-xs font-semibold text-slate-400">Who doubled the Queens?</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[0, 1, 2, 3].map(qIdx => (
                              <div key={qIdx} className="flex items-center gap-2 text-xs">
                                <span className="text-slate-300 w-12">Q{qIdx + 1}:</span>
                                <select 
                                  className="flex-1 bg-slate-800 border border-slate-600 rounded p-1 text-white outline-none focus:border-indigo-500"
                                  value={complexData.queensDoubledBy[qIdx] === null ? "" : complexData.queensDoubledBy[qIdx]!}
                                  onChange={(e) => {
                                    const newQ = [...complexData.queensDoubledBy];
                                    newQ[qIdx] = e.target.value === "" ? null : parseInt(e.target.value);
                                    setComplexData({...complexData, queensDoubledBy: newQ});
                                  }}
                                >
                                  <option value="">None</option>
                                  {state.players.map((p, idx) => <option key={idx} value={idx}>{p}</option>)}
                                </select>
                              </div>
                            ))}
                          </div>
                      </div>
                   )}
                </div>
             </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/80 sticky bottom-0">
          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg active:scale-[0.98]"
          >
            Save Round Scores
          </button>
        </div>
      </div>
    </div>
  );
};
