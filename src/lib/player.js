var player = {
  name: 'Object',
  power: 15,
  party: [], // If the player meets a friend unit then their details are pushed to this array
  prev_x: 0, // previous x of player
  prev_y: 0, // previous y of player
  x: 0, // Current x of player
  y: 0, // Current y of player
  freePass: 0, // If 1 or more then the player is allowed to move to a tile
  resolve: true, // Is the player in a fight?
  conflict: {
    enemy: undefined, // If the player is in a fight then who is the player fighting?
  },
  end: false, // has the game ended?
  turn: 0, // Counter for no. of turns player has played
};

module.exports = player;
