var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const withAuth = require('./middleware');

var loginRouter = require('./routes/login');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var uiRouter = require('./routes/ui');
var appRouter = require('./routes/application');
var authV20Router = require('./routes/authv20');
var roleRouter = require('./routes/roles');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/login', loginRouter);
app.use('/api/users', withAuth, usersRouter);
app.use('/api/auth/v20', authV20Router);
app.use('/api/auth', authRouter);
app.use('/admin', withAuth, uiRouter);
//app.use('/', withAuth, indexRouter);
app.use('/api/application', withAuth, appRouter); 

app.use('/api/roles', withAuth, roleRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3003, '0.0.0.0', () => console.log('Server listening on port 3003!'));

module.exports = app;
