const router = require('express').Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Channel = require('../models/Channel');

// Get messages for a channel (last 50)
router.get('/:channelId', auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    const messages = await Message.find({ channel: req.params.channelId })
      .populate('author', 'username avatarColor')
      .sort({ createdAt: 1 })
      .limit(50);

    res.json(messages);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
