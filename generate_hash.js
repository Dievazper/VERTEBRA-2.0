const bcrypt = require('bcrypt');
const password = 'admin';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function (err, hash) {
    console.log('Hash for "admin": ' + hash);
});
