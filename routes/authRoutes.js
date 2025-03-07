const express = require('express');
const { login } = require('../controllers/authController');
const { validateLogin } = require('../validators/authValidator');

const router = express.Router(); // Ensure this is correctly initialized

console.log("authRoutes loaded and router initialized"); // Debugging

router.post('/login', validateLogin, login);

module.exports = router; // Ensure this correctly exports the router
