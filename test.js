const bcrypt = require('bcryptjs');

const password = 'test';

// Hash the password and log the hash to compare
bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
    } else {
        console.log('Generated Hash:', hash);
    }
});
// Compare this snippet from VerifyPassword.js: