var mathApp = angular.module('mathApp', []);
function mainController($scope, $http) {
  var username = "";
  $scope.problem = "";
  $scope.status = "";
  $scope.users = [];
  var socket = io.connect();

  socket.on('user list', function(data) {
    var processed_users = []
    for (var key in data) {
      processed_users.push({
        'user': key,
        'score': data[key]
      });
    }
    console.log(processed_users);
    $scope.users = processed_users;
    $scope.$apply();
  });

  socket.on('new question', function(data) {
    $scope.problem = data.question;
    $scope.$apply();
  });

  socket.on('correct answer', function(data) {
    $scope.status = "correct!";
    $scope.$apply();

    setTimeout(function() {
      $scope.status = "";
      $scope.$apply();
    }, 1000);
  });

  socket.on('submitted answer', function(data) {
    $('.chat-messages-list').append(
      $('<li>').addClass(data.correctness).append(
        $('<span>').append(data.username+": "+data.submitted)
        )
      );
    $('.chat-area')[0].scrollTop = $('.chat-area')[0].scrollHeight;
  });

  $('.chat-input').focus(function() {
    if (username === "") {
      username = prompt('enter a username');
      socket.emit('set username', {username: username});
    }
  });

  $('.chat-input').keyup(function (e) {
    if (e.keyCode == 13) {
      var answer = $('.chat-input').val();
      if(answer !== "") {
        socket.emit('submit answer', {answer: answer});
      }
      $('.chat-input').val("");
    }
  });
}
