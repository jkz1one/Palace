const cardRanks = {
    '3': 3, '4': 4, '5': 5, '6': 6,
    '7': 7, '8': 8, '9': 9, 'J': 11,
    'Q': 12, 'K': 13, 'A': 14,
  };
  
  function getCardSelectionValue(card) {
    if (card.value === '2') return 0;
    if (card.value === '10') return 1;
    return cardRanks[card.value] || 0;
  }
  
  function isValidMove(card, topCard) {
    if (card.value === '2' || card.value === '10') return true;
    if (!topCard || topCard.value === '2') return true;
    if (cardRanks[card.value] && cardRanks[topCard.value]) {
      return cardRanks[card.value] >= cardRanks[topCard.value];
    }
    return false;
  }
  
  module.exports = { getCardSelectionValue, isValidMove, cardRanks };
  