#!/usr/bin/env node
import {Server} from 'socket.io';
import {SocketServer} from './controllers/SocketServer';

const debug = require('debug')('MediaMogulTwo');
const app = require('./app');

app.set('port', process.env.PORT || 5555);

const server = require('http').createServer(app);
const io: Server = new Server(server);

export const socketServer = new SocketServer();
socketServer.initIO(io);

server.listen(app.get('port'), () => {
  debug('Express server listening on port ' + server.address().port);
});
