const router = require('express').Router();
const auth = require('../middleware/auth');
const Channel = require('../models/Channel');

// Get all channels
router.get('/', auth, async (req, res) => {
  try {
    const channels = await Channel.find().sort({ createdAt: 1 });
    res.json(channels);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create channel
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Channel name is required' });

    const exists = await Channel.findOne({ name: name.toLowerCase().replace(/\s+/g, '-') });
    if (exists) return res.status(400).json({ message: 'Channel name already exists' });

    const channel = await Channel.create({
      name: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      createdBy: req.user._id
    });

    res.status(201).json(channel);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
