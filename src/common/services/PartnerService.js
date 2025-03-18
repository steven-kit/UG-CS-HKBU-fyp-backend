const PartnerRepository = require('../repositories/PartnerRepository');
class PartnerService {
  constructor() {
    this.partnerRepository = new PartnerRepository();
  }

  listPartners() {
    return this.partnerRepository.findAll();
  }

  findByConsumerKey(partner) {
    return this.partnerRepository.findByConsumerKey(partner.consumerKey);
  }

  findByPartnerId(partner) {
    return this.partnerRepository.findByPartnerId(partner.partnerId);
  }

  verifyConsumerKey(partner) {
    return this.partnerRepository.verifyConsumerKey(partner.consumerKey);
  }

  verifyUniqueConsumerKey(partner) {
    return this.partnerRepository.verifyUniqueConsumerKey(partner.consumerKey);
  }

  savePartner(partner) {
    return this.partnerRepository.save(partner);
  }
}

module.exports = PartnerService;