const mongoose = require('mongoose');

const userAccessTokenSchema = new mongoose.Schema({
  uat: {
    type: String,
    required: true,
  },
  uatSecret: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
});

userAccessTokenSchema.methods.toString = function () {
  return `UserAccessToken:
    uat: ${this.uat}
    uatSecret: ${this.uatSecret}
    userId: ${this.userId}`;
};

const UserAccessToken = mongoose.model('UserAccessToken', userAccessTokenSchema);

module.exports = UserAccessToken;