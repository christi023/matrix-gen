const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); // require files for mapping
const colors = require('colors');
const config = require('./config');
const utils = require('./utils');

const debug = require('./debug.js');

// declare sizes,map & engine  for use
let map_width = config.map_width;
let map_height = config.map_height;
let map;
let engine = {};

// initialize engine built
/*engine.init = () => {
  map_width = config.map_width;
  map_height = config.map_height;
  map = utils.create2dArray(map_width, map_height, 0);

  engine.map = map;
};*/

/**

 * 
 * @param {stdin} stdin Input stream
 */

const Engine = class Engine {
  constructor(options) {
    // declare mapping for matrix box
    let options = { map_width, map_height, x, y };

    this.directions = ['north', 'east', 'south', 'west'];
    this.setupGameArea(options);

    if (!options.map_width || !options.map_height || !options.x || !options.y) {
      console.log(config.instructions);
      process.exit();
    } else {
      debug('Im in the game constructor!', options);
    }
  }
  // start game with required commands
  start() {
    console.log(utils.commands);
    this.displayMap(); // displaying the matrix map layout
  }

  // display the map
  displayMap(map) {
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
  }
  // create the map from array
  createMapFromArray(type) {
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
  }

  //
  createMapArea(map_width, map_height, x, y) {
    this.map_width = map_width;
    this.map_height = map_height;
    this.position = [parseInt(x), parseInt(y)];
    this.direction = 0; // north
  }

  // get the full direction = north, east,west,south
  getFullDirection(direction) {
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
  }

  /* movements ----------------------
 calculate movements of the object*/
  getUserMovementChoice(moves = 1) {
    console.log('your movements');
    this.movement += moves;
    if (this.movement > 3) {
      return (this.movement = 0);
    } else {
      if (this.movement < 0) {
        return (this.movement = 3);
      }
      debug('Movements:', this.movements[this.movement]);
    }
  }

  // move the obj => forward, add & sub degrees
  /*
Key | <Left> event:direction += turn;
 Key | <Right> event:direction -= turn; 

 point_direction(x1,y1,x2,y2): returns the direction (in degrees) from point (x1,y1) to (x2,y2).
point_distance(x1,y1,x2,y2): returns the distance (in pixels) from point (x1,y1) to (x2,y2).*/

  forward(move = 1) {
    // 1 step to move forward
    let position = this;
    switch (this.movement) {
      case 0:
        position[0] -= move;
        console.log('This is north');
        break;
      case 1:
        position[1] += move;
        console.log('This is East');
        break;
      case 2:
        position[2] += move;
        console.log('This is South');
        break;
      case 3:
        position[3] -= move;
        console.log('This is West');
        break;
    }
  }

  // move obj => backward
  /* to move backward we move 1(-1) step back away from forward(front)*/
  backward() {
    this.forward(-1);
  }
  // get the options for diff movements
  getMovementOptions(player) {
    let options = [];
    if (player.y !== 0) {
      options.push('North');
    }
    if (player.y !== map_height - 1) {
      options.push('South');
    }
    if (player.x !== 0) {
      options.push('West');
    }
    if (player.x !== map_width - 1) {
      options.push('East');
    }
    kcomb(options, 2, function (x, y) {
      if (x === 'North' || x === 'South') {
        if ((x === 'North' && y === 'South') || (x === 'South' && y === 'North')) {
          // Do nothing.
        } else {
          options.push(x + y);
        }
      }
    });
    return options;
  }

  // obtain the info from the movements
  obtainMovementOptionInfo(position) {
    if (position.explored === false) {
      return 'unknown';
    } else {
      return position.type;
    }
  }

  // display the options movements

  // get the obj indexes current position
  getObjectFromCurrentPosition(x, y, direction) {
    switch (direction) {
      case 'South':
        return map[x][y + 1];
      case 'North':
        return map[x][y - 1];
      case 'East':
        return map[x + 1][y];
      case 'West':
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
  }

  // update the map tiles
  updateNextAndPreviousMapTiles(
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
  }
  updateNextAndPreviousMapTilesAfterPlayerMovement(player, prevType, prevAcquiredBy) {
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
  }
  //  exit
  exit() {
    console.log('Exiting.....'.red);
    this.showLocation();
    process.exit(0);
  }

  play(choice, utils) {
    console.log('You choose ' + choice + ' (' + getFullDirection(choice) + ')');
    let nextTile = getObjectFromCurrentPosition(x, y, choice);
    switch (parseInt(utils)) {
      case 'blocked':
        console.log("The option selected is blocked, you can't move");
        startGame(false);
        break;
      case 'safe':
        mapEngine.movePlayerTowards(choice);
        updateTile(nextTile);
        encounter(nextTile);
        break; // call the moves
      case 0:
        this.exit();
        break;
      case 1:
        this.forward();
        break;
      case 2:
        this.getUserMovementChoice();
        break;
      case 3:
        this.getUserMovementChoice(-1);
        break;
    }
    // showing which we are located =
    this.showLocation();
  }

  // check if obj is on / off table
  offTable() {
    let [x, y] = this.position;
    return x < 0 || y < 0 || x > this.height - 1 || y > this.width - 1;
  }

  // outputting results
  showLocation() {
    let [x, y] = this.position;
    console.log('Object is at location:', [x, y]);

    if (this.offTable()) {
      console.log('You fell', [x, y]);
      process.exit(0);
    }

    displayMap();
  }
};
module.exports = Engine;
