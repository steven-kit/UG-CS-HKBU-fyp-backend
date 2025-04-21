const UserRepository = require('../repositories/UserRepository');

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  listUsers() {
    return this.userRepository.findAll();
  }

  saveUser(user) {
    return this.userRepository.save(user);
  }

  findByUserId(userId) {
    return this.userRepository.findByUserId(userId);
  }

  deleteByUserId(userId) {
    return this.userRepository.deleteByUserId(userId);
  }
}

module.exports = UserService;