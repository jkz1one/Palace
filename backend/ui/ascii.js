// File: /palace/ui/ascii.js
const chalk = require('chalk');

function renderGameState(player, opponent, discardPile, deckLength) {
  const topCard = discardPile[discardPile.length - 1];
  console.clear();
  const headerColor = chalk.cyan;

  console.log(chalk.bold("=========== HOUSE OF PALACE ==========="));

  // Opponent summary inline with turn line
  const opponentStatus = discardPile.length === 0
  ? (opponent.faceDown.length > 0 ? "Btm 3" : "Top 3")
  : `Hand: ${opponent.hand.length}`;
  console.log(headerColor(`Turn: ${player.name.toUpperCase()}      Opponent Hand: ${opponentStatus}`));

  if (topCard) {
    console.log(headerColor(`\nTop Card: [${topCard.value}${colorSuit(symbol(topCard.suit), topCard.suit)}]`));
  } else {
    console.log(headerColor("\nTop Card: [--]"));
  }
  console.log(headerColor(`Pile: (${discardPile.length} cards)`));
  console.log(`Deck: [${deckLength}]\n`);

  console.log(chalk.green("Your Hand:"));
  const groupedHand = {};
  player.hand.forEach((card, index) => {
    const val = card.value;
    if (!groupedHand[val]) groupedHand[val] = [];
    groupedHand[val].push({ card, index });
  });
  Object.keys(groupedHand).sort((a, b) => groupedHand[b][0].index - groupedHand[a][0].index).forEach(value => {
    const group = groupedHand[value].map(({ card, index }) => ` [${index}] ${card.value}${colorSuit(symbol(card.suit), card.suit)}`);
    console.log(`${value}s:${group.join("")}`);
  });

  console.log(chalk.yellow("\nYour Palace:"));
  const palaceGroups = {};
  player.faceUp.forEach(card => {
    if (!palaceGroups[card.value]) palaceGroups[card.value] = [];
    palaceGroups[card.value].push(card);
  });
  Object.keys(palaceGroups).sort((a, b) => a - b).forEach(value => {
    const group = palaceGroups[value]
      .map(card => `${card.value}${colorSuit(symbol(card.suit), card.suit)}`)
      .join("  ");
    console.log(`  Top: ${group}`);
  });
  player.faceDown.forEach(() => {
    console.log("  Bottom: [##]");
  });

  console.log("\n---------------------------------------");
  console.log(headerColor("Enter: play <index> [index] | pickup | quit"));
  console.log("=======================================");
}

function symbol(suit) {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
    default: return '?';
  }
}

function colorSuit(text, suit) {
  if (suit === 'hearts' || suit === 'diamonds') return chalk.red(text);
  if (suit === 'spades' || suit === 'clubs') return chalk.white(text);
  return text;
}

function displayGroupedSelection(hand) {
  const grouped = {};
  hand.forEach((card, index) => {
    const val = card.value;
    if (!grouped[val]) grouped[val] = [];
    grouped[val].push({ card, index });
  });
  Object.keys(grouped).sort().forEach(value => {
    const group = grouped[value]
      .map(({ card, index }) => `[${index}] ${card.value}${colorSuit(symbol(card.suit), card.suit)}`)
      .join("   ");
    console.log(`${value}s: ${group}`);
  });
}

module.exports = { renderGameState, displayGroupedSelection };
