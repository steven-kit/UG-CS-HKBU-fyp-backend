const StressDataRepository = require('../repositories/StressDataRepository');

class StressDataService {
  constructor() {
    this.stressDataRepository = new StressDataRepository();
  }

  findAll() {
    return this.stressDataRepository.find();
  }

  findBySummaryId(summaryId) {
    return this.stressDataRepository.findBySummaryId(summaryId);
  }

  findByUserAccessToken(userAccessToken) {
    return this.stressDataRepository.findByUserAccessToken(userAccessToken);
  }

  save(stressData, options = {}) {
    return this.stressDataRepository.save(stressData, options);
  }

  verifyUniqueSummaryId(summaryId) {
    return this.stressDataRepository.verifyUniqueSummaryId(summaryId);
  }

  deleteBySummaryId(summaryId) {
    return this.stressDataRepository.deleteBySummaryId(summaryId);
  }
}

module.exports = StressDataService;