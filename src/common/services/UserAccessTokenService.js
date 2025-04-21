const UserAccessTokenRepository = require('../repositories/UserAccessTokenRepository');

class UserAccessTokenService {
  constructor() {
    this.userAccessTokenRepository = new UserAccessTokenRepository();
  }

  listUserAccessTokens() {
    return this.userAccessTokenRepository.findAll();
  }

  findByUat(uat) {
    return this.userAccessTokenRepository.findByUat(uat);
  }

  deleteByUat(uat) {
    return this.userAccessTokenRepository.deleteByUat(uat);
  }

  verifyUniqueUserAccessToken(uat) {
    return this.userAccessTokenRepository.verifyUniqueUserAccessToken(uat);
  }

  saveUserAccessToken(uat) {
    return this.userAccessTokenRepository.save(uat);
  }
}

module.exports = UserAccessTokenService;