const axios = require('axios');
const Consts = require('../common/Consts');
const UserAccessTokenService = require('../common/services/UserAccessTokenService');
const UserService = require('../common/services/UserService');
const PartnerService = require('../common/services/PartnerService');
const OAuthImpl = require('../oauth/OAuthImpl');

class UserApiService {
  constructor() {
    this.oAuthImpl = new OAuthImpl();
    this.partnerService = new PartnerService();
    this.userService = new UserService();
    this.deregistrationUrl = process.env.DEREGISTRATION_URL;
    this.retrieveuserIdUrl = process.env.RETRIEVEUSERID_URL;
  }

  async deregisterUser(uat) {
    this.createOAuthDeregisterRequest(uat);

    try {
      return await this.sendDeregisterRequestToGarmin();
    } catch (error) {
      console.error("There was an error in sending the deregistration request to Garmin.\n" + error.message);
      return { status: 500, message: "There was an error in deregistering the user." };
    }
  }

  async retrieveUserId(uat) {
    this.createOAuthRetrieveUserIdRequest(uat);

    try {
      const userId = await this.parseUserIdFromJson(await this.sendRetrieveUserIdRequestToGarmin());
      if (userId) {
        return { status: 200, message: `Found user Id ${userId}<br>for UAT: ${uat.toString()}.` };
      } else {
        return { status: 500, message: "User id is null. Most likely an error in fetching the user id." };
      }
    } catch (error) {
      console.error("There was an error handling the JSON returned from Garmin.\n" + error.message);
      return { status: 500, message: "There was a problem retrieving the user ID." };
    }
  }

  createOAuthRetrieveUserIdRequest(uat) {
    let partner = {};
    let user = {};

    try {
      user = this.userService.findByUserId(uat.userId);
      partner = this.partnerService.findByPartnerId(user.partnerId);
    } catch (error) {
      console.error("There was an error setting up the models for the user service endpoints. Ensure that user is present in DB.\n" + error.message);
    }

    this.oAuthImpl.setService(partner.consumerKey, partner.consumerSecret);
    this.oAuthImpl.createOAuthAccessToken(uat.uat, uat.uatSecret);
    this.oAuthImpl.createOAuthGetRequest(this.retrieveuserIdUrl);
    this.oAuthImpl.getService().signRequest(this.oAuthImpl.getAccessToken(), this.oAuthImpl.getRequest());
  }

  createOAuthDeregisterRequest(uat) {
    let partner = {};
    let user = {};

    try {
      user = this.userService.findByUserId(uat.userId);
      partner = this.partnerService.findByPartnerId(user.partnerId);
    } catch (error) {
      console.error("There was an error setting up the models for the user service endpoints. Ensure that user is present in DB.\n" + error.message);
    }

    this.oAuthImpl.setService(partner.consumerKey, partner.consumerSecret);
    this.oAuthImpl.createOAuthAccessToken(uat.uat, uat.uatSecret);
    this.oAuthImpl.createOAuthDeleteRequest(this.deregistrationUrl);
    this.oAuthImpl.getService().signRequest(this.oAuthImpl.getAccessToken(), this.oAuthImpl.getRequest());
  }

  async sendDeregisterRequestToGarmin() {
    try {
      console.info("Sending user api request");
      const response = await axios({
        method: 'delete',
        url: this.oAuthImpl.getRequest().url,
        headers: this.oAuthImpl.getRequest().headers,
      });

      if (response.status === 204) {
        console.info("Received 204 response from Garmin for deregistering user.");
        return { status: 204, message: "Received success response from Garmin for user api request." };
      } else {
        console.warn("Did NOT receive 204 response from Garmin. Received: " + response.status);
        return { status: 400, message: "Received no success response from Garmin for user api request." };
      }
    } catch (error) {
      console.error("There was an error sending the deregistration request to Garmin.\n" + error.message);
      return { status: 500, message: "There was an error sending the deregistration request to Garmin." };
    }
  }

  async sendRetrieveUserIdRequestToGarmin() {
    try {
      console.info("Sending response to callback url");
      const response = await axios({
        method: 'get',
        url: this.oAuthImpl.getRequest().url,
        headers: this.oAuthImpl.getRequest().headers,
      });

      if (!response.data || response.data.length === 0) {
        throw new Error("No body returned from callback URL");
      } else {
        console.info("Fetched response from Garmin API.");
        return response.data;
      }
    } catch (error) {
      console.error("There was an error sending the retrieve user ID request to Garmin.\n" + error.message);
      throw error;
    }
  }

  async parseUserIdFromJson(retrieveUserIdResponse) {
    try {
      const json = JSON.parse(retrieveUserIdResponse);
      if (json.userId) {
        return json.userId;
      } else {
        throw new Error("Could not find field userId to parse the user Id from.");
      }
    } catch (error) {
      console.error("There was an error parsing the user ID from JSON.\n" + error.message);
      throw error;
    }
  }
}

module.exports = UserApiService;