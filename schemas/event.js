const mongoose = require('mongoose');
let eventSchema = new mongoose.Schema({
    eventid: {type: String, index: true},
    date: {type: Date},
    time: {type: String},
    currency: {type: String},
    impact: {type: String},
    event: {type: String},
    actual: {type: String},
    forecast: {type: String},
    previous: {type: String},
});

module.exports = eventSchema;