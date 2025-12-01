const express = require('express');
const Product =  require('../models/product');
const auth = require('../middlewares/auth');
//const mongoose = require('mongoose');

const router = express.Router();

// Get all products
router.get('/', async( req, res) => {
    try {
        const { category, condition, minPrice, maxPrice, search, page = 1,
            limit = 12
        } = req.query;

        const query = {};

        if (category) query.category = category;
        if (condition) query.condition = condition;
        if (minPrice  || maxPrice){
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i'}},
                { description: {$regex: search, $options: 'i'}}
            ];
        }
        const product = await Product.find(query)
            .populate('seller', 'name location phone')
            .sort({ featured: -1, createdAt: -1})
            .limit(limit*1 )
            .skip(( page - 1) * limit);

        const total = await Product.countDocuments(query);

        res.json({ products: product, totalPages: Math.ceil(total / limit),
            currentPage: page, total
        });

    } catch (error){
        res.status(500).json({ error: error.message });
    }
    
});

// Get a single equipment
router.get('/:id', async (req, res) => {
    try{
        const product = await Product.findById(req.params.id).populate(
            'seller', 'name location phone email'
        );

        if (!product){
            return res.status(404).json({error: 'Product not found'});
        }

        product.views += 1;
        await product.save();

        res.json(product);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
});

// Create product listing

router.post('/', auth.protect, auth.authorizeRoles,  async (req, res) => {
    try{
        const productData = {
            ...req.body,
            seller: req.user.userId
        };

        const product = new Product(productData);
        await product.save();

        await product.populate('seller', 'name location phone');

        res.status(201).json(product);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
});

// Updating the product

router.put('/:id', auth.protect, auth.authorizeRoles, async (req, res) => {
    try{
        const product = await Product.findOne({
            _id: req.params.id,
            seller: req.user.userId
        });

        if (!product) {
            return res.status(404).json({error: 'Product not found'});
        }

        Object.assign(product, req.body);
        await product.save();

        res.json(product);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
});

// Delete product
router.delete('/:id', auth.protect, auth.authorizeRoles, async (req, res) => {
    try{
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            seller: req.user.userId
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found'});

        }

        res.json({ message: 'Product deleted successfully'});
    }catch (error){
        res.status(500).json({ error: error.message});
    }
});

module.exports = router;