const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Allow all CORS origins
app.use(cors());

app.use(express.json());

app.use('/api', userRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

module.exports = app;
