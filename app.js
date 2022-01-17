var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const fs = require('fs');
var logger = require('morgan');
const cors = require('cors');
const env = require('dotenv').config();
const compression = require('compression');
const coursesRouter = require('./routes/courses');
const authenticRouter = require('./routes/authentication');
const authorization = require('./middleware/authorization');

const MongoClient = require('mongodb').MongoClient;

const url = process.env.URL;
const port = process.env.PORT || 5000
const dbs = process.env.DATABASE

const client = new MongoClient(url, { useUnifiedTopology: true });
let connection;

var app = express();


// configuration
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('case sensitive routing', true);
app.set('strict routing', true);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// connect to database
app.use('/', (req, res, next) => {
  if (!connection) {
    client.connect(function (err) {
      connection = client.db(dbs);
      console.log(connection);
      req.db = connection;
      next();
    })
  } else { // 
    req.db = connection;

    next();
  }
});

//Applying cors to all routes
app.use(cors());

//Compression
app.use(compression());

//Morgan log file
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(logger('combined', { stream: accessLogStream }));



app.use(authorization.checkToken);

app.use('/api/v1/authenticate', authenticRouter);
app.use('/api/v1/courses', coursesRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.listen(port, () => {
  console.log("server running...on " + port);
})
