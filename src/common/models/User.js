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
  },
  partnerUserAcctId: {
    type: String,
    default: uuidv4,
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

userSchema.methods.toString = function () {
  return `User:
    userId: ${this.userId}
    gcpsUserAcctId: ${this.gcpsUserAcctId}
    partnerUserAcctId: ${this.partnerUserAcctId}
    partnerId: ${this.partnerId}`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;