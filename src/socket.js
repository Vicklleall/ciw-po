const registerControlEvents = require('./ctrl');
const registerMessageEvents = require('./msg');
const { registerPlayerEvents } = require('./player');

module.exports = io => {
  for (const mode of ['plain', 'race', 'coop']) {
    io.of('/' + mode).on('connection', socket => {
      registerControlEvents(mode, socket);
      registerMessageEvents(mode, socket);
      registerPlayerEvents(mode, socket);
    });
  }
};