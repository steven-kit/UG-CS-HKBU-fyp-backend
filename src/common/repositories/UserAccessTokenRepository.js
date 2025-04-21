const UserAccessToken = require('../models/UserAccessToken');

class UserAccessTokenRepository {
  async findAll() {
    return await UserAccessToken.find();
  }

  async findByUat(uat) {
    return await UserAccessToken.findOne({ uat: uat });
  }
  
  async deleteByUat(uat) {
    return await UserAccessToken.deleteOne({ uat: uat });
  }

  async verifyUniqueUserAccessToken(uat) {
    const count = await UserAccessToken.countDocuments({ uat: uat });
    return count === 0;
  }

  async save(uat) {
    const newUserAccessToken = new UserAccessToken(uat);
    return await newUserAccessToken.save();
  }
}

module.exports = UserAccessTokenRepository;