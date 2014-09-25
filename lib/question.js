module.exports = {
  generateQuestion: function () {
    switch(getRandomInt(0,3)) {
      case 0:
        return this.generateAddition(
            getRandomInt(1,10), 
            getRandomInt(5,20)
            );
        break;
      case 1:
        return this.generateSubtraction(
            getRandomInt(5,15), 
            getRandomInt(5,10)
            );
        break;
      case 2:
        return this.generateMultiplication(
            getRandomInt(1,10), 
            getRandomInt(5,20)
            );
        break;
      case 3:
        return this.generateDivision(
            getRandomInt(1,10), 
            getRandomInt(5,20)
            );
        break;
    }
  },

  generateAddition: function(lvalue, rvalue) {
    var question = { question: lvalue+" + "+rvalue,
      answer: lvalue+rvalue
    }
    return question;
  },

  generateSubtraction: function(lvalue, rvalue) {
    var question = { question: lvalue+" - "+rvalue,
      answer: lvalue-rvalue
    }
    return question;
  },

  generateMultiplication: function(lvalue, rvalue) {
    var question = { question: lvalue+" * "+rvalue,
      answer: lvalue*rvalue
    }
    return question;
  },

  generateDivision: function(lvalue, rvalue) {
    var question = { question: lvalue*rvalue+" / "+rvalue,
      answer: lvalue
    }
    return question;
  }
}

var getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max-min + 1)) + min;
}
