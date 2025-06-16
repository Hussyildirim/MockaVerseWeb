const express = require('express');
const router = express.Router();

// Modeller
const Customer = require('../../models/Customer');
const Scenario = require('../../models/Scenario');

/**
 * @route   GET api/customers
 * @desc    Tüm müşterileri getir
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate('assignedScenarios', 'name description')
      .sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu hatası');
  }
});

/**
 * @route   GET api/customers/:id
 * @desc    Belirli bir müşteriyi getir
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedScenarios', 'name description');
    
    if (!customer) {
      return res.status(404).json({ msg: 'Müşteri bulunamadı' });
    }
    
    res.json(customer);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Müşteri bulunamadı' });
    }
    res.status(500).send('Sunucu hatası');
  }
});

/**
 * @route   POST api/customers
 * @desc    Yeni bir müşteri oluştur
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { customerNumber, userCode, assignedScenarios } = req.body;

    // Müşteri numarasının benzersiz olup olmadığını kontrol et
    const existingCustomer = await Customer.findOne({ customerNumber });
    if (existingCustomer) {
      return res.status(400).json({ msg: 'Bu müşteri numarası zaten kullanılıyor' });
    }

    const newCustomer = new Customer({
      customerNumber,
      userCode,
      assignedScenarios: assignedScenarios || []
    });

    const customer = await newCustomer.save();
    
    // Veritabanından güncel müşteri bilgisini al ve senaryo verilerini doldur
    const populatedCustomer = await Customer.findById(customer._id)
      .populate('assignedScenarios', 'name description');
    
    res.json(populatedCustomer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu hatası');
  }
});

/**
 * @route   PUT api/customers/:id
 * @desc    Bir müşteriyi güncelle
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { customerNumber, userCode, assignedScenarios } = req.body;
    
    // Müşteri numarasının benzersiz olup olmadığını kontrol et (kendisi hariç)
    const existingCustomer = await Customer.findOne({ 
      customerNumber, 
      _id: { $ne: req.params.id } 
    });
    
    if (existingCustomer) {
      return res.status(400).json({ msg: 'Bu müşteri numarası zaten kullanılıyor' });
    }
    
    // Müşteriyi güncelle
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          customerNumber, 
          userCode,
          assignedScenarios 
        } 
      },
      { new: true }
    ).populate('assignedScenarios', 'name description');
    
    if (!customer) {
      return res.status(404).json({ msg: 'Müşteri bulunamadı' });
    }
    
    res.json(customer);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Müşteri bulunamadı' });
    }
    res.status(500).send('Sunucu hatası');
  }
});

/**
 * @route   DELETE api/customers/:id
 * @desc    Bir müşteriyi sil
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ msg: 'Müşteri bulunamadı' });
    }
    
    await customer.remove();
    res.json({ msg: 'Müşteri silindi' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Müşteri bulunamadı' });
    }
    res.status(500).send('Sunucu hatası');
  }
});

module.exports = router; 