var mathApp = angular.module('mathApp', []);
function mainController($scope, $http) {
  var username = "";
  $scope.problem = "";
  $scope.status = "";
  $scope.users = [];
  $scope.rooms = [];
  $scope.current_room = '/general';
  var main_socket = io.connect('/');
  var socket = io('/general');
  var socket_2 = io('/general-2');
  var socket_3 = io('/general-3');
  var socket_4 = io('/general-4');

  main_socket.on('room list', function(data) {
    console.log(data.rooms);
    $scope.rooms = data.rooms;
    $scope.$apply();
    
    $('.room-link').click(function() {
      $scope.current_room = $(this).html();
      $scope.$apply();
    });
  });

  function bindSockets(socket) {
    var self = this;
    self.socket = socket;
    self.socket_room = socket.nsp;
    self.socket.on('user list', function(data) {
      if (self.socket_room === $scope.current_room) {
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
      }
    });

    self.socket.on('connected', function(data) {
      if (self.socket_room === $scope.current_room) {
        console.log('connected');
      }
    });

    self.socket.on('new question', function(data) {
      console.log('receiving question from %s', self.socket_room);
      if (self.socket_room === $scope.current_room) {
        $scope.problem = data.question;
        $scope.$apply();
      }
    });

    self.socket.on('correct answer', function(data) {
      if (self.socket_room === $scope.current_room) {
        $scope.status = "correct!";
        $scope.$apply();

        setTimeout(function() {
          $scope.status = "";
          $scope.$apply();
        }, 1000);
      }
    });

    self.socket.on('submitted answer', function(data) {
      if (self.socket_room === $scope.current_room) {
        $('.chat-messages-list').append(
          $('<li>').addClass(data.correctness).append(
            $('<span>').append(data.username+": "+data.submitted)
            )
          );
        $('.chat-area')[0].scrollTop = $('.chat-area')[0].scrollHeight;
      }
    });

    $('.chat-input').focus(function() {
      if (username === "") {
        username = S(prompt('enter a username')).stripTags().s;

        if (socket.nsp === $scope.current_room) {
          console.log('setting username');
          self.socket.emit('set username', {username: username});
        }
      }
    });

    $('.chat-input').keyup(function (e) {
      if (e.keyCode == 13) {
        var answer = S($('.chat-input').val()).stripTags().s;
        if(answer !== "") {
          if (socket.nsp === $scope.current_room) {
            self.socket.emit('submit answer', {answer: answer});
          }
        }
        $('.chat-input').val("");
      }
    });
  }

  var sock1 = new bindSockets(socket);
  var sock2 = new bindSockets(socket_2);
  var sock3 = new bindSockets(socket_4);
  var sock4 = new bindSockets(socket_3);

  window.sockets = [];
  window.sockets.push(sock1);
  window.sockets.push(sock2);
  window.sockets.push(sock3);
  window.sockets.push(sock4);
}
