const express = require('express');
const router = express.Router();

router.post('/data', async (req, res) => {
  try {
    console.log('Received stress data push notification from Garmin.');
    const stressData = req.body;

    // Validate and process the stress data
    if (!stressData || !Array.isArray(stressData)) {
      return res.status(400).send('Invalid stress data.');
    }

    // Process and store the stress data
    console.log('Processing stress data:', stressData);
    // TODO: Add logic to save stress data to your database

    res.status(200).send('Stress data processed successfully: ', stressData);
  } catch (error) {
    console.error('Error processing stress data:', error.message);
    res.status(500).send('There was a problem processing the stress data.');
  }
});

module.exports = router;