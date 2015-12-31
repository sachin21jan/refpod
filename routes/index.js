var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    console.log("index: /");
    res.render('user-shell', {title:'Refpod - a new way of employee referral', message: req.flash('error')});
});

module.exports = router;
