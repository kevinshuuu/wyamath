var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var stylus = require('stylus');
var room = require('./lib/room');

app.engine('jade', require('jade').__express);
app.set('views', './public/views');
app.set('view engine', 'jade');
app.use(stylus.middleware({
  src: path.join(__dirname, '/public/stylesheets/stylus'),
  dest: path.join(__dirname, '/public/stylesheets'),
  debug: true,
  force: true
}));
app.use(express.static(__dirname + '/public'));

var index = require('./routes/index');
app.use('/', index);

var rooms = [];
var room_names = [];
createRoom('/general');
createRoom('/general-2');
createRoom('/general-3');
createRoom('/general-4');

io.on('connection', function(socket) {
  socket.emit('room list', {rooms: room_names});
});


http.listen(port, function(){
    console.log('Server listening on port %d', port);
});

//helpers
function createRoom(name) {
  rooms.push(new room(io.of(name)));
  room_names.push(name);
  io.sockets.emit('room list', {rooms: room_names});
}
