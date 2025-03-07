const express = require('express');
const {
    createAccount,
    depositMoney,
    withdrawMoney,
    checkBalance,
    transferMoney,
} = require('../controllers/bankController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router(); // Ensure this is properly defined

console.log("bankRoutes loaded and router initialized"); // Debugging

// Public route (no authentication required)
router.post('/accounts', createAccount);

// Protected routes (authentication required)
router.post('/accounts/deposit', authMiddleware, depositMoney);
router.post('/accounts/withdraw', authMiddleware, withdrawMoney);
router.get('/accounts/:id/balance', authMiddleware, checkBalance);
router.post('/accounts/transfer', authMiddleware, transferMoney);

module.exports = router; // Ensure this correctly exports the router