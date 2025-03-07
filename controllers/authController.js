const pool = require('../db/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Make sure bcrypt is required at the top of the file
const { validationResult } = require('../validators/authValidator'); // Keep validation logic

const login = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check if user exists
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare passwords using bcrypt
        const isMatch = await bcrypt.compare(password.trim(), user.password); // Compare the plain text password with the hashed one

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = { login };
