/**
 * Menu Routes (Dynamic menu based on user role)
 */
const express = require('express');
const router = express.Router();
const menuController = require('../controllers/MenuController');
const { optionalAuthenticate } = require('../middlewares/authMiddleware');

// Get menu based on user role
router.get(
  '/',
  optionalAuthenticate,
  menuController.getMenu.bind(menuController)
);

module.exports = router;


