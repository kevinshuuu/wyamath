var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var stylus = require('stylus');
var question_handler = require('./lib/question');
var index = require('./routes/index');

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

app.use('/', index);

var all_users = [];
var users_in_room = {
  addition: {},
  subtraction: {},
  multiplication: {},
  division: {}
};

var rooms = [
  'addition', 
  'subtraction', 
  'multiplication', 
  'division'
  ];

var question_handlers = [
  new question_handler(0, io, 'addition'),
  new question_handler(1, io, 'subtraction'),
  new question_handler(2, io, 'multiplication'),
  new question_handler(3, io, 'division')
  ];

io.on('connection', function(socket){
  socket.join(rooms[0]);
  socket.current_room = rooms[0];
  socket.current_room_index = 0;
  socket.emit('new question', question_handlers[socket.current_room_index].current_question);
  socket.emit('room list', {
    rooms: rooms, 
    current_room: socket.current_room
  });
  socket.emit('user list', {
    users_in_room: users_in_room,
    all_users: all_users
  });
  socket.on('disconnect', function(){
    delete users_in_room.addition[socket.username];
    delete users_in_room.subtraction[socket.username];
    delete users_in_room.multiplication[socket.username];
    delete users_in_room.division[socket.username];
    var user_index = all_users.indexOf(socket.username);
    all_users.splice(user_index, user_index);
    io.emit('user list', {
      users_in_room: users_in_room,
      all_users: all_users
    });
  });

  socket.on('changing rooms', function(data) {
    var previous_room = socket.current_room;
    if(socket.username !== undefined)
      users_in_room[previous_room][socket.username].active = false;

    socket.leave(socket.current_room);
    socket.join(data);
    socket.current_room = data;
    socket.current_room_index = rooms.indexOf(data);
    if(socket.username !== undefined)
      users_in_room[socket.current_room][socket.username].active = true;

    socket.emit('room list', {
      rooms: rooms, 
      current_room: socket.current_room
    });
    io.to(socket.current_room).emit('user list', {
      users_in_room: users_in_room,
      all_users: all_users
    });
    io.to(previous_room).emit('user list', {
      users_in_room: users_in_room,
      all_users: all_users
    });

    socket.emit('new question', question_handlers[socket.current_room_index].current_question);
  });

  socket.on('submit answer', function(data) {
    current_question = question_handlers[socket.current_room_index].current_question;
    if (data.answer == current_question.answer) {
      users_in_room[socket.current_room][socket.username].score += 1;

      io.to(socket.current_room).emit('user list', {
        users_in_room: users_in_room,
        all_users: all_users
      });

      socket.emit('correct answer');
      current_question = question_handlers[socket.current_room_index].generateQuestion();
      io.to(socket.current_room).emit('new question', current_question);

      clearInterval(question_handlers[socket.current_room_index].question_interval);
      question_handlers[socket.current_room_index].question_interval = 
        setInterval(question_handlers[socket.current_room_index].generateAndEmitQuestion, 
          question_handlers[socket.current_room_index].interval_timing);

      io.to(socket.current_room).emit('submitted answer', {
        submitted: data.answer, 
        username: socket.username, 
        correctness: 'correct'
      });
    } else {
      io.to(socket.current_room).emit('submitted answer', {
        submitted: data.answer, 
        username: socket.username, 
        correctness: 'incorrect'
      });
    }
  });

  socket.on('set username', function(data) {
    socket.username = data.username;
    rooms.forEach(function(room) {
      users_in_room[room][data.username] = { 
        score: 0,
        active: room === socket.current_room
      };
    });
    all_users.push(data.username);

    io.emit('user list', {
      users_in_room: users_in_room,
      all_users: all_users
    });
  });
});

http.listen(port, function(){
    console.log('Server listening on port %d', port);
});
