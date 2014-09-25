var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var stylus = require('stylus');

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

var question = generateQuestion();
function generateAndEmitQuestion() {
  question = generateQuestion();
  io.sockets.emit('new question', question);
}

var questionInterval = setInterval(generateAndEmitQuestion, 5000);

io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('connected');
  socket.emit('new question', question);
  socket.emit('user list', users);
  socket.on('submit answer', function(data) {
    if (data.answer == question.answer) {
      users[socket.username] += 1;
      io.sockets.emit('user list', users);

      socket.emit('correct answer');
      question = generateQuestion();
      io.sockets.emit('new question', question);

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

//helpers
var ADDITION = 0;
var SUBTRACTION = 1;
var MULTIPLICATION = 2;
var DIVISION = 3;

function generateQuestion() {
  switch(getRandomInt(0,3)) {
    case 0:
      return generateAddition(
          getRandomInt(1,10), 
          getRandomInt(5,20)
          );
      break;
    case 1:
      return generateSubtraction(
          getRandomInt(5,15), 
          getRandomInt(5,10)
          );
      break;
    case 2:
      return generateMultiplication(
          getRandomInt(1,10), 
          getRandomInt(5,20)
          );
      break;
    case 3:
      return generateDivision(
          getRandomInt(1,10), 
          getRandomInt(5,20)
          );
      break;
  }
}

function generateAddition(lvalue, rvalue) {
  var question = { question: lvalue+" + "+rvalue,
    answer: lvalue+rvalue
  }
  return question;
}

function generateSubtraction(lvalue, rvalue) {
  var question = { question: lvalue+" - "+rvalue,
    answer: lvalue-rvalue
  }
  return question;
}

function generateMultiplication(lvalue, rvalue) {
  var question = { question: lvalue+" * "+rvalue,
    answer: lvalue*rvalue
  }
  return question;
}

function generateDivision(lvalue, rvalue) {
  var question = { question: lvalue*rvalue+" / "+rvalue,
    answer: lvalue
  }
  return question;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max-min + 1)) + min;
}
