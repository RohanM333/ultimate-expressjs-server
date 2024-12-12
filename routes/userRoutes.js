// routes/userRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'user' && password === 'password') {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Invalid username or password');
  }
});

module.exports = router;
