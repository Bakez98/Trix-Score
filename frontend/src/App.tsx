
import { useGame } from './context/GameContext';
import { GameSetup } from './components/GameSetup';
import { Scoreboard } from './components/Scoreboard';

function AppContent() {
  const { state } = useGame();

  // If gameMode is not set, we are in setup mode
  if (!state.gameMode) {
    return <GameSetup />;
  }

  // Otherwise show the main scoreboard
  return <Scoreboard />;
}

function App() {
  return <AppContent />;
}

export default App;
