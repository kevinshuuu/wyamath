var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var stylus = require('stylus');
var question = require('./lib/question');

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

var users = {};

var current_question = question.generateQuestion();
function generateAndEmitQuestion() {
  current_question = question.generateQuestion();
  io.sockets.emit('new question', current_question);
}

var questionInterval = setInterval(generateAndEmitQuestion, 5000);

io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('connected');
  socket.emit('new question', current_question);
  socket.emit('user list', users);
  socket.on('submit answer', function(data) {
    if (data.answer == current_question.answer) {
      users[socket.username] += 1;
      io.sockets.emit('user list', users);

      socket.emit('correct answer');
      current_question = question.generateQuestion();
      io.sockets.emit('new question', current_question);

      clearInterval(questionInterval);
      questionInterval = setInterval(generateAndEmitQuestion, 5000);
      io.sockets.emit('submitted answer', {
        submitted: data.answer, 
        username: socket.username, 
        correctness: 'correct'
      });
    } else {
      io.sockets.emit('submitted answer', {
        submitted: data.answer, 
        username: socket.username, 
        correctness: 'incorrect'
      });
    }
  });

  socket.on('set username', function(data) {
    socket.username = data.username;
    users[data.username] = 0;

    io.sockets.emit('user list', users);
  });
});

http.listen(port, function(){
    console.log('Server listening on port %d', port);
});
