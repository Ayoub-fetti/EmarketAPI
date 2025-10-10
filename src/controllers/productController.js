const Product = require('../models/Product');

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: { $ne: true } }).populate('category');
        res.json(products);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

const getProductDeleted = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: { $ne: false } });
        res.json(products);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!product) {
            return res.status(404).json({error: 'Product not found'});
        }
        res.json(product);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate({ _id: req.params.id, isDeleted: { $ne: true } }, req.body, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({error: 'Product not found'});
        }
        res.json(product);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate({ _id: req.params.id, isDeleted: { $ne: true } }, { isDeleted: true, deletedAt: new Date() }, { new: true });
        if (!product) {
            return res.status(404).json({error: 'Product not found'});
        }
        res.json({message: 'Product deleted successfully'});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

const searchProducts = async (req, res) => {
    try {
        const { title, category, minPrice, maxPrice, inStock } = req.query;
        let filter = { isDeleted: { $ne: true } };

        if (title) {
            filter.title = { $regex: title, $options: 'i' };
        }
        if (category) {
            filter.category = category;
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (inStock === 'true') {
            filter.stock = { $gt: 0 };
        }

        const products = await Product.find(filter).populate('category');
        res.json(products);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

module.exports = {
    getAllProducts,
    getProductDeleted,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
};
