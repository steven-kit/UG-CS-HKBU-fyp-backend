const express = require('express');
const router = express.Router();
const BackfillService = require('../BackfillService.js'); 
const Consts = require('../../common/Consts');

const backfillService = new BackfillService();
const backfillObject = {};

router.get('/test', (req, res) => {
  res.send('Hello. This test endpoint is working');
});

router.get('/stress', (req, res) => {
  console.log('Stress endpoint backfill notification');
  backfillObject.summaryTitle = Consts.STRESS;
  backfillObject.userAccessToken = req.query.uat;
  backfillObject.summaryStartTime = req.query.startTime;
  backfillObject.summaryEndTime = req.query.endTime;

  backfillService.handleBackfillRequest(backfillObject)
    .then(response => res.send(response))
    .catch(error => res.status(500).send(error));
});

router.get('/activities', (req, res) => {
  console.log('Activities endpoint backfill notification');
  backfillObject.summaryTitle = Consts.ACTIVITIES;
  backfillObject.userAccessToken = req.query.uat;
  backfillObject.summaryStartTime = req.query.startTime;
  backfillObject.summaryEndTime = req.query.endTime;

  backfillService.handleBackfillRequest(backfillObject)
    .then(response => res.send(response))
    .catch(error => res.status(500).send(error));
});

router.get('/dailies', (req, res) => {
  console.log('Dailies endpoint backfill notification');
  backfillObject.summaryTitle = Consts.DAILIES;
  backfillObject.userAccessToken = req.query.uat;
  backfillObject.summaryStartTime = req.query.startTime;
  backfillObject.summaryEndTime = req.query.endTime;

  backfillService.handleBackfillRequest(backfillObject)
    .then(response => res.send(response))
    .catch(error => res.status(500).send(error));
});

router.get('/epochs', (req, res) => {
  console.log('Epochs endpoint backfill notification');
  backfillObject.summaryTitle = Consts.EPOCHS;
  backfillObject.userAccessToken = req.query.uat;
  backfillObject.summaryStartTime = req.query.startTime;
  backfillObject.summaryEndTime = req.query.endTime;

  backfillService.handleBackfillRequest(backfillObject)
    .then(response => res.send(response))
    .catch(error => res.status(500).send(error));
});

module.exports = router;