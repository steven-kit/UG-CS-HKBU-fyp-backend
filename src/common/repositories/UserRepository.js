const mongoose = require('mongoose');
const User = require('../models/User');

class UserRepository {
  async findAll() {
    return await User.find();
  }

  async save(user) {
    const newUser = new User(user);
    return await newUser.save();
  }

  async findByUserId(userId) {
    return await User.findOne({ userId: userId });
  }

  async deleteByUserId(userId) {
    return await User.deleteOne({ userId: userId });
  }
}

module.exports = UserRepository;