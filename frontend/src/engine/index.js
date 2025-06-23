import { createDeck, shuffleDeck } from './deck.js';
import { setFaceUpCardsForPlayer, selectFaceUpCardsForNPC } from './player.js';
import { isValidMove } from './rules.js';

export function createGame(playerNames = ['Player 1', 'Player 2']) {
  const deck = shuffleDeck(createDeck());

  const players = playerNames.map(name => ({
    name,
    hand: [],
    faceUp: [],
    faceDown: [],
  }));

  players.forEach(player => {
    for (let i = 0; i < 3; i++) player.faceDown.push(deck.pop());
    for (let i = 0; i < 7; i++) player.hand.push(deck.pop());
  });

  players.forEach(p => {
    if (p.name.toLowerCase().includes('npc')) {
      selectFaceUpCardsForNPC(p);
    }
  });

  let discardPile = [deck.pop()];
  if (discardPile[0].value === '10') discardPile = [];

  return {
    players,
    deck,
    discardPile,
    currentPlayerIndex: 0,
    forceExtraTurn: discardPile.length === 0,
    phase: 'selecting-palace'
  };
}

export function setFaceUpCardsForPlayerWrapper(player, selected) {
  setFaceUpCardsForPlayer(player, selected);
}

export function playTurn(gameState, playerIndex, chosenCards) {
  const player = gameState.players[playerIndex];
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];

  if (!Array.isArray(chosenCards)) chosenCards = [chosenCards];

  const allSame = chosenCards.every(card => card.value === chosenCards[0].value);
  if (!allSame) throw new Error('All cards must be the same value');

  if (!isValidMove(topCard, chosenCards[0])) {
    throw new Error('Invalid move');
  }

  for (const card of chosenCards) {
    let zone = player.hand.length ? player.hand
             : player.faceUp.length ? player.faceUp
             : player.faceDown;
    const idx = zone.findIndex(c => c.suit === card.suit && c.value === card.value);
    if (idx !== -1) zone.splice(idx, 1);
  }

  gameState.discardPile.push(...chosenCards);

  if (chosenCards[0].value === '10') {
    gameState.discardPile = [];
    gameState.forceExtraTurn = true;
    return gameState;
  }

  const pile = gameState.discardPile;
  if (pile.length >= 4) {
    const lastFour = pile.slice(-4);
    const same = lastFour.every(c => c.value === lastFour[0].value);
    if (same) {
      gameState.discardPile = [];
      gameState.forceExtraTurn = true;
      return gameState;
    }
  }

  gameState.forceExtraTurn = false;
  gameState.currentPlayerIndex = (playerIndex + 1) % gameState.players.length;
  return gameState;
}

export function getPlayableCards(gameState, playerIndex) {
  const player = gameState.players[playerIndex];
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];

  let zone = player.hand.length ? player.hand
           : player.faceUp.length ? player.faceUp
           : player.faceDown;

  if (!zone.length) return [];

  if (zone === player.faceDown) return [zone[0]];

  const playableGroups = {};
  for (const card of zone) {
    if (isValidMove(topCard, card)) {
      if (!playableGroups[card.value]) playableGroups[card.value] = [];
      playableGroups[card.value].push(card);
    }
  }

  return Object.values(playableGroups);
}

export function isGameOver(gameState) {
  return gameState.players.some(p =>
    p.hand.length === 0 &&
    p.faceUp.length === 0 &&
    p.faceDown.length === 0
  );
}
