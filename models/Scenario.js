const mongoose = require('mongoose');

// Mock Servis Şeması
const mockServiceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
    trim: true
  },
  endpointUrl: {
    type: String,
    required: true,
    trim: true
  },
  responseData: {
    type: String,
    required: true
  }
});

// Senaryo Şeması
const scenarioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  mockServices: [mockServiceSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scenario', scenarioSchema); 