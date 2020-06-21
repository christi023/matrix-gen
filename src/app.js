#!/usr/bin/env node
// Load dependencies
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const prompt = require('prompt');
const colors = require('colors');
// get data
const engine = require('./engine');
const config = require('./config');
const utils = require('./utils');

// prop mapping
let map = engine.map;

// set initial settings
// ask the user question
let num1 = Math.floor(Math.random() * 10 + 1);
let num2 = Math.floor(Math.random() * 10 + 1);
let answer = num1 + num2;

// rl have a method called question which should have a string & callback
rl.question(`What is ${num1} + ${num2}?  \n`, (userInput) => {
  //console.log(userInput);
  if (userInput.trim() == answer) {
    rl.close();
  } // if answer is wrong
  else {
    rl.setPrompt('Incorrect response please try again\n');
    rl.prompt();

    // listen for userInput
    rl.on('line', (userInput) => {
      if (userInput.trim() == answer) rl.close();
      else {
        rl.setPrompt(`Your answer of ${userInput} is incorrect \n`);
      }
    });
  }
});

// add listener, will execute when closing readline interface
rl.on('close', () => {
  // console.log('Correct !!!!');
});

//
let movementSchema = {
  description: 'Please enter a movement option',
  type: 'string',
  // pattern: new RegExp('^(' + engine.getMovementOptions().join('|') + ')$', 'i'),
  message: 'Please choose an appropriate movement option',
  require: true,
  before: (val) => val.toUpperCase(),
};
// start the prompt
prompt.start();

// Entry point

// matrix size setup for mapping
function setupMapMatrix() {
  prompt.get(
    {
      description: `Size of Map default is 4x4`,
      type: 'integer',
      message: 'Minimum: 4, Maximum: 99',
      default: 4,
      required: true,
      conform: (val) => val <= 99 && val >= 4,
    }, // cb
    (err, result) => {
      let value = parseInt(result.question, 10);
      config.map_height = value;
      config.map_width = value;

      engine.init();
      map = engine.map;

      map[0][0] = {
        acquiredBy: player,
        type: 'player',
        explored: true,
      };

      //engine.createMapFromArray(monsters.concat(bosses, specials, friends));
    },
  );
}

// Setup
function setupGame() {
  prompt.get(
    {
      description: 'Number of players',
      type: 'integer',
      message: 'Only 1 player is allowed to play',
      default: 1,
      required: true,
      conform: (val) => val === 1,
    },
    (err, result) => {
      totalPlayers = parseInt(result.question);
      if (totalPlayers !== 1) {
        console.log('Sorry, ' + totalPlayers + ' players are not supported yet');
      } else {
        setupMapMatrix();
      }
    },
  );
}
//console.log(movementSchema);

// Start
function startGame(isNextTurn) {
  console.log('TURN : ' + (isNextTurn ? ++player.turn : player.turn));
  engine.displayMap(map);
  engine.displayPosition(player);
  engine.displayMovementOptions(engine.getMovementOptions(player), player);
  getUserMovementChoice();
}

