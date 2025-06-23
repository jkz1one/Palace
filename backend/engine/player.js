// File: /palace/engine/player.js
const prompt = require('prompt-sync')();
const chalk = require('chalk');
const { getCardSelectionValue } = require('./rules');
const { displayGroupedSelection } = require('../ui/ascii');

function selectFaceUpCardsForPlayer(player) {
  console.log(chalk.yellow(`\n${player.name}, select 3 cards from your hand to place as your Palace:`));
  displayGroupedSelection(player.hand);

  let raw;
  let indices;

  while (true) {
    let indicesInput = prompt("Enter the indices of the 3 cards separated by spaces: ");
    raw = indicesInput.trim().split(/\s+/);

    const allNumeric = raw.every(i => /^\d+$/.test(i));
    indices = allNumeric ? raw.map(i => parseInt(i)) : [];
    const unique = new Set(indices);
    const valid = [...unique].every(i => i >= 0 && i < player.hand.length);

    if (indices.length === 3 && valid) break;
    console.log(chalk.red("Invalid selection. Please enter 3 valid card indices."));
  }

  indices.sort((a, b) => b - a);
  for (let idx of indices) {
    let card = player.hand.splice(idx, 1)[0];
    player.faceUp.push(card);
  }

  console.log(chalk.green("Your Palace cards are:"));
  displayGroupedSelection(player.faceUp);
}

function selectFaceUpCardsForNPC(player) {
  player.hand.sort((a, b) => getCardSelectionValue(b) - getCardSelectionValue(a));
  for (let i = 0; i < 3; i++) {
    player.faceUp.push(player.hand.shift());
  }
  console.log(chalk.magenta("NPC has selected its Palace cards."));
}

module.exports = {
  selectFaceUpCardsForPlayer,
  selectFaceUpCardsForNPC
};
