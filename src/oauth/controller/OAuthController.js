const express = require('express');
const router = express.Router();
const OAuthImpl = require('../OAuthImpl');
const UserService = require('../../common/services/UserService');
const PartnerService = require('../../common/services/PartnerService');
const UserAccessTokenService = require('../../common/services/UserAccessTokenService');
const { URL } = require('url');
const { v4: uuidv4 } = require('uuid');

const oAuthImpl = new OAuthImpl();
const userService = new UserService();
const partnerService = new PartnerService();
const userAccessTokenService = new UserAccessTokenService();

router.get('/requestToken', async (req, res) => {
  try {
    const consumerKey = req.query.consumer_key;
    let partner = await partnerService.findByConsumerKey({ consumerKey });

    if (!partner) {
      return res.status(400).send('Could not complete OAuth process. Ensure that the provided consumer key is present in the DB.');
    }

    oAuthImpl.setService(partner.consumerKey, partner.consumerSecret);

    const requestToken = await oAuthImpl.getService().getRequestToken();
    oAuthImpl.setRequestToken(requestToken);

    const responseObject = await oauthConfirm(requestToken, req.protocol + '://' + req.get('host') + req.originalUrl);
    res.set(responseObject.headers).status(responseObject.status).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Could not obtain request token from oauth service.');
  }
});

async function oauthConfirm(oauthRequestToken, host) {
  const oauthConfirmUrl = oAuthImpl.getService().getAuthorizationUrl(oauthRequestToken);
  const callbackUrl = new URL('/auth/accessToken', host);
  const uri = new URL(oauthConfirmUrl);
  uri.searchParams.append('oauth_callback', callbackUrl.toString());

  return {
    headers: { Location: uri.toString() },
    status: 303,
  };
}

router.get('/accessToken', async (req, res) => {
  try {
    const oauthToken = req.query.oauth_token;
    const oauthVerifier = req.query.oauth_verifier;

    if (oauthVerifier) {
      const token = { key: oauthToken, secret: oAuthImpl.getRequestToken().tokenSecret };
      const accessToken = await oAuthImpl.getService().getAccessToken(token, oauthVerifier);
      await createUserInDB(accessToken);

      res.send(`You have successfully completed the OAuth process.<br>User Access Token: ${accessToken.key}<br>User Access Token Secret: ${accessToken.secret}`);
    } else {
      res.send('There was an error in the OAuth process.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('There was an error in the OAuth process.');
  }
});

async function createUserInDB(accessToken) {
  let partner = await partnerService.findByConsumerKey({ consumerKey: oAuthImpl.getConsumerKey() });
  let user = {
    partnerId: partner.partnerId,
    partnerUserAcctId: uuidv4(),
  };

  user = await userService.saveUser(user);

  let userAccessToken = {
    uat: accessToken.key,
    uatSecret: accessToken.secret,
    userId: user.userId,
  };

  if (await userAccessTokenService.verifyUniqueUserAccessToken(userAccessToken)) {
    await userAccessTokenService.saveUserAccessToken(userAccessToken);
    console.info(`User access token: ${userAccessToken.uat} and user access token secret: ${userAccessToken.uatSecret} were added for partner: ${partner.consumerKey}`);
  } else {
    console.warn(`UAT: ${accessToken.key} is already present in the DB. Will not put duplicate UATs.`);
  }
}

module.exports = router;