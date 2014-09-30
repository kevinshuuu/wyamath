var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

//use stylus for css templating
var stylus = require('stylus');

//require question handler for question generation
var question_handler = require('./lib/question');
var index = require('./routes/index');

//use jade for view templating
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

//spawn question handlers for each of the rooms
var question_handlers = [
  new question_handler(0, io, 'addition'),
  new question_handler(1, io, 'subtraction'),
  new question_handler(2, io, 'multiplication'),
  new question_handler(3, io, 'division')
  ];

io.on('connection', function(socket){
  
  //on connection of a new client, join addition room by default
  socket.join(rooms[0]);
  socket.current_room = rooms[0];
  socket.current_room_index = 0;

  //and emit the question, list of rooms and users
  socket.emit('new question', question_handlers[socket.current_room_index].current_question);
  socket.emit('room list', {
    rooms: rooms, 
    current_room: socket.current_room
  });
  socket.emit('user list', {
    users_in_room: users_in_room,
    all_users: all_users
  });
  
  //on disconnect of client, remove them from all places storing their user info
  socket.on('disconnect', function(){
    if(socket.username !== undefined) {
      delete users_in_room.addition[socket.username];
      delete users_in_room.subtraction[socket.username];
      delete users_in_room.multiplication[socket.username];
      delete users_in_room.division[socket.username];
      var user_index = all_users.indexOf(socket.username);
      all_users.splice(user_index, 1);
      io.emit('user list', {
        users_in_room: users_in_room,
        all_users: all_users
      });
    }
  });

  //on client changing rooms
  socket.on('changing rooms', function(data) {
    var previous_room = socket.current_room;

    //unset the active flag for their previous room
    if(socket.username !== undefined)
      users_in_room[previous_room][socket.username].active = false;

    //leave the previous room and join the new room
    socket.leave(socket.current_room);
    socket.join(data);
    socket.current_room = data;
    socket.current_room_index = rooms.indexOf(data);

    //set their active flag for the current (new) room
    if(socket.username !== undefined)
      users_in_room[socket.current_room][socket.username].active = true;

    //and emit the new room list/current room to the client
    socket.emit('room list', {
      rooms: rooms, 
      current_room: socket.current_room
    });

    //and update the user lists for the affected rooms
    io.to(socket.current_room).emit('user list', {
      users_in_room: users_in_room,
      all_users: all_users
    });
    io.to(previous_room).emit('user list', {
      users_in_room: users_in_room,
      all_users: all_users
    });

    //and give the client the current question for the current (new) room it joined
    socket.emit('new question', question_handlers[socket.current_room_index].current_question);
  });

  //on client answer submission
  socket.on('submit answer', function(data) {
    var current_question_handler = question_handlers[socket.current_room_index];
    current_question = current_question_handler.current_question;

    //if the submitted answer is the same as the current question's answer
    if (data.answer == current_question.answer) {
      
      //increment the user's score
      users_in_room[socket.current_room][socket.username].score += 1;

      //and update the user list to reflect the change in score
      io.to(socket.current_room).emit('user list', {
        users_in_room: users_in_room,
        all_users: all_users
      });

      //then emit a correct answer event so the client knows the answer is correct
      socket.emit('correct answer');

      //then regenerate a new question for the room and emit it to all clients of that room
      current_question = current_question_handler.generateQuestion();
      io.to(socket.current_room).emit('new question', current_question);

      //and then reset the interval that periodically generates a new question
      clearInterval(current_question_handler.question_interval);
      current_question_handler.question_interval = 
        setInterval(current_question_handler.generateAndEmitQuestion, 
          current_question_handler.interval_timing);

      //finally let every client connected know what answer was submitted
      io.to(socket.current_room).emit('submitted answer', {
        submitted: data.answer, 
        username: socket.username, 
        correctness: 'correct'
      });
    } else {

      //otherwise, just emit to the current room the submitted answer/chat
      io.to(socket.current_room).emit('submitted answer', {
        submitted: data.answer, 
        username: socket.username, 
        correctness: 'incorrect'
      });
    }
  });

  //on setting a username
  socket.on('set username', function(data) {

    //add the user to each of the rooms and push their username
    socket.username = data.username;
    rooms.forEach(function(room) {
      users_in_room[room][data.username] = { 
        score: 0,
        active: room === socket.current_room
      };
    });
    all_users.push(data.username);

    //and then let all clients know that a new user has connected
    io.emit('user list', {
      users_in_room: users_in_room,
      all_users: all_users
    });
  });
});

//listen for incoming connections
http.listen(port, function(){
    console.log('Server listening on port %d', port);
});
