class BackfillObject {
    constructor() {
      this.summaryTitle = '';
      this.userAccessToken = '';
      this.summaryStartTime = null;
      this.summaryEndTime = null;
    }
  
    getSummaryEndTime() {
      return this.summaryEndTime;
    }
  
    setSummaryEndTime(summaryEndTime) {
      this.summaryEndTime = summaryEndTime;
    }
  
    getSummaryStartTime() {
      return this.summaryStartTime;
    }
  
    setSummaryStartTime(summaryStartTime) {
      this.summaryStartTime = summaryStartTime;
    }
  
    getUserAccessToken() {
      return this.userAccessToken;
    }
  
    setUserAccessToken(userAccessToken) {
      this.userAccessToken = userAccessToken;
    }
  
    getSummaryTitle() {
      return this.summaryTitle;
    }
  
    setSummaryTitle(summaryTitle) {
      this.summaryTitle = summaryTitle;
    }
  
    toString() {
      return `BackfillObject [summaryTitle=${this.summaryTitle} userAccessToken=${this.userAccessToken} summaryStartTime=${this.summaryStartTime} summaryEndTime=${this.summaryEndTime}]`;
    }
  }
  
  module.exports = BackfillObject;