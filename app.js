var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-locals');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var config = require('./config/main');

//Setting up database to use
mongoose.connect('mongodb://localhost/fin-poc');
var db = mongoose.connection;

//initalise app
var app = express();

// Express Session
app.use(session({
    secret: config.secret,
    saveUninitialized: true,
    resave: true
}));

//View engine
app.set('views', path.join(__dirname,'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('view options', { layout:'layouts/layout.ejs' });

// BodyParser Middleware (makes req.body possible)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
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

// Connect Flash (show flash message e.g. you logged in)
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  req.db = db;
  next();
});

//Setting up routes
var routes = require('./routes/index');
var users = require('./routes/users');
var posts = require('./routes/posts', db);
var apiUsers = require('./routes/apiUsers');

app.use('/', routes);
app.use('/users', users);
app.use('/posts', posts);
app.use('/apiUsers', apiUsers);

// Set Port and start server
app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});


