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
        res.status(500).end();
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
        res.status(500).end();
});
/* GET events by name */
router.get('/event/:name', (req,res,next) => {
   if(req.params.name !== undefined && req.params.name !== null)
   {
       ffUtil.findEventByName(req.params.name).then((result) => {
           res.send(result);
       })
   }
   else
       res.status(500).end();
});
/* POST events within a range of 2 dates */
router.post('/range', (req,res,next) => {
    if(req.body!== undefined && req.body !== null)
    {
        ffUtil.findEventDateRange(new Date(req.body.datestart),
            new Date(req.body.dateend)).then((result) => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
            console.error(err);
        })
    }
    else
        res.status(500).end()
});
router.post('/name/range', (req,res,next) => {
    if(req.body !== undefined && req.body.body !== null)
    {
        ffUtil.findEventNameDate(new Date(req.body.datestart), new Date(req.body.dateend),
            req.body.event).then((result) => {
                res.send(result);
        }).catch((err) => {
            console.error(err);
        })
    }
    else
        res.status(500).end()
});
module.exports = router;
