var mathApp = angular.module('mathApp', []);
function mainController($scope, $http) {
  $scope.problem = "";          //current problem
  $scope.status = "";           //status updates to "correct!" after a correct answer
  $scope.users_in_room = [];    //the users in the current room
  $scope.all_users = [];        //the users in the game
  $scope.rooms = [];            //the list of rooms
  $scope.current_room = "";     //room client is currently in
  var username = "";            //username of the client

  var setting_username = true;  //flags for setting username initially
  var first_try = true;

  var socket = io.connect();

  //updates the scoreboard when given a new list of users
  socket.on('user list', function(data) {
    var processed_users = []
    for (var key in data.users_in_room[$scope.current_room]) {
      processed_users.push({
        'user': key,
        'score': data.users_in_room[$scope.current_room][key].score,
        'active': data.users_in_room[$scope.current_room][key].active
      });
    }
    $scope.users_in_room = processed_users;
    $scope.all_users = data.all_users;
    $scope.$apply();
  });

  //updates the current list of rooms
  socket.on('room list', function(data) {
    $scope.rooms = data.rooms;
    $scope.current_room = data.current_room;
    $scope.$apply();

    //binds a click event to trigger room switching when clicking on the navbar
    $('.room-link').unbind().click(function(e) {
      e.stopPropagation();

      console.log('switching');
      socket.emit('changing rooms', S($(this).html()).stripTags().s);
      $('.chat-messages-list').html('');
    });
  });

  socket.on('new question', function(data) {
    $scope.problem = data.question;
    $scope.$apply();
  });

  socket.on('correct answer', function(data) {
    $scope.status = "correct!";
    $scope.$apply();

    //removes the "correct!" text from the page after one second
    setTimeout(function() {
      $scope.status = "";
      $scope.$apply();
    }, 1000);
  });

  //appends answers/chat messages to the bottom of the list of chat messages
  socket.on('submitted answer', function(data) {
    $('.chat-messages-list').append(
      $('<li>').addClass(data.correctness).append(
        $('<span>').append(data.username+": "+data.submitted)
        )
      );
    $('.chat-area')[0].scrollTop = $('.chat-area')[0].scrollHeight;
  });

  //really only called once at the beginning to change placeholder text
  $('.chat-input').focus(function() {
    if(setting_username && first_try) {
      $(this).attr('placeholder', 'enter your username');
      first_try = false;
    }
  });

  //tries to set username if username not set or submits an answer/chat message
  $('.chat-input').keyup(function (e) {
    if (e.keyCode == 13) {

      //if setting username
      if(setting_username) {
        username = S($('.chat-input').val()).stripTags().s;
        if(username === "")
          return;

        //if the username isn't in the list of current users
        if($scope.all_users.indexOf(username) === -1) {

          //tell the server our new username and change the placeholder text
          socket.emit('set username', {username: username});
          $(this).attr('placeholder', 'username accepted!');
          setTimeout(function() {
            $('.chat-input').attr('placeholder', 'answer or chat here...');
          }, 1500);
          setting_username = false;
        } else {

          //otherwise we change the placeholder text to indicate username is taken
          $(this).attr('placeholder', 'that username is taken!');

          //unset all of the values
          $(this).val("");
          username = "";

          //and prompt the user to reenter a username
          setTimeout(function() {
            $('.chat-input').attr('placeholder', 'try a different username');
          }, 2000);
        }
      } else {

        //we try to submit the answer
        var answer = S($('.chat-input').val()).stripTags().s;
        if(answer !== "") {

          //as long as the "answer" isn't an empty string ""
          socket.emit('submit answer', {answer: answer});
        }
      }
      $(this).val("");
    }
  });

  //same as above: tries to set username if username not set or submits an answer/chat message
  $('.chat-submit').click(function() {
    if(setting_username) {
      if(username === "")
        return;

      username = S($('.chat-input').val()).stripTags().s;
      if($scope.all_users.indexOf(username) === -1) {
        socket.emit('set username', {username: username});
        $('.chat-input').attr('placeholder', 'username accepted!');
        setTimeout(function() {
          $('.chat-input').attr('placeholder', 'answer or chat here...');
        }, 1500);
        setting_username = false;
      } else {
        $('.chat-input').attr('placeholder', 'that username is taken!');
        $('.chat-input').val("");
        username = "";
        setTimeout(function() {
          $('.chat-input').attr('placeholder', 'try a different username');
        }, 1500);
      }
    } else {
      var answer = S($('.chat-input').val()).stripTags().s;
      if(answer !== "") {
        socket.emit('submit answer', {answer: answer});
      }
    }
    $('.chat-input').val("");
  });
}
