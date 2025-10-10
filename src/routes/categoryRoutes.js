const express = require('express');
const {getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory, getCategoriesDeleted} = require('../controllers/categoryController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category's CRUD
 */

/**
 * @swagger
 * /api/categories/:
 *   get:
 *     summary: list of all categories
 *     tags: [Categories]
 *     responses:
 *       201:
 *         description: list of all categories
 */
router.get('/', getAllCategories);

/**
 * @swagger
 * /api/categories/deleted:
 *   get:
 *     summary: list of deleted categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: list of deleted categories
 */
router.get('/deleted', getCategoriesDeleted);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: string
 *           format: ObjectId
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: 68e7b5010bf901dfd66d774a
 *     responses:
 *       200:
 *         description: Category found
 *       404:
 *         description: Category not found
 */
router.get('/:id', getCategoryById);

/**
 * @swagger
 * /api/categories/:
 *   post:
 *     summary: Create category
 *     tags: [Categories]
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
 *                                 "name" : "Category Name",
 *                                "description" : "Category description"
 *                             }
 *     responses:
 *       201:
 *         description: Category created
 */
router.post('/', createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update category with ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID to update
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
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 */
router.put('/:id', updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category with ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category Id to delete
 *         schema:
 *           type: string
 *           format: ObjectId
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: 68e7b5010bf901dfd66d774a
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */
router.delete('/:id', deleteCategory);

module.exports = router;
