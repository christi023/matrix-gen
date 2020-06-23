// Load dependencies
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// get data
const Generator = require('./generator');
// prop mapping

const app = () => {
  // arguments => zero based location in array, where to start removing elements
  const [width, height, x, y] = process.argv.splice(2);
  const generator = new Generator({ width, height, x, y });
  Events(generator); // new gen will have all neccessity for stdin process with events settings
  generator.start();
};
// stdin for user Input
const Events = (generator, stdin = process.stdin) => {
  stdin.resume(); //Resumes the readline input stream.
  stdin.setEncoding('utf8');

  readline.emitKeypressEvents(stdin);
  stdin.setRawMode(true);

  stdin.on('keypress', (str, key) => {
    generator.move(str);

    // handle process termination
    if (key && key.ctrl && key.name == 'c') process.exit();
  });
};

app();
