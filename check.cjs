const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const loadedHash = process.env.ADMIN_PASSWORD_HASH;
console.log('Loaded Hash from .env:', loadedHash);

const pass = 'Anon@1107';
bcrypt.compare(pass, loadedHash).then(res => {
  console.log(`Bcrypt compare with loaded hash:`, res);
}).catch(err => {
  console.error('Error during compare:', err);
});
