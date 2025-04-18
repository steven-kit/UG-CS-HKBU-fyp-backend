const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const axios = require('axios');

class OAuthImpl {
  constructor() {
    this.consumerKey = process.env.CONSUMER_KEY;
    this.consumerSecret = process.env.CONSUMER_SECRET;
    
    this.oauthRequestTokenUrl = process.env.OAUTH_REQUEST_TOKEN_URL;
    this.oauthConfirmUrl = process.env.OAUTH_CONFIRM_URL;
    this.oauthAccessTokenUrl = process.env.OAUTH_ACCESS_TOKEN_URL;

    this.oauth = OAuth({
      consumer: {
        key: this.consumerKey,
        secret: this.consumerSecret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });

    this.requestToken = null;
    this.verifier = null;
    this.accessToken = null;
    this.request = null;
  }

  setService(consumerKey, consumerSecret) {
    console.info(`The OAuth first leg URL is: ${this.oauthRequestTokenUrl}`);
    console.info(`The OAuth second leg URL is: ${this.oauthConfirmUrl}`);
    console.info(`The OAuth third leg URL is: ${this.oauthAccessTokenUrl}`);

    this.oauth = OAuth({
      consumer: {
        key: consumerKey,
        secret: consumerSecret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });
  }

  getService() {
    return this.oauth;
  }

  setRequestToken(requestToken) {
    this.requestToken = requestToken;
  }

  getRequestToken() {
    return this.requestToken;
  }

  setVerifier(verifier) {
    this.verifier = verifier;
  }

  getVerifier() {
    return this.verifier;
  }

  setAccessToken(accessToken) {
    this.accessToken = accessToken;
  }

  getAccessToken() {
    return this.accessToken;
  }

  setRequest(request) {
    this.request = request;
  }

  getRequest() {
    return this.request;
  }

  createOAuthGetRequest(requestUrl) {
    const request = {
      url: requestUrl,
      method: 'GET',
    };
    this.setRequest(request);
    return request;
  }

  createOAuthDeleteRequest(requestUrl) {
    const request = {
      url: requestUrl,
      method: 'DELETE',
    };
    this.setRequest(request);
    return request;
  }

  createOAuthAccessToken(uat, uatSecret) {
    const accessToken = {
      key: uat,
      secret: uatSecret,
    };
    this.setAccessToken(accessToken);
    return accessToken;
  }

  async sendRequest() {
    const requestData = this.getRequest();
    const token = this.getAccessToken();
    const headers = this.oauth.toHeader(this.oauth.authorize(requestData, token));

    try {
      const response = await axios({
        url: requestData.url,
        method: requestData.method,
        headers: headers,
      });
      return response;
    } catch (error) {
      console.error('Error sending OAuth request:', error);
      throw error;
    }
  }
}

module.exports = OAuthImpl;