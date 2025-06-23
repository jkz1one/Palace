// FULL UPDATED game.js WITH INPUT VALIDATION
const prompt = require('prompt-sync')();
const chalk = require('chalk');
const { createDeck, shuffleDeck } = require('./deck');
const { selectFaceUpCardsForPlayer, selectFaceUpCardsForNPC } = require('./player');
const { isValidMove } = require('./rules');
const { renderGameState } = require('../ui/ascii');

function startGame() {
  let deck = shuffleDeck(createDeck());
  const players = [
    { name: "You", hand: [], faceUp: [], faceDown: [] },
    { name: "NPC", hand: [], faceUp: [], faceDown: [] },
  ];

  players.forEach(player => {
    for (let i = 0; i < 3; i++) player.faceDown.push(deck.pop());
    for (let i = 0; i < 7; i++) player.hand.push(deck.pop());
  });

  players.forEach(p => p.name === "You" ? selectFaceUpCardsForPlayer(p) : selectFaceUpCardsForNPC(p));

  let discardPile = [deck.pop()];
  let forceExtraTurn = discardPile[0].value === '10';
  if (forceExtraTurn) {
    console.log(chalk.red("Initial 10! Pile cleared. You must play again."));
    discardPile = [];
  }

  let currentPlayerIndex = 0;

  while (true) {
    let player = players[currentPlayerIndex];
    renderGameState(players[0], players[1], discardPile, deck.length);
    console.log(chalk.cyan(`\nTurn: ${player.name.toUpperCase()}`));

    let activeCards = player.hand.length ? player.hand
                    : player.faceUp.length ? player.faceUp
                    : player.faceDown.length ? player.faceDown : [];

    let activeZone = player.hand.length ? 'hand'
                    : player.faceUp.length ? 'faceUp'
                    : 'faceDown';

    if (activeCards.length === 0) {
      console.log(chalk.green(`${player.name} wins the game!`));
      break;
    }

    const topCard = discardPile[discardPile.length - 1];

    if (activeZone === 'faceDown') {
      const index = 0;
      const card = activeCards.splice(index, 1)[0];
      console.log(chalk.gray(`${player.name} flips: ${card.value} of ${card.suit}`));
      if (isValidMove(card, topCard)) {
        discardPile.push(card);
        forceExtraTurn = ['2', '10'].includes(card.value);
        if (card.value === '10') discardPile = [];
      } else {
        console.log(chalk.red("Invalid flip. Picking up pile."));
        player.hand.push(...discardPile, card);
        discardPile = [];
      }
    } else if (player.name === 'You') {
      let valid = activeCards.map((card, i) => isValidMove(card, topCard) ? i : -1).filter(i => i !== -1);
      if (!valid.length) {
        console.log(chalk.red("No valid moves. Picking up pile."));
        player.hand.push(...discardPile);
        discardPile = [];
      } else {
        let raw, indices;
        while (true) {
          const input = prompt("Enter card indices (space-separated) or 'p' to pick up: ").trim();
          if (input.toLowerCase() === 'p') {
            player.hand.push(...discardPile);
            discardPile = [];
            indices = null;
            break;
          }
          raw = input.split(/\s+/);
          const allNumeric = raw.every(i => /^\d+$/.test(i));
          indices = allNumeric ? raw.map(Number) : [];
          const unique = new Set(indices);
          const allInRange = [...unique].every(i => i >= 0 && i < activeCards.length);
          const sameVal = allInRange && [...unique].every(i => activeCards[i].value === activeCards[indices[0]].value);
          const allPlayable = [...unique].every(i => isValidMove(activeCards[i], topCard));

          if (indices.length && allInRange && sameVal && allPlayable) break;
          console.log(chalk.red("Invalid selection. Please enter valid, matching, playable card indices."));
        }

        if (indices) {
  indices.sort((a, b) => b - a);
  const played = indices.map(idx => activeCards[idx]);
  for (let idx of indices) {
    discardPile.push(activeCards.splice(idx, 1)[0]);
  }
  const playedValue = played[0].value;
  if (playedValue === '10') {
    console.log(chalk.red("10 played! Pile cleared. You must go again."));
    discardPile = [];
    forceExtraTurn = true;
  } else if (playedValue === '2') {
    console.log(chalk.red("2 played! You must play again."));
    forceExtraTurn = true;
  } else {
    forceExtraTurn = false;
  }
}
      }
    } else {
      // Basic NPC logic (can be expanded)
      const options = activeCards.filter(c => isValidMove(c, topCard));
      if (!options.length) {
        console.log(chalk.red("NPC picks up the pile."));
        player.hand.push(...discardPile);
        discardPile = [];
      } else {
        const valueGroups = {};
        activeCards.forEach((card, idx) => {
          if (isValidMove(card, topCard)) {
            if (!valueGroups[card.value]) valueGroups[card.value] = [];
            valueGroups[card.value].push(idx);
          }
        });
        const bestValue = Object.keys(valueGroups)[0];
        const indices = valueGroups[bestValue];
        indices.sort((a, b) => b - a);
        indices.forEach(idx => {
          discardPile.push(activeCards.splice(idx, 1)[0]);
        });
        if (bestValue === '10') discardPile = [];
        forceExtraTurn = ['2', '10'].includes(bestValue);
      }
    }

    if (discardPile.length >= 4) {
      let last4 = discardPile.slice(-4);
      if (last4.every(c => c.value === last4[0].value)) {
        console.log(chalk.red("Four of a kind! Pile cleared."));
        discardPile = [];
        forceExtraTurn = true;
      }
    }

    if (activeZone === 'hand' && deck.length > 0) {
      while (player.hand.length < 3 && deck.length > 0) {
        player.hand.push(deck.pop());
      }
    }

    if (!forceExtraTurn) {
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    } else {
      console.log(chalk.blue(`${player.name} goes again.`));
      forceExtraTurn = false;
    }
  }
}

module.exports = { startGame };
