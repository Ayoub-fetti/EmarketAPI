const express = require('express');
const {getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductDeleted, searchProducts} = require('../controllers/productController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product' CRUD
 */

/**
 * @swagger
 * /api/products/:
 *   get:
 *     summary: list of all products
 *     tags: [Products]
 *     responses:
 *       201:
 *         description: list of all products
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: search products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: search results
 */
router.get('/search', searchProducts);

/**
 * @swagger
 * /api/products/deleted:
 *   get:
 *     summary: list of deleted products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: list of deleted products
 */
router.get('/deleted', getProductDeleted);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *           format: ObjectId
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: 68e7b5010bf901dfd66d774a
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /api/products/:
 *   post:
 *     summary: Create product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: {
 *                                 "name" : "Product Name",
 *                                "description" : "Product description",
 *                                "price" : 99.99,
 *                                "category" : "68e7b5010bf901dfd66d774a"
 *                             }
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/', createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product with ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID to update
 *         schema:
 *           type: string
 *           format: ObjectId
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: 68e7b5010bf901dfd66d774a
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: {
 *                                 "title" : "iphone 18 pro max",
 *                                "description": "iphone 17 pro max , made in usa california , available in our store",
 *                                "price": 800,
 *                                "stock" : 100,
 *                                "category" : "phones",
 *                                "imageUrl": "https://www.mobileana.com/wp-content/uploads/2025/06/Apple-iPhone-17-Pro-Max-Cosmic-Orange.webp"
 *                             }
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.put('/:id', updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product with ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product Id to delete
 *         schema:
 *           type: string
 *           format: ObjectId
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: 68e7b5010bf901dfd66d774a
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete('/:id', deleteProduct);

module.exports = router;
