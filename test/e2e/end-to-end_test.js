describe('Best Math Game homepage', function() {
  beforeEach(function() {
    browser.get('http://localhost:3000');
  });

  it('should have a title', function() {
    var title = browser.getTitle();
    expect(browser.getTitle()).toEqual('Best Math Game');
  });

  it('should be active on addition', function() {
    var room_name = element(by.css('li.active>a'));
    expect(room_name.getText()).toEqual('addition');
  });

  it('should ask to play first', function() {
    var chat_input = element(by.css('.chat-input'));
    expect(chat_input.getAttribute('placeholder')).toEqual('click here to start playing!');
  });

  it('should update placeholder on username setting', function() {
    var chat_input = element(by.css('.chat-input'));
    chat_input.click();
    expect(chat_input.getAttribute('placeholder')).toEqual('enter your username');
  });

  it('should update placeholder after setting username and update scoreboard', function() {
    var chat_input = element(by.css('.chat-input'));
    chat_input.sendKeys('testuser1\n');
    expect(chat_input.getAttribute('placeholder')).toEqual('username accepted!');

    var scoreboard_listings = element.all(by.css('ul.scores>li'));
    expect(scoreboard_listings.count()).toEqual(1);
  });

  it('should have an addition question by default', function() {
    var game_question = element(by.css('.problem'));
    expect(game_question.getText()).toContain('+');
  });

  it('should have a subtraction question when switching rooms', function() {
    var subtraction_button = element(by.css('ul.nav>li:nth-child(2)>a'));
    subtraction_button.click();
    var game_question = element(by.css('.problem'));
    expect(game_question.getText()).toContain('-');
  });

  it('should have a multiplication question when switching rooms', function() {
    var multiplication_button = element(by.css('ul.nav>li:nth-child(3)>a'));
    multiplication_button.click();
    var game_question = element(by.css('.problem'));
    expect(game_question.getText()).toContain('*');
  });

  it('should have a division question when switching rooms', function() {
    var division_button = element(by.css('ul.nav>li:nth-child(4)>a'));
    division_button.click();
    var game_question = element(by.css('.problem'));
    expect(game_question.getText()).toContain('/');
  });

  it('should print the message to chat area when submitted', function() {
    var chat_input = element(by.css('.chat-input'));
    chat_input.sendKeys('testuser1\n');
    chat_input.sendKeys('test chat message\n');

    var chat_message = element.all(by.css('ul.chat-messages-list>li'));
    expect(chat_message.count()).toEqual(1);
  });

  it('should apply the correct class to correct answers', function() {
    var chat_input = element(by.css('.chat-input'));
    chat_input.sendKeys('testuser1\n');

    var game_question = element(by.css('.problem'));
    game_question.getText().then(function(text) {
      var answer = eval(text).toString() + '\n';
      chat_input.sendKeys(answer);

      var chat_message = element.all(by.css('ul.chat-messages-list>li.correct'));
      expect(chat_message.count()).toEqual(1);
    });
  });

  it('should have empty user list right now since each test disconnects the socket connection', function() {
    var scoreboard_listings = element.all(by.css('ul.scores>li'));
    expect(scoreboard_listings.count()).toEqual(0);
  });

  it('should clear the chat area and have scores of 0 when switching rooms', function() {
    var chat_input = element(by.css('.chat-input'));
    chat_input.sendKeys('testuser1');

    var submit_button = element(by.css('.chat-submit'));
    submit_button.click();

    var game_question = element(by.css('.problem'));
    game_question.getText().then(function(text) {
      var answer = eval(text).toString() + '\n';
      chat_input.sendKeys(answer);

      var chat_message = element.all(by.css('ul.chat-messages-list>li.correct'));
      expect(chat_message.count()).toEqual(1);

      var subtraction_button = element(by.css('ul.nav>li:nth-child(2)>a'));
      subtraction_button.click();

      var chat_messages_list = element.all(by.css('ul.chat-messages-list>li'));
      expect(chat_messages_list.count()).toEqual(0);

      var scoreboard_listing = element(by.css('ul.scores>li'));
      expect(scoreboard_listing.getText()).toContain('0');
    });
  });
});
