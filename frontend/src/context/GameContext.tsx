import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';

export type GameMode = 'Individual' | 'Partnership' | null;
export type GameType = 'Complex' | 'Kingdoms' | null;
export type RoundType = 'Queens' | 'Diamonds' | 'Tricks' | 'KingOfHearts' | 'Trix' | 'ComplexNegative';

export interface Round {
  id: string;
  timestamp: number;
  gameType: RoundType;
  playerScores: number[]; // Array of 4 elements corresponding to player points
  details: any; // Storing raw inputs for history details
  kingIndex?: number;
}

export interface GameState {
  gameMode: GameMode;
  gameType: GameType;
  players: string[];
  rounds: Round[];
}

const initialState: GameState = {
  gameMode: null,
  gameType: null,
  players: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
  rounds: [],
};

type Action =
  | { type: 'SET_GAME_CONFIG'; payload: { gameMode: GameMode; gameType: GameType; players: string[] } }
  | { type: 'ADD_ROUND'; payload: Round }
  | { type: 'REMOVE_ROUND'; payload: { id: string } }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_STATE'; payload: GameState };

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_GAME_CONFIG':
      return { ...state, ...action.payload };
    case 'ADD_ROUND':
      return { ...state, rounds: [...state.rounds, action.payload] };
    case 'REMOVE_ROUND':
      return { ...state, rounds: state.rounds.filter(r => r.id !== action.payload.id) };
    case 'RESET_GAME':
      return initialState;
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('trixGameState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch (e) {
        console.error('Failed to parse state from localStorage');
      }
    }
  }, []);

  // Save to local storage on state change
  useEffect(() => {
    localStorage.setItem('trixGameState', JSON.stringify(state));
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
