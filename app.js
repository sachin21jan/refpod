var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    multer = require('multer'),
    flash = require('connect-flash'),
    mongo = require('mongodb'),
    hogan = require('hogan-express'),
    mongoose = require('mongoose'),
    exphbs  = require('express-handlebars');

var app = express();

mongoose.connect("mongodb://admin:admin123@ds037622.mongolab.com:37622/refpod");

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

//Handle file uploads
app.use(multer({dest:'./uploads/'}).single('singleInputFileName'));

//app.use(express.logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Handle express sessions
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: new Date(Date.now() + 3600000)
    }
}));
        
//Passport
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

var config = require('./config/config.js');
var index = require('./routes/index');
var users = require('./routes/users');
var employers = require('./routes/employers');

app.use('/', index);
app.use('/users', users);
app.use('/employers', employers);

var env = process.env.NODE_ENV || 'development';
console.log("Mode: " + env);
if(env === 'development'){
   // app.use(session({secret: config.sessionSecret}));
    app.set('port', 3000);
} else {
    app.set('port', process.env.PORT || 3000);
}

app.listen(app.get('port'), function(){
    console.log("Refpod server is running at " + app.get('port') + " port");
});

module.exports = app;