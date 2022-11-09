const path = require('path');
const { createLogger, format, transports } = require('winston');

const { logLevel } = require('../config');
const globalLogger = require('./logger');
const { Player } = require('./player');

const Room = class {
  constructor(isPublic, mode, id, name) {
    this.isPublic = isPublic;
    this.mode = mode;
    this.id = id;
    this.name = name;
    this.players = [];
    this.createdAt = Date.now();
    if (mode === 'race') {
      this.data = {};
    } else if (mode === 'coop') {
      this.data = {};
    }
    this.destroyTime = 60_000;
    this.destroyTimeout = 0;
    // 按游戏id写入日志
    this.logId = `[${id.slice(10) || id}]`.padEnd(12, ' ');
    this.logger = createLogger({
      level: logLevel,
      label: this.id.slice(10),
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss' }),
        format.printf(info => `${info.timestamp} > ${this.logId} ${info.message}`)
      ),
      transports: [
        new transports.File({ filename: path.join('logs', 'room', this.id.slice(0, 10) + '.log') })
      ]
    });
    if (name) {
      globalLogger.verbose(`Create room ${id}: ${name}`);
    } else {
      globalLogger.verbose(`Create room ${id}`);
    }
  }

  joinPlayer(user) {
    const UID = user.slice(0, 10);
    let player = this.players.find(p => p.uid === UID);
    if (!player) {
      player = new Player(user);
      this.players.push(player);
    }
    if (this.destroyTimeout) {
      clearTimeout(this.destroyTimeout);
      this.destroyTimeout = 0;
    }
    this.logger.verbose(`player ${player.name}(${UID}) joined`);
    return player;
  }

  removePlayer(player) {
    const i = this.players.indexOf(player);
    if (~i) this.players.splice(i, 1);
    this.logger.verbose(`player ${player.name}(${player.uid}) left`);
    this.delayDestroy();
  }

  delayDestroy() { // 延迟销毁房间
    if (this.players.length === 0 && !this.destroyTimeout) {
      this.destroyTimeout = setTimeout(() => {
        if (this.players.length === 0) RoomManager.removeRoom(this);
        this.destroyTimeout = 0;
      }, this.destroyTime);
    }
  }
};

const RoomManager = {
  publicRooms: {
    plain: {},
    race: {},
    coop: {}
  },
  privateRooms: {
    plain: {},
    race: {},
    coop: {}
  },

  generateId() {
    let i = Date.now();
    let id = '';
    while (id.length < 5) {
      id += '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-'[i % 64];
      i = i / 64 | 0;
    }
    while (id.length < 8) {
      id += '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-'[Math.random() * 64 | 0];
    }
    return id;
  },

  // 创建公开房间
  newPublicRoom(mode, GID, name, roomId) {
    let rooms = this.publicRooms[mode][GID];
    if (!rooms) {
      // 没有大厅的时候先创建一个大厅
      rooms = [new Room(true, mode, GID)];
      this.publicRooms[mode][GID] = rooms;
    }
    let room = new Room(true, mode, roomId ?? (GID + '-' + this.generateId()), name);
    rooms.push(room);
    return room;
  },

  // 获取公开房间
  getPublicRoom(mode, GID, roomId) {
    let rooms = this.publicRooms[mode][GID];
    if (!rooms) {
      // 没有大厅的时候先创建一个大厅
      rooms = [new Room(true, mode, GID)];
      this.publicRooms[mode][GID] = rooms;
    }
    return rooms.find(r => r.id === roomId);
  },

  // 获取私有房间
  getPrivateRoom(mode, roomId) {
    this.privateRooms[mode][roomId] ??= new Room(false, mode, roomId);
    return this.privateRooms[mode][roomId];
  },

  // 移除房间
  removeRoom(room) {
    if (room.isPublic) {
      const GID = room.id.slice(0, 10);
      const rooms = this.publicRooms[room.mode][GID];
      if (!rooms) return;
      if (room.id.length === 10) { // 大厅
        if (rooms.length === 1) {  // 仅剩下大厅时
          delete this.publicRooms[room.mode][GID];
          globalLogger.verbose(`Remove room ${GID}`);
        }
      } else { // 普通房间
        rooms.splice(rooms.indexOf(room), 1);
        rooms[0].delayDestroy(); // 检查销毁大厅
        globalLogger.verbose(`Remove room ${room.id}`);
      }
    } else {
      delete this.privateRooms[room.mode][room.id];
      globalLogger.verbose(`Remove room ${room.id}`);
    }
  },

  // 获取公开房间列表
  getPublicRoomList(mode, GID) {
    let rooms = this.publicRooms[mode][GID];
    if (!rooms) {
      return [{id: GID, players: []}];
    }
    return rooms;
  }
};

module.exports = RoomManager;