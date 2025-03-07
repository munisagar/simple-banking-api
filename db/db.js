const { Pool } = require('pg'); // Importing Pool class from pg package
require('dotenv').config(); // Importing dotenv package to access environment variables

// Creating a new Pool instance with better error handling
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432, // Added DB_PORT in case it's defined in .env
});

// A function to test the connection to the database and ensure it's successful
const testConnection = async () => {
    try {
        const client = await pool.connect(); // Try to acquire a connection from the pool
        console.log('Connected to the database successfully');
        client.release(); // Always release the client when done
    } catch (error) {
        console.error('Database connection failed:', error.stack); // Log connection error
    }
};

// Ensure the database connection is working when the server starts
testConnection();

// Gracefully handle shutdown and release database connection
process.on('SIGINT', async () => {
    console.log('Closing database connection...');
    await pool.end(); // Close the database pool
    console.log('Database connection closed');
    process.exit(0); // Exit the process cleanly
});

module.exports = pool; // Exporting the pool instance for use in other parts of the application
