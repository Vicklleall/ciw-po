const registerControlEvents = require('./ctrl');
const registerMessageEvents = require('./msg');
const { registerPlayerEvents } = require('./player');

module.exports = (io) => {
  const plain = io.of('/plain');
  const race = io.of('/race');
  const coop = io.of('/coop');

  plain.on('connection', socket => {
    registerControlEvents('plain', socket);
    registerMessageEvents(socket);
    registerPlayerEvents(socket);
  });

  race.on('connection', socket => {
    registerControlEvents('race', socket);
    registerMessageEvents(socket);
    registerPlayerEvents(socket);
  });

  coop.on('connection', socket => {
    registerControlEvents('coop', socket);
    registerMessageEvents(socket);
    registerPlayerEvents(socket);
  });
};