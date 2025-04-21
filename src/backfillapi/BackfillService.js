const axios = require('axios');
const Consts = require('../common/Consts'); 
const UserAccessTokenService = require('../common/services/UserAccessTokenService');
const UserService = require('../common/services/UserService');
const OAuthImpl = require('../oauth/OAuthImpl');

class BackfillService {
  constructor() {
    this.userAccessTokenService = new UserAccessTokenService();
    this.userService = new UserService();
    this.oAuthImpl = new OAuthImpl();
  }

  async handleBackfillRequest(backfillRequestObject) {
    try {
      await this.prepareModelsForOAuthHeader(backfillRequestObject.userAccessToken);
      const fullBackfillURI = this.formatBackfillUrl(
        this.determineSummaryDomainForBackfillRequest(backfillRequestObject.summaryTitle),
        backfillRequestObject
      );
      await this.buildOAuthHeader(fullBackfillURI);
      const success = await this.sendBackfillRequest(this.oAuthImpl.getRequest());

      if (success) {
        return { status: 200, message: 'Backfill request submitted successfully.' };
      } else {
        return { status: 500, message: 'There was a problem submitting the backfill request.' };
      }
    } catch (error) {
      console.error(error);
      return { status: 500, message: 'There was a problem submitting the backfill request.' };
    }
  }

  async prepareModelsForOAuthHeader(userAccessToken) {
    this.uat = await this.userAccessTokenService.findByUat(userAccessToken);
    this.user = await this.userService.findByUserId(this.uat.userId);
  }

  determineSummaryDomainForBackfillRequest(summaryTitle) {
    switch (summaryTitle) {
      case Consts.DAILIES:
        return 'https://healthapitest.garmin.com/wellness-api/rest/backfill/dailies';
      case Consts.EPOCHS:
        return 'https://healthapitest.garmin.com/wellness-api/rest/backfill/epochs';
      case Consts.STRESS:
        return 'https://healthapitest.garmin.com/wellness-api/rest/backfill/stressDetails';
      default:
        throw new Error(`Couldn't match the summary domain: ${summaryTitle} to a valid backfill domain.`);
    }
  }

  formatBackfillUrl(baseBackfillUrl, backfillObject) {
    const url = new URL(baseBackfillUrl);
    url.searchParams.append('summaryStartTimeInSeconds', backfillObject.summaryStartTime.toString());
    url.searchParams.append('summaryEndTimeInSeconds', backfillObject.summaryEndTime.toString());
    return url.toString();
  }

  async buildOAuthHeader(fullBackfillUrl) {
    this.oAuthImpl.createOAuthAccessToken(this.uat.uat, this.uat.uatSecret);
    this.oAuthImpl.createOAuthGetRequest(fullBackfillUrl);
    this.oAuthImpl.setService(this.partner.consumerKey, this.partner.consumerSecret);
  }

  async sendBackfillRequest(backfillRequest) {
    try {
      console.log('Sending backfill request to Garmin');
      const response = await axios({
        method: 'get',
        url: backfillRequest.url,
        headers: backfillRequest.headers,
      });

      if (response.data === '[]' || !response.data || response.data.length === 0) {
        console.log('Received expected blank response from Garmin.');

        if (response.status === 202) {
          console.log('Received expected HTTP 202 response from Garmin.');
          return true;
        } else {
          throw new Error(`Received unexpected HTTP ${response.status} response from Garmin`);
        }
      } else {
        throw new Error(`Received non-blank response from Garmin.\nBody:\n${response.data}`);
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

module.exports = BackfillService;