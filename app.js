const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const ffUtils = require('./ffUtils');

const eventsRouter = require('./routes/events');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/events', eventsRouter);

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

let test = [
  {
    "eventid": "107720",
    "event": "All Industries Activity m/m",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "Low",
    "currency": "JPY",
    "actual": "-0.2%",
    "previous": "0.0%",
    "forecast": "-0.2%",
    "time": "12:30am"
  },
  {
    "eventid": "104984",
    "event": "Credit Suisse Economic Expectations",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "Low",
    "currency": "CHF",
    "actual": "-7.7",
    "previous": "-26.9",
    "forecast": "",
    "time": "4:00am"
  },
  {
    "eventid": "101465",
    "event": "German Ifo Business Climate",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "Medium",
    "currency": "EUR",
    "actual": "99.2",
    "previous": "99.7",
    "forecast": "99.9",
    "time": "4:00am"
  },
  {
    "eventid": "103409",
    "event": "ECB Economic Bulletin",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "Low",
    "currency": "EUR",
    "actual": "",
    "previous": "",
    "forecast": "",
    "time": "4:00am"
  },
  {
    "eventid": "106214",
    "event": "Public Sector Net Borrowing",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "Medium",
    "currency": "GBP",
    "actual": "0.8B",
    "previous": "-0.5B",
    "forecast": "-0.8B",
    "time": "4:30am"
  },
  {
    "eventid": "110241",
    "event": "German 10-y Bond Auction",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "Low",
    "currency": "EUR",
    "actual": "0.02|2.0",
    "previous": "-0.05|2.6",
    "forecast": "",
    "time": "5:34am"
  },
  {
    "eventid": "104868",
    "event": "Belgian NBB Business Climate",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "Low",
    "currency": "EUR",
    "actual": "-3.2",
    "previous": "-0.7",
    "forecast": "-0.7",
    "time": "8:59am"
  },
  {
    "eventid": "108163",
    "event": "CB Leading Index m/m",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "Low",
    "currency": "CNY",
    "actual": "1.2%",
    "previous": "1.1%",
    "forecast": "",
    "time": "9:00am"
  },
  {
    "eventid": "105474",
    "event": "BOC Monetary Policy Report",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "High",
    "currency": "CAD",
    "actual": "",
    "previous": "",
    "forecast": "",
    "time": "10:00am"
  },
  {
    "eventid": "105480",
    "event": "BOC Rate Statement",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "High",
    "currency": "CAD",
    "actual": "",
    "previous": "",
    "forecast": "",
    "time": "10:00am"
  },
  {
    "eventid": "105477",
    "event": "Overnight Rate",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "High",
    "currency": "CAD",
    "actual": "1.75%",
    "previous": "1.75%",
    "forecast": "1.75%",
    "time": "10:00am"
  },
  {
    "eventid": "99937",
    "event": "Crude Oil Inventories",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "Low",
    "currency": "USD",
    "actual": "5.5M",
    "previous": "-1.4M",
    "forecast": "0.9M",
    "time": "10:30am"
  },
  {
    "eventid": "105476",
    "event": "BOC Press Conference",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "High",
    "currency": "CAD",
    "actual": "",
    "previous": "",
    "forecast": "",
    "time": "11:15am"
  },
  {
    "eventid": "107206",
    "event": "Bank Holiday",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "Holiday",
    "currency": "NZD",
    "actual": "",
    "previous": "",
    "forecast": "",
    "time": "All Day"
  },
  {
    "eventid": "107215",
    "event": "Bank Holiday",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "Holiday",
    "currency": "AUD",
    "actual": "",
    "previous": "",
    "forecast": "",
    "time": "All Day"
  },
  {
    "eventid": "106597",
    "event": "BOJ Outlook Report",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "High",
    "currency": "JPY",
    "actual": "",
    "previous": "",
    "forecast": "",
    "time": "11:27pm"
  },
  {
    "eventid": "106610",
    "event": "Monetary Policy Statement",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "High",
    "currency": "JPY",
    "actual": "",
    "previous": "",
    "forecast": "",
    "time": "11:27pm"
  },
  {
    "eventid": "106608",
    "event": "BOJ Policy Rate",
    "date": "2019-04-24T04:00:00.000Z",
    "impact": "Low",
    "currency": "JPY",
    "actual": "-0.10%",
    "previous": "-0.10%",
    "forecast": "-0.10%",
    "time": "11:27pm"
  }
];

ffUtils.saveEventsToFile(test);
module.exports = app;
