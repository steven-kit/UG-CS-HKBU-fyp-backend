const express = require('express');
const router = express.Router();
const UserService = require('../../common/services/UserService');
const UserAccessTokenService = require('../../common/services/UserAccessTokenService');
const UserApiService = require('../UserApiService');

const userService = new UserService();
const userAccessTokenService = new UserAccessTokenService();
const userApiService = new UserApiService();

router.get('/test', (req, res) => {
  res.send('Hello. This test endpoint is working');
});

router.get('/deregister', async (req, res) => {
  try {
    const userAccessToken = req.query.userAccessToken;
    let uat = await userAccessTokenService.findByUat(userAccessToken);

    const response = await userApiService.deregisterUser(uat);
    console.log("Response from deregisterUser:", response);
    res.status(response.status).send(response.message);
  } catch (error) {
    console.error(error);
    res.status(500).send('There was a problem deregistering the user.');
  }
});

router.get('/getUserId', async (req, res) => {
  try {
    const userAccessToken = req.query.userAccessToken;
    let uat = await userAccessTokenService.findByUat(userAccessToken);

    const response = await userApiService.retrieveUserId(uat);
    res.status(response.status).send(response.message);
  } catch (error) {
    console.error(error);
    res.status(500).send('There was a problem retrieving the user ID.');
  }
});

module.exports = router;