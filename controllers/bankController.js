const pool = require('../db/db');
const bcrypt = require('bcryptjs'); // Add this for password hashing


// Create Account
const createAccount = async (req, res) => {
    const { name, email, password } = req.body; // Add password field

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Debugging: Log the hashed password
        console.log("Hashed password:", hashedPassword);

        // Insert user into the database
        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, hashedPassword]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating account' });
    }
};

// Deposit money into the account
const depositMoney = async (req, res) => {
    const { user_id, amount } = req.body;
    
    // Ensure the amount is valid
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    try {
        // Check if user exists
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Update the balance
        const updatedBalance = parseFloat(user.balance) + parseFloat(amount);
        await pool.query('UPDATE users SET balance = $1 WHERE id = $2', [updatedBalance, user_id]);

        // Respond with the updated balance
        return res.status(200).json({
            message: 'Deposit successful',
            balance: updatedBalance.toFixed(2)
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Withdraw Money
const withdrawMoney = async (req, res) => {
    const { id, amount } = req.body;

    try {
        // Check if the user exists
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Ensure valid amount
        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be positive' });
        }

        if (user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Update the user's balance
        const updateResult = await pool.query(
            'UPDATE users SET balance = balance - $1 WHERE id = $2 RETURNING *',
            [amount, id]
        );

        // Log the withdrawal transaction
        await pool.query(
            'INSERT INTO transactions (user_id, type, amount) VALUES ($1, $2, $3)',
            [id, 'withdraw', amount]
        );

        res.status(200).json(updateResult.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error withdrawing money' });
    }
};

// Check Balance
const checkBalance = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching balance' });
    }
};

// Transfer Money
const transferMoney = async (req, res) => {
    const { fromId, toId, amount } = req.body;

    const client = await pool.connect(); // Start transaction

    try {
        await client.query('BEGIN'); // Begin transaction

        // Check if both accounts exist
        const fromUser = await client.query('SELECT * FROM users WHERE id = $1', [fromId]);
        const toUser = await client.query('SELECT * FROM users WHERE id = $1', [toId]);

        if (fromUser.rows.length === 0 || toUser.rows.length === 0) {
            return res.status(404).json({ message: 'One or both accounts not found' });
        }

        // Check if the sender has sufficient balance
        if (fromUser.rows[0].balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Deduct from sender
        await client.query(
            'UPDATE users SET balance = balance - $1 WHERE id = $2',
            [amount, fromId]
        );

        // Add to receiver
        await client.query(
            'UPDATE users SET balance = balance + $1 WHERE id = $2',
            [amount, toId]
        );

        // Log transaction for sender
        await client.query(
            'INSERT INTO transactions (user_id, type, amount) VALUES ($1, $2, $3)',
            [fromId, 'transfer-out', amount]
        );

        // Log transaction for receiver
        await client.query(
            'INSERT INTO transactions (user_id, type, amount) VALUES ($1, $2, $3)',
            [toId, 'transfer-in', amount]
        );

        await client.query('COMMIT'); // Commit transaction

        res.status(200).json({ message: 'Transfer successful' });
    } catch (err) {
        await client.query('ROLLBACK'); // Rollback in case of error
        console.error('Error transferring money:', err);
        res.status(500).json({ message: 'Error transferring money' });
    } finally {
        client.release(); // Release the client
    }
};


module.exports = {
    createAccount,
    depositMoney,
    withdrawMoney,
    checkBalance,
    transferMoney,
};