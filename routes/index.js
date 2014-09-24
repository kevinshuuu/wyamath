var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
  res.render('index', {title: 'hello', message: 'world'});
});

module.exports = router;
