var should = require('should');
var question_handler = require('../lib/question.js');

describe('QuestionHandler', function() {
  describe('generateAddition(lvalue, rvalue)', function() {
    it('should generate an correct addition question', function() {
      var q_handler = new question_handler(0, null, 'addition');
      var addition_question = q_handler.generateAddition(5,5);
      
      addition_question.should.have.property('question', '5 + 5');
      addition_question.should.have.property('answer', '10');
    });
  });

  describe('generateSubtraction(lvalue, rvalue)', function() {
    it('should generate a correct subtraction question', function() {
      var q_handler = new question_handler(1, null, 'subtraction');
      var subtraction_question = q_handler.generateSubtraction(5,5);
      
      subtraction_question.should.have.property('question', '5 - 5');
      subtraction_question.should.have.property('answer', '0');
    });
  });

  describe('generateMultiplication(lvalue, rvalue)', function() {
    it('should generate a correct multiplication question', function() {
      var q_handler = new question_handler(2, null, 'multiplication');
      var multiplication_question = q_handler.generateMultiplication(5,5);
      
      multiplication_question.should.have.property('question', '5 * 5');
      multiplication_question.should.have.property('answer', '25');
    });
  });

  describe('generateDivision(lvalue, rvalue)', function() {
    it('should generate a correct division question', function() {
      var q_handler = new question_handler(3, null, 'division');
      var division_question = q_handler.generateDivision(5,5);
      
      division_question.should.have.property('question', '25 / 5');
      division_question.should.have.property('answer', '5');
    });
  });

  describe('generateQuestion()', function() {
    it('should set current_question to new question', function() {
      var q_handler = new question_handler(0, null, 'addition');
      q_handler.generateQuestion();
      var current_question = q_handler.current_question;
      q_handler.generateQuestion();

      current_question.should.not.equal(q_handler.current_question);
    });
  });
});

describe('QuestionHandler(0, null, "addition")', function() {
  describe('generateQuestion()', function() {
    it('should generate an addition question', function() {
      var q_handler = new question_handler(0, null, 'addition');
      var question = q_handler.generateQuestion();

      question.question.indexOf('+').should.be.above(0);
    });
  });
});

describe('QuestionHandler(1, null, "subtraction")', function() {
  describe('generateQuestion()', function() {
    it('should generate an subtraction question', function() {
      var q_handler = new question_handler(1, null, 'subtraction');
      var question = q_handler.generateQuestion();

      question.question.indexOf('-').should.be.above(0);
    });
  });
});

describe('QuestionHandler(2, null, "multiplication")', function() {
  describe('generateQuestion()', function() {
    it('should generate an multiplication question', function() {
      var q_handler = new question_handler(2, null, 'multiplication');
      var question = q_handler.generateQuestion();

      question.question.indexOf('*').should.be.above(0);
    });
  });
});

describe('QuestionHandler(3, null, "division")', function() {
  describe('generateQuestion()', function() {
    it('should generate an division question', function() {
      var q_handler = new question_handler(3, null, 'division');
      var question = q_handler.generateQuestion();

      question.question.indexOf('/').should.be.above(0);
    });
  });
});
