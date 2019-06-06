var exports = module.exports = {};
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const mongoose = require('mongoose');
const eventSchema = require('./schemas/event');
const Event = mongoose.model('Events',eventSchema, 'Events');
//Connect to our MongoDB
mongoose.connect('',
    {useNewUrlParser: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error: '));
db.once('open', () => {
    console.log('Connected to MongoDB successfully');
});
//Date takes a JavaScript Date object and returns a formatted date suitable for ForexFactory
function formatDate(Date, OnlyMonthYear = 0)
{
    var monthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sept", "Oct",
        "Nov", "Dec"
    ];
    var day = Date.getDate();
    var monthIndex = Date.getMonth();
    var year = Date.getFullYear();

    if(OnlyMonthYear === 0)
        return monthNames[monthIndex] + day + '.' + year;
    else
        return monthNames[monthIndex] + '.' + year;
}
//Returns the current date and time in string format suitable for naming files
function getCurrentDate()
{
    let currentDate = new Date();
    return currentDate.toDateString() + "." + currentDate.getHours() + currentDate.getMinutes();
}
//Takes a URL as a string and returns the HTML of that web page
function getHTML(Url)
{
    return new Promise((resolve,reject) => {
        https.get(Url, (resp) =>{

            let returnData = "";
            if(Url === undefined || Url === "")
                throw new Error('Url is a mandatory param');
            else
            {
                resp.on('data', (chunk) => {
                    returnData += chunk;
                });
                resp.on("end", () => {
                    resolve(returnData);
                });
            }
        }).on("error", (err) => {
            reject(err.message);
        });
    });
}
//Takes a JavaScript date object and returns the ForexFactory HTML for a single day
exports.getDailyFxHTML = (date) =>
{
    return new Promise((resolve, reject) => {
        if(date === undefined)
            reject("Date cannot be undefined");
        else
        {
            //TODO: Verify typeof date
            let urlString = "https://www.forexfactory.com/calendar.php?day=" + formatDate(date);
            console.log(urlString);
            getHTML(urlString).then((ret) => {
                resolve(ret);
            }).catch((err) => {reject(err)});
        }
    });
};
exports.getMonthlyFxHTML = (date) =>
{
    return new Promise((resolve, reject) => {
        if(date === undefined)
            reject("Date cannot be undefined");
        else
        {
            //TODO: Verify typeof date
            let urlString = "https://www.forexfactory.com/calendar.php?month=" + formatDate(date,1);
            console.log(urlString);
            getHTML(urlString).then((ret) => {
                resolve(ret);
            }).catch((err) => {reject(err)});
        }
    });
};
//This will parse the daily or monthly HTML and return an array of event objects
//The calendar href in the html gives us the year the events took place and if it is a daily/monthly req
//If insertEvents argument is true then this will also insert an array of events into the DB
exports.parseHTML = (htmlString, insertEvents = false) =>
{
    return new Promise((resolve,reject) => {
        if(htmlString === undefined || htmlString === null)
            throw new Error('htmlString param in parseHTML cannot be null or undefined');

        const $ = cheerio.load(htmlString);
        let calendarHref = $('a.calendar__pagination--next').attr('href');
        let temp = calendarHref.split(/[?=]/);
        let year = "";
        let startIndex = temp[2].length - 4;
        for(let x = startIndex; x < temp[2].length;x++)
        {
            year += temp[2][x];
        }
        let tempDate = "";//if there is a group of events on same day the first event on the page contains the date tag
        let timeOfEvent = "";//time works the same way
        let eventArray = []; //Array of events that we will resolve
        $('tr.calendar__row--grey').map(function(i, el)
        {
            //Get month and day of event
            if($(this).find('span.date').text() !== null && $(this).find('span.date').text() !== "" )
            {
                tempDate = $(this).find('span.date').text();
                tempDate = tempDate.slice(3,tempDate.length) + "." + year;

            }
            //Get currency symbol for this event
            let currencySymbol = $(this).find('td.currency').text();
            currencySymbol = currencySymbol.replace(/(\r\n|\n|\r)/gm,"");
            //Get time of event
            if($(this).find('td.time').text() !== null && $(this).find('td.time').text() !== "")
                timeOfEvent = $(this).find('td.time').text();
            var newEvent = {
                eventid: $(this).attr('data-eventid'),
                event: $(this).find('span.calendar__event-title').html(),
                date: new Date(tempDate),
                impact: '',
                currency: currencySymbol,
                actual: $(this).find('td.actual').text(),
                previous: $(this).find('td.previous').text(),
                forecast: $(this).find('td.forecast').text(),
                time : timeOfEvent,
            };
            //Find forecasted impact for event
            if($(this).find('span.high').html() !== undefined &&
                $(this).find('span.high').html() !== null)
                newEvent.impact = "High";
            else if($(this).find('span.low').html() !== undefined &&
                $(this).find('span.low').html() !== null)
                newEvent.impact = "Low";
            else if($(this).find('span.holiday').html() !== undefined &&
                $(this).find('span.holiday').html() !== null)
                newEvent.impact = "Holiday";
            else if($(this).find('span.medium').html() !== undefined &&
                $(this).find('span.medium').html() !== null)
                newEvent.impact = "Medium";

            eventArray.push(newEvent); //push our new element
        });
        resolve(eventArray);
        if(insertEvents === true)
        {
            exports.insertMultipleEvents(eventArray);
        }

    });
};
//Save an array of events to a file
exports.saveEventsToFile = (eventArray) => {
    fs.writeFile(getCurrentDate() + ".json",JSON.stringify(eventArray),'utf8', (err) => {
        if(err)
            throw err;
        else
            console.log('File saved');
    })
};
//Insert a single event into the db
exports.insertEvent = (event) => {
    let newEvent = new Event({
        eventid: event.eventid,
        date: event.date,
        time: event.time,
        currency: event.currency,
        impact: event.impact,
        event: event.event,
        actual: event.actual,
        forecast: event.forecast,
        previous: event.previous,
    });
    newEvent.save((err) => {
        if (err)
            console.warn(err);
        else
            console.log('Saved event: ' + event.eventid + ' to db');
    })
};
exports.insertMultipleEvents = (eventArray) => {
  Event.collection.insertMany(eventArray, (err, docs) => {
      if (err)
      return console.error(err);
      else
          console.log('Event array of size: ' + eventArray.length + " has been inserted");
  })
};

exports.getMonthlyFxHTML(new Date('Jun.2016')).then((html) => {
   exports.parseHTML(html,true).then((eventArray) => {

   })
});