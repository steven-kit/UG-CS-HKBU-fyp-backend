const express = require('express');
const router = express.Router();
const UserService = require('../../common/services/UserService');
const UserAccessTokenService = require('../../common/services/UserAccessTokenService');
const { v4: uuidv4 } = require('uuid');

const userService = new UserService();
const userAccessTokenService = new UserAccessTokenService();

router.get('/connect/garmin', (req, res) => {
  res.redirect('/connect/garmin');
});

router.get('/handle_garmin_callback', async (req, res) => {
  try {
    console.log('Session:', req.session);

    if (!req.session.grant || !req.session.grant.response) {
      console.log('Grant object not found in session:', req.session.grant);
      return res.status(400).send('OAuth response not found in session.');
    }

    const { access_token, access_secret } = req.session.grant.response;

    // Save the access token and secret in the database
    const user = {
      gcpsUserAcctId: uuidv4()
    };

    const savedUser = await userService.saveUser(user);

    const userAccessToken = {
      uat: access_token,
      uatSecret: access_secret,
      userId: savedUser.userId,
    };

    if (await userAccessTokenService.verifyUniqueUserAccessToken(userAccessToken)) {
      await userAccessTokenService.saveUserAccessToken(userAccessToken);
      console.info(`User access token: ${userAccessToken.uat} and user access token secret: ${userAccessToken.uatSecret} were added for user: ${savedUser.userId}`);
    } else {
      console.warn(`UAT: ${access_token} is already present in the DB. Will not put duplicate UATs.`);
    }

    res.send('OAuth process completed successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('There was an error in the OAuth process.');
  }
});

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const UserService = require('../../common/services/UserService');
// const UserAccessTokenService = require('../../common/services/UserAccessTokenService');
// const { v4: uuidv4 } = require('uuid');
// const axios = require('axios');
// const OAuth = require('oauth-1.0a');
// const crypto = require('crypto');

// const userService = new UserService();
// const userAccessTokenService = new UserAccessTokenService();

// const oauth = OAuth({
//   consumer: {
//     key: process.env.CONSUMER_KEY,
//     secret: process.env.CONSUMER_SECRET,
//   },
//   signature_method: 'HMAC-SHA1',
//   hash_function(base_string, key) {
//     return crypto.createHmac('sha1', key).update(base_string).digest('base64');
//   },
// });

// router.get('/handle_garmin_callback', async (req, res) => {
//   try {
//     console.log('Session:', req.session);

//     if (!req.session.grant || !req.session.grant.response) {
//       return res.status(400).send('OAuth response not found in session.');
//     }

//     if (!req.session.grant.response) {
//       console.error('OAuth response not found in session.');
//       return res.status(400).send('OAuth response not found in session.');
//     }

//     const { oauth_token, oauth_verifier } = req.session.grant.response;

//     console.log('OAuth Token:', oauth_token);
//     console.log('OAuth Verifier:', oauth_verifier);

//     // Exchange the request token and verifier for an access token
//     const requestData = {
//       url: process.env.OAUTH_ACCESS_TOKEN_URL,
//       method: 'POST',
//       data: {
//         oauth_token,
//         oauth_verifier,
//       },
//     };

//     const headers = oauth.toHeader(oauth.authorize(requestData, { key: oauth_token, secret: req.session.grant.response.oauth_token_secret }));

//     headers.Authorization += `, oauth_verifier="${oauth_verifier}"`;

//     console.log('Authorization Header:', headers.Authorization);

//     const response = await axios.post(requestData.url, null, { headers });

//     const responseParams = new URLSearchParams(response.data);
//     const access_token = responseParams.get('oauth_token');
//     const access_secret = responseParams.get('oauth_token_secret');

//     // Save the access token and secret in the database
//     const user = {
//       // partnerId: 'emier',
//       // partnerUserAcctId: uuidv4(),
//       gcpsUserAcctId: uuidv4()
//     };

//     const savedUser = await userService.saveUser(user);

//     const userAccessToken = {
//       uat: access_token,
//       uatSecret: access_secret,
//       userId: savedUser.userId,
//     };

//     if (await userAccessTokenService.verifyUniqueUserAccessToken(userAccessToken)) {
//       await userAccessTokenService.saveUserAccessToken(userAccessToken);
//       console.info(`User access token: ${userAccessToken.uat} and user access token secret: ${userAccessToken.uatSecret} were added for user: ${savedUser.userId}`);
//     } else {
//       console.warn(`UAT: ${access_token} is already present in the DB. Will not put duplicate UATs.`);
//     }

//     res.send('OAuth process completed successfully.');
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('There was an error in the OAuth process.');
//   }
// });

// module.exports = router;

// require('dotenv').config();

// const express = require('express');
// const router = express.Router();
// const OAuthImpl = require('../OAuthImpl');
// const UserService = require('../../common/services/UserService');
// // const PartnerService = require('../../common/services/PartnerService');
// const UserAccessTokenService = require('../../common/services/UserAccessTokenService');
// const { URL } = require('url');
// const { v4: uuidv4 } = require('uuid');

// const oAuthImpl = new OAuthImpl();
// const userService = new UserService();
// // const partnerService = new PartnerService();
// const userAccessTokenService = new UserAccessTokenService();

// router.get('/requestToken', async (req, res) => {
//   try {
//     // const consumerKey = req.query.consumer_key;
//     // let partner = await partnerService.findByConsumerKey({ consumerKey });

//     // if (!partner) {
//     //   return res.status(400).send('Could not complete OAuth process. Ensure that the provided consumer key is present in the DB.');
//     // }

//     oAuthImpl.setService(process.env.CONSUMER_KEY, process.env.CONSUMER_KEY);

//     const requestToken = await oAuthImpl.getService().getRequestToken();
//     oAuthImpl.setRequestToken(requestToken);

//     const responseObject = await oauthConfirm(requestToken, req.protocol + '://' + req.get('host') + req.originalUrl);
//     res.set(responseObject.headers).status(responseObject.status).send();
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Could not obtain request token from oauth service.');
//   }
// });

// async function oauthConfirm(oauthRequestToken, host) {
//   const oauthConfirmUrl = oAuthImpl.getService().getAuthorizationUrl(oauthRequestToken);
//   const callbackUrl = new URL('/auth/accessToken', host);
//   const uri = new URL(oauthConfirmUrl);
//   uri.searchParams.append('oauth_callback', callbackUrl.toString());

//   return {
//     headers: { Location: uri.toString() },
//     status: 303,
//   };
// }

// router.get('/accessToken', async (req, res) => {
//   try {
//     const oauthToken = req.query.oauth_token;
//     const oauthVerifier = req.query.oauth_verifier;

//     if (oauthVerifier) {
//       const token = { key: oauthToken, secret: oAuthImpl.getRequestToken().tokenSecret };
//       const accessToken = await oAuthImpl.getService().getAccessToken(token, oauthVerifier);
//       await createUserInDB(accessToken);

//       res.send(`You have successfully completed the OAuth process.<br>User Access Token: ${accessToken.key}<br>User Access Token Secret: ${accessToken.secret}`);
//     } else {
//       res.send('There was an error in the OAuth process.');
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('There was an error in the OAuth process.');
//   }
// });

// async function createUserInDB(accessToken) {
//   let partner = await partnerService.findByConsumerKey({ consumerKey: oAuthImpl.getConsumerKey() });
//   let user = {
//     partnerId: partner.partnerId,
//     partnerUserAcctId: uuidv4(),
//   };

//   user = await userService.saveUser(user);

//   let userAccessToken = {
//     uat: accessToken.key,
//     uatSecret: accessToken.secret,
//     userId: user.userId,
//   };

//   if (await userAccessTokenService.verifyUniqueUserAccessToken(userAccessToken)) {
//     await userAccessTokenService.saveUserAccessToken(userAccessToken);
//     console.info(`User access token: ${userAccessToken.uat} and user access token secret: ${userAccessToken.uatSecret} were added for partner: ${partner.consumerKey}`);
//   } else {
//     console.warn(`UAT: ${accessToken.key} is already present in the DB. Will not put duplicate UATs.`);
//   }
// }

// module.exports = router;