const player = require('./lib/player.js');
// Instructions to start
const instructions = `You have 1 rule here, stay on the table!
  Usage: npm start [width][height][x][y]`;

const commands = `0 - Exit Game
  1 - Move forward
  2 - Move backward
  3 - Rotate 90 degrees clockwise
  4 - Rotate 90 degrees counter-clockwise`;

const movementSchema = {
  description: 'Please enter a number for movement option',
  type: 'string',
  //pattern: new RegExp('^(' + this.getMovementOptions(player).join('|') + ')$', 'i'),
  message: 'Please choose an appropriate movement option',
  require: true,
  before: (val) => val.toUpperCase(),
};

create2dArray = (numRows, numCols, initial) => {
  let arr = [];
  for (let i = 0; i < numRows; ++i) {
    let columns = [];
    for (let j = 0; j < numCols; ++j) {
      columns[j] = initial;
    }
    arr[i] = columns;
  }
  return arr;
};
module.exports = { create2dArray, movementSchema, instructions, commands };
