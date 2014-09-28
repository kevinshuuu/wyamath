var mathApp = angular.module('mathApp', []);
function mainController($scope, $http) {
  var username = "";
  $scope.problem = "";
  $scope.status = "";
  $scope.users_in_room = [];
  $scope.all_users = [];
  $scope.rooms = [];
  $scope.current_room = "";
  var socket = io.connect();

  socket.on('user list', function(data) {
    var processed_users = []
    for (var key in data.users_in_room) {
      processed_users.push({
        'user': key,
        'score': data.users_in_room[key].score,
        'active': data.users_in_room[key].active
      });
    }
    $scope.users_in_room = processed_users;
    $scope.all_users = data.all_users;
    $scope.$apply();
  });

  socket.on('room list', function(data) {
    $scope.rooms = data.rooms;
    $scope.current_room = data.current_room;
    $scope.$apply();

    $('.room-link').unbind().click(function(e) {
      e.stopPropagation();

      console.log('switching');
      socket.emit('changing rooms', $(this).html());
    });
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
      username = S(prompt('enter a username')).stripTags().s;
      socket.emit('set username', {username: username});
    }
  });

  $('.chat-input').keyup(function (e) {
    if (e.keyCode == 13) {
      var answer = S($('.chat-input').val()).stripTags().s;
      if(answer !== "") {
        socket.emit('submit answer', {answer: answer});
      }
      $('.chat-input').val("");
    }
  });
}
