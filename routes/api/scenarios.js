const express = require('express');
const router = express.Router();

// Senaryo modeli
const Scenario = require('../../models/Scenario');

/**
 * @route   GET api/scenarios
 * @desc    Tüm senaryoları getir
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const scenarios = await Scenario.find().sort({ createdAt: -1 });
    res.json(scenarios);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu hatası');
  }
});

/**
 * @route   GET api/scenarios/:id
 * @desc    Belirli bir senaryoyu getir
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const scenario = await Scenario.findById(req.params.id);
    
    if (!scenario) {
      return res.status(404).json({ msg: 'Senaryo bulunamadı' });
    }
    
    res.json(scenario);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Senaryo bulunamadı' });
    }
    res.status(500).send('Sunucu hatası');
  }
});

/**
 * @route   POST api/scenarios
 * @desc    Yeni bir senaryo oluştur
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const newScenario = new Scenario({
      name: req.body.name,
      description: req.body.description,
      mockServices: req.body.mockServices || []
    });

    const scenario = await newScenario.save();
    res.json(scenario);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu hatası');
  }
});

/**
 * @route   PUT api/scenarios/:id
 * @desc    Bir senaryoyu güncelle
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, description, mockServices } = req.body;
    
    // Senaryoyu güncelle
    const scenario = await Scenario.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          name, 
          description,
          mockServices 
        } 
      },
      { new: true }
    );
    
    if (!scenario) {
      return res.status(404).json({ msg: 'Senaryo bulunamadı' });
    }
    
    res.json(scenario);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Senaryo bulunamadı' });
    }
    res.status(500).send('Sunucu hatası');
  }
});

/**
 * @route   DELETE api/scenarios/:id
 * @desc    Bir senaryoyu sil
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const scenario = await Scenario.findById(req.params.id);
    
    if (!scenario) {
      return res.status(404).json({ msg: 'Senaryo bulunamadı' });
    }
    
    await scenario.remove();
    res.json({ msg: 'Senaryo silindi' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Senaryo bulunamadı' });
    }
    res.status(500).send('Sunucu hatası');
  }
});

module.exports = router; 