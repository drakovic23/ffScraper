const express = require('express');
const router = express.Router();
const ffUtil = require('../ffUtils');

/* GET monthly events */
router.get('/monthly/:month', (req, res, next) => {
    if(req.params.month !== undefined && req.params.month !== null)
    {
        ffUtil.getMonthlyFxHTML(new Date(req.params.month)).then((htmlString) => {
          ffUtil.parseHTML(htmlString).then((eventArray) => {
            res.send(eventArray);
          }).catch((err) => {res.status(500).end(err);console.log(err)});
        }).catch((err) => {res.status(500).end(err);console.log(err)});

    }
    else
    {
        res.status(500).end();
    }
});
/* GET daily events */
router.get('/daily/:date', (req,res,next) => {
    if(req.params.date !== undefined && req.params.date !== null)
    {
        //TODO: Input validation
        ffUtil.getDailyFxHTML(new Date(req.params.date)).then((htmlString) => {
           ffUtil.parseHTML(htmlString).then((eventArray) => {
              res.send(eventArray);
           }).catch((err) => {res.status(500).end(err);console.log(err)});
        }).catch((err) => {res.status(500).end(err);console.log(err)});
    }
    else
    {
        res.status(500).end();
    }
});
module.exports = router;
