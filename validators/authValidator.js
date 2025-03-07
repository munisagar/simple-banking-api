const { body, validationResult } = require('express-validator');

const validateLogin = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { validateLogin, validationResult }; // Ensure this exports an object