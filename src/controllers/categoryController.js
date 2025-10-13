const Category = require('../models/Category');

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isDeleted: {$ne: true} });
        res.json(categories);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

const getCategoriesDeleted = async (req, res) => {
    try {
        const categories = await Category.find({ isDeleted: {$ne: false} });
        res.json(categories);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findOne({ _id: req.params.id, isDeleted: {$ne: true}});
        if (!category) {
            return res.status(404).json({error: 'Category not found'});
        }
        res.json(category);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

const createCategory = async (req, res) => {
    try {
        const category = new Category(req.body);
        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate({_id: req.params.id, isDeleted: {$ne: true}}, req.body, {new: true, runValidators: true});
        if (!category) {
            return res.status(404).json({error: 'Category not found'});
        }
        res.json(category);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOneAndUpdate({ _id: req.params.id, isDeleted: { $ne: true } }, { isDeleted: true, deletedAt: new Date() }, { new: true });
        if (!category) {
            return res.status(404).json({error: 'Category not found'});
        }
        res.json({message: 'Category deleted successfully'});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesDeleted
};
