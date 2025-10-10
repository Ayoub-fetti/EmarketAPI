const express = require('express');
const {getAllUsers, getUserById, createUser,updateUser, deleteUser} = require('../controllers/userController');
const validate = require('../middlewares/validation');
const { createUserSchema, updateUserSchema } = require('../validations/userValidation');
const { mongoIdSchema } = require('../validations/commonValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Users' CRUD
 */

/**
 * @swagger
 * /api/users/:
 *   get:
 *     summary: list of all users
 *     tags: [Users]
 *     responses:
 *       201:
 *         description: list of all users
 */
/**
 * @swagger
 * /api/users/:
 *   post:
 *     summary: Create user
 *     tags: [Users]
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
 *                                 "fullName" : "ayoub fetti",
 *                                "email" : "ayoub@email.com",
 *                                "password" : "ayoub123"
 *                             }
 *     responses:
 *       201:
 *         description: User created
 */
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update users with ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID to update
 *         schema:
 *           type: object
 *           properties:
 *              name:
 *                 type: string
 *                 example: {
 *                                 "fullName" : "ayoub fetti updated",
 *                                "email" : "ayoub.updated@email.com",
 *                                "password" : "newpassword123"
 *                             }
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user with ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User Id to delete
 *         schema:
 *           type: string
 *           format: ObjectId
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: 68e7b5010bf901dfd66d774a
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.get('/', getAllUsers);
router.get('/:id', validate(mongoIdSchema), getUserById);
router.post('/', validate(createUserSchema), createUser);
router.put('/:id', validate(mongoIdSchema), validate(updateUserSchema), updateUser);
router.delete('/:id', validate(mongoIdSchema), deleteUser);


module.exports = router;
