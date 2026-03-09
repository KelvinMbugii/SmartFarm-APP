const express = require('express');
const Consultation = require('../models/Consultation');
const User = require('../models/user');
const auth = require('../middlewares/auth');
const {
    getEffectiveAvailabilityForDate,
    isTimeWithinWindow,
    toDateOnlyKey,
} = require('../utils/availability');

const router = express.Router();

// Get all consultations (filtered by user role)
router.get('/', auth.protect, async (req, res) => {
    try {
        const query = {};
        
        if (req.user.role === 'farmer') {
            query.farmer = req.user._id;
        } else if (req.user.role === 'officer') {
            query.officer = req.user._id;
        }

        const consultations = await Consultation.find(query)
            .populate('farmer', 'name email role avatar location')
            .populate('officer', 'name email role avatar location')
            .sort({ createdAt: -1 });

        res.json(consultations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single consultation
router.get('/:id', auth.protect, async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id)
            .populate('farmer', 'name email role avatar location')
            .populate('officer', 'name email role avatar location')
            .populate('messages.sender', 'name avatar');

        if (!consultation) {
            return res.status(404).json({ error: 'Consultation not found' });
        }

        // Check if user is part of this consultation
        if (consultation.farmer._id.toString() !== req.user._id.toString() &&
            consultation.officer._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        res.json(consultation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create consultation (farmer only)
router.post('/', auth.protect, async (req, res) => {
    try {
        if (req.user.role !== 'farmer') {
            return res.status(403).json({ error: 'Only farmers can create consultations' });
        }

        const { officerId, subject, description, consultationType, scheduledDate, scheduledTime } = req.body;

        // Verify officer exists
        const officer = await User.findById(officerId);
        if (!officer || officer.role !== 'officer') {
            return res.status(400).json({ error: 'Invalid officer selected' });
        }

        const normalizedType = consultationType || 'chat';

        if ((normalizedType === 'video-call' || normalizedType === 'in-person') && (!scheduledDate || !scheduledTime)) {
            return res.status(400).json({ error: 'Scheduled date and time are required for this consultation type' });
        }

        if (scheduledDate && scheduledTime) {
            const dateKey = toDateOnlyKey(scheduledDate);
            const availabilityWindow = getEffectiveAvailabilityForDate(officer, dateKey);

            if (!availabilityWindow) {
                return res.status(400).json({ error: 'Officer is not available on the selected date' });
            }

            const validTime = isTimeWithinWindow({
                startTime: availabilityWindow.startTime,
                endTime: availabilityWindow.endTime,
                targetTime: scheduledTime,
            });

            if (!validTime) {
                return res.status(400).json({ error: 'Selected time is outside officer availability window' });
            }

            const dayStart = new Date(`${dateKey}T00:00:00.000Z`);
            const dayEnd = new Date(`${dateKey}T23:59:59.999Z`);

            const [existingSameTime, dailyCount] = await Promise.all([
                Consultation.countDocuments({
                    officer: officerId,
                    scheduledDate: { $gte: dayStart, $lte: dayEnd },
                    scheduledTime,
                    status: { $nin: ['cancelled'] },
                }),
                Consultation.countDocuments({
                    officer: officerId,
                    scheduledDate: { $gte: dayStart, $lte: dayEnd },
                    status: { $nin: ['cancelled'] },
                }),
            ]);

            if (existingSameTime > 0) {
                return res.status(409).json({ error: 'Selected slot is already booked' });
            }

            if (dailyCount >= (officer.maxDailyBookings || 8)) {
                return res.status(409).json({ error: 'Officer has reached the maximum daily bookings for this date' });
            }
        }

        const consultation = new Consultation({
            farmer: req.user._id,
            officer: officerId,
            subject,
            description,
            consultationType: normalizedType,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
            scheduledTime,
            status: scheduledDate ? 'scheduled' : 'pending'
        });

        await consultation.save();
        await consultation.populate('farmer', 'name email role avatar location');
        await consultation.populate('officer', 'name email role avatar location');

        res.status(201).json(consultation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update consultation status
router.put('/:id', auth.protect, async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);

        if (!consultation) {
            return res.status(404).json({ error: 'Consultation not found' });
        }

        // Check authorization
        const isFarmer = consultation.farmer.toString() === req.user._id.toString();
        const isOfficer = consultation.officer.toString() === req.user._id.toString();

        if (!isFarmer && !isOfficer && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Officers can update status, scheduled date, notes
        if (isOfficer || req.user.role === 'admin') {
            if (req.body.status) consultation.status = req.body.status;
            if (req.body.scheduledDate) consultation.scheduledDate = new Date(req.body.scheduledDate);
            if (req.body.scheduledTime) consultation.scheduledTime = req.body.scheduledTime;
            if (req.body.notes) consultation.notes = req.body.notes;
        }

        // Farmers can update description
        if (isFarmer && req.body.description) {
            consultation.description = req.body.description;
        }

        await consultation.save();
        await consultation.populate('farmer', 'name email role avatar location');
        await consultation.populate('officer', 'name email role avatar location');

        res.json(consultation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add message to consultation
router.post('/:id/message', auth.protect, async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);

        if (!consultation) {
            return res.status(404).json({ error: 'Consultation not found' });
        }

        // Check if user is part of this consultation
        const isFarmer = consultation.farmer.toString() === req.user._id.toString();
        const isOfficer = consultation.officer.toString() === req.user._id.toString();

        if (!isFarmer && !isOfficer && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        consultation.messages.push({
            sender: req.user._id,
            content: req.body.content
        });

        // Update status if pending
        if (consultation.status === 'pending') {
            consultation.status = 'in-progress';
        }

        await consultation.save();
        await consultation.populate('messages.sender', 'name avatar');

        const newMessage = consultation.messages[consultation.messages.length - 1];
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit feedback/rating
router.post('/:id/feedback', auth.protect, async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);

        if (!consultation) {
            return res.status(404).json({ error: 'Consultation not found' });
        }

        if (consultation.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Only farmers can submit feedback' });
        }

        consultation.rating = req.body.rating;
        consultation.feedback = req.body.feedback;
        consultation.status = 'completed';

        await consultation.save();
        res.json(consultation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get available officers
router.get('/officers/available', auth.protect, async (req, res) => {
    try {
        const officers = await User.find({ role: 'officer' })
            .select('name email role avatar location isOnline')
            .sort({ isOnline: -1, name: 1 });

        res.json(officers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;