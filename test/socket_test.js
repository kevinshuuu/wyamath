var should = require('should');
var io = require('socket.io-client');
var socketUrl = 'http://localhost:3000';
var options = { transports: ['websocket'], 'force new connection': true };

describe('SocketIO', function() {
  var client, client2;
  beforeEach(function(done) {
    client = io.connect(socketUrl, options);
    client2 = io.connect(socketUrl, options);
    done();
  });

  describe('on default client connection', function() {
    it('should receive valid addition question', function(done) {
      client.on('new question', function(data) {
        data.question.indexOf('+').should.be.above(0);
        data.answer.should.be.ok;
        done();
      });
    });

    it('should receive room list', function(done) {
      client.on('room list', function(data) {
        data.should.have.property('rooms').with.lengthOf(4);
        data.should.have.property('current_room').equal('addition');
        done();
      });
    });

    it('should receive valid user list info', function(done) {
      client.on('user list', function(data) {
        data.users_in_room.should.have.property('addition');
        data.users_in_room.should.have.property('subtraction');
        data.users_in_room.should.have.property('multiplication');
        data.users_in_room.should.have.property('division');
        data.all_users.should.be.instanceOf(Array);

        //remove this event so it doesn't call done() again in the future
        client.removeAllListeners('user list');
        done();
      });
    });
  });

  describe('on setting a username', function() {
    it('should receive updated user list info', function(done) {
      client.on('connect', function() {
        client.emit('set username', {username: 'testuser1'});
        client.emit('submit answer', {answer: 'hello'});
        client.on('user list', function(data) {
          if(data.all_users.length === 1) {
            data.users_in_room.addition.should.have.property('testuser1');
            data.users_in_room.subtraction.should.have.property('testuser1');
            data.users_in_room.multiplication.should.have.property('testuser1');
            data.users_in_room.division.should.have.property('testuser1');
            data.all_users.should.containEql('testuser1');

            client.disconnect();
            done();
          }
        });
      });
    });
  });

  describe('on other user activity', function() {
    it('should receive updated user list info if disconnect', function(done) {
      client2.on('user list', function(data) {
        if(data.all_users.length === 0) {
          true.should.be.ok;
          done();
        }
      });
    });
  });
});
