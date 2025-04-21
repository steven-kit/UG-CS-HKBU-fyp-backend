const StressData = require('../models/StressData');

class StressDataRepository {
  async findAll() {
    return await StressData.find();
  }

  async findBySummaryId(summaryId) {
    return await StressData.findOne({ summaryId });
  }

  async findByUserAccessToken(userAccessToken) {
    return await StressData.findOne({ userAccessToken });
  }

  async deleteByUserAccessToken(userAccessToken) {
    return await StressData.deleteOne({ userAccessToken });
  }

  async save(stressData, options = {}) {
    const { _id, ...dataWithoutId } = stressData.toObject ? stressData.toObject() : stressData;
    return await StressData.findOneAndUpdate(
      { userAccessToken: stressData.userAccessToken },
      { $set: dataWithoutId },
      { upsert: true, new: true, ...options }
    );
  }

  async verifyUniqueSummaryId(summaryId) {
    const count = await StressData.countDocuments({ summaryId });
    return count === 0;
  }

  async deleteBySummaryId(summaryId) {
    return await StressData.deleteOne({ summaryId });
  }
}

module.exports = StressDataRepository;