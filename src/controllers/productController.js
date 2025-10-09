const Product = require('../models/Product');

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: { $ne: true } });
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
        const {title, description, price, stock, category, imageUrl} = req.body;
        if (!title || !description || !price || !stock || !category || !imageUrl) {
            return res.status(400).json({ error: 'All fields are required'});
        }
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
        const product = await Product.findOneAndUpdate({ _id: req.params.id, isDeleted: { $ne: true } }, { isDeleted: true, deletedAt: new Date() }, { new: true }
        );
        if (!product) {
            return res.status(404).json({error: 'Product not found'});
        }
        res.json({message: 'Product deleted successfully'});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
