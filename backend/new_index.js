const prompt = require('prompt-sync')();
const chalk = require('chalk').default || require('chalk');

// ------------------------
// Constants & Mappings
// ------------------------

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

const suitSymbols = {
  'hearts': '♥',
  'diamonds': '♦',
  'clubs': '♣',
  'spades': '♠'
};

// Predefined color functions for players.
const playerColors = [chalk.red, chalk.green, chalk.blue, chalk.magenta];

// For display sorting (natural card ranking)
function getDisplayRank(value) {
  const displayRanks = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 14
  };
  return displayRanks[value] || 0;
}

// ------------------------
// Utility Functions
// ------------------------

// Create a standard deck of 52 cards.
function createDeck() {
  const deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  return deck;
}

// Shuffle the deck using the Fisher-Yates algorithm.
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Ranking for normal cards (for comparing moves).
const cardRanks = {
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14,
};

// For selecting face-up cards, treat special cards as low.
function getCardSelectionValue(card) {
  if (card.value === '2') return 0;
  if (card.value === '10') return 1;
  return cardRanks[card.value] || 0;
}

// Check if playing a card is valid based on the top card of the discard pile.
function isValidMove(card, topCard) {
  if (card.value === '2' || card.value === '10') return true;
  if (!topCard || topCard.value === '2') return true;
  if (cardRanks[card.value] && cardRanks[topCard.value]) {
    return cardRanks[card.value] >= cardRanks[topCard.value];
  }
  return false;
}

// ------------------------
// Grouping Function for Display
// ------------------------
// Groups cards by their value and prints each group in the format:
//   <value>s: [index] <value><suitSymbol>   [index] <value><suitSymbol> ...
function displayCardsGrouped(cards) {
  const groups = {};
  cards.forEach((card, index) => {
    if (!groups[card.value]) {
      groups[card.value] = [];
    }
    groups[card.value].push({ index, suit: suitSymbols[card.suit] });
  });
  // Sort the groups in descending order of card rank.
  const sortedValues = Object.keys(groups).sort((a, b) => getDisplayRank(b) - getDisplayRank(a));
  sortedValues.forEach(value => {
    const group = groups[value];
    const groupStr = group.map(item => `[${item.index}] ${value}${item.suit}`).join("   ");
    console.log(chalk.cyan(`${value}s:`) + " " + groupStr);
  });
}

// ------------------------
// Main Menu & Player Setup
// ------------------------

console.clear();
console.log(chalk.blue("Welcome to Palace!"));
let numPlayers = parseInt(prompt("Enter number of players (2-4): "));
while (isNaN(numPlayers) || numPlayers < 2 || numPlayers > 4) {
  numPlayers = parseInt(prompt(chalk.red("Please enter a valid number between 2 and 4: ")));
}

const players = [];
for (let i = 0; i < numPlayers; i++) {
  let typeInput = prompt(`Is player ${i + 1} human? (y/n): `).toLowerCase();
  let isHuman = typeInput === 'y' || typeInput === 'yes';
  let name;
  if (isHuman) {
    name = prompt(`Enter name for player ${i + 1}: `);
    if (!name) name = `Player ${i + 1}`;
  } else {
    name = `NPC ${i + 1}`;
  }
  let color = playerColors[i % playerColors.length];
  players.push({ name, type: isHuman ? "human" : "npc", color, hand: [], faceUp: [], faceDown: [] });
}

// ------------------------
// Dealing Phase
// ------------------------

let deck = createDeck();
deck = shuffleDeck(deck);

players.forEach(player => {
  for (let i = 0; i < 3; i++) {
    player.faceDown.push(deck.pop());
  }
  for (let i = 0; i < 7; i++) {
    player.hand.push(deck.pop());
  }
});

