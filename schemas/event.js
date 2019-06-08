const mongoose = require('mongoose');
let eventSchema = new mongoose.Schema({
        eventid: {type: String, index: true, unique: true, required: true},
        date: {type: Date, required: true},
        time: {type: String},
        currency: {type: String, required: true},
        impact: {type: String},
        event: {type: String, required: true},
        actual: {type: String},
        forecast: {type: String},
        previous: {type: String},
});

module.exports = eventSchema;