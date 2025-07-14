const express = require('express');
const MarketPrice = require('../models/MarketPrice');

const router = express.Router();

// Get the market prices
router.get('prices', async (req, res) => {
    try{
        const { commodity, market, days = 30 } = req.query;

        const query = {};
        if (commodity) query.commodity = commodity;
        if (market) query.market = market;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query.date = { $gte: startDate };

        const prices = await MarketPrice.find(query).sort({ date: -1}).limit(100);

        res.json(prices);
    } catch (error){
    res.status(500).json({ error: error.message});
    }
});

// Get price trends
router.get('/trends', async(req, res) => {
    try{
        const { commodity } = req.query;

        const pipeline = [
            {
                $match: commodity ? { commodity } : {}
            },
            { $group:{
                _id: {
                    commodity: '$commodity',
                    date:{
                        $dateToString: {
                            format: '%y-%m-%d',
                            date: '$date'
                        }
                    }
                },

                avgPrice: { $avg: '$price'},
                count: { $sum: 1}
              }
            },
            {
                $sort: {'_id.date': -1}
            },
            {
                $limit: 30
            }
        ];
        const trends = await MarketPrice.aggregate(pipeline);
        res.json(trends);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
});

// Get commodities list
router.get('/commodities', async (req, res) => {
    try {
        const commodities = await MarketPrice.distinct('commodity');
        res.json(commodities)
    }catch (error){
        res.status(500).json({ error: error.message});
    }
});

module.exports = router;