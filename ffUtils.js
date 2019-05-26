var exports = module.exports = {};
const cheerio = require('cheerio');
const https = require('https');

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

exports.getDailyFxHTML = (date) =>
{
    return new Promise((resolve, reject) => {
        if(date === undefined)
            reject("Date cannot be undefined");
        else
        {
            //console.log(date);
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
            //console.log(date);
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
    //console.log(Url);
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
                    //console.log(returnData);
                    resolve(returnData);
                });
            }

        }).on("error", (err) => {
            //console.log("Error: " + err.message);
            reject(err.message);
        });

    });
};


//A forex data object example:
let forexObject = {
    eventid: '123123',
    date: new Date(),
    time: "2:32 am",
    currency: 'EUR',
    impact: 'Low', //Low, Medium, High
    event: 'BOJ Press Conference',
    actual: '14.7%',
    forecast: '0',
    previous: '14.5%'
};

exports.parseHTML = (htmlString) =>
{
    return new Promise((resolve,reject) => {

        if(htmlString === undefined || htmlString === null)
            reject('htmlString param in parseHTML cannot be null or undefined');
        const $ = cheerio.load(htmlString);
        let calendarHref = $('a.calendar__pagination--next').attr('href');
        let temp = "";
        temp = calendarHref.split(/[?=]/);
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
                //console.log(tempDate);
                if(isDailyData) //if daily data then remove the name of the day (we only need day/month)
                    tempDate = tempDate.slice(3,tempDate.length) + "." + year;
            }
            //Get currency pair for this event
            let currencyPair = $(this).find('td.currency').text();
            currencyPair = currencyPair.replace(/(\r\n|\n|\r)/gm,"");
            //Get time of event
            if($(this).find('td.time').text() !== null && $(this).find('td.time').text() !== "")
                timeOfEvent = $(this).find('td.time').text();
            //Start creating our new element
            var newElement = {
                eventid: $(this).attr('data-eventid'),
                event: $(this).find('span.calendar__event-title').html(),
                date: new Date(tempDate), //TODO: Set time of event
                impact: '',
                currency: currencyPair,
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