function QuestionHandler(question_type, io, room_name) {
  var self = this;
  self.io = io;
  self.question_type = question_type;
  self.room_name = room_name;

  self.generateQuestion = function() {
    switch(self.question_type) {
      case 0:
        self.current_question = self.generateAddition(self.getRandomInt(5,20), self.getRandomInt(1,10));
        return self.current_question;
        break;
      case 1:
        self.current_question = self.generateSubtraction(self.getRandomInt(10,20), self.getRandomInt(1,10));
        return self.current_question;
        break;
      case 2:
        self.current_question = self.generateMultiplication(self.getRandomInt(2,11), self.getRandomInt(1,10));
        return self.current_question;
        break;
      case 3:
        self.current_question = self.generateDivision(self.getRandomInt(2,10), self.getRandomInt(5,20));
        return self.current_question;
        break;
    }
  }

  self.generateAddition = function(lvalue, rvalue) {
    var question = { question: lvalue+" + "+rvalue,
      answer: lvalue+rvalue
    }
    return question;
  }

  self.generateSubtraction = function(lvalue, rvalue) {
    var question = { question: lvalue+" - "+rvalue,
      answer: lvalue-rvalue
    }
    return question;
  }

  self.generateMultiplication = function(lvalue, rvalue) {
    var question = { question: lvalue+" * "+rvalue,
      answer: lvalue*rvalue
    }
    return question;
  }

  self.generateDivision = function(lvalue, rvalue) {
    var question = { question: lvalue*rvalue+" / "+rvalue,
      answer: lvalue
    }
    return question;
  }

  self.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max-min + 1)) + min;
  }

  self.current_question = self.generateQuestion();

  self.generateAndEmitQuestion = function() {
    self.current_question = self.generateQuestion();
    if(self.io !== null)
      self.io.to(self.room_name).emit('new question', self.current_question);
  }

  self.interval_timing = 5000;

  self.question_interval = setInterval(self.generateAndEmitQuestion, self.interval_timing);

}

module.exports = QuestionHandler;
