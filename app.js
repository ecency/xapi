const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http'),
  https = require('https');

http.globalAgent.maxSockets = Infinity;
https.globalAgent.maxSockets = Infinity;

const app = express();

app.use(logger('short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.enable('etag');
app.set('etag', 'strong')

// view engine setup
const hbs = require('hbs');
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public'), {maxAge: (86400000 * 7)}));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use('/', require('./routes/api'));

app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json(['error', {
    message: err.message,
    error: {}
  }]);
});

module.exports = app;
