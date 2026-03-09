const express = require('express');
const User = require('../models/user');
const Consultation = require('../models/Consultation');
const Knowledge = require('../models/Knowledge');
const Forum = require('../models/Forum');
const { protect, authorizeRoles } = require('../middlewares/auth');
const {
  buildSlotsForDate,
  parseTimeToMinutes,
  toDateOnlyKey,
} = require('../utils/availability');

const router = express.Router();

const ensureWeeklyShape = (weekly = []) => {
  const defaults = Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    enabled: false,
    startTime: '08:00',
    endTime: '17:00',
    slotDurationMinutes: 30,
  }));

  for (const entry of weekly) {
    if (typeof entry?.dayOfWeek !== 'number' || entry.dayOfWeek < 0 || entry.dayOfWeek > 6) continue;
    defaults[entry.dayOfWeek] = {
      dayOfWeek: entry.dayOfWeek,
      enabled: Boolean(entry.enabled),
      startTime: entry.startTime || '08:00',
      endTime: entry.endTime || '17:00',
      slotDurationMinutes: entry.slotDurationMinutes || 30,
    };
  }

  return defaults;
};

const validateAvailabilityPayload = (body) => {
  const weekly = ensureWeeklyShape(body?.availability?.weekly);

  for (const day of weekly) {
    if (!day.enabled) continue;
    const start = parseTimeToMinutes(day.startTime);
    const end = parseTimeToMinutes(day.endTime);
    if (start === null || end === null || start >= end) {
      return `Invalid time window for day ${day.dayOfWeek}`;
    }
  }

  const exceptions = Array.isArray(body?.availability?.exceptions) ? body.availability.exceptions : [];
  for (const exception of exceptions) {
    if (!exception?.date) return 'Each availability exception must include a date';
    if (exception.isAvailable) {
      const start = parseTimeToMinutes(exception.startTime);
      const end = parseTimeToMinutes(exception.endTime);
      if (start === null || end === null || start >= end) {
        return 'Available exceptions must include valid startTime and endTime';
      }
    }
  }

  return null;
};


router.get('/me/dashboard-summary', protect, authorizeRoles('officer', 'admin'), async (req, res) => {
  try {
    const officerId = req.user._id;
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      pendingRequests,
      activeConsultations,
      completedThisMonth,
      ratedRows,
      todaySchedule,
      publishedArticles,
      draftArticles,
      openReports,
    ] = await Promise.all([
      Consultation.countDocuments({ officer: officerId, status: 'pending' }),
      Consultation.countDocuments({ officer: officerId, status: { $in: ['pending', 'scheduled', 'in-progress'] } }),
      Consultation.countDocuments({
        officer: officerId,
        status: 'completed',
        updatedAt: { $gte: monthStart },
      }),
      Consultation.find({ officer: officerId, rating: { $gte: 1 } }).select('rating').lean(),
      Consultation.find({
        officer: officerId,
        scheduledDate: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ['scheduled', 'in-progress', 'pending'] },
      })
        .select('subject status scheduledDate scheduledTime farmer')
        .sort({ scheduledTime: 1, createdAt: -1 })
        .limit(8)
        .lean(),
      Knowledge.countDocuments({ author: officerId, status: 'published' }),
      Knowledge.countDocuments({ author: officerId, status: 'draft' }),
      Forum.countDocuments({ 'reports.status': 'open' }),
    ]);

    const averageRating = ratedRows.length
      ? Number((ratedRows.reduce((sum, row) => sum + (row.rating || 0), 0) / ratedRows.length).toFixed(1))
      : 0;

    const farmerIds = [...new Set(todaySchedule.map((item) => String(item.farmer)).filter(Boolean))];
    const farmers = await User.find({ _id: { $in: farmerIds } })
      .select('name avatar location')
      .lean();
    const farmerMap = new Map(farmers.map((farmer) => [String(farmer._id), farmer]));

    const normalizedSchedule = todaySchedule.map((item) => ({
      ...item,
      farmer: farmerMap.get(String(item.farmer)) || null,
    }));

    res.json({
      kpis: {
        pendingRequests,
        activeConsultations,
        completedThisMonth,
        averageRating,
        publishedArticles,
        draftArticles,
        openReports,
      },
      todaySchedule: normalizedSchedule,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me/availability', protect, authorizeRoles('officer', 'admin'), async (req, res) => {
  try {
    const officer = await User.findById(req.user._id)
      .select('role availability bookingBufferMinutes maxDailyBookings')
      .lean();

    res.json({
      availability: {
        timezone: officer?.availability?.timezone || 'Africa/Nairobi',
        weekly: ensureWeeklyShape(officer?.availability?.weekly),
        exceptions: officer?.availability?.exceptions || [],
      },
      bookingBufferMinutes: officer?.bookingBufferMinutes ?? 0,
      maxDailyBookings: officer?.maxDailyBookings ?? 8,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/availability', protect, async (req, res) => {
  try {
    const officer = await User.findById(req.params.id)
      .select('role availability bookingBufferMinutes maxDailyBookings')
      .lean();

    if (!officer || officer.role !== 'officer') {
      return res.status(404).json({ error: 'Officer not found' });
    }

    res.json({
      availability: {
        timezone: officer?.availability?.timezone || 'Africa/Nairobi',
        weekly: ensureWeeklyShape(officer?.availability?.weekly),
        exceptions: officer?.availability?.exceptions || [],
      },
      bookingBufferMinutes: officer?.bookingBufferMinutes ?? 0,
      maxDailyBookings: officer?.maxDailyBookings ?? 8,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/me/availability', protect, authorizeRoles('officer', 'admin'), async (req, res) => {
  try {
    const validationError = validateAvailabilityPayload(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const updates = {
      availability: {
        timezone: req.body?.availability?.timezone || 'Africa/Nairobi',
        weekly: ensureWeeklyShape(req.body?.availability?.weekly),
        exceptions: Array.isArray(req.body?.availability?.exceptions)
          ? req.body.availability.exceptions
          : [],
      },
      bookingBufferMinutes: Number(req.body.bookingBufferMinutes ?? 0),
      maxDailyBookings: Number(req.body.maxDailyBookings ?? 8),
    };

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('availability bookingBufferMinutes maxDailyBookings role');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/slots', protect, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD)' });
    }

    const officer = await User.findById(req.params.id)
      .select('role availability bookingBufferMinutes maxDailyBookings')
      .lean();

    if (!officer || officer.role !== 'officer') {
      return res.status(404).json({ error: 'Officer not found' });
    }

    const dateKey = toDateOnlyKey(date);
    if (!dateKey) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    const dayStart = new Date(`${dateKey}T00:00:00.000Z`);
    const dayEnd = new Date(`${dateKey}T23:59:59.999Z`);

    const consultations = await Consultation.find({
      officer: req.params.id,
      scheduledDate: { $gte: dayStart, $lte: dayEnd },
      status: { $nin: ['cancelled'] },
    })
      .select('scheduledTime status')
      .lean();

    const slots = buildSlotsForDate({
      officer,
      dateString: date,
      existingConsultations: consultations,
    });

    res.json({
      date: dateKey,
      slots,
      bookedCount: consultations.length,
      maxDailyBookings: officer.maxDailyBookings ?? 8,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;