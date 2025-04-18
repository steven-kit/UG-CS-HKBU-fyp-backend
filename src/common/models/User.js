const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  gcpsUserAcctId: {
    type: String,
    required: true,
  }
});

userSchema.methods.toString = function () {
  return `User:
    userId: ${this.userId}
    gcpsUserAcctId: ${this.gcpsUserAcctId}`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;