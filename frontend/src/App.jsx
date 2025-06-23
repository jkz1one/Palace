import { useState } from 'react';
import {
  createGame,
  playTurn,
  getPlayableCards,
  isGameOver,
  setFaceUpCardsForPlayerWrapper
} from './engine/index.js';

function App() {
  const [game, setGame] = useState(() => createGame(['You', 'NPC']));
  const [error, setError] = useState(null);
  const yourIndex = 0;
  const you = game.players[yourIndex];
  const topCard = game.discardPile.at(-1);
  const playableGroups = getPlayableCards(game, yourIndex);
  const [selected, setSelected] = useState([]);

  const handlePlay = (group) => {
    try {
      const newGame = playTurn({ ...structuredClone(game) }, yourIndex, group);
      setGame(newGame);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleSelect = (card) => {
    const exists = selected.find(c => c.suit === card.suit && c.value === card.value);
    if (exists) {
      setSelected(selected.filter(c => c !== exists));
    } else if (selected.length < 3) {
      setSelected([...selected, card]);
    }
  };

  const confirmSelection = () => {
    try {
      const updatedGame = structuredClone(game);
      setFaceUpCardsForPlayerWrapper(updatedGame.players[0], selected);
      updatedGame.phase = 'playing';
      setGame(updatedGame);
    } catch (err) {
      setError(err.message);
    }
  };

  if (game.phase === 'selecting-palace') {
    return (
      <div style={{ padding: 20, backgroundColor: '#222', color: '#eee' }}>
        <h2>Select 3 Palace Cards</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {you.hand.map((card, i) => {
            const isSelected = selected.find(c => c.suit === card.suit && c.value === card.value);
            return (
              <button
                key={i}
                onClick={() => toggleSelect(card)}
                style={{
                  padding: 10,
                  border: isSelected ? '2px solid lime' : '1px solid gray',
                  backgroundColor: isSelected ? '#333' : '#111',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                {card.value} of {card.suit}
              </button>
            );
          })}
        </div>
        <button
          onClick={confirmSelection}
          disabled={selected.length !== 3}
          style={{ marginTop: 16, padding: '10px 20px' }}
        >
          Confirm Selection
        </button>
        {error && <p style={{ color: 'red' }}>⚠️ {error}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: 20, backgroundColor: '#222', color: '#eee' }}>
      <h1>Palace</h1>

      <h2>Your Hand</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        {you.hand.map((card, i) => (
          <div key={i} style={{ padding: 6, border: '1px solid #888', borderRadius: 4 }}>
            {card.value} of {card.suit}
          </div>
        ))}
      </div>

      <h2>Playable Groups</h2>
      {playableGroups.length > 0 ? (
        playableGroups.map((group, i) => (
          <button key={i} onClick={() => handlePlay(group)} style={{ margin: 4, padding: 8 }}>
            Play: {group.map(c => `${c.value}`).join(', ')}
          </button>
        ))
      ) : (
        <p>No valid plays</p>
      )}

      <h2>Top of Pile</h2>
      <div>{topCard ? `${topCard.value} of ${topCard.suit}` : 'Pile was cleared'}</div>

      {error && <p style={{ color: 'red' }}>⚠️ {error}</p>}
      {isGameOver(game) && <h2 style={{ color: 'lime' }}>🎉 Game Over!</h2>}
    </div>
  );
}

export default App;
