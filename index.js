const express = require('express');
const bankRoutes = require('./routes/bankRoutes'); // Ensure this is a router object
const authRoutes = require('./routes/authRoutes'); // Ensure this is a router object
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/api', bankRoutes); // Ensure bankRoutes is a router object
app.use('/auth', authRoutes); // Ensure authRoutes is a router object

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('authRoutes:', authRoutes);
    console.log('bankRoutes:', bankRoutes);
});

module.exports = app;