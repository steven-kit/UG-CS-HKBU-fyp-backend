const mongoose = require('mongoose');
const Partner = require('../models/Partner');

class PartnerRepository {
  async findAll() {
    return await Partner.find();
  }

  async findByConsumerKey(consumerKey) {
    return await Partner.findOne({ consumerKey: consumerKey });
  }

  async findByPartnerId(partnerId) {
    return await Partner.findOne({ _id: partnerId });
  }

  async verifyConsumerKey(consumerKey) {
    const count = await Partner.countDocuments({ consumerKey: consumerKey });
    return count > 0;
  }

  async verifyUniqueConsumerKey(consumerKey) {
    const count = await Partner.countDocuments({ consumerKey: consumerKey });
    return count === 0;
  }

  async save(partner) {
    const newPartner = new Partner(partner);
    return await newPartner.save();
  }
}

module.exports = PartnerRepository;