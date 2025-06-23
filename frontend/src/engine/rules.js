export const cardRanks = {
  '3': 3, '4': 4, '5': 5, '6': 6,
  '7': 7, '8': 8, '9': 9, 'J': 11,
  'Q': 12, 'K': 13, 'A': 14
};

/**
 * Used for NPC card sorting (or AI selection logic).
 * 2s and 10s are considered special utility cards.
 */
export function getCardSelectionValue(card) {
  if (card.value === '2') return 0;
  if (card.value === '10') return 1;
  return cardRanks[card.value] || 0;
}

/**
 * Determines if a given card can be played on top of the current discard pile card.
 */
export function isValidMove(card, topCard) {
  if (card.value === '2' || card.value === '10') return true; // wildcards
  if (!topCard || topCard.value === '2') return true;          // open or 2-under
  if (cardRanks[card.value] && cardRanks[topCard.value]) {
    return cardRanks[card.value] >= cardRanks[topCard.value];
  }
  return false;
}
