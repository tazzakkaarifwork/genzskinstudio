import ShippingSetting from '../models/ShippingSetting.js';

export const getShippingSettings = async (req, res) => {
  try {
    let settings = await ShippingSetting.findOne();
    if (!settings) {
      settings = await ShippingSetting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateShippingSettings = async (req, res) => {
  try {
    const { freeCities, standardCharge, freeMatchMode } = req.body;
    let settings = await ShippingSetting.findOne();
    if (!settings) {
      settings = new ShippingSetting();
    }
    if (freeCities !== undefined) settings.freeCities = freeCities;
    if (standardCharge !== undefined) settings.standardCharge = standardCharge;
    if (freeMatchMode !== undefined) settings.freeMatchMode = freeMatchMode;
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const calculateShipping = async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) return res.status(400).json({ message: 'City is required' });
    let settings = await ShippingSetting.findOne();
    if (!settings) {
      settings = await ShippingSetting.create({});
    }
    const cityLower = city.trim().toLowerCase();
    let isFree = false;
    if (settings.freeMatchMode === 'exact') {
      isFree = settings.freeCities.map(c => c.toLowerCase()).includes(cityLower);
    } else {
      isFree = settings.freeCities.some(c => cityLower.includes(c.toLowerCase()));
    }
    res.json({
      shippingCost: isFree ? 0 : settings.standardCharge,
      isFree,
      standardCharge: settings.standardCharge,
      freeCities: settings.freeCities,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
