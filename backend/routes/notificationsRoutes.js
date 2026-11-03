const express = require('express');
const Notification = require('../models/Notification');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    return res.json({
      notifications: notifications.map((notification) => ({
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message,
        category: notification.category,
        type: notification.type,
        icon: notification.icon,
        color: notification.color,
        amount: notification.amount || '',
        time: new Intl.DateTimeFormat('en-NG', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }).format(new Date(notification.createdAt)),
        createdAt: notification.createdAt,
        read: Boolean(notification.read),
      })),
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, message, category = 'System', type = 'info', icon = 'chart', color = 'green', amount = '' } = req.body || {};

    if (typeof title !== 'string' || typeof message !== 'string') {
      return res.status(400).json({ message: 'Notification title and message are required.' });
    }

    const notification = await Notification.create({
      userId: req.user.id,
      title: title.trim(),
      message: message.trim(),
      category,
      type,
      icon,
      color,
      amount: String(amount || ''),
    });

    return res.status(201).json({
      notification: {
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message,
        category: notification.category,
        type: notification.type,
        icon: notification.icon,
        color: notification.color,
        amount: notification.amount,
        time: new Intl.DateTimeFormat('en-NG', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }).format(new Date(notification.createdAt)),
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
