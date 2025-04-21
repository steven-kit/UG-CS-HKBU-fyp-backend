const path = require('path');
const Consts = require(path.join(process.cwd(), 'src/common/Consts'));
const express = require('express');
const router = express.Router();
const StressApiService = require('../StressApiService');


const stressApiService = new StressApiService();

router.get('/test', (req, res) => {
  res.send('Hello. This stress test endpoint is working');
});

router.post('/dailies', async (req, res) => {
  try {
    console.info('Dailies endpoint ping notification received');

    const dailies = req.body.dailies;
    dailies.summaryTitle = Consts.DAILIES;

    // Call the service to handle the ping notification
    const response = await stressApiService.sendAppropriateResponseToGarminApi(dailies);

    // Return the response from the service
    res.status(response.status).json({ message: response.message });
  } catch (error) {
    console.error('Error handling dailies ping notification:', error.message);
    res.status(500).json({ message: 'Error handling dailies ping notification', error: error.message });
  }
});

router.post('/details', async (req, res) => {
  try {
    console.info('Stress Details endpoint ping notification received');

    const stressDetails = req.body.stressDetails;
    stressDetails.summaryTitle = Consts.STRESSDETAILS;

    // Call the service to handle the ping notification
    const response = await stressApiService.sendAppropriateResponseToGarminApi(stressDetails);

    // Return the response from the service
    res.status(response.status).json({ message: response.message });
  } catch (error) {
    console.error('Error handling dailies ping notification:', error.message);
    res.status(500).json({ message: 'Error handling dailies ping notification', error: error.message });
  }
});

module.exports = router;