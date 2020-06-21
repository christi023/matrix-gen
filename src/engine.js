// require files for mapping
const colors = require('colors');
const config = require('./config');
const utils = require('./utils');
// declare sizes,map & engine  for use
let map_width;
let map_height;
let map;
let engine = {};

// initialize engine built
engine.init = () => {
  map_width = config.map_width;
  map_height = config.map_height;
  map = utils.create2dArray(map_width, map_height, 0);

  engine.map = map;
};

// display the map
engine.displayMap = function (map) {
  console.log('MAP VIEW'.bgWhite.black);
  for (let i = 0; i < map_width; i++) {
    let row = '';
    for (let j = 0; j < map_height; j++) {
      if (map[j][i].explored) {
        switch (map[j][i].type) {
          case 'player':
            row += colors.cyan([j][i]);
            break;
          case 'blocked':
            row += colors.gray([j][i]);
            break;
          default:
            row += [j][i];
        }
      } else {
        row += [j][i].red;
      }
    }
    console.log(row);
  }
};
// create the map from array
engine.createMapFromArray = function (type) {
  let samples = _.sampleSize(type, type.length);
  for (let i = 0; i < map_width; i++) {
    for (let j = 0; j < map_height; j++) {
      if (!(i === 0 && j === 0)) {
        let sample = samples.pop();
        map[i][j] = {
          acquiredBy: sample,
          type: sample === undefined ? 'safe' : sample.type,
          explored: false,
        };
      }
    }
  }
};
// get the full direction = north, east,west,south
engine.getFullDirection = function (direction) {
  if (direction.length === 1) {
    switch (direction) {
      case 'N':
        return 'North';
      case 'S':
        return 'South';
      case 'W':
        return 'West';
      case 'E':
        return 'East';
    }
  } else {
    return (
      this.getFullDirection(direction.substring(0, 1)) +
      '-' +
      this.getFullDirection(direction.substring(1, 2))
    );
  }
};
// display the position

// get the options for diff movements
engine.getMovementOptions = function (player) {
  let options = [];
  if (player.y !== 0) {
    options.push('N');
  }
  if (player.y !== map_height - 1) {
    options.push('S');
  }
  if (player.x !== 0) {
    options.push('W');
  }
  if (player.x !== map_width - 1) {
    options.push('E');
  }
  kcomb(options, 2, function (x, y) {
    if (x === 'N' || x === 'S') {
      if ((x === 'N' && y === 'S') || (x === 'S' && y === 'N')) {
        // Do nothing.
      } else {
        options.push(x + y);
      }
    }
  });
  return options;
};

// obtain the info from the movements
engine.obtainMovementOptionInfo = function (position) {
  if (position.explored === false) {
    return 'unknown';
  } else {
    return position.type;
  }
};

// display the options movements

// get the obj indexes current position
engine.getObjectFromCurrentPosition = function (x, y, direction) {
  switch (direction) {
    case 'S':
      return map[x][y + 1];
    case 'N':
      return map[x][y - 1];
    case 'E':
      return map[x + 1][y];
    case 'W':
      return map[x - 1][y];
    case 'NE':
      return map[x + 1][y - 1];
    case 'NW':
      return map[x - 1][y - 1];
    case 'SE':
      return map[x + 1][y + 1];
    case 'SW':
      return map[x - 1][y + 1];
    default:
      return map[x][y];
  }
};

// update the map tiles
mapEngine.updateNextAndPreviousMapTiles = function (
  x,
  y,
  prev_x,
  prev_y,
  nextType,
  nextAcquiredBy,
  prevType,
  prevAcquiredBy,
) {
  map[x][y].type = nextType;
  map[x][y].acquiredBy = nextAcquiredBy;
  map[prev_x][prev_y].type = prevType;
  map[prev_x][prev_y].acquiredBy = prevAcquiredBy;
};

mapEngine.updateNextAndPreviousMapTilesAfterPlayerMovement = function (
  player,
  prevType,
  prevAcquiredBy,
) {
  this.updateNextAndPreviousMapTiles(
    player.x,
    player.y,
    player.prev_x,
    player.prev_y,
    'player',
    player,
    prevType,
    prevAcquiredBy,
  );
};

module.exports = engine;
