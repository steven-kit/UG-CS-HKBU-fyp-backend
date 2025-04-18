require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const UserService = require('../../common/services/UserService');
const UserAccessTokenService = require('../../common/services/UserAccessTokenService');
const { v4: uuidv4 } = require('uuid');

const userService = new UserService();
const userAccessTokenService = new UserAccessTokenService();

const oauth = OAuth({
  consumer: {
    key: process.env.CONSUMER_KEY,
    secret: process.env.CONSUMER_SECRET,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

router.get('/handle_garmin_callback', async (req, res) => {
  try {
    console.log('Handling Garmin callback...');

    const oauth_token_secret = req.session.grant.request.oauth_token_secret

    const { oauth_token, oauth_verifier } = req.query;
    console.log('OAuth Token:', oauth_token);
    console.log('OAuth Verifier:', oauth_verifier);

    const requestData = {
      url: process.env.OAUTH_ACCESS_TOKEN_URL,
      method: 'POST',
    };

    const oauthParams = {
      oauth_consumer_key: process.env.CONSUMER_KEY,
      oauth_token: oauth_token,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_version: '1.0',
      oauth_verifier: oauth_verifier,
    };

    const baseString = `${requestData.method.toUpperCase()}&${encodeURIComponent(requestData.url)}&${encodeURIComponent(
      Object.keys(oauthParams)
        .sort()
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
        .join('&')
    )}`;
    console.log('Custom Signature Base String:', baseString);

    const signingKey = `${process.env.CONSUMER_SECRET}&${oauth_token_secret}`;
    console.log('Signing Key:', signingKey);

    const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
    console.log('Manually Calculated Signature:', signature);

    oauthParams.oauth_signature = signature;

    const headers = oauth.toHeader(oauthParams);
    console.log('Authorization Header:', headers.Authorization);

    const response = await axios.post(requestData.url, null, { headers });

    const responseParams = new URLSearchParams(response.data);
    const access_token = responseParams.get('oauth_token');
    const access_secret = responseParams.get('oauth_token_secret');

    console.log('Access Token:', access_token);
    console.log('Access Secret:', access_secret);

    // Save access token and secret in database
    const user = {
      gcpsUserAcctId: uuidv4()
    };

    const savedUser = await userService.saveUser(user);

    const userAccessToken = {
      uat: access_token,
      uatSecret: access_secret,
      userId: savedUser.userId,
    };

    if (await userAccessTokenService.verifyUniqueUserAccessToken(userAccessToken.uat)) {
      await userAccessTokenService.saveUserAccessToken(userAccessToken);
      console.info(`User access token: ${userAccessToken.uat} and user access token secret: ${userAccessToken.uatSecret} were added for user: ${savedUser.userId}`);
    } else {
      console.warn(`UAT: ${access_token} is already present in the DB. Will not put duplicate UATs.`);
    }

    res.send('OAuth process completed successfully.');
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).send('There was an error in the OAuth process.');
  }
});

module.exports = router;