// Let human players choose 3 face-up cards; NPCs auto-select.
function selectFaceUpCardsForPlayer(player) {
  console.log(chalk.yellow(`\n${player.color(player.name)}, select 3 cards from your hand to place face up on your table:`));
  // Display hand grouped by card value.
  displayCardsGrouped(player.hand);
  let indicesInput = prompt("Enter the indices of the 3 cards separated by spaces: ");
  let indices = indicesInput.split(" ").map(i => parseInt(i)).filter(i => !isNaN(i));
  if (indices.length !== 3 || indices.some(i => i < 0 || i >= player.hand.length)) {
    console.log(chalk.red("Invalid selection. Automatically selecting highest cards."));
    let sortedIndices = player.hand
      .map((card, index) => ({ index, value: getCardSelectionValue(card) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(obj => obj.index);
    indices = sortedIndices;
  }
  indices.sort((a, b) => b - a);
  for (let idx of indices) {
    let card = player.hand.splice(idx, 1)[0];
    player.faceUp.push(card);
  }
  console.log(chalk.green("Your face up cards are:"));
  player.faceUp.forEach((card, index) => {
    console.log(chalk.cyan(`${index}: ${card.value}${suitSymbols[card.suit]}`));
  });
}

function selectFaceUpCardsForNPC(player) {
  player.hand.sort((a, b) => getCardSelectionValue(b) - getCardSelectionValue(a));
  for (let i = 0; i < 3; i++) {
    player.faceUp.push(player.hand.shift());
  }
  console.log(chalk.magenta(`${player.color(player.name)} has selected its face up cards.`));
}

players.forEach(player => {
  if (player.type === "human") {
    selectFaceUpCardsForPlayer(player);
  } else {
    selectFaceUpCardsForNPC(player);
  }
});

// The remaining deck becomes the draw pile. Start the discard pile with one card.
let discardPile = [deck.pop()];

// Check initial discard: if it's a 10, clear it and force an extra move.
let forceExtraTurn = false;
if (discardPile[0].value === '10') {
  console.log(chalk.red("Initial discard is a 10. Clearing it and forcing the first player to play again."));
  discardPile = [];
  forceExtraTurn = true;
}

// ------------------------
// GAME LOOP
// ------------------------

let currentPlayerIndex = 0;
while (true) {
  let currentPlayer = players[currentPlayerIndex];
  console.log(chalk.blue(`\n${currentPlayer.color(currentPlayer.name)}'s turn.`));
  
  // Determine active zone: hand > faceUp > faceDown.
  let activeCards, activeZone;
  if (currentPlayer.hand.length > 0) {
    activeCards = currentPlayer.hand;
    activeZone = "hand";
  } else if (currentPlayer.faceUp.length > 0) {
    activeCards = currentPlayer.faceUp;
    activeZone = "faceUp";
  } else if (currentPlayer.faceDown.length > 0) {
    activeCards = currentPlayer.faceDown;
    activeZone = "faceDown";
  } else {
    console.log(chalk.green(`${currentPlayer.color(currentPlayer.name)} has no cards left and wins the game!`));
    break;
  }
  
  // Display discard pile info.
  let topCard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
  if (topCard) {
    console.log(chalk.yellow(`Discard Pile (${discardPile.length} cards): Top card: ${topCard.value}${suitSymbols[topCard.suit]}`));
  } else {
    console.log(chalk.yellow("Discard pile is empty (0 cards). You can play any card."));
  }
  
  // --- PLAY PHASE ---
  if (activeZone === "faceDown") {
    if (currentPlayer.type === "human") {
      console.log(chalk.yellow("Your face-down cards:"));
      for (let i = 0; i < currentPlayer.faceDown.length; i++) {
        console.log(chalk.cyan(`Card index: ${i}`));
      }
      let chosenIndex = prompt("Enter the index of the face-down card to flip: ");
      chosenIndex = parseInt(chosenIndex);
      if (isNaN(chosenIndex) || chosenIndex < 0 || chosenIndex >= currentPlayer.faceDown.length) {
        console.log(chalk.red("Invalid selection, defaulting to the first face-down card."));
        chosenIndex = 0;
      }
      let card = currentPlayer.faceDown.splice(chosenIndex, 1)[0];
      console.log(chalk.cyan(`You flip a face-down card: ${card.value}${suitSymbols[card.suit]}`));
      if (isValidMove(card, topCard)) {
        console.log(chalk.green("You play the card from face-down."));
        discardPile.push(card);
        if (card.value === '10') {
          console.log(chalk.red("10 played! Clearing the discard pile and forcing an extra move."));
          discardPile = [];
          forceExtraTurn = true;
        } else if (card.value === '2') {
          console.log(chalk.red("2 played! Forcing an extra move."));
          forceExtraTurn = true;
        }
      } else {
        console.log(chalk.red("Card cannot be played. You pick up the discard pile."));
        currentPlayer.hand.push(...discardPile);
        discardPile = [];
        currentPlayer.hand.push(card);
      }
    } else {
      let card = activeCards.shift();
      console.log(chalk.cyan(`${currentPlayer.color(currentPlayer.name)} flips a face-down card: ${card.value}${suitSymbols[card.suit]}`));
      if (isValidMove(card, topCard)) {
        console.log(chalk.green(`${currentPlayer.color(currentPlayer.name)} plays the card from face-down.`));
        discardPile.push(card);
        if (card.value === '10') {
          console.log(chalk.red("10 played! Clearing the discard pile and forcing an extra move."));
          discardPile = [];
          forceExtraTurn = true;
        } else if (card.value === '2') {
          console.log(chalk.red("2 played! Forcing an extra move."));
          forceExtraTurn = true;
        }
      } else {
        console.log(chalk.red(`${currentPlayer.color(currentPlayer.name)} cannot play the card and picks up the discard pile.`));
        currentPlayer.hand.push(...discardPile);
        discardPile = [];
        currentPlayer.hand.push(card);
      }
    }
  } else if (currentPlayer.type === "human") {
    let validMovesIndices = [];
    activeCards.forEach((card, index) => {
      if (isValidMove(card, topCard)) {
        validMovesIndices.push(index);
      }
    });
    if (validMovesIndices.length === 0) {
      console.log(chalk.red("No valid moves available. Automatically picking up the discard pile."));
      currentPlayer.hand.push(...discardPile);
      discardPile = [];
    } else {
      console.log(chalk.yellow(`Your ${activeZone} cards:`));
      displayCardsGrouped(activeCards);
      console.log(chalk.magenta("Valid moves (indices): " + validMovesIndices.join(", ")));
      let input;
      if (forceExtraTurn) {
        console.log(chalk.red("Forced extra move: You must play a card (pickup not allowed)."));
        input = prompt("Enter card indices (separated by spaces) to play: ");
      } else {
        input = prompt("Enter card indices (separated by spaces) to play or 'p' to pick up the discard pile: ");
      }
      if (!forceExtraTurn && input.toLowerCase() === 'p') {
        console.log(chalk.red("You choose to pick up the discard pile."));
        currentPlayer.hand.push(...discardPile);
        discardPile = [];
      } else {
        let indices = input.split(" ").map(s => parseInt(s)).filter(n => !isNaN(n));
        if (indices.length === 0) {
          console.log(chalk.red("No valid indices entered. Try again."));
          continue;
        }
        let allValid = indices.every(idx => validMovesIndices.includes(idx));
        if (!allValid) {
          console.log(chalk.red("One or more selected cards are not valid moves. Try again."));
          continue;
        }
        let firstValue = activeCards[indices[0]].value;
        let sameValue = indices.every(idx => activeCards[idx].value === firstValue);
        if (!sameValue) {
          console.log(chalk.red("All selected cards must be of the same value. Try again."));
          continue;
        }
        indices.sort((a, b) => b - a);
        console.log(chalk.green("You play:"));
        for (let idx of indices) {
          let card = activeCards[idx];
          console.log(chalk.green(`${card.value}${suitSymbols[card.suit]}`));
          discardPile.push(card);
          activeCards.splice(idx, 1);
        }
        if (firstValue === '10') {
          console.log(chalk.red("10 played! Clearing the discard pile and forcing an extra move."));
          discardPile = [];
          forceExtraTurn = true;
        } else if (firstValue === '2') {
          console.log(chalk.red("2 played! Forcing an extra move."));
          forceExtraTurn = true;
        } else {
          forceExtraTurn = false;
        }
      }
    }
  } else {
    let played = false;
    let validCardsByValue = {};
    activeCards.forEach((card, index) => {
      if (isValidMove(card, topCard)) {
        validCardsByValue[card.value] = validCardsByValue[card.value] || [];
        validCardsByValue[card.value].push(index);
      }
    });
    for (let value in validCardsByValue) {
      let indices = validCardsByValue[value];
      if (indices.length > 0) {
        indices.sort((a, b) => b - a);
        console.log(chalk.green(`${currentPlayer.color(currentPlayer.name)} plays ${indices.length} card(s) of ${value}.`));
        for (let idx of indices) {
          let card = activeCards[idx];
          discardPile.push(card);
          activeCards.splice(idx, 1);
        }
        if (value === '10') {
          console.log(chalk.red("NPC played a 10! Clearing the discard pile and forcing an extra move."));
          discardPile = [];
          forceExtraTurn = true;
        } else if (value === '2') {
          console.log(chalk.red("NPC played a 2! Forcing an extra move."));
          forceExtraTurn = true;
        } else {
          forceExtraTurn = false;
        }
        played = true;
        break;
      }
    }
    if (!played) {
      console.log(chalk.red(`${currentPlayer.color(currentPlayer.name)} has no valid moves and picks up the discard pile.`));
      currentPlayer.hand.push(...discardPile);
      discardPile = [];
    }
  }
  
  // --- FOUR-OF-A-KIND CHECK ---
  if (discardPile.length >= 4) {
    let last4 = discardPile.slice(-4);
    if (last4.every(card => card.value === last4[0].value)) {
      console.log(chalk.red("Four of a kind played in a row! Clearing the discard pile and forcing an extra move."));
      discardPile = [];
      forceExtraTurn = true;
    }
  }
  
  // --- DRAW PHASE (only when playing from hand) ---
  if (activeZone === "hand" && deck.length > 0) {
    while (currentPlayer.hand.length < 3 && deck.length > 0) {
      let drawnCard = deck.pop();
      currentPlayer.hand.push(drawnCard);
      console.log(chalk.blue(`${currentPlayer.color(currentPlayer.name)} draws a card from the deck.`));
    }
  }
  
  // Check win condition.
  if (
    currentPlayer.hand.length === 0 &&
    currentPlayer.faceUp.length === 0 &&
    currentPlayer.faceDown.length === 0
  ) {
    console.log(chalk.green(`\n${currentPlayer.color(currentPlayer.name)} wins the game!`));
    break;
  }
  
  // --- TURN SWITCHING ---
  if (!forceExtraTurn) {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  } else {
    console.log(chalk.blue(`${currentPlayer.color(currentPlayer.name)} gets an extra move.`));
    forceExtraTurn = false;
  }
}
