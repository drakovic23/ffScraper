var exports = module.exports = {};
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');

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
            exports.getHTML(urlString).then((ret) => {
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
            exports.getHTML(urlString).then((ret) => {
                resolve(ret);
            }).catch((err) => {reject(err)});
        }
    });
};

exports.getHTML = (Url) =>
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
};

//This will parse the daily or monthly HTML and return an array of event objects
//The calendar href in the html gives us the year the events took place and if it is a daily/monthly query
exports.parseHTML = (htmlString) =>
{
    return new Promise((resolve,reject) => {
        if(htmlString === undefined || htmlString === null)
            reject('htmlString param in parseHTML cannot be null or undefined');

        const $ = cheerio.load(htmlString);
        let calendarHref = $('a.calendar__pagination--next').attr('href');
        let temp = calendarHref.split(/[?=]/);
        let isDailyData = temp[1].toLowerCase() === 'day';
        let year = temp[2][6] + temp[2][7] + temp[2][8] + temp[2][9];
        let tempDate = "";//if there is a group of events on same day the first event on the page contains the date tag
        let timeOfEvent = "";//time works the same way
        let eventArray = []; //Our return array that holds all event objects

        $('tr.calendar__row--grey').map(function(i, el)
        {
            //Get month and day of event
            if($(this).find('span.date').text() !== null && $(this).find('span.date').text() !== "" )
            {
                tempDate = $(this).find('span.date').text();
                if(isDailyData) //if daily data then remove the name of the day (we only need day/month)
                    tempDate = tempDate.slice(3,tempDate.length) + "." + year;
            }
            //Get currency symbol for this event
            let currencySymbol = $(this).find('td.currency').text();
            currencySymbol = currencySymbol.replace(/(\r\n|\n|\r)/gm,"");
            //Get time of event
            if($(this).find('td.time').text() !== null && $(this).find('td.time').text() !== "")
                timeOfEvent = $(this).find('td.time').text();
            //Start creating our new element
            var newElement = {
                eventid: $(this).attr('data-eventid'),
                event: $(this).find('span.calendar__event-title').html(),
                date: new Date(tempDate), //TODO: Set time of event
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
                newElement.impact = "High";
            else if($(this).find('span.low').html() !== undefined &&
                $(this).find('span.low').html() !== null)
                newElement.impact = "Low";
            else if($(this).find('span.holiday').html() !== undefined &&
                $(this).find('span.holiday').html() !== null)
                newElement.impact = "Holiday";
            else if($(this).find('span.medium').html() !== undefined &&
                $(this).find('span.medium').html() !== null)
                newElement.impact = "Medium";

            eventArray.push(newElement); //push our new element
        });
        resolve(eventArray);
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