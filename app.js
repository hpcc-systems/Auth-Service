const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const withAuth = require('./middleware');
const loginRouter = require('./routes/login');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const uiRouter = require('./routes/ui');
const appRouter = require('./routes/application');
const authV20Router = require('./routes/authv20');
const roleRouter = require('./routes/roles');
const notificationRouter = require('./routes/notification')
const { userAccountCleanUp } = require("./jobSchedular");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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
app.use('/api/application', withAuth, appRouter); 
app.use('/api/notification', notificationRouter)
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

app.listen(process.env["PORT"], '0.0.0.0', () => {
userAccountCleanUp();
console.log('Server listening on port '+process.env["PORT"])
});

module.exports = app;
