const path = require('path');
const Consts = require(path.join(process.cwd(), 'src/common/Consts'));
const mongoose = require('mongoose');
const StressData = require('../common/models/StressData');
const StressDataService = require('../common/services/StressDataService');
const UserService = require('../common/services/UserService');
const UserAccessTokenService = require('../common/services/UserAccessTokenService');
const OAuthImpl = require('../oauth/OAuthImpl');


class StressApiService {
  constructor() {
    this.stressDataService = new StressDataService();
    this.userAccessTokenService = new UserAccessTokenService();
    this.userService = new UserService();
    this.oAuthImpl = new OAuthImpl();
  }

  async sendAppropriateResponseToGarminApi(pingBody) {
    if (pingBody && pingBody.length > 0) {
        
      // Process callback URLs asynchronously
      setImmediate(async () => {
        const success = await this.manageCallbackProcess(pingBody);
        if (success) {
          console.info('Callback process finished successfully.');
        } else {
          console.error('There was an error in the callback process.');
        }
      });

      console.info('Sending acknowledgment - 200 for ping notification service');
      return { status: 200, message: 'Acknowledged' };
    } else {
      console.warn('Ping body received from Garmin API was null or empty.');
      return { status: 204, message: 'No Content' };
    }
  }

  async manageCallbackProcess(pingBody) {
    const stressSummaries = [];

    for (const pingNotification of pingBody) {
      try {
        const callbackData = await this.hitCallbackUrl(pingNotification);

        const summaryList = await this.convertJsonToSummaryData(callbackData, pingNotification.userAccessToken, pingBody.summaryTitle);

        stressSummaries.push(...summaryList);
      } catch (error) {
        console.error('Error converting JSON to SummaryData object:', error.message);
      }
    }

    if (stressSummaries.length > 0) {
      return this.placeSummaryDataIntoDB(stressSummaries);
    } else {
      console.warn('Stress summary list is empty. Will not place empty data into DB.');
      return false;
    }
  }

  async hitCallbackUrl(pingBody) {
    try {
      const uat = await this.userAccessTokenService.findByUat(pingBody.userAccessToken);
  
      this.createOAuthCallbackRequest(uat, pingBody.callbackURL);

      console.info("Sending response to callback url");
      const response = await this.oAuthImpl.sendRequest();
  
      if (!response.data || response.data.length === 0) {
        throw new Error("No body returned from callback URL");
      }
  
      console.info("Fetched response from Garmin API.");
      return response.data;
    } catch (error) {
      console.error("Error hitting callback URL:", error.message);
      throw error;
    }
  }

  createOAuthCallbackRequest(uat, callbackURL) {
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

    const request = this.oAuthImpl.createOAuthGetRequest(callbackURL);

    // Generate OAuth headers
    const headers = this.oAuthImpl.getService().toHeader(
      this.oAuthImpl.getService().authorize(request, this.oAuthImpl.getAccessToken())
    );

    // Attach headers to the request
    request.headers = headers;

    // Save the request in the OAuthImpl instance
    this.oAuthImpl.setRequest(request);
  }

  async convertJsonToSummaryData(json, uat, summaryTitle) {
    try {

      const parsedData = Array.isArray(json) ? json : JSON.parse(json);

      const stressDataList = [];

      for (const map of parsedData) {
        map.userAccessToken = uat;
        map.summaryTitle = summaryTitle;
        const stressSummary = await this.putCallbackDataIntoStressData(map);
        stressDataList.push(stressSummary);
      }

      if (stressDataList.length > 0) {
        return stressDataList;
      } else {
        throw new Error('Stress Data List is empty. Cannot place empty list into DB.');
      }
    } catch (error) {
      console.error('Error parsing JSON to SummaryData:', error.message);
      throw error;
    }
  }

  async placeSummaryDataIntoDB(stressSummaries) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (const summary of stressSummaries) {
        await this.stressDataService.save(summary, { session });
      }

      await session.commitTransaction();
      console.info('Transaction committed successfully.');
      return true;
    } catch (error) {
      console.error('Error committing transaction:', error.message);
      await session.abortTransaction();
      return false;
    } finally {
      session.endSession();
    }
  }

  async putCallbackDataIntoStressData(json) {
    try {
        const uat = await this.userAccessTokenService.findByUat(json.userAccessToken);

        if (!uat) {
            console.warn(`UserAccessToken not found for UAT: ${json.userAccessToken}. Skipping.`);
            return null;
        }

        // Check if a record with the same userAccessToken already exists
        let stressData = await this.stressDataService.findByUserAccessToken(json.userAccessToken);

        if (!stressData) {
            // If no record exists, create a new one
            stressData = new StressData();
        }

        // Update fields with the latest data
        if (json.summaryTitle === Consts.DAILIES) {
            stressData.dailySummaryId = json.summaryId;
            stressData.calendarDate = json.calendarDate;
            stressData.averageStressLevel = json.averageStressLevel;
            stressData.maxStressLevel = json.maxStressLevel;
        }
        else if (json.summaryTitle === Consts.STRESSDETAILS) {
            stressData.stressSummaryId = json.summaryId;

            const stressLevels = json.timeOffsetStressLevelValues;
            if (!stressLevels || Object.keys(stressLevels).length === 0) {
              console.warn(`No stress level data found for summaryId: ${data.summaryId}. Skipping.`);
            }
      
            // Find the latest stress level based on the maximum time offset
            const latestTimeOffset = Math.max(...Object.keys(stressLevels).map(Number));
            const latestStressLevel = stressLevels[latestTimeOffset];

            stressData.latestStressLevel = latestStressLevel;
        }

        stressData.userAccessToken = uat.uat;
        stressData.userId = uat.userId;

        console.log("StressData saved:", stressData);
        return stressData;
    } catch (error) {
        console.error('Error processing StressData:', error.message);
        throw error;
    }
}
}

module.exports = StressApiService;