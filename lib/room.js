var question = require('./question');

function Room(io) {
  var self = this;
  self.io = io;
  self.users = {};
  self.current_question = question.generateQuestion();
  self.questionInterval = setInterval(function(){
    self.current_question = question.generateQuestion();
    self.io.emit('new question', self.current_question);
    console.log(self.io.name);
    console.log(self.current_question);
  }, 5000);
  
  self.io.on('connection', function(socket){
    console.log('user joining '+self.io.name);
    socket.emit('connected');
    socket.emit('new question', self.current_question);
    socket.emit('user list', self.users);

    socket.on('disconnect', function() {
      delete self.users[socket.username];
      self.io.emit('user list', self.users);
    });

    socket.on('submit answer', function(data) {
      if (data.answer == self.current_question.answer) {
        self.users[socket.username] += 1;
        self.io.emit('user list', self.users);

        socket.emit('correct answer');
        self.current_question = question.generateQuestion();
        self.io.emit('new question', self.current_question);

        clearInterval(self.questionInterval);
        self.questionInterval = setInterval(function() {
          self.current_question = question.generateQuestion();
          self.io.emit('new question', self.current_question);
        }, 5000);
        self.io.emit('submitted answer', {
          submitted: data.answer, 
          username: socket.username, 
          correctness: 'correct'
        });
      } else {
        self.io.emit('submitted answer', {
          submitted: data.answer, 
          username: socket.username, 
          correctness: 'incorrect'
        });
      }
    });

    socket.on('set username', function(data) {
      socket.username = data.username;
      self.users[data.username] = 0;

      self.io.emit('user list', self.users);
    });
  });
}

module.exports = Room;
