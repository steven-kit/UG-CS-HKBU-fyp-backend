const mongoose = require('mongoose');

const stressDataSchema = new mongoose.Schema({
  dailySummaryId: {
    type: String,
    required: false,
    unique: true,
  },
  stressSummaryId: {
    type: String,
    required: false,
    unique: true,
  },
  calendarDate: {
    type: String,
    required: false,
  },
  latestStressLevel: {
    type: Number,
    required: false,
  },
  averageStressLevel: {
    type: Number,
    required: false,
  },
  maxStressLevel: {
    type: Number,
    required: false,
  },
  userAccessToken: {
    type: String,
    required: true,
    ref: 'UserAccessToken',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  }
}, { timestamps: true });

const StressData = mongoose.model('StressData', stressDataSchema);

module.exports = StressData;