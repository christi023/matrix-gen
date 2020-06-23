const utils = require('./utils.js');
const colors = require('colors');
const prompt = require('prompt');
let map;
const player = require('./lib/player.js');
const kcomb = require('foreach-combination');

const Generator = class Generator {
  constructor(options) {
    // require required parameters
    if (!options.width || !options.height || !options.x || !options.y) {
      console.log(utils.instructions);
      process.exit();
    }

    let { width, height, x, y } = options;
    this.directions = ['north', 'east', 'south', 'west'];
    this.settings(width, height, x, y);
  }

  start() {
    console.log(utils.commands);
    this.matrixTable(); // displaying the matrix map layout
    this.getUserMovementChoice();
    this.getMovementOptions();
  }

  settings(width, height, x, y) {
    this.width = width;
    this.height = height;
    this.position = [parseInt(x), parseInt(y)];
    this.direction = 0; //number
  }
  // display matrix table => 2d array
  matrixTable() {
    console.log('MAP VIEW'.bgWhite.black);
    for (let i = 0; i < this.width; i++) {
      let row = '';
      for (let j = 0; j < this.height; j++) {
        if (map) {
          switch (map[j][i].type) {
            case 'player':
              row += colors.cyan(' * ');
              break;
            case 'blocked':
              row += colors.gray(' * ');
              break;
            default:
              row += ' * ';
          }
        } else {
          row += ' * '.red;
        }
      }
      console.log(row);
    }
  }

  /* movements ----------------------
   calculate movements of the object*/
  objectDirection(moves = 1) {
    console.log('your movements');
    this.movement += moves;
    if (this.movement > 3) {
      return (this.movement = 0);
    } else {
      if (this.movement < 0) {
        return (this.movement = 3);
      }

      this.movePlayerTowards();
    }
  }
  /*
  Key | <Left> event:direction += turn;
   Key | <Right> event:direction -= turn; 
  
   point_direction(x1,y1,x2,y2): returns the direction (in degrees) from point (x1,y1) to (x2,y2).
  point_distance(x1,y1,x2,y2): returns the distance (in pixels) from point (x1,y1) to (x2,y2).*/
  getUserMovementChoice() {
    console.log('Please choose one option from the above'.dim);
    prompt.get(utils.movementSchema, (err, result) => this.turn(err, result));
  }
  /*
  ______ _    _ _   _  _____ _______ _____ ____  _   _  _____ 
 |  ____| |  | | \ | |/ ____|__   __|_   _/ __ \| \ | |/ ____|
 | |__  | |  | |  \| | |       | |    | || |  | |  \| | (___  
 |  __| | |  | | . ` | |       | |    | || |  | | . ` |\___ \ 
 | |    | |__| | |\  | |____   | |   _| || |__| | |\  |____) |
 |_|     \____/|_| \_|\_____|  |_|  |_____\____/|_| \_|_____/ 
*/
  turn(err, result) {
    if (!err) {
      let choice = result.question;
      let choiceIsValid = this.validateUserChoice(choice);
      if (choiceIsValid) {
        play(choice);
      } else {
        this.getUserMovementChoice();
      }
    } else {
      console.log(err);
    }
  }
  /*  validating the choices*/
  validateUserChoice(choice) {
    return (
      choice &&
      choice !== '' &&
      (choice === 'N' ||
        choice === 'W' ||
        choice === 'E' ||
        choice === 'S' ||
        choice === 'NE' ||
        choice === 'NW' ||
        choice === 'SE' ||
        choice === 'SW')
    );
  }

  movePlayerTowards(direction) {
    switch (direction) {
      case 'S':
        player.prev_x = player.x;
        player.prev_y = player.y++;
        break;
      case 'N':
        player.prev_x = player.x;
        player.prev_y = player.y--;
        break;
      case 'E':
        player.prev_x = player.x++;
        player.prev_y = player.y;
        break;
      case 'W':
        player.prev_x = player.x--;
        player.prev_y = player.y;
        break;
      case 'NE':
        player.prev_x = player.x++;
        player.prev_y = player.y--;
        break;
      case 'NW':
        player.prev_x = player.x--;
        player.prev_y = player.y--;
        break;
      case 'SE':
        player.prev_x = player.x++;
        player.prev_y = player.y++;
        break;
      case 'SW':
        player.prev_x = player.x--;
        player.prev_y = player.y++;
        break;
    }
  }

  /** Available tiles to which player
   * can move from his current position
   * @param {object} player - The player
   * @returns {string []} An array containing options where the player is allowed to move to
   * */
  getMovementOptions(player) {
    let options = [];
    let [x, y] = this.position;
    if (y !== 0) {
      options.push('N');
    }
    if (y !== options.height - 1) {
      options.push('S');
    }
    if (x !== 0) {
      options.push('W');
    }
    if (x !== options.width - 1) {
      options.push('E');
    }
    kcomb(options, 2, (x, y) => {
      if (x === 'N' || x === 'S') {
        if ((x === 'N' && y === 'S') || (x === 'S' && y === 'N')) {
          // Do nothing.
        } else {
          options.push(x + y);
        }
      }
    });
    return options;
  }

  /**
   * obj moving forward, => forward
   * @param {number} [step=1]
   */
  forward(step = 1) {
    // 1 step to move forward
    switch (this.direction) {
      case 0:
        this.position[0] -= step;
        break; // north
      case 1:
        this.position[1] += step;
        break; // east
      case 2:
        this.position[0] += step;
        break; // south
      case 3:
        this.position[1] -= step;
        break; // west
    }
  }

  backward() {
    // move obj => backward
    /* to move backward we move 1(-1) step back away from forward(front)*/
    this.forward(-1);
  }

  exit() {
    console.log('Exiting.....'.red);

    this.getObjectFromCurrentPosition();
    0;
    process.exit(0);
  }
  /*play(choice, utils) {
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
    }*/

  move(utils) {
    switch (parseInt(utils)) {
      default:
        // debug('Unknown command:', utils);
        break;
      case 0:
        this.exit();
        break;
      case 1:
        this.forward();
        break;
      case 2:
        this.backward();
        break;
      case 3:
        this.objectDirection();
        break;
      case 4:
        this.objectDirection(-1);
        break;
    }

    // output location after move
    this.getObjectFromCurrentPosition();
  }

  /**
   * Determine if the object is off board. Current implementation is
   * a simple edge-detection for a rectangle (x*y) shape. This
   * could easily be modified to test for an arbitrary figure,
   * by storing the shape in a matrix of x/y coordinates.
   */
  offTable() {
    let [x, y] = this.position;

    return x < 0 || y < 0 || x > this.height - 1 || y > this.width - 1;
  }

  /**
   * Output the current location of the object on the game board
   */
  /* outputCurrentLocation() {
    let [x, y] = this.position;
    console.log('Object is located at:', [x, y]);

    if (this.offTable()) {
      console.log('! ooh no, off table ', [x, y]);
      process.exit(0);
    }

    this.matrixTable();
  }*/ getObjectFromCurrentPosition() {
    let [x, y] = this.position;

    console.log('', 'Object is at location:', '', [x, y]);
    if (this.offTable()) {
      console.log('Ooh No, you are off the table', [x, y]);
      process.exit(0);
    }

    this.matrixTable();
  }
};

module.exports = Generator;
