## Requirements
Node.Js


Cheerios (https://github.com/cheeriojs/cheerio)


Knowledge of running/building a Node.Js application

## Description
ffScraper is a Node.Js server that provides a REST API you can use to scrape events from ForexFactory which provides you 
with fundamental financial data released by governments and institutions from around the world.

This is a new project I plan to work on over time, below are some features I plan to implement:

API Security

Application Front-End

Access to more financial indicators

Data crunching and analysis
### Below is an example of an event object
```
//A forex data object example:
let forexObject = {
    eventid: '123123',
    date: new Date(),
    time: "2:32 am",
    currency: 'EUR',
    impact: 'Low', //Low, Medium, High, Holiday
    event: 'BOJ Press Conference',
    actual: '14.7%',
    forecast: '0',
    previous: '14.5%'
};
```

## Routes
### GET /monthly/:month
Making a GET request to /monthly/:month with a month and year will return all events in that time frame


As an example: /monthly/Apr.2019 will return all events for April 2019


Please note there is no date validation in place yet, but any dates compatible with the Date class in JavaScript should work.


### GET /daily/:date
Making a get request to /daily/:date is similar to the monthly request, however here we provide a full date


As an example: /daily/Apr15.2019 will return all events for April 15, 2019


