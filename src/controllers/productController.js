const Product = require('../models/Product');
const User = require("../models/User");

const getAllProducts = async (req, res) => {
    try {

    const products = await Product.find();
    res.json(products);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({error: 'Product not found'});
        }
        res.json(product);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// todo : complet createProduct function
const createProduct = async (req, res) => {
    try {
         const {title, description, price, stock, category, imageUrl} = req.body;
         if (!title || !description || !price || !stock || !category || !imageUrl) {
             return res.status(400).json({ message: 'All the fields required'});
         }
         const product = new Product(req.body);
         const savedProduct = await Product
    } catch (e) {

    }
}
