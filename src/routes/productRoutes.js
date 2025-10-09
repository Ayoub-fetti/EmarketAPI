const express = require('express');
const {getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductDeleted, testError} = require('../controllers/productController');

const router = express.Router();
router.get('/', getAllProducts);
router.get('/deleted', getProductDeleted);
router.get('/test-error', testError);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;