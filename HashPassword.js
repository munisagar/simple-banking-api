const bcrypt = require('bcryptjs');
const hashedPassword = bcrypt.hashSync('defaultpassword', 10);
console.log(hashedPassword);