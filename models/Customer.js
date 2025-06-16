const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Müşteri Şeması
const customerSchema = new mongoose.Schema({
  customerNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  userCode: {
    type: String,
    required: true,
    trim: true
  },
  assignedScenarios: [{
    type: Schema.Types.ObjectId,
    ref: 'Scenario'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Customer', customerSchema); 