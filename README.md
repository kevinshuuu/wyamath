Best Math Game
==============
[Find this application on Heroku](http://wyamath.herokuapp.com)
![game-screen](http://puu.sh/bTKU7/d96146cb12.png)

## Overview
This application is a basic math trivia game that features four different rooms for four basic math operations (addition, subtraction, multiplication, division). Each room maintains a separate instance of its own game and generates its own trivia questions and keeps its own score. The questions have a time limit of five seconds before the game automatically regenerates a new question. When a question is answered correctly, the room automatically regenerates a new question instead of waiting for the rest of the five second timer. Furthermore, users can freely join and switch between rooms and can keep their scores when moving between rooms. Upon disconnection (like closing the tab), the users leave the lobby and their scores are removed.

The navbar at the top of the application allows the users to switch between the four different rooms that are supported. The game panel on the left prominently displays the current question that is open to the current room that the user is in. The scoreboard on the top right lists all of the users who are currently online on the application and emboldens the names of people who are currently in the user's room. The scores are separate from room to room, so a user with ten points in the "addition" room may only have five points in the "subtraction" room if s/he answered five questions correctly there. The chat area in the bottom left serves as a place to keep track of what is going on in the room and as a chat room. Users submit messages to the chat room and messages that are actually correct answers to the current problem will be colored green and points will be awarded to that user. Other messages are colored white and are there to allow the users to talk to each other. The chat area is not preserved when navigating to a new room, so make sure to screenshot any messages you want to save!

## Running Locally
The application stack is comprised of an all-JavaScript suite of **Node.js, Angular, and Socket.io**. To run the application locally, complete the following steps:

```
cd ~ (or whatever directory you'd like)
git clone https://github.com/wyaeiga/best-math-game.git
cd best-math-game
npm install
npm start
```

And that's it! The server should be started and running, listening for connections at `http://localhost:3000/`. Now you can access the application from your browser and try it out locally.

## Testing
The testing stack uses **Mocha + Should.js** for back-end testing and **Protractor + Selenium** for front-end/end-to-end testing. To run the tests, complete the following steps (assuming you cloned into the previously suggested directory):

```
cd ~/best-math-game
mocha
protractor test/e2e/conf.js
```

Before you get started, you might need to set up [Mocha](http://mochajs.org/#installation) and [Protractor](https://github.com/angular/protractor/blob/master/docs/tutorial.md#setup) first, especially if you don't already have them installed. The Selenium webdriver-manager needs to be running for the end-to-end tests to work and of course the actual game server itself needs to be running as well. All of the tests make the assumption that at the time of running the tests, there are no active users in the game (so close or simply refresh the tab to disconnect the socket and don't sign in again as another user until the tests are done running) and that the server is running at `http://localhost:3000/`.