function getUserMovementChoice() {
  console.log('Please choose one option from the above'.dim);
  prompt.get(movementSchema, (err, result) => turn(err, result));
}
// turn
function turn(err, result) {
  if (!err) {
    let choice = result.question;
    let choiceIsValid = validateUserChoice(choice);
    if (choiceIsValid) {
      play(choice);
    } else {
      getUserMovementChoice();
    }
  } else {
    console.log(err);
  }
}
function validateUserChoice(choice) {
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

function play(choice) {
  console.log('You choose ' + choice + ' (' + engine.getFullDirection(choice) + ')');
  var nextTile = engine.getObjectFromCurrentPosition(player.x, player.y, choice);
  switch (nextTile.type) {
    case 'blocked':
      console.log("The option selected is blocked, you can't move");
      startGame(false);
      break;
    case 'safe':
      mapEngine.movePlayerTowards(choice);
      updateTile(nextTile);
      encounter(nextTile);
      break;
    case 'special':
      switch (nextTile.acquiredBy.effect) {
        case 'block':
          nextTile.explored = true;
          nextTile.type = 'blocked';
          console.log('scroch tile blocks your path');
          break;
      }
      startGame(true);
      break;
    case 'monster':
      engine.movePlayerTowards(choice);
      updateTile(nextTile);
      if (player.freePass === 0) {
        encounter(nextTile.acquiredBy);
      } else {
        console.log(
          'You used your free pass to skip the monster ' +
            colors.bold(nextTile.acquiredBy.name) +
            '. Free passes remaining ' +
            --player.freePass,
        );
        engine.updateNextAndPreviousMapTilesAfterPlayerMovement(player, 'safe', undefined);
        startGame(true);
      }
      break;
    case 'boss':
    case 'friend':
      engine.movePlayerTowards(choice);
      if (nextTile.explored === false) {
        updateTile(nextTile);
        encounter(nextTile.acquiredBy);
      } else {
        startGame(true);
      }
      break;
  }
}

function endGame() {
  console.log('Quittng game..'.red);
  process.exit();
}

/*
______ _    _ _   _  _____ _______ _____ ____  _   _  _____ 
|  ____| |  | | \ | |/ ____|__   __|_   _/ __ \| \ | |/ ____|
| |__  | |  | |  \| | |       | |    | || |  | |  \| | (___  
|  __| | |  | | . ` | |       | |    | || |  | | . ` |\___ \ 
| |    | |__| | |\  | |____   | |   _| || |__| | |\  |____) |
|_|     \____/|_| \_|\_____|  |_|  |_____\____/|_| \_|_____/ 
*/

/*function postBattleEncounter() {
  if (player.end === false) {
    if (player.resolve === false) {
      console.log('TURN : ' + ++player.turn);
      console.log(
        'You conflict with ' + colors.bold(player.conflict.enemy.name) + ' is still not resolved',
      );
      battleEngine.initateBattle(player, player.conflict.enemy, postBattleEncounter);
    } else {
      mapEngine.updateNextAndPreviousMapTilesAfterPlayerMovement(player, 'safe', undefined);
      startGame(true);
    }
  } else {
    endGame();
  }
}

function postBossEncounter(reward) {
  if (reward !== undefined) {
    switch (reward.depth) {
      case 0:
        switch (reward.assignment) {
          case 'add':
            player[reward.property] = reward.value;
            break;
        }
        break;
      case 1:
        var properties = reward.property.match(/[a-zA-Z]+/g);
        switch (reward.assignment) {
          case 'update':
            player[properties[0]][properties[1]] = reward.value;
            break;
        }
        break;
    }
    console.log(reward.description);
    prompt.get(
      {
        description: 'Continue?',
        type: 'boolean',
        default: true,
        require: false,
      },
      function (err, result) {
        if (player.end === false) {
          mapEngine.updateNextAndPreviousMapTilesAfterPlayerMovement(player, 'safe', undefined);
          startGame(true);
        } else {
          endGame();
        }
      },
    );
  } else {
    endGame();
  }
}

function updateTile(tile) {
  tile.explored = true;
}

function encounter(object) {
  console.log(
    'You have encounterd a ' +
      colors.bold(object.type) +
      ' tile containing ' +
      colors.bold(object.name),
  );
  switch (object.type) {
    case 'monster':
      battleEngine.initateBattle(player, object, postBattleEncounter);
      break;
    case 'special':
      // do action based on special name
      break;
    case 'boss':
      // do action based on boss name
      battleEngine.initiateBossBattle(player, object, postBossEncounter);
      break;
    case 'friend':
      // do action based on friend name
      if (object.name === 'Cirilla Fiona Elen Riannon') {
        player.objectives.ciri = true;
        if (player.objectives.wildHunt === true) {
          endGame();
        } else {
          // prompt
        }
      } else {
        // add friend to party
      }
      break;
    case 'safe':
      // Simply move
      postBattleEncounter();
      break;
  }
}*/
