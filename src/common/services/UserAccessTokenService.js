const UserAccessTokenRepository = require('../repositories/UserAccessTokenRepository');

class UserAccessTokenService {
  constructor() {
    this.userAccessTokenRepository = new UserAccessTokenRepository();
  }

  listUserAccessTokens() {
    return this.userAccessTokenRepository.findAll();
  }

  findByUat(userAccessToken) {
    return this.userAccessTokenRepository.findByUat(userAccessToken.uat);
  }

  verifyUniqueUserAccessToken(uat) {
    return this.userAccessTokenRepository.verifyUniqueUserAccessToken(uat);
  }

  saveUserAccessToken(userAccessToken) {
    return this.userAccessTokenRepository.save(userAccessToken);
  }
}

module.exports = UserAccessTokenService;