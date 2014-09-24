var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.engine('jade', require('jade').__express);
app.set('views', './public/views');
app.set('view engine', 'jade');

var index = require('./routes/index');
app.use('/', index);

io.on('connection', function(socket){
    console.log('a user connected');
});

http.listen(port, function(){
    console.log('Server listening on port %d', port);
});
