// routes/todoRoutes.js
const express = require('express');
const { check } = require('express-validator');
const todoController = require('../controllers/todoController');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  authenticateJWT,
  [
    check('title').isLength({ min: 1 }).withMessage('Title is required'),
    check('description').isLength({ min: 1 }).withMessage('Description is required')
  ],
  todoController.createTodo
);

router.get('/:id', authenticateJWT, todoController.getTodo);
router.put(
  '/:id',
  authenticateJWT,
  [
    check('title').isLength({ min: 1 }).withMessage('Title is required'),
    check('description').isLength({ min: 1 }).withMessage('Description is required')
  ],
  todoController.updateTodo
);
router.delete('/:id', authenticateJWT, todoController.deleteTodo);

module.exports = router;
