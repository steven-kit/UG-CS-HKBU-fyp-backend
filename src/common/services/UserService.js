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

  findByUserId(user) {
    return this.userRepository.findByUserId(user.userId);
  }
}

module.exports = UserService;