#!/usr/bin/env node
const debug = require('debug')('MediaMogulTwo');
const app = require('./app');
const sockets = require('./controllers/sockets_controller');

app.set('port', process.env.PORT || 5555);

const server = require('http').createServer(app);
const www_io = require('socket.io')(server);

sockets.initIO(www_io);

server.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
