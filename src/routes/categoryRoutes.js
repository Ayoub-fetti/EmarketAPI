const express = require('express');
const {getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory, getCategoriesDeleted} = require('../controllers/categoryController');

const router = express.Router();
router.get('/', getAllCategories);
router.get('/deleted', getCategoriesDeleted);
router.get('/:id', getCategoryById);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
