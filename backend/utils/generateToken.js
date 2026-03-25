const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // Add your JWT secret in .env as JWT_SECRET
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
