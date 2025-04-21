require('dotenv').config();
const axios = require('axios');
const OAuthImpl = require('../oauth/OAuthImpl');
const UserAccessTokenService = require('../common/services/UserAccessTokenService');
const UserService = require('../common/services/UserService');

class UserApiService {
  constructor() {
    this.oAuthImpl = new OAuthImpl();
    this.userService = new UserService();
    this.deregistrationUrl = process.env.DEREGISTRATION_URL;
    this.retrieveuserIdUrl = process.env.RETRIEVEUSERID_URL;
  }

  async deregisterUser(uat) {
    this.createOAuthDeregisterRequest(uat);

    try {
      return await this.sendDeregisterRequestToGarmin(uat);
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
    if (!uat || !uat.uat || !uat.uatSecret) {
      throw new Error("Invalid UAT object. Ensure that 'uat' and 'uatSecret' are provided.");
    }

    let user = {};

    try {
      user = this.userService.findByUserId(uat.userId);
    } catch (error) {
      console.error("There was an error setting up the models for the user service endpoints. Ensure that user is present in DB.\n" + error.message);
    }

    this.oAuthImpl.setService(process.env.CONSUMER_KEY, process.env.CONSUMER_SECRET);
    this.oAuthImpl.createOAuthAccessToken(uat.uat, uat.uatSecret);

    const request = this.oAuthImpl.createOAuthGetRequest(this.retrieveuserIdUrl);

    // Generate OAuth headers
    const headers = this.oAuthImpl.getService().toHeader(
      this.oAuthImpl.getService().authorize(request, this.oAuthImpl.getAccessToken())
    );

    // Attach headers to the request
    request.headers = headers;

    // Save the request in the OAuthImpl instance
    this.oAuthImpl.setRequest(request);
  }

  createOAuthDeregisterRequest(uat) {
    if (!uat || !uat.uat || !uat.uatSecret) {
      throw new Error("Invalid UAT object. Ensure that 'uat' and 'uatSecret' are provided.");
    }
    let user = {};

    try {
      user = this.userService.findByUserId(uat.userId);
    } catch (error) {
      console.error("There was an error setting up the models for the user service endpoints. Ensure that user is present in DB.\n" + error.message);
      return { status: 404, message: "User not found for the provided user identifier."};
    }

    this.oAuthImpl.setService(process.env.CONSUMER_KEY, process.env.CONSUMER_SECRET);
    this.oAuthImpl.createOAuthAccessToken(uat.uat, uat.uatSecret);
    
    const request = this.oAuthImpl.createOAuthDeleteRequest(this.deregistrationUrl);

    // Generate OAuth headers
    const headers = this.oAuthImpl.getService().toHeader(
      this.oAuthImpl.getService().authorize(request, this.oAuthImpl.getAccessToken())
    );

    // Attach headers to the request
    request.headers = headers;

    // Save the request in the OAuthImpl instance
    this.oAuthImpl.setRequest(request);
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

        // Delete the user and associated UAT from the database
        const uat = this.oAuthImpl.getAccessToken();
        console.info("Deleting UAT and associated user from the database:", uat);

        // Delete the associated user
        const dbUAT = await new UserAccessTokenService().userAccessTokenRepository.findByUat(uat.key);

        const user = await new UserService().userRepository.findByUserId(dbUAT.userId);
        if (user) {
          await new UserService().userRepository.deleteByUserId(user.userId);
          console.info("Deleted user with ID:", user.userId);
        }
        // Delete the UAT
        await new UserAccessTokenService().userAccessTokenRepository.deleteByUat(uat.key);

        return { status: 204, message: "Received success response from Garmin for user api request." };
      } else {
        console.warn("Did NOT receive 204 response from Garmin. Received: " + response.status);
        return { status: 400, message: "Received no success response from Garmin for user api request." };
      }
    } catch (error) {
      console.error("There was an error sending the deregistration request to Garmin.");
      if (error.response) {
        console.error("Error response from Garmin:", error.response.data);
        console.error("HTTP Status Code:", error.response.status);
        return { status: error.response.status, message: error.response.data };
      } else if (error.request) {
        console.error("No response received from Garmin. Request details:", error.request);
        return { status: error.response.status, message: error.request };
      } else {
        console.error("Error message:", error.message || "No error message available.");
        return { status: error.response.status, message: error.message };
      }
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
      const json = typeof retrieveUserIdResponse === 'string' 
      ? JSON.parse(retrieveUserIdResponse) 
      : retrieveUserIdResponse;

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