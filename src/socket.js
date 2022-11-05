const registerControlEvents = require('./ctrl');
const registerMessageEvents = require('./msg');

module.exports = (io) => {
  const plain = io.of('/plain');
  const race = io.of('/race');
  const coop = io.of('/coop');

  plain.on('connection', socket => {
    registerControlEvents('plain', socket);
    registerMessageEvents(socket);
  });

  race.on('connection', socket => {
    registerControlEvents('race', socket);
    registerMessageEvents(socket);
  });

  coop.on('connection', socket => {
    registerControlEvents('coop', socket);
    registerMessageEvents(socket);
  });
};