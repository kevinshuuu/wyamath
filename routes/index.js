var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
  res.render('index', {
    title: 'Best Math Game', 
    message: 'This is the best math game haha xD.'});
});

module.exports = router;
