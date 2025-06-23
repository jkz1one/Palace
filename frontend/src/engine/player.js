/**
 * Manually set a player's face-up cards from their hand.
 * Frontend UI should pass in 3 selected card objects.
 */
export function setFaceUpCardsForPlayer(player, selectedCards) {
  if (!Array.isArray(selectedCards) || selectedCards.length !== 3) {
    throw new Error('Exactly 3 cards must be selected for face-up placement.');
  }

  const uniqueKeys = new Set(selectedCards.map(c => c.suit + c.value));
  if (uniqueKeys.size !== 3) {
    throw new Error('Cards must be unique.');
  }

  for (const selected of selectedCards) {
    const index = player.hand.findIndex(
      c => c.suit === selected.suit && c.value === selected.value
    );
    if (index === -1) {
      throw new Error(`Card ${selected.value} of ${selected.suit} not found in hand.`);
    }

    const card = player.hand.splice(index, 1)[0];
    player.faceUp.push(card);
  }
}

/**
 * NPC selects strongest 3 cards from hand
 */
export function selectFaceUpCardsForNPC(player) {
  player.hand.sort((a, b) => cardValue(b) - cardValue(a));
  for (let i = 0; i < 3; i++) {
    player.faceUp.push(player.hand.shift());
  }
}

function cardValue(card) {
  const order = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return order[card.value] || 0;
}
