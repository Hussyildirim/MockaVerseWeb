const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Express uygulamasını başlat
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// DB Config
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mockverse';

// MongoDB'ye bağlan
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB bağlantısı başarılı...'))
  .catch(err => console.log('MongoDB bağlantı hatası:', err));

// API rotalarını tanımla
// const scenarioRoutes = require('./routes/api/scenarios');
// const customerRoutes = require('./routes/api/customers');

// Geçici API rotaları
app.get('/api/scenarios', (req, res) => {
  res.json([]);
});

app.get('/api/customers', (req, res) => {
  res.json([]);
});

// API rotalarını kullan
// app.use('/api/scenarios', scenarioRoutes);
// app.use('/api/customers', customerRoutes);

// Production ortamında statik dosyaları sunma
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Port tanımla
const PORT = process.env.PORT || 5000;

// Sunucuyu başlat
app.listen(PORT, () => console.log(`Server ${PORT} portunda başlatıldı`)); 