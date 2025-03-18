const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  consumerKey: {
    type: String,
    required: true,
  },
  consumerSecret: {
    type: String,
    required: true,
  },
  partnerName: {
    type: String,
    required: true,
  },
});

partnerSchema.methods.toString = function () {
  return `Partner:
    partnerId: ${this.partnerId}
    partnerName: ${this.partnerName}
    consumerKey: ${this.consumerKey}
    consumerSecret: ${this.consumerSecret}`;
};

const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;