const express = require('express');
const {getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductDeleted, searchProducts} = require('../controllers/productController');

const router = express.Router();
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/deleted', getProductDeleted);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);


module.exports = router